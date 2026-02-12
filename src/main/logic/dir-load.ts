import { IpcMain, app } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

// Helper to determine file category
const getFileType = (name: string, isDirectory: boolean) => {
  if (isDirectory) return 'directory' // ⚡ Explicitly mark folders

  const ext = path.extname(name).toLowerCase()
  const textExts = [
    '.txt',
    '.md',
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.json',
    '.html',
    '.css',
    '.py',
    '.java',
    '.c',
    '.cpp',
    '.h',
    '.csv',
    '.env',
    '.log',
    '.xml',
    '.yml',
    '.yaml'
  ]
  const imgExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp']
  const vidExts = ['.mp4', '.mkv', '.avi', '.mov', '.webm']
  const execExts = ['.exe', '.msi', '.bat', '.sh', '.app', '.dmg']

  if (textExts.includes(ext)) return 'text'
  if (imgExts.includes(ext)) return 'image'
  if (vidExts.includes(ext)) return 'video'
  if (execExts.includes(ext)) return 'executable'
  return 'unknown'
}

// 🛡️ Safe Path Getter (Fixes the "Failed to get path" error)
const getSystemPath = (name: any) => {
  try {
    return app.getPath(name)
  } catch (e) {
    console.warn(`⚠️ Electron failed to resolve '${name}'. Using fallback.`)
    // Manual fallback for Windows/Mac/Linux standard paths
    const home = os.homedir()
    switch (name) {
      case 'desktop':
        return path.join(home, 'Desktop')
      case 'documents':
        return path.join(home, 'Documents')
      case 'downloads':
        return path.join(home, 'Downloads')
      case 'music':
        return path.join(home, 'Music')
      case 'pictures':
        return path.join(home, 'Pictures')
      case 'videos':
        return path.join(home, 'Videos')
      default:
        return home
    }
  }
}

export default function registerDirLoader(ipcMain: IpcMain) {
  ipcMain.handle('read-directory', async (_event, dirPath: string) => {
    try {
      let rawInput = dirPath.trim()
      let targetPath = rawInput
      const platform = os.platform()

      // 1. 🛡️ ROBUST PATH RESOLUTION
      // A. Windows Drive Logic (e.g., "D", "d:", "E")
      if (platform === 'win32' && /^[a-zA-Z]:?$/.test(rawInput)) {
        const driveLetter = rawInput.charAt(0).toUpperCase()
        targetPath = `${driveLetter}:\\`
      }
      // B. System Aliases (Safe Fallback Wrapper)
      else if (
        ['desktop', 'documents', 'downloads', 'music', 'pictures', 'videos'].includes(
          rawInput.toLowerCase()
        )
      ) {
        targetPath = getSystemPath(rawInput.toLowerCase())
      } else if (rawInput.toLowerCase() === 'home' || rawInput === '~') {
        targetPath = os.homedir()
      }
      // C. Relative Path Fallback
      else if (!path.isAbsolute(targetPath)) {
        targetPath = path.join(os.homedir(), rawInput)
      }

      console.log(`📂 IRIS Scanning: '${targetPath}'`)

      // 2. 🛡️ VERIFY PATH EXISTS
      try {
        const stats = await fs.stat(targetPath)
        if (!stats.isDirectory()) {
          return `Error: '${targetPath}' is a FILE. Use 'read_file' to read it.`
        }
      } catch (e) {
        return `Error: Directory not found at '${targetPath}'.`
      }

      // 3. READ DIRECTORY (With Types)
      const dirents = await fs.readdir(targetPath, { withFileTypes: true })

      // 4. FILTER & MAP
      const items = dirents
        .filter((d) => !d.name.startsWith('.')) // Hide dotfiles (.git, .env)
        .map((d) => ({
          name: d.name,
          path: path.join(targetPath, d.name),
          isDirectory: d.isDirectory(),
          ext: path.extname(d.name).toLowerCase()
        }))

      // 5. GET METADATA (Sort by Recent)
      const itemsWithStats = await Promise.all(
        items.map(async (item) => {
          try {
            const stats = await fs.stat(item.path)
            return { ...item, mtime: stats.mtimeMs, size: stats.size }
          } catch {
            return { ...item, mtime: 0, size: 0 }
          }
        })
      )

      // 6. SORT & LIMIT
      // Prioritize Folders at the top, then recent files
      const sortedItems = itemsWithStats
        .sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return b.mtime - a.mtime // Newest first
        })
        .slice(0, 30) // Limit to 30 items to save context

      // 7. FORMAT OUTPUT FOR AI
      const results = sortedItems.map((item) => {
        const type = getFileType(item.name, item.isDirectory)
        let infoString = ''

        if (item.isDirectory) {
          infoString = `[DIR] - Use 'read_directory("${item.name}")' to open this folder.`
        } else {
          const sizeKb = (item.size / 1024).toFixed(1) + 'KB'
          infoString = `[${type.toUpperCase()} | ${sizeKb}]`
        }

        return {
          name: item.name,
          type: type,
          path: item.path,
          info: infoString
        }
      })

      return JSON.stringify({
        directory: targetPath,
        items_found: results.length,
        content: results
      })
    } catch (err) {
      console.error(err)
      return `System Error: ${err}`
    }
  })
}
