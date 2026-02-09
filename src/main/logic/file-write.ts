import { IpcMain, app } from 'electron'
import fs from 'fs/promises'
import path from 'path'

export default function registerFileWrite(ipcMain: IpcMain) {
  ipcMain.handle('write-file', async (_event, { fileName, content }) => {
    try {
      // Default to Desktop if no path
      const targetPath = fileName.includes('/') || fileName.includes('\\') 
        ? fileName 
        : path.join(app.getPath('desktop'), fileName)
        
      console.log(`✍️ Writing: ${targetPath}`)
      await fs.writeFile(targetPath, content, 'utf-8')
      return `Success. File saved to: ${targetPath}`
    } catch (err) {
      return `Error writing file: ${err}`
    }
  })
}