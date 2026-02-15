import { IpcMain, app, shell } from 'electron'
import { keyboard, Key, mouse } from '@nut-tree-fork/nut-js'
import screenshot from 'screenshot-desktop'
import loudness from 'loudness'
import path from 'path'

keyboard.config.autoDelayMs = 10

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
  f: Key.F,
  c: Key.C,
  v: Key.V,
  a: Key.A,
  f11: Key.F11,
  f5: Key.F5
}

export default function registerGhostControl(ipcMain: IpcMain) {
  console.log('👻 [Main] Registering Master Ghost Controller (Forked Engine)...')

  ipcMain.handle('ghost-sequence', async (_event, actions: any[]) => {
    try {
      console.log(`👻 Executing Sequence of ${actions.length} actions...`)

      for (const action of actions) {
        if (action.type === 'wait') {
          const ms = action.ms || 1000
          await new Promise((r) => setTimeout(r, ms))
        } else if (action.type === 'type') {
          await keyboard.type(action.text)
        } else if (action.type === 'press') {
          const keyName = action.key.toLowerCase()
          const k = KEY_MAP[keyName]

          if (k !== undefined) {
            if (action.modifiers && Array.isArray(action.modifiers)) {
              const mods = action.modifiers
                .map((m: string) => KEY_MAP[m.toLowerCase()])
                .filter((m) => m !== undefined)
              await keyboard.pressKey(...mods)
              await keyboard.pressKey(k)
              await keyboard.releaseKey(k)
              await keyboard.releaseKey(...mods.reverse())
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
      console.error('Ghost Sequence Failed:', e)
      return false
    }
  })

  ipcMain.handle('set-volume', async (_event, level: number) => {
    try {
      await loudness.setVolume(level)
      return `Volume set to ${level}%`
    } catch (e) {
      return 'Failed to set volume.'
    }
  })

  ipcMain.handle('take-screenshot', async () => {
    try {
      const filename = `screenshot_${Date.now()}.png`
      const savePath = path.join(app.getPath('pictures'), filename)
      await screenshot({ filename: savePath })
      shell.showItemInFolder(savePath)
      return `Screenshot saved.`
    } catch (e) {
      return 'Failed to take screenshot.'
    }
  })
}
