import { IpcMain, app } from 'electron'
import fs from 'fs' // Native fs module
import path from 'path'
import os from 'os'
import Groq from 'groq-sdk'

let pipeline: any = null
let lancedb: any = null

// ============================================================================
// YOUR PROVEN PATH RESOLUTION LOGIC
// ============================================================================
const getSystemPath = (name: string) => {
  try {
    return app.getPath(name as any)
  } catch (e) {
    const home = os.homedir()
    switch (name.toLowerCase()) {
      case 'desktop':
        return path.join(home, 'Desktop')
      case 'documents':
        return path.join(home, 'Documents')
      case 'downloads':
        return path.join(home, 'Downloads')
      case 'music':
        return path.join(home, 'Music')
      case 'pictures':
        return path.join(home, 'Pictures')
      case 'videos':
        return path.join(home, 'Videos')
      default:
        return home
    }
  }
}

async function getActiveDrives(): Promise<string[]> {
  if (os.platform() === 'win32') {
    const drives: string[] = []
    for (let i = 65; i <= 90; i++) {
      const drive = String.fromCharCode(i) + ':\\'
      try {
        await fs.promises.access(drive, fs.constants.R_OK)
        drives.push(drive)
      } catch {
        continue
      }
    }
    return drives.length > 0 ? drives : ['C:\\']
  }
  return ['/']
}

// Global Ignore List
const IGNORE_FOLDERS = new Set([
  'node_modules',
  'appdata',
  'program files',
  'windows',
  'system volume information',
  'dist',
  'build',
  '.git',
  '$recycle.bin'
])

