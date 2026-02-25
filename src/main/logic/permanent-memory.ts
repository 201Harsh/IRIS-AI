import fs from 'fs'
import path from 'path'
import { IpcMain, App } from 'electron'

export default function registerPermanentMemory({ ipcMain, app }: { ipcMain: IpcMain; app: App }) {
  const MEMORY_DIR = path.resolve(app.getPath('userData'), 'Memory')
  const FILE_PATH = path.join(MEMORY_DIR, 'saved-user-memory.json')

  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true })

  ipcMain.handle('save-core-memory', async (_event, fact: string) => {
    try {
      let memoryBank: { fact: string; timestamp: string }[] = []

      if (fs.existsSync(FILE_PATH)) {
        const data = fs.readFileSync(FILE_PATH, 'utf-8')
        memoryBank = data ? JSON.parse(data) : []
      }

      memoryBank.push({
        fact: fact,
        timestamp: new Date().toISOString()
      })

      fs.writeFileSync(FILE_PATH, JSON.stringify(memoryBank, null, 2))
      return true
    } catch (err) {
      console.error('Failed to save core memory:', err)
      return false
    }
  })

  ipcMain.handle('search-core-memory', async () => {
    try {
      if (fs.existsSync(FILE_PATH)) {
        const data = fs.readFileSync(FILE_PATH, 'utf-8')
        return data ? JSON.parse(data) : []
      }
      return []
    } catch (err) {
      console.error('Failed to retrieve core memory:', err)
      return []
    }
  })
}
