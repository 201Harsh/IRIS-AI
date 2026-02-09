import { IpcMain } from 'electron'
import fs from 'fs/promises'

export default function registerFileOps(ipcMain: IpcMain) {
  ipcMain.handle('file-ops', async (_event, { operation, sourcePath, destPath }) => {
    console.log(`⚡ File Op: ${operation} on ${sourcePath} -> ${destPath || 'N/A'}`)

    try {
      switch (operation) {
        case 'copy': // "Copy -> Paste"
          if (!destPath) return 'Error: Destination path required for copy.'
          // recursive: true allows copying directories too if needed (Node 16+)
          await fs.cp(sourcePath, destPath, { recursive: true })
          return `Success: Copied to ${destPath}`

        case 'move': // "Cut -> Paste"
          if (!destPath) return 'Error: Destination path required for move.'
          await fs.rename(sourcePath, destPath)
          return `Success: Moved to ${destPath}`

        case 'delete':
          // recursive: true allows deleting folders. force: true ignores if file missing.
          await fs.rm(sourcePath, { recursive: true, force: true })
          return `Success: Deleted ${sourcePath}`

        default:
          return `Error: Unknown operation '${operation}'`
      }
    } catch (err) {
      console.error(err)
      return `System Error: ${err}`
    }
  })
}
