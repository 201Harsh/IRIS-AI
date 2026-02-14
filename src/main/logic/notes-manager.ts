import { IpcMain, app } from 'electron'
import fs from 'fs'
import path from 'path'

export default function registerNotesHandlers(ipcMain: IpcMain) {
  const NOTES_DIR = path.resolve(app.getPath('userData'), 'Notes')

  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true })
  }

  ipcMain.handle('save-note', async (_event, { title, content }) => {
    try {
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const fileName = `${safeTitle}.md`
      const filePath = path.join(NOTES_DIR, fileName)

      const fileContent = `# ${title}\n\n${content}`

      fs.writeFileSync(filePath, fileContent, 'utf-8')
      console.log(`📝 Note Saved: ${fileName}`)
      return { success: true, path: filePath }
    } catch (error: any) {
      console.error('Save Note Error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('get-notes', async () => {
    try {
      const files = fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith('.md'))

      return files
        .map((file) => {
          const filePath = path.join(NOTES_DIR, file)
          const stats = fs.statSync(filePath)
          const content = fs.readFileSync(filePath, 'utf-8')

          return {
            filename: file,
            title: file.replace('.md', '').replace(/_/g, ' '),
            content: content,
            createdAt: stats.birthtime,
            path: filePath
          }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) 
    } catch (error) {
      return []
    }
  })

  // --- 3. DELETE NOTE ---
  ipcMain.handle('delete-note', async (_event, filename) => {
    try {
      const filePath = path.join(NOTES_DIR, filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
      return false
    } catch (e) {
      return false
    }
  })
}
