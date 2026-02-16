import { IpcMain, app, shell, clipboard } from 'electron'
import { keyboard, Key, mouse } from '@nut-tree-fork/nut-js'
import screenshot from 'screenshot-desktop'
import loudness from 'loudness'
import path from 'path'
import { exec } from 'child_process' // ⚡ REQUIRED FOR FILES

// ⚡ Speed configuration
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

  // ⚡ 1. HANDLE FILE COPYING (POWERSHELL TRICK)
  ipcMain.handle('copy-file-to-clipboard', async (_event, filePath: string) => {
    return new Promise((resolve) => {
      const cmd = `powershell -command "Set-Clipboard -Path '${filePath}'"`
      exec(cmd, (error) => {
        if (error) {
          console.error('File copy failed:', error)
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  })

  // ⚡ 2. THE SEQUENCER
  ipcMain.handle('ghost-sequence', async (_event, actions: any[]) => {
    try {
      console.log(`🚀 Sequence: ${actions.length} steps`)

      for (const action of actions) {
        // --- 📋 PASTE (THE FIX FOR SENDING) ---
        if (action.type === 'paste') {
          // Put text in clipboard
          clipboard.writeText(action.text)
          await new Promise((r) => setTimeout(r, 300)) // Wait for clipboard sync

          // Press Ctrl+V manually
          await keyboard.pressKey(Key.LeftControl)
          await keyboard.pressKey(Key.V)
          await keyboard.releaseKey(Key.V)
          await keyboard.releaseKey(Key.LeftControl)
        }

        // --- ⏳ WAIT ---
        else if (action.type === 'wait') {
          const ms = action.ms || 1000
          await new Promise((r) => setTimeout(r, ms))
        }

        // --- ⌨️ TYPE ---
        else if (action.type === 'type') {
          await keyboard.type(action.text)
        }

        // --- 🔘 PRESS ---
        else if (action.type === 'press') {
          const keyName = action.key.toLowerCase()
          const k = KEY_MAP[keyName]
          if (k !== undefined) {
            if (action.modifiers && Array.isArray(action.modifiers)) {
              const mods = action.modifiers
                .map((m: any) => KEY_MAP[m.toLowerCase()])
                .filter((m: any) => m !== undefined)
              for (const mod of mods) await keyboard.pressKey(mod)
              await keyboard.pressKey(k)
              await keyboard.releaseKey(k)
              for (const mod of mods.reverse()) await keyboard.releaseKey(mod)
            } else {
              await keyboard.pressKey(k)
              await keyboard.releaseKey(k)
            }
          }
        }

        // --- 🖱️ CLICK ---
        else if (action.type === 'click') {
          await mouse.leftClick()
        }
      }
      return true
    } catch (e) {
      return false
    }
  })

  // --- VOLUME & SCREENSHOT ---
  ipcMain.handle('set-volume', async (_event, level: number) => {
    try {
      await loudness.setVolume(level)
      return `Volume set to ${level}%`
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
