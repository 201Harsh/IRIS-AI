import { IpcMain, app } from 'electron'
import { exec } from 'child_process'
import util from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = util.promisify(exec)

let activeDevice: { ip: string; port: string } | any | null = null

export default function registerAdbHandlers(ipcMain: IpcMain) {
  const dirPath = path.join(app.getPath('userData'), 'Connected Devices')
  const historyPath = path.join(dirPath, 'Connect-mobile.json')

  const saveDeviceToHistory = async (ip: string, port: string, model: string) => {
    try {
      await fs.mkdir(dirPath, { recursive: true })

      let history: any[] = []
      try {
        const file = await fs.readFile(historyPath, 'utf-8')
        history = JSON.parse(file)
      } catch (e) {}

      const existingIndex = history.findIndex((d) => d.ip === ip)
      const deviceData = { ip, port, model, lastConnected: new Date().toISOString() }

      if (existingIndex > -1) {
        history[existingIndex] = deviceData
      } else {
        history.push(deviceData)
      }
      await fs.writeFile(historyPath, JSON.stringify(history, null, 2))
    } catch (e) {
      console.error('Failed to save device history', e)
    }
  }

  ipcMain.removeHandler('adb-get-history')
  ipcMain.handle('adb-get-history', async () => {
    try {
      const file = await fs.readFile(historyPath, 'utf-8')
      return JSON.parse(file)
    } catch (e) {
      return []
    }
  })

  ipcMain.removeHandler('adb-connect')
  ipcMain.handle('adb-connect', async (_, { ip, port }) => {
    try {
      const { stdout } = await execAsync(`adb connect ${ip}:${port}`)

      if (
        stdout.toLowerCase().includes('connected to') ||
        stdout.toLowerCase().includes('already connected')
      ) {
        activeDevice = { ip, port }

        try {
          const { stdout: modelOut } = await execAsync(
            `adb -s ${ip}:${port} shell getprop ro.product.model`
          )
          await saveDeviceToHistory(ip, port, modelOut.trim().toUpperCase() || 'UNKNOWN DEVICE')
        } catch (e) {}

        return { success: true }
      }
      return { success: false, error: stdout }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.removeHandler('adb-disconnect')
  ipcMain.handle('adb-disconnect', async () => {
    if (!activeDevice) return { success: true }
    try {
      await execAsync(`adb disconnect ${activeDevice.ip}:${activeDevice.port}`)
      activeDevice = null
      return { success: true }
    } catch (e: any) {
      return { success: false }
    }
  })

  ipcMain.removeHandler('adb-screenshot')
  ipcMain.handle('adb-screenshot', async () => {
    if (!activeDevice) return { success: false }
    return new Promise((resolve) => {
      exec(
        `adb -s ${activeDevice.ip}:${activeDevice.port} exec-out screencap -p`,
        { encoding: 'buffer', maxBuffer: 1024 * 1024 * 20 },
        (error, stdout) => {
          if (error) {
            resolve({ success: false })
          } else {
            const base64 = `data:image/png;base64,${stdout.toString('base64')}`
            resolve({ success: true, image: base64 })
          }
        }
      )
    })
  })

  ipcMain.removeHandler('adb-quick-action')
  ipcMain.handle('adb-quick-action', async (_, { action }) => {
    if (!activeDevice) return { success: false }
    const target = `-s ${activeDevice.ip}:${activeDevice.port}`
    try {
      if (action === 'camera') {
        await execAsync(`adb ${target} shell am start -a android.media.action.STILL_IMAGE_CAMERA`)
      } else if (action === 'wake') {
        await execAsync(`adb ${target} shell input keyevent KEYCODE_WAKEUP`)
      } else if (action === 'lock') {
        await execAsync(`adb ${target} shell input keyevent KEYCODE_SLEEP`)
      } else if (action === 'home') {
        await execAsync(`adb ${target} shell input keyevent KEYCODE_HOME`)
      }
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.removeHandler('adb-telemetry')
  ipcMain.handle('adb-telemetry', async () => {
    if (!activeDevice) return { success: false, error: 'No device connected' }
    const target = `-s ${activeDevice.ip}:${activeDevice.port}`
    try {
      const { stdout: batteryOut } = await execAsync(`adb ${target} shell dumpsys battery`)
      const levelMatch = batteryOut.match(/level: (\d+)/)
      const tempMatch = batteryOut.match(/temperature: (\d+)/)
      const isCharging =
        batteryOut.includes('AC powered: true') || batteryOut.includes('USB powered: true')

      const level = levelMatch ? parseInt(levelMatch[1]) : 0
      const temp = tempMatch ? (parseInt(tempMatch[1]) / 10).toFixed(1) : 0

      const { stdout: storageOut } = await execAsync(`adb ${target} shell df -h /data`)
      const storageLines = storageOut.trim().split('\n')
      let storageUsed = '0',
        storageTotal = '0',
        storagePercent = 0

      if (storageLines.length > 1) {
        const parts = storageLines[1].trim().split(/\s+/)
        storageTotal = parts[1]
        storageUsed = parts[2]
        storagePercent = parseInt(parts[4].replace('%', '')) || 0
      }

      const { stdout: modelOut } = await execAsync(`adb ${target} shell getprop ro.product.model`)
      const { stdout: osOut } = await execAsync(
        `adb ${target} shell getprop ro.build.version.release`
      )

      return {
        success: true,
        data: {
          model: modelOut.trim().toUpperCase(),
          os: `ANDROID ${osOut.trim()}`,
          battery: { level, isCharging, temp },
          storage: { used: storageUsed, total: storageTotal, percent: storagePercent }
        }
      }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })
}
