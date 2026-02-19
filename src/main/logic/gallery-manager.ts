import { IpcMain, app, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url' // ⚡ URL Helper

export default function registerGalleryHandlers(ipcMain: IpcMain) {
  const GALLERY_DIR = path.resolve(app.getPath('userData'), 'Gallery')

  if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true })
  }

  // --- 1. GET GALLERY (Fixes Broken Images) ---
  ipcMain.handle('get-gallery', async () => {
    try {
      if (!fs.existsSync(GALLERY_DIR)) return []

      const files = fs
        .readdirSync(GALLERY_DIR)
        .filter((file) => /\.(png|jpg|jpeg|webp|gif)$/i.test(file))

      return files
        .map((file) => {
          const filePath = path.join(GALLERY_DIR, file)
          const stats = fs.statSync(filePath)

          // ⚡ FIX: Use pathToFileURL to generate valid file:/// URLs on Windows
          const fileUrl = pathToFileURL(filePath).href

          return {
            filename: file,
            // Clean Name: Removes timestamp and IRIS suffix for display
            displayName: file
              .replace(/_\d+_Generated_by_IRIS\.png$/, '') // Remove ID+Suffix
              .replace(/_/g, ' '), // Underscores to spaces
            path: filePath,
            url: fileUrl,
            createdAt: stats.birthtime
          }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error('❌ Gallery Load Error:', error)
      return []
    }
  })

  // --- 2. SAVE IMAGE (Adds Branding) ---
  ipcMain.handle('save-image-to-gallery', async (_event, { title, base64Data }) => {
    try {
      const safeTitle = (title || 'visual')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50)

      const timestamp = Date.now()
      const fileName = `${safeTitle}_${timestamp}_Generated_by_IRIS.png`
      const filePath = path.join(GALLERY_DIR, fileName)

      const data = base64Data.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(data, 'base64')

      fs.writeFileSync(filePath, buffer)
      console.log(`🖼️ Saved: ${fileName}`)

      return { success: true, path: filePath }
    } catch (error: any) {
      console.error('❌ Save Error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('delete-image', async (_event, filename) => {
    try {
      const filePath = path.join(GALLERY_DIR, filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
      return false
    } catch (e) {
      return false
    }
  })

  // --- 4. OPEN FOLDER ---
  ipcMain.handle('open-image-location', async (_event, filePath) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle('save-image-external', async (_event, sourcePath) => {
    try {
      const { dialog } = require('electron')
      const fs = require('fs')

      // 1. Show "Save As" Dialog
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save Image Copy',
        defaultPath: path.basename(sourcePath),
        filters: [{ name: 'Images', extensions: ['png', 'jpg'] }]
      })

      if (filePath) {
        // 2. Copy the file
        fs.copyFileSync(sourcePath, filePath)
        return { success: true }
      }
      return { canceled: true }
    } catch (error: any) {
      console.error('Export Error:', error)
      return { success: false, error: error.message }
    }
  })
}
