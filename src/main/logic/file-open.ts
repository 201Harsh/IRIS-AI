import { shell } from 'electron'

export default function registerFileOpen(ipcMain: Electron.IpcMain) {
  ipcMain.handle('file:open', async (_, filePath: string) => {
    try {

      const error = await shell.openPath(filePath)

      if (error) {
        return { success: false, error }
      }

      return { success: true }
    } catch (e) {
      return { success: false, error: 'Internal System Error' }
    }
  })

  ipcMain.handle('file:reveal', async (_, filePath: string) => {
    try {
      shell.showItemInFolder(filePath)
      return { success: true }
    } catch (e) {
      return { success: false, error: 'Failed to reveal item' }
    }
  })
}
