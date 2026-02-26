import fs from 'fs'
import path from 'path'
import { IpcMain, App } from 'electron'
import { exec } from 'child_process'
import { GoogleGenAI } from '@google/genai'

export default function registerIrisCoder({ ipcMain, app }: { ipcMain: IpcMain; app: App }) {
  const PROJECTS_DIR = path.resolve(app.getPath('userData'), 'Projects')
  if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true })

  ipcMain.handle('start-live-coding', async (event, { prompt, filename }) => {
    try {
      const filePath = path.join(PROJECTS_DIR, filename)

      fs.writeFileSync(filePath, '// Boss, connection established. Waiting for AI stream...\n')

      const apiKey =
        (import.meta.env as any).VITE_GEMINI_API_KEY ||
        (import.meta.env as any).MAIN_VITE_GEMINI_API_KEY ||
        (process.env as any).VITE_GEMINI_API_KEY

      if (!apiKey) {
        throw new Error('API Key missing. Make sure VITE_GEMINI_API_KEY is in your .env file.')
      }

      const ai = new GoogleGenAI({ apiKey })

      const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: `You are an elite developer. Write the code for: "${prompt}". Output ONLY the raw code for the file ${filename}. Do NOT wrap it in markdown blockquotes.`
      })

      let fullCode = ''
      for await (const chunk of response) {
        if (chunk.text) {
          fullCode += chunk.text
          event.sender.send('live-code-chunk', chunk.text)
        }
      }

      fs.writeFileSync(filePath, fullCode)
      return { success: true, filePath }
    } catch (err) {
      console.error('Coding Error:', err)
      event.sender.send('live-code-chunk', `\n\n❌ [SYSTEM FAILURE]: ${String(err)}`)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('open-in-vscode', async (_event, filePath) => {
    try {
      exec(`code "${filePath}"`)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
