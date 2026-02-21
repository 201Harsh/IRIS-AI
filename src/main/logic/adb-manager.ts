import { IpcMain } from 'electron'
import { exec } from 'child_process'
import util from 'util'

const execAsync = util.promisify(exec)

let activeDevice: { ip: string; port: string } | any | null = null

export default function registerAdbHandlers(ipcMain: IpcMain) {
  ipcMain.removeHandler('adb-connect')
  ipcMain.removeHandler('adb-disconnect')
  ipcMain.removeHandler('adb-telemetry')
  ipcMain.removeHandler('adb-screenshot')
  ipcMain.removeHandler('get-mobile-info-ai')

  ipcMain.handle('adb-connect', async (_, { ip, port }) => {
    try {
      console.log(`📡 Attempting ADB connection to ${ip}:${port}...`)
      const { stdout } = await execAsync(`adb connect ${ip}:${port}`)

      if (
        stdout.toLowerCase().includes('connected to') ||
        stdout.toLowerCase().includes('already connected')
      ) {
        activeDevice = { ip, port }
        return { success: true }
      }
      return { success: false, error: stdout }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

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

  ipcMain.handle('adb-telemetry', async () => {
    if (!activeDevice) return { success: false, error: 'No device connected' }
    const target = `-s ${activeDevice.ip}:${activeDevice.port}`
    try {
      const { stdout: batteryOut } = await execAsync(`adb ${target} shell dumpsys battery`)
      const levelMatch = batteryOut.match(/level: (\d+)/)
      const tempMatch = batteryOut.match(/temperature: (\d+)/)
      const acMatch = batteryOut.match(/AC powered: (true|false)/)
      const usbMatch = batteryOut.match(/USB powered: (true|false)/)

      const level = levelMatch ? parseInt(levelMatch[1]) : 0
      const temp = tempMatch ? (parseInt(tempMatch[1]) / 10).toFixed(1) : 0
      const isCharging = (acMatch && acMatch[1] === 'true') || (usbMatch && usbMatch[1] === 'true')

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

  ipcMain.handle('get-mobile-info-ai', async () => {
    if (!activeDevice) return 'Error: You are not currently connected to any mobile device.'
    try {
      const target = `-s ${activeDevice.ip}:${activeDevice.port}`
      const { stdout: batOut } = await execAsync(`adb ${target} shell dumpsys battery`)
      const level = batOut.match(/level: (\d+)/)?.[1] || 'Unknown'
      const { stdout: modelOut } = await execAsync(`adb ${target} shell getprop ro.product.model`)

      return `I am currently linked to your ${modelOut.trim()}. The battery is at ${level}%.`
    } catch (e) {
      return 'I am connected, but I could not retrieve the telemetry data.'
    }
  })
}
