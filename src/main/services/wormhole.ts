import { IpcMain } from 'electron'
import { startTunnel } from 'untun'

let activeTunnel: any = null

export default function registerWormhole({ ipcMain }: { ipcMain: IpcMain }) {
  ipcMain.handle('open-wormhole', async (_event, port: number) => {
    try {
      if (activeTunnel) {
        await activeTunnel.close()
        activeTunnel = null
      }

      activeTunnel = await startTunnel({
        port,
        acceptCloudflareNotice: true
      })

      const tunnelUrl = await activeTunnel.getURL()

      return {
        success: true,
        url: tunnelUrl,
        password: null
      }
    } catch (err) {
      console.error('Cloudflare Wormhole Error:', err)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('close-wormhole', async () => {
    if (activeTunnel) {
      await activeTunnel.close()
      activeTunnel = null
    }
    return { success: true }
  })
}
