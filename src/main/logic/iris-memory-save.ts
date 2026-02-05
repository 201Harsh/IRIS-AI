import fs from 'fs'
import path from 'path'
import { IpcMain, App } from 'electron'

export default function registerIpcHandlers({ ipcMain, app }: { ipcMain: IpcMain; app: App }) {
  console.log('🔵 [Main] Registering Memory Handlers...')

  const CHAT_DIR = path.resolve(app.getPath('userData'), 'Chat')
  const FILE_PATH = path.join(CHAT_DIR, 'iris_memory.json')

  // 1. Remove old handlers to prevent conflicts
  ipcMain.removeHandler('add-message')
  ipcMain.removeHandler('get-history')

  // 2. REGISTER 'add-message' (Matches your Frontend!)
  ipcMain.handle('add-message', async (_event, msg) => {
    try {
      if (!fs.existsSync(CHAT_DIR)) fs.mkdirSync(CHAT_DIR, { recursive: true })

      let history: { role: string; content: string; timestamp: string }[] = []
      if (fs.existsSync(FILE_PATH)) {
        const data = fs.readFileSync(FILE_PATH, 'utf-8')
        history = data ? JSON.parse(data) : []
      }

      // Append new message
      const newEntry: { role: string; content: string; timestamp: string } = {
        role: msg.role,
        content: msg.parts[0].text,
        timestamp: new Date().toISOString()
      }
      history.push(newEntry)

      // Keep last 20
      if (history.length > 20) history = history.slice(-20)

      fs.writeFileSync(FILE_PATH, JSON.stringify(history, null, 2))
      return true
    } catch (err) {
      console.error('🔴 Save Error:', err)
      return false
    }
  })

  // 3. REGISTER 'get-history'
  ipcMain.handle('get-history', async () => {
    try {
      if (fs.existsSync(FILE_PATH)) {
        const data = fs.readFileSync(FILE_PATH, 'utf-8')
        const raw = JSON.parse(data)
        // Convert to Gemini format
        return raw.map((m: any) => ({
          role: m.role === 'iris' ? 'model' : m.role,
          parts: [{ text: m.content }]
        }))
      }
    } catch (err) {
      console.error('🔴 Read Error:', err)
    }
    return []
  })
}
