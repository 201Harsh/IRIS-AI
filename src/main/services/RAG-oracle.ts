import { IpcMain, app } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { GoogleGenAI } from '@google/genai'
import Groq from 'groq-sdk'

// --- Persistent State Management ---
const getStateDir = () => path.join(app.getPath('userData'), 'iris_scan_states')

interface ScanState {
  dirPath: string
  processedFiles: string[]
  vectorDB: { filePath: string; chunk: string; embedding: number[] }[]
}

const getStateFilePath = (dirPath: string) => {
  const hash = crypto.createHash('md5').update(path.normalize(dirPath)).digest('hex')
  return path.join(getStateDir(), `${hash}.json`)
}

const saveState = async (state: ScanState) => {
  try {
    await fs.mkdir(getStateDir(), { recursive: true })
    await fs.writeFile(getStateFilePath(state.dirPath), JSON.stringify(state, null, 2))
  } catch (e) {
    console.error('Failed to save scan state:', e)
  }
}

const loadState = async (dirPath: string): Promise<ScanState | null> => {
  try {
    await fs.mkdir(getStateDir(), { recursive: true })
    const data = await fs.readFile(getStateFilePath(dirPath), 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}
// ------------------------------------

let vectorDB: { filePath: string; chunk: string; embedding: number[] }[] = []
let processedFiles = new Set<string>()
let isCancelled = false

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  let dot = 0,
    normA = 0,
    normB = 0
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getGeminiClient = () => {
  const apiKey =
    (process.env as any).MAIN_VITE_GEMINI_API_KEY || (import.meta.env as any).VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini Custom API Key is missing.')
  return new GoogleGenAI({ apiKey })
}

const getGroqClient = () => {
  const apiKey =
    (import.meta.env as any).MAIN_VITE_GROQ_API_KEY || (process.env as any).VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('Groq Custom API Key is missing.')
  return new Groq({ apiKey })
}

export default function registerOracle({ ipcMain }: { ipcMain: IpcMain }) {
  ipcMain.handle('cancel-ingestion', () => {
    isCancelled = true
    return { success: true }
  })

  ipcMain.handle('ingest-codebase', async (event, dirPath: string) => {
    try {
      const targetPath = path.normalize(dirPath.trim())
      isCancelled = false
      const ai = getGeminiClient()

      // 1. Try to load existing state for resume
      const prevState = await loadState(targetPath)
      if (prevState) {
        vectorDB = prevState.vectorDB
        processedFiles = new Set(prevState.processedFiles)
      } else {
        vectorDB = []
        processedFiles = new Set()
      }

      // 2. Scan for all files
      const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'out', 'public']
      const ignoreFiles = [
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'package.json',
        'tsconfig.json'
      ]
      const allowedExts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.md']
      let allFiles: string[] = []

      async function fastScan(currentPath: string) {
        if (isCancelled) return
        let entries
        try {
          entries = await fs.readdir(currentPath, { withFileTypes: true })
        } catch {
          return
        }
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name)
          if (entry.isDirectory() && !ignoreDirs.includes(entry.name)) {
            await fastScan(fullPath)
          } else if (
            entry.isFile() &&
            allowedExts.includes(path.extname(entry.name)) &&
            !ignoreFiles.includes(entry.name)
          ) {
            allFiles.push(fullPath)
          }
        }
      }
      event.sender.send('oracle-progress', {
        status: 'scanning',
        file: 'Initializing...',
        totalFound: 0
      })
      await fastScan(targetPath)

      if (isCancelled) return { success: false, error: 'Aborted by user.' }

      // 3. Filter and Sort
      const filesToProcess = allFiles.filter((f) => !processedFiles.has(f))
      const filesWithStats = await Promise.all(
        filesToProcess.map(async (f) => ({ path: f, size: (await fs.stat(f)).size }))
      )
      filesWithStats.sort((a, b) => a.size - b.size)
      const sortedFilesToProcess = filesWithStats.map((f) => f.path)

      event.sender.send('oracle-progress', {
        status: 'scanning',
        file: 'Scan Complete',
        totalFound: allFiles.length,
        filesProcessed: processedFiles.size,
        chunks: vectorDB.length
      })

      // 4. Processing Loop
      for (let i = 0; i < sortedFilesToProcess.length; i++) {
        if (isCancelled) {
          event.sender.send('oracle-progress', { status: 'cancelled' })
          break
        }

        const fullPath = sortedFilesToProcess[i]
        const fileName = path.basename(fullPath)

        event.sender.send('oracle-progress', {
          status: 'reading',
          file: fileName,
          filesProcessed: processedFiles.size,
          totalFiles: allFiles.length,
          chunks: vectorDB.length
        })

        const stats = await fs.stat(fullPath)
        if (stats.size > 100000) continue
        const content = await fs.readFile(fullPath, 'utf-8')
        const rawChunks = content.match(/[\s\S]{1,1500}/g) || []
        const validChunks = rawChunks.filter((c) => c.trim().length > 10)

        if (validChunks.length === 0) {
          processedFiles.add(fullPath)
          continue
        }

        try {
          const response: any = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: validChunks.map((chunk) => `File: ${fileName}\n\n${chunk}`),
            config: { taskType: 'RETRIEVAL_DOCUMENT' }
          })
          response.embeddings.forEach((emb: any, idx: number) => {
            vectorDB.push({ filePath: fullPath, chunk: validChunks[idx], embedding: emb.values })
          })

          processedFiles.add(fullPath)
          await saveState({
            dirPath: targetPath,
            processedFiles: Array.from(processedFiles),
            vectorDB
          })

          event.sender.send('oracle-progress', {
            status: 'embedded',
            file: fileName,
            filesProcessed: processedFiles.size,
            totalFiles: allFiles.length,
            chunks: vectorDB.length
          })
          await sleep(3500)
        } catch (apiError) {
          console.error(`Skipping ${fileName} due to API Error.`)
          await sleep(5000)
        }
      }

      return { success: true, totalChunks: vectorDB.length, wasResumed: !!prevState }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('consult-oracle', async (_event, query: string) => {
    try {
      if (vectorDB.length === 0)
        return { success: false, answer: 'Error: No files loaded into memory.' }
      const ai = getGeminiClient()
      const groq = getGroqClient()

      const queryResponse: any = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: query,
        config: { taskType: 'RETRIEVAL_QUERY' }
      })
      const queryEmbedding = queryResponse.embeddings[0].values

      const rankedChunks = vectorDB
        .map((item) => ({ ...item, score: cosineSimilarity(queryEmbedding, item.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      const contextText = rankedChunks.map((c) => `// File: ${c.filePath}\n${c.chunk}`).join('\n\n')

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              "You are an elite coding assistant. Answer the user's question based ONLY on the provided codebase context. Give direct code snippets and explanations. Be concise."
          },
          { role: 'user', content: `Context:\n${contextText}\n\nQuestion: ${query}` }
        ],
        model: 'llama-3.1-8b-instant'
      })

      return {
        success: true,
        answer: chatCompletion.choices[0].message.content,
        scannedFiles: rankedChunks.map((c) => c.filePath)
      }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
