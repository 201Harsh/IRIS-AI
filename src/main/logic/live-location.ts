import { IpcMain } from 'electron'
import { exec } from 'child_process'

export default function registerLocationHandlers(ipcMain: IpcMain) {
  ipcMain.removeHandler('get-live-location')

  const runPowerShell = (cmd: string): Promise<string> => {
    return new Promise((resolve) => {
      exec(`powershell -Command "${cmd.replace(/"/g, '\\"')}"`, (error, stdout) => {
        if (error) {
          return resolve('')
        }
        resolve(stdout ? stdout.trim() : '')
      })
    })
  }

  ipcMain.handle('get-live-location', async () => {
    try {
      console.log('🌍 Activating Windows Hardware Location Service...')

      const psCommand = `Add-Type -AssemblyName System.Device; $w = New-Object System.Device.Location.GeoCoordinateWatcher; $w.Start(); $t = 0; while($w.Position.Location.IsUnknown -and $t -lt 15) { Start-Sleep -Milliseconds 300; $t++ }; if(!$w.Position.Location.IsUnknown) { Write-Output "$($w.Position.Location.Latitude),$($w.Position.Location.Longitude)" }`

      const osLocation = await runPowerShell(psCommand)

      if (osLocation && osLocation.includes(',')) {
        const [lat, lon] = osLocation.split(',')
        console.log(`📍 Hardware Lock Acquired: ${lat}, ${lon}`)

        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        )
        const geoData = await geoRes.json()

        return {
          city: geoData.city || geoData.locality,
          region: geoData.principalSubdivision,
          country: geoData.countryName,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          fullString: `${geoData.city || geoData.locality}, ${geoData.principalSubdivision}, ${geoData.countryName}`
        }
      }

      console.warn(
        '⚠️ Hardware location failed (Is Windows Location turned on?). Falling back to IP routing...'
      )

      const ipRes = await fetch('http://ip-api.com/json/')
      const ipData = await ipRes.json()

      if (ipData.status === 'success') {
        return {
          city: ipData.city,
          region: ipData.regionName,
          country: ipData.country,
          lat: ipData.lat,
          lon: ipData.lon,
          timezone: ipData.timezone,
          fullString: `${ipData.city}, ${ipData.regionName}, ${ipData.country}`
        }
      }

      return null
    } catch (error) {
      console.error('Location Engine Error:', error)
      return null
    }
  })
}
