import { IpcMain, BrowserWindow } from 'electron'
import { spawn } from 'child_process'
import path from 'path'

export default function registerSystemControl(ipcMain: IpcMain) {
  console.log('💻 [Main] Registering Terminal Streamer...')

  const sanitizePath = (inputPath: string) => {
    let clean = path.normalize(inputPath)
    if (clean.endsWith(path.sep)) clean = clean.slice(0, -1)
    return clean
  }

  ipcMain.handle('run-shell-command', async (_event, { command, cwd }) => {
    return new Promise((resolve) => {
      const safeCwd = cwd ? sanitizePath(cwd) : undefined
      console.log(`💻 Executing: "${command}" in ${safeCwd || 'Root'}`)

      const win = BrowserWindow.getAllWindows()[0]

      const child = spawn('powershell.exe', ['-Command', command], {
        cwd: safeCwd,
        stdio: ['ignore', 'pipe', 'pipe'] 
      })

      child.stdout.on('data', (data) => {
        const output = data.toString()
        if (win) win.webContents.send('terminal-data', output)
      })

      child.stderr.on('data', (data) => {
        const output = data.toString()
        if (win) win.webContents.send('terminal-data', `\x1b[31m${output}\x1b[0m`)
      })

      child.on('close', (code) => {
        const msg = `\r\n[Process exited with code ${code}]\r\n`
        if (win) win.webContents.send('terminal-data', msg)
        resolve({ success: code === 0, output: `Completed with code ${code}` })
      })

      child.on('error', (err) => {
        if (win) win.webContents.send('terminal-data', `Error: ${err.message}`)
        resolve({ success: false, output: err.message })
      })
    })
  })
}
