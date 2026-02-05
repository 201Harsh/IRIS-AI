import fs from 'fs'
import path from 'path'

function registerIpcHandlers({ ipcMain, app }: { ipcMain: Electron.IpcMain; app: Electron.App }) {
  const CHAT_DIR = path.resolve(app.getPath('userData'), 'Chat')
  const FILE_PATH = path.join(CHAT_DIR, 'iris_memory.json')
  // Handler 1: Save
  ipcMain.handle('save-history', async (_event, history) => {
    try {
      if (!fs.existsSync(CHAT_DIR)) {
        fs.mkdirSync(CHAT_DIR, { recursive: true })
      }
      fs.writeFileSync(FILE_PATH, JSON.stringify(history, null, 2))
      return true
    } catch (err) {
      console.error('🔴 Save Error:', err)
      return false
    }
  })

  // Handler 2: Get
  ipcMain.handle('get-history', async () => {
    try {
      if (fs.existsSync(FILE_PATH)) {
        const data = fs.readFileSync(FILE_PATH, 'utf-8')
        return JSON.parse(data)
      }
    } catch (err) {
      console.error('🔴 Read Error:', err)
    }
    return []
  })
}

export default registerIpcHandlers
