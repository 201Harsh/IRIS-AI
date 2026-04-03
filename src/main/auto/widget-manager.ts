import { ipcMain, BrowserWindow, app } from 'electron'
import path from 'path'
import fs from 'fs/promises'

let activeWidgets: BrowserWindow[] = []

export default function registerWidgetMaker() {
  ipcMain.handle('create-widget', async (_, { htmlCode, width, height }) => {
    try {
      const widgetDir = path.join(app.getPath('userData'), 'DynamicWidgets')
      await fs.mkdir(widgetDir, { recursive: true })

      const widgetId = Date.now()
      const filePath = path.join(widgetDir, `widget_${widgetId}.html`)

      const UXInjection = `
        <style>
          body { -webkit-app-region: drag; overflow: hidden; background: transparent !important; margin: 0; }
          button, input, a, select, textarea { -webkit-app-region: no-drag; }
        </style>
        <script>
          document.addEventListener('dblclick', (e) => {
             if(e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                 window.close();
             }
          });
        </script>
      `

      const finalHtml = htmlCode.includes('</head>')
        ? htmlCode.replace('</head>', `${UXInjection}</head>`)
        : htmlCode + UXInjection

      await fs.writeFile(filePath, finalHtml, 'utf-8')

      const widgetWin = new BrowserWindow({
        width: width || 420,
        height: height || 500,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        type: 'toolbar',
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      widgetWin.setAlwaysOnTop(true, 'screen-saver')
      widgetWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

      widgetWin.loadFile(filePath)
      activeWidgets.push(widgetWin)

      widgetWin.once('ready-to-show', () => {
        widgetWin.showInactive()
      })

      widgetWin.on('closed', () => {
        activeWidgets = activeWidgets.filter((w) => w !== widgetWin)
        fs.unlink(filePath).catch(() => {})
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('close-widgets', async () => {
    try {
      if (activeWidgets.length === 0) {
        return { success: true, message: 'No active widgets to close.' }
      }

      const count = activeWidgets.length
      activeWidgets.forEach((win) => {
        if (!win.isDestroyed()) {
          win.close()
        }
      })

      activeWidgets = []
      return { success: true, message: `Closed ${count} active widget(s).` }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })
}
