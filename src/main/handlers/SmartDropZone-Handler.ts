import { IpcMain, BrowserWindow, screen } from 'electron'
import { mouse, Point, Button } from '@nut-tree-fork/nut-js'
import fs from 'fs/promises'
import path from 'path'

function generateHumanPath(start: Point, end: Point): Point[] {
  const steps = 25
  const pathArray: Point[] = []
  const directionX = end.x > start.x ? 1 : -1
  const directionY = end.y > start.y ? 1 : -1
  const deviation = Math.random() * 80 + 20

  const controlPoint = new Point(
    start.x +
      (Math.abs(end.x - start.x) / 2) * directionX +
      (Math.random() < 0.5 ? -deviation : deviation),
    start.y +
      (Math.abs(end.y - start.y) / 2) * directionY +
      (Math.random() < 0.5 ? -deviation : deviation)
  )

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * controlPoint.x + t * t * end.x
    const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * controlPoint.y + t * t * end.y
    pathArray.push(new Point(x, y))
  }
  return pathArray
}

export default function registerDropZoneControl(ipcMain: IpcMain) {
  ipcMain.handle('ghost-drag-and-drop', async (_event, { startX, startY, endX, endY }) => {
    try {
      const primaryDisplay = screen.getPrimaryDisplay()
      const scaleFactor = primaryDisplay.scaleFactor

      const start = new Point(Math.round(startX / scaleFactor), Math.round(startY / scaleFactor))
      const end = new Point(Math.round(endX / scaleFactor), Math.round(endY / scaleFactor))

      const pathPoints = generateHumanPath(start, end)

      await mouse.setPosition(start)
      await new Promise((r) => setTimeout(r, 200))
      await mouse.pressButton(Button.LEFT)
      await new Promise((r) => setTimeout(r, 100))
      await mouse.move(pathPoints) 
      await new Promise((r) => setTimeout(r, 100))
      await mouse.releaseButton(Button.LEFT)

      return true
    } catch (e) {
      console.error('Drag failed:', e)
      return false
    }
  })

  ipcMain.handle('move-file-to-category', async (_event, { sourcePath, targetFolder }) => {
    try {
      const fileName = path.basename(sourcePath)
      const destPath = path.join(targetFolder, fileName)

      await fs.mkdir(targetFolder, { recursive: true })

      await fs.rename(sourcePath, destPath)
      return { success: true, destPath }
    } catch (e: any) {
      console.error('File move failed:', e)
      return { success: false, error: e.message }
    }
  })

  let dropZoneWindow: BrowserWindow | null = null
  ipcMain.handle('spawn-drop-zone-ui', async () => {
    if (dropZoneWindow) return
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    dropZoneWindow = new BrowserWindow({
      width,
      height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: { nodeIntegration: true, contextIsolation: false }
    })
    return true
  })

  ipcMain.handle('close-drop-zone-ui', async () => {
    if (dropZoneWindow) {
      dropZoneWindow.close()
      dropZoneWindow = null
    }
  })
}
