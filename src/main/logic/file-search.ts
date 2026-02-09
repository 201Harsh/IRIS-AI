import { IpcMain, app } from 'electron'
import { glob } from 'glob'
import path from 'path'

export default function registerFileSearch(ipcMain: IpcMain) {
  ipcMain.handle('search-files', async (_event, { fileName, searchPath }) => {
    try {
      const rootDir = searchPath
        ? path.resolve(app.getPath('home'), searchPath)
        : app.getPath('home')
      console.log(`🔍 Searching: ${fileName} in ${rootDir}`)

      const files = await glob(`**/*${fileName}*`, {
        cwd: rootDir,
        nodir: true,
        nocase: true,
        maxDepth: 5,
        ignore: ['**/node_modules/**', '**/AppData/**', '**/Library/**', '**/.git/**'],
        absolute: true
      })
      return files.slice(0, 5).join('\n') || 'No files found.'
    } catch (err) {
      return `Error: ${err}`
    }
  })
}
