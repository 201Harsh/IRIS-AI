import { IpcMain, app, shell } from 'electron'
import { keyboard, Key, mouse } from '@nut-tree-fork/nut-js'
import screenshot from 'screenshot-desktop'
import loudness from 'loudness'
import path from 'path'

// ⚡ Speed configuration
keyboard.config.autoDelayMs = 20 // Slightly increased for better stability

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
  s: Key.S,
  n: Key.N,
  f11: Key.F11,
  f5: Key.F5
}

export default function registerGhostControl(ipcMain: IpcMain) {
  console.log('👻 [Main] Registering Enhanced Master Ghost Controller...')

  ipcMain.handle('ghost-sequence', async (_event, actions: any[]) => {
    try {
      console.log(`🚀 IRIS Sequence: ${actions.length} actions starting...`)

      for (const action of actions) {
        // --- ⏳ WAIT ---
        if (action.type === 'wait') {
          const ms = action.ms || 1000
          await new Promise((r) => setTimeout(r, ms))
        }

        // --- ⌨️ TYPE ---
        else if (action.type === 'type') {
          console.log(`   > Typing: "${action.text}"`)
          await keyboard.type(action.text)
        }

        // --- 🔘 PRESS (Enhanced Multi-Key Support) ---
        else if (action.type === 'press') {
          const keyName = action.key.toLowerCase()
          const k = KEY_MAP[keyName]

          if (k !== undefined) {
            if (action.modifiers && Array.isArray(action.modifiers)) {
              const mods = action.modifiers
                .map((m: string) => KEY_MAP[m.toLowerCase()])
                .filter((m) => m !== undefined)

              console.log(`   > Pressing Combo: ${action.modifiers.join('+')} + ${keyName}`)

              // 1. Hold down all modifiers
              for (const mod of mods) {
                await keyboard.pressKey(mod)
              }

              // 2. Press and release the target key
              await keyboard.pressKey(k)
              await keyboard.releaseKey(k)

              // 3. Release all modifiers in reverse
              for (const mod of mods.reverse()) {
                await keyboard.releaseKey(mod)
              }
            } else {
              console.log(`   > Pressing Key: ${keyName}`)
              await keyboard.pressKey(k)
              await keyboard.releaseKey(k)
            }
          }
        }

        // --- 🖱️ CLICK ---
        else if (action.type === 'click') {
          console.log(`   > Mouse Left Click`)
          await mouse.leftClick()
        }
      }
      return true
    } catch (e) {
      console.error('❌ IRIS Ghost Sequence Failed:', e)
      return false
    }
  })

  // --- 🔊 VOLUME ---
  ipcMain.handle('set-volume', async (_event, level: number) => {
    try {
      await loudness.setVolume(level)
      return `✅ Volume set to ${level}%`
    } catch (e) {
      return '❌ Failed to set volume.'
    }
  })

  // --- 📸 SCREENSHOT ---
  ipcMain.handle('take-screenshot', async () => {
    try {
      const filename = `IRIS_Capture_${Date.now()}.png`
      const savePath = path.join(app.getPath('pictures'), filename)
      await screenshot({ filename: savePath })
      shell.showItemInFolder(savePath)
      return `✅ Screenshot saved to Pictures folder.`
    } catch (e) {
      return '❌ Failed to take screenshot.'
    }
  })
}
