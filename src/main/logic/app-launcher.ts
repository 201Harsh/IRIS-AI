import { IpcMain } from 'electron'
import { exec } from 'child_process'

const APP_ALIASES: Record<string, string> = {
  vscode: 'code',
  code: 'code',
  'visual studio code': 'code',
  terminal: 'wt',
  cmd: 'start cmd',
  git: 'start git-bash',
  mongo: 'mongodbcompass',
  mongodb: 'mongodbcompass',
  postman: 'postman',

  chrome: 'start chrome',
  'google chrome': 'start chrome',
  edge: 'start msedge',
  brave: 'start brave',
  firefox: 'start firefox',

  whatsapp: 'start whatsapp:',
  discord: 'Update.exe --processStart Discord.exe',
  spotify: 'start spotify:',
  telegram: 'start telegram:',

  tlauncher: 'TLauncher',
  minecraft: 'MinecraftLauncher',
  'cheat engine': 'Cheat Engine',
  steam: 'start steam:',
  'epic games': 'com.epicgames.launcher:',

  'live wallpaper': 'livelywpf',
  lively: 'livelywpf',
  notepad: 'notepad',
  calculator: 'calc',
  settings: 'start ms-settings:',
  explorer: 'explorer',
  files: 'explorer',
  'task manager': 'taskmgr',
  camera: 'start microsoft.windows.camera:',
  photos: 'start microsoft.windows.photos:'
}

const PROCESS_NAMES: Record<string, string> = {
  vscode: 'code.exe',
  code: 'code.exe',
  'visual studio code': 'code.exe',
  chrome: 'chrome.exe',
  'google chrome': 'chrome.exe',
  edge: 'msedge.exe',
  brave: 'brave.exe',
  firefox: 'firefox.exe',
  notepad: 'notepad.exe',
  cmd: 'cmd.exe',
  terminal: 'WindowsTerminal.exe',

  whatsapp: 'WhatsApp.exe',
  discord: 'Discord.exe',
  spotify: 'Spotify.exe',
  telegram: 'Telegram.exe',

  steam: 'steam.exe',
  'epic games': 'EpicGamesLauncher.exe',

  camera: 'WindowsCamera.exe', 
  calculator: 'CalculatorApp.exe',
  settings: 'SystemSettings.exe',
  'task manager': 'Taskmgr.exe',
  photos: 'Microsoft.Photos.exe',
  explorer: 'explorer.exe',
  files: 'explorer.exe'
}

export default function registerAppLauncher(ipcMain: IpcMain) {
  console.log('🚀 [Main] Registering App Launcher & Terminator...')

  ipcMain.removeHandler('open-app')
  ipcMain.handle('open-app', async (_event, appName: string) => {
    return new Promise((resolve) => {
      const lowerName = appName.toLowerCase().trim()
      let command = APP_ALIASES[lowerName]

      if (command) {
        executeCommand(command, appName, resolve)
      } else {
        launchViaPowerShell(appName, resolve)
      }
    })
  })

  ipcMain.removeHandler('close-app')
  ipcMain.handle('close-app', async (_event, appName: string) => {
    return new Promise((resolve) => {
      const lowerName = appName.toLowerCase().trim()

      let processName = PROCESS_NAMES[lowerName]

      if (!processName) {
        processName = appName.endsWith('.exe') ? appName : `${appName}.exe`
      }
      const cmd = `taskkill /IM "${processName}" /F /T`


      exec(cmd, (error) => {
        if (error) {
          resolve({ success: false, error: `Could not close ${appName}. Is it running?` })
        } else {
          resolve({ success: true, message: `Terminated ${appName}` })
        }
      })
    })
  })
}


function executeCommand(command: string, appName: string, resolve: any) {
  console.log(`🚀 IRIS Launching Direct: ${command}`)
  exec(command, (error) => {
    if (error) {
      launchViaPowerShell(appName, resolve)
    } else {
      resolve({ success: true, message: `Opened ${appName}` })
    }
  })
}

function launchViaPowerShell(appName: string, resolve: any) {
  const psCommand = `powershell -Command "Get-StartApps | Where-Object { $_.Name -like '*${appName}*' } | Select-Object -First 1 -ExpandProperty AppID"`

  exec(psCommand, (err, stdout) => {
    if (err) console.warn(`PowerShell search failed for ${appName}:`, err)

    const appId = stdout.trim()

    if (appId) {
      const launchCmd = `start explorer "shell:AppsFolder\\${appId}"`

      exec(launchCmd, (launchErr) => {
        if (launchErr) {
          resolve({ success: false, error: `Found app but could not launch: ${launchErr.message}` })
        } else {
          resolve({ success: true, message: `Opened ${appName} via System Search` })
        }
      })
    } else {
      resolve({
        success: false,
        error: `Could not find '${appName}' on this system. Try opening it manually once.`
      })
    }
  })
}
