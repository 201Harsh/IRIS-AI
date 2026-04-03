import { IpcMain } from 'electron'
import fs from 'fs/promises'

export default function registerFileOps(ipcMain: IpcMain) {
  ipcMain.handle('file-ops', async (_event, { operation, sourcePath, destPath }) => {

    try {
      switch (operation) {
        case 'copy':
          if (!destPath) return 'Error: Destination path required for copy.'
          await fs.cp(sourcePath, destPath, { recursive: true })
          return `Success: Copied to ${destPath}`

        case 'move':
          if (!destPath) return 'Error: Destination path required for move.'
          await fs.rename(sourcePath, destPath)
          return `Success: Moved to ${destPath}`

        case 'delete':
          await fs.rm(sourcePath, { recursive: true, force: true })
          return `Success: Deleted ${sourcePath}`

        default:
          return `Error: Unknown operation '${operation}'`
      }
    } catch (err) {
      return `System Error: ${err}`
    }
  })
}
