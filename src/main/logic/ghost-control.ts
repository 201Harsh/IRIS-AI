import { IpcMain, app, shell, clipboard, screen } from 'electron'
import { keyboard, Key, mouse, Point, Button } from '@nut-tree-fork/nut-js'
import screenshot from 'screenshot-desktop'
import loudness from 'loudness'
import path from 'path'
import { exec } from 'child_process'

keyboard.config.autoDelayMs = 20

const KEY_MAP: Record<string, Key> = {
  enter: Key.Enter,
  return: Key.Enter,
  space: Key.Space,
  tab: Key.Tab,
  escape: Key.Escape,
  esc: Key.Escape,
  backspace: Key.Backspace,
  shift: Key.LeftShift,
  control: Key.LeftControl,
  ctrl: Key.LeftControl,
  alt: Key.LeftAlt,
  command: Key.LeftSuper,
  win: Key.LeftSuper,
  up: Key.Up,
  down: Key.Down,
  left: Key.Left,
  right: Key.Right,
  pageup: Key.PageUp,
  pagedown: Key.PageDown,
  f: Key.F,
  c: Key.C,
  v: Key.V,
  a: Key.A,
  s: Key.S,
  n: Key.N,
  w: Key.W,
  t: Key.T,
  q: Key.Q,
  r: Key.R,
  x: Key.X,
  z: Key.Z,
  y: Key.Y,
  f1: Key.F1,
  f5: Key.F5,
  f11: Key.F11,
  f12: Key.F12
}

function generateHumanPath(start: Point, end: Point): Point[] {
  const steps = 25 // Lower = Faster, Higher = Smoother
  const pathArray: Point[] = []

  // Add randomness to the curve
  const directionX = end.x > start.x ? 1 : -1
  const directionY = end.y > start.y ? 1 : -1
  const deviation = Math.random() * 80 + 20 // 20-100px curve

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

export default function registerGhostControl(ipcMain: IpcMain) {
  // ⚡ 1. HANDLE FILE COPYING
  ipcMain.handle('copy-file-to-clipboard', async (_event, filePath: string) => {
    return new Promise((resolve) => {
      const cmd = `powershell -command "Set-Clipboard -Path '${filePath}'"`
      exec(cmd, (error) => {
        if (error) {
          console.error('File copy failed:', error)
          resolve(false)
        } else resolve(true)
      })
    })
  })

  ipcMain.handle('ghost-sequence', async (_event, actions: any[]) => {
    try {
      for (const action of actions) {
        if (action.type === 'paste') {
          clipboard.writeText(action.text)
          await new Promise((r) => setTimeout(r, 200))
          await keyboard.pressKey(Key.LeftControl, Key.V)
          await keyboard.releaseKey(Key.V, Key.LeftControl)
        } else if (action.type === 'wait') {
          await new Promise((r) => setTimeout(r, action.ms || 500))
        } else if (action.type === 'type') {
          await keyboard.type(action.text)
        } else if (action.type === 'press') {
          const k = KEY_MAP[action.key.toLowerCase()]
          if (k !== undefined) {
            if (action.modifiers) {
              const mods = action.modifiers
                .map((m: any) => KEY_MAP[m.toLowerCase()])
                .filter(Boolean)
              for (const mod of mods) await keyboard.pressKey(mod)
              await keyboard.pressKey(k)
              await keyboard.releaseKey(k)
              for (const mod of mods.reverse()) await keyboard.releaseKey(mod)
            } else {
              await keyboard.pressKey(k)
              await keyboard.releaseKey(k)
            }
          }
        } else if (action.type === 'click') {
          await mouse.leftClick()
        }
      }
      return true
    } catch (e) {
      return false
    }
  })

  ipcMain.handle('ghost-click-coordinate', async (_event, { x, y, doubleClick }) => {
    try {
      const primaryDisplay = screen.getPrimaryDisplay()
      const scaleFactor = primaryDisplay.scaleFactor // e.g., 1.25 or 1.5

      const logicalX = Math.round(x / scaleFactor)
      const logicalY = Math.round(y / scaleFactor)

      const startPoint = await mouse.getPosition()
      const endPoint = new Point(logicalX, logicalY)

      const pathPoints = generateHumanPath(startPoint, endPoint)
      await mouse.move(pathPoints)

      if (doubleClick) await mouse.doubleClick(Button.LEFT)
      else await mouse.leftClick()

      return true
    } catch (e) {
      console.error('Click failed:', e)
      return false
    }
  })

  ipcMain.handle('ghost-scroll', async (_event, { direction, amount }) => {
    try {
      const scrollAmount = amount || 500
      if (direction === 'up') await mouse.scrollUp(scrollAmount)
      else await mouse.scrollDown(scrollAmount)
      return true
    } catch (e) {
      return false
    }
  })

  ipcMain.handle('get-screen-size', async () => {
    const primaryDisplay = screen.getPrimaryDisplay()
    return {
      width: primaryDisplay.size.width * primaryDisplay.scaleFactor,
      height: primaryDisplay.size.height * primaryDisplay.scaleFactor
    }
  })

  ipcMain.handle('set-volume', async (_event, level: number) => {
    try {
      await loudness.setVolume(level)
      return `Volume ${level}%`
    } catch (e) {
      return 'Error'
    }
  })
  ipcMain.handle('take-screenshot', async () => {
    try {
      const filename = `IRIS_Capture_${Date.now()}.png`
      const savePath = path.join(app.getPath('pictures'), filename)
      await screenshot({ filename: savePath })
      shell.showItemInFolder(savePath)
      return `Screenshot saved.`
    } catch (e) {
      return 'Error'
    }
  })
}
