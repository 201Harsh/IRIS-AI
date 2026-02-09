import { IpcMain } from 'electron'
import fs from 'fs/promises'

export default function registerFileRead(ipcMain: IpcMain) {
  ipcMain.handle('read-file', async (_event, filePath) => {
    try {
      console.log(`📖 Reading: ${filePath}`)
      const content = await fs.readFile(filePath, 'utf-8')
      return content.length > 2000 ? content.slice(0, 2000) + '\n...(Truncated)' : content
    } catch (err) {
      return `Error reading file: ${err}`
    }
  })
}