export default function registerFileSearch(ipcMain: IpcMain) {
  // --- PROTOCOL 1: THE INDEXER (Kept intact for Semantic Memory) ---
  ipcMain.handle('index-folder', async (event, folderPath: string) => {
    try {
      event.sender.send('semantic-progress', {
        status: 'booting',
        text: 'Initializing Neural Engine...',
        progress: 10
      })
      if (!pipeline) pipeline = (await import('@xenova/transformers')).pipeline
      if (!lancedb) lancedb = await import('vectordb')

      const dbPath = path.join(app.getPath('userData'), 'iris_semantic_db')
      const db = await lancedb.connect(dbPath)

      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

      event.sender.send('semantic-progress', {
        status: 'scanning',
        text: `Native Sweeping folder...`,
        progress: 50
      })

      const filesToIndex: string[] = []
      const VALID_INDEX_EXTENSIONS = new Set([
        '.txt',
        '.md',
        '.js',
        '.ts',
        '.tsx',
        '.jsx',
        '.json',
        '.py',
        '.html',
        '.css'
      ])

      async function scanForIndexing(dir: string) {
        let entries
        try {
          entries = await fs.promises.readdir(dir, { withFileTypes: true })
        } catch (err) {
          return
        }

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          const nameLower = entry.name.toLowerCase()

          if (entry.isDirectory()) {
            if (
              nameLower.startsWith('.') ||
              nameLower.startsWith('$') ||
              IGNORE_FOLDERS.has(nameLower)
            )
              continue
            await scanForIndexing(fullPath)
          } else if (entry.isFile()) {
            if (VALID_INDEX_EXTENSIONS.has(path.extname(nameLower))) filesToIndex.push(fullPath)
          }
        }
      }

      await scanForIndexing(path.resolve(folderPath))

      const records: any[] = []
      let processed = 0

      for (const file of filesToIndex) {
        try {
          const content = await fs.promises.readFile(file, 'utf-8')
          if (content.trim().length === 0) continue

          processed++
          if (processed % 5 === 0)
            event.sender.send('semantic-progress', {
              status: 'indexing',
              text: `Vectorizing: ${path.basename(file)}`,
              progress: 50 + (processed / filesToIndex.length) * 40
            })

          const textChunk = content.substring(0, 1000)
          const output = await extractor(textChunk, { pooling: 'mean', normalize: true })
          records.push({
            vector: Array.from(output.data),
            file_path: file,
            file_name: path.basename(file),
            content_snippet: textChunk.substring(0, 200)
          })
        } catch (e) {
          /* skip */
        }
      }

      event.sender.send('semantic-progress', {
        status: 'saving',
        text: 'Writing DB...',
        progress: 95
      })
      if (records.length > 0) {
        try {
          const table = await db.openTable('files')
          await table.add(records)
        } catch {
          await db.createTable('files', records)
        }
      }
      return `✅ Successfully indexed ${filesToIndex.length} files.`
    } catch (err) {
      return `❌ Indexing Error: ${String(err)}`
    }
  })

  // --- PROTOCOL 2: THE INFINITE QUEUE + SEMANTIC SEARCH ---
  ipcMain.handle('search-files', async (event, { query }) => {
    try {
      event.sender.send('semantic-progress', {
        status: 'searching',
        text: 'Waking Llama 3.1...',
        progress: 10
      })

      const groqKey =
        (import.meta.env as any).MAIN_VITE_GROQ_API_KEY ||
        (process.env as any).MAIN_VITE_GROQ_API_KEY
      if (!groqKey) throw new Error('Missing MAIN_VITE_GROQ_API_KEY')

      let semanticResultsText = ''
      let nativeResultsText = ''
      let searchParams = { keywords: [] as string[], root_target: '' }

      // =========================================================
      // TASK A: SEMANTIC DB SEARCH (Checks file contents)
      // =========================================================
      const runSemantic = async () => {
        try {
          if (!pipeline) pipeline = (await import('@xenova/transformers')).pipeline
          if (!lancedb) lancedb = await import('vectordb')
          const dbPath = path.join(app.getPath('userData'), 'iris_semantic_db')
          if (!fs.existsSync(dbPath)) return

          const db = await lancedb.connect(dbPath)
          const table = await db.openTable('files')
          const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
          const queryOutput = await extractor(query, { pooling: 'mean', normalize: true })
          const results = await table.search(Array.from(queryOutput.data)).limit(3).execute()

          if (results.length > 0) {
            semanticResultsText =
              `🧠 CONTENT MEMORY MATCHES:\n` +
              results.map((r: any) => `- ${r.file_path}`).join('\n') +
              '\n\n'
          }
        } catch (e) {
          /* DB missing or empty, safely ignore */
        }
      }

      // =========================================================
      // TASK B: NATIVE BREADTH-FIRST SEARCH (Checks nested folders)
      // =========================================================
      const runNativeCrawler = async () => {
        const groq = new Groq({ apiKey: groqKey })

        // 🚨 FIX 1: Explicitly tell Llama to NEVER add the word "file" or "document" to keywords
        const prompt = `
          Extract the core search keywords from this user query: "${query}".
          RULES:
          1. Extract the specific file name (e.g. "mainresume"), extension ("pdf", "txt"), and nested folder names ("career").
          2. NEVER include the words "file", "document", "folder", or "find" in the keywords array. Use exact extensions only (e.g., "pdf" not "pdf file").
          3. FIX ANY SPELLING MISTAKES (e.g., "carrer" -> "career").
          4. If the user mentions a root location (like "desktop", "documents", "downloads"), put it in the "root_target" string. Otherwise leave it empty.
          5. Output JSON with "keywords" (array of lowercase strings) and "root_target" (string).
        `

        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          response_format: { type: 'json_object' }
        })

        try {
          const parsed = JSON.parse(
            chatCompletion.choices[0]?.message?.content || '{"keywords":[]}'
          )
          searchParams.root_target = parsed.root_target || ''
          if (Array.isArray(parsed.keywords)) searchParams.keywords = parsed.keywords
          else if (typeof parsed.keywords === 'string')
            searchParams.keywords = parsed.keywords.split(/[\s,]+/)
        } catch (e) {
          searchParams.keywords = []
        }

        // Clean array
        searchParams.keywords = searchParams.keywords
          .filter(Boolean)
          .map((kw) => String(kw).toLowerCase().trim())
        if (searchParams.keywords.length === 0) return

        event.sender.send('semantic-progress', {
          status: 'searching',
          text: `Engine Locked On: [ ${searchParams.keywords.join(' + ')} ]`,
          progress: 30
        })

        const searchRoots = new Set<string>()
        let rawInput = searchParams.root_target.trim().toLowerCase()

        if (rawInput) {
          if (os.platform() === 'win32' && (rawInput.length === 1 || rawInput.includes('drive'))) {
            const driveLetter = rawInput.charAt(0).toUpperCase()
            searchRoots.add(`${driveLetter}:\\`)
          } else if (
            ['desktop', 'documents', 'downloads', 'music', 'pictures', 'videos'].includes(rawInput)
          ) {
            searchRoots.add(getSystemPath(rawInput))
          } else {
            searchRoots.add(path.join(os.homedir(), rawInput))
          }
        } else {
          searchRoots.add(os.homedir())
          const drives = await getActiveDrives()
          drives.forEach((d) => {
            if (!d.startsWith('C')) searchRoots.add(d)
          })
        }

        const rootArray = Array.from(searchRoots)
        event.sender.send('semantic-progress', {
          status: 'searching',
          text: `Native Sweeping Nested Folders...`,
          progress: 50
        })

        // THE INFINITE QUEUE LOOP (BREADTH-FIRST SEARCH)
        const foundFiles: string[] = []
        const queue: string[] = [...rootArray]
        const visited = new Set<string>()

        while (queue.length > 0 && foundFiles.length < 15) {
          const currentDir = queue.shift()

          if (!currentDir || visited.has(currentDir)) continue
          visited.add(currentDir)

          let entries
          try {
            entries = await fs.promises.readdir(currentDir, { withFileTypes: true })
          } catch (err) {
            continue
          }

          for (const entry of entries) {
            if (foundFiles.length >= 15) break

            const fullPath = path.join(currentDir, entry.name)
            const lowerPath = fullPath.toLowerCase()

            let isDir = entry.isDirectory()
            let isFile = entry.isFile()

            if (entry.isSymbolicLink()) {
              try {
                const stat = await fs.promises.stat(fullPath)
                isDir = stat.isDirectory()
                isFile = stat.isFile()
              } catch (e) {
                continue
              }
            }

            if (isDir) {
              const name = entry.name.toLowerCase()
              if (name.startsWith('.') || name.startsWith('$') || IGNORE_FOLDERS.has(name)) continue

              queue.push(fullPath)
            } else if (isFile) {
              // 🚨 FIX 2: Exact matching. If keywords are ["resume", "pdf", "career"], ALL must exist in the path.
              const isMatch = searchParams.keywords.every((kw: string) => lowerPath.includes(kw))
              if (isMatch) {
                foundFiles.push(fullPath)
              }
            }
          }
        }

        const uniqueResults = Array.from(new Set(foundFiles))
        if (uniqueResults.length > 0) {
          // 🚨 FIX 3: Actually assign the text instead of returning early!
          nativeResultsText =
            `⚡ NATIVE DEEP SYSTEM MATCHES:\n` + uniqueResults.slice(0, 15).join('\n')
        }
      }

      // RUN BOTH CONCURRENTLY
      await Promise.all([runSemantic(), runNativeCrawler()])

      event.sender.send('semantic-progress', {
        status: 'searching',
        text: 'Consolidating Results...',
        progress: 95
      })

      // COMBINE RESULTS
      const finalOutput = (semanticResultsText + nativeResultsText).trim()

      if (finalOutput.length > 0) {
        return finalOutput
      } else {
        return `No files found matching [ ${searchParams.keywords.join(', ')} ]`
      }
    } catch (err) {
      console.error(err)
      return `❌ System Error: ${String(err)}`
    }
  })
}
