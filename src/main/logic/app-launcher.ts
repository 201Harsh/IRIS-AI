import { IpcMain } from 'electron'
import { exec } from 'child_process'
import os from 'os'

const runCommand = (cmd: string): Promise<string> => {
  return new Promise((resolve) => {
    exec(cmd, (err, stdout) => {
      resolve(err ? '' : stdout.trim())
    })
  })
}

export default function registerAppScanner(ipcMain: IpcMain) {
  console.log('🔵 [Main] Registering App Scanner...')

  ipcMain.removeHandler('get-running-apps')

  ipcMain.handle('get-running-apps', async () => {
    try {
      if (os.platform() === 'win32') {
        const cmd = `powershell "Get-Process | Where-Object {$_.MainWindowTitle -ne ''} | Select-Object -ExpandProperty ProcessName"`
        const output = await runCommand(cmd)
        const apps = output
          .split(/\r?\n/)
          .map((a) => a.trim())
          .filter((a) => a)
        return [...new Set(apps)]
      }

      if (os.platform() === 'darwin') {
        const cmd = `osascript -e 'tell application "System Events" to get name of (processes where background only is false)'`
        const output = await runCommand(cmd)
        return output.split(', ').map((s) => s.trim())
      }

      return [] 
    } catch (e) {
      console.error('App Scan Error:', e)
      return []
    }
  })
}
