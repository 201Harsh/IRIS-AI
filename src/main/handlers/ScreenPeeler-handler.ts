import {
  ipcMain,
  BrowserWindow,
  app,
  screen,
  globalShortcut,
  desktopCapturer,
  nativeImage
} from 'electron'
import path from 'path'
import fs from 'fs/promises'

import clipboardy from 'clipboardy'
import Prism from 'prismjs'

const loadLanguages = require('prismjs/components/')
loadLanguages([
  'javascript',
  'typescript',
  'python',
  'jsx',
  'tsx',
  'json',
  'html',
  'css',
  'bash',
  'yaml'
])

let peelerWindow: BrowserWindow | null = null

async function executeClipboardyWrite(text: string) {
  const clipWrite = clipboardy.write || (clipboardy as any).default?.write
  if (clipWrite) {
    await clipWrite(text)
  } else {
    require('electron').clipboard.writeText(text)
  }
}

export default function registerScreenPeeler() {
  const triggerPeeler = async () => {
    if (peelerWindow) return

    try {
      const primaryDisplay = screen.getPrimaryDisplay()
      const { width, height } = primaryDisplay.bounds

      const widgetDir = path.join(app.getPath('userData'), 'DynamicWidgets')
      await fs.mkdir(widgetDir, { recursive: true })
      const filePath = path.join(widgetDir, `peeler_overlay_${Date.now()}.html`)

      const htmlCode = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: rgba(0,0,0,0.35); cursor: crosshair; user-select: none; font-family: monospace; }
            #hud { position: absolute; top: 48px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.9); color: #34d399; padding: 12px 24px; border-radius: 99px; border: 1px solid rgba(52,211,153,0.4); box-shadow: 0 0 30px rgba(52,211,153,0.2); display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; pointer-events: none; }
            #selection { position: absolute; border: 1px solid #34d399; background: rgba(52,211,153,0.1); box-shadow: 0 0 50px rgba(52,211,153,0.2); display: none; }
            .corner { position: absolute; width: 8px; height: 8px; box-shadow: 0 0 10px white; }
            .tl { top: -4px; left: -4px; border-top: 2px solid white; border-left: 2px solid white; }
            .tr { top: -4px; right: -4px; border-top: 2px solid white; border-right: 2px solid white; }
            .bl { bottom: -4px; left: -4px; border-bottom: 2px solid white; border-left: 2px solid white; }
            .br { bottom: -4px; right: -4px; border-bottom: 2px solid white; border-right: 2px solid white; }
          </style>
        </head>
        <body>
          <div id="hud">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
            Select Area to Rip
          </div>
          <div id="selection">
            <div class="corner tl"></div><div class="corner tr"></div>
            <div class="corner bl"></div><div class="corner br"></div>
          </div>
          <script>
            const { ipcRenderer } = require('electron');
            let startX, startY, isDrawing = false;
            const selection = document.getElementById('selection');
            const hud = document.getElementById('hud');

            document.addEventListener('mousedown', (e) => {
              isDrawing = true; startX = e.clientX; startY = e.clientY;
              selection.style.left = startX + 'px'; selection.style.top = startY + 'px';
              selection.style.width = '0px'; selection.style.height = '0px';
              selection.style.display = 'block'; hud.style.display = 'none';
            });

            document.addEventListener('mousemove', (e) => {
              if (!isDrawing) return;
              selection.style.left = Math.min(startX, e.clientX) + 'px';
              selection.style.top = Math.min(startY, e.clientY) + 'px';
              selection.style.width = Math.abs(e.clientX - startX) + 'px';
              selection.style.height = Math.abs(e.clientY - startY) + 'px';
            });

            document.addEventListener('mouseup', (e) => {
              if (!isDrawing) return;
              isDrawing = false;
              
              // HIDE THE GREEN BOX IMMEDIATELY BEFORE SENDING IPC
              selection.style.display = 'none';
              
              const width = parseInt(selection.style.width);
              const height = parseInt(selection.style.height);
              
              // Wait 50ms to ensure the DOM is painted without the box
              setTimeout(() => {
                if (width > 20 && height > 20) {
                  ipcRenderer.send('peeler-result', { x: parseInt(selection.style.left), y: parseInt(selection.style.top), width, height });
                } else {
                  ipcRenderer.send('peeler-result', null);
                }
              }, 50);
            });

            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') ipcRenderer.send('peeler-result', null);
            });
          </script>
        </body>
        </html>
      `
      await fs.writeFile(filePath, htmlCode, 'utf-8')

      peelerWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width,
        height,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        type: 'toolbar',
        webPreferences: { nodeIntegration: true, contextIsolation: false }
      })

      peelerWindow.setAlwaysOnTop(true, 'screen-saver')
      peelerWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
      await peelerWindow.loadFile(filePath)

      peelerWindow.on('closed', () => {
        peelerWindow = null
        fs.unlink(filePath).catch(() => {})
      })
    } catch (error) {
      console.error('Peeler Forge Error:', error)
    }
  }

  globalShortcut.register('CommandOrControl+Alt+X', triggerPeeler)

  ipcMain.on('copy-extracted-text', async (event, text) => {
    if (!event) return
    await executeClipboardyWrite(text)
  })

  ipcMain.on('copy-extracted-image', (event, base64DataUrl) => {
    if (!event) return
    const image = nativeImage.createFromDataURL(base64DataUrl)
    require('electron').clipboard.writeImage(image)
  })

  ipcMain.on('peeler-result', async (event, coordinates) => {
    if (!event) return
    if (peelerWindow) peelerWindow.close()
    if (!coordinates) return

    let resultWindow: BrowserWindow | null = null
    let filePath = ''

    try {
      const primaryDisplay = screen.getPrimaryDisplay()
      const scaleFactor = primaryDisplay.scaleFactor

      await new Promise((resolve) => setTimeout(resolve, 150))

      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: primaryDisplay.size.width * scaleFactor,
          height: primaryDisplay.size.height * scaleFactor
        }
      })

      const croppedImage = sources[0].thumbnail.crop({
        x: Math.round(coordinates.x * scaleFactor),
        y: Math.round(coordinates.y * scaleFactor),
        width: Math.round(coordinates.width * scaleFactor),
        height: Math.round(coordinates.height * scaleFactor)
      })

      const rawBase64 = croppedImage.toPNG().toString('base64')
      const base64DataUrl = croppedImage.toDataURL()

      const widgetDir = path.join(app.getPath('userData'), 'DynamicWidgets')
      await fs.mkdir(widgetDir, { recursive: true })
      filePath = path.join(widgetDir, `peel_result_${Date.now()}.html`)

      const widgetHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            code[class*="language-"], pre[class*="language-"] { color: #ccc; background: none; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; font-size: 13px; text-align: left; white-space: pre; word-spacing: normal; word-break: normal; word-wrap: normal; line-height: 1.5; tab-size: 4; hyphens: none; }
            .token.comment, .token.block-comment, .token.prolog, .token.doctype, .token.cdata { color: #999; }
            .token.punctuation { color: #ccc; }
            .token.tag, .token.attr-name, .token.namespace, .token.deleted { color: #e2777a; }
            .token.function-name { color: #6196cc; }
            .token.boolean, .token.number, .token.function { color: #f08d49; }
            .token.property, .token.class-name, .token.constant, .token.symbol { color: #f8c555; }
            .token.selector, .token.important, .token.atrule, .token.keyword, .token.builtin { color: #cc99cd; }
            .token.string, .token.char, .token.attr-value, .token.regex, .token.variable { color: #7ec699; }
            .token.operator, .token.entity, .token.url { color: #67cdcc; }

            body { margin: 0; padding: 0; background: transparent; overflow: hidden; font-family: 'Inter', sans-serif; color: #e4e4e7; }
            .glass-panel { 
              width: 100vw; height: 100vh; box-sizing: border-box; background: rgba(10, 10, 10, 0.95); 
              backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
              display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            }
            
            .drag-header {
              height: 40px; background: rgba(0,0,0,0.4); border-bottom: 1px solid rgba(255,255,255,0.05);
              -webkit-app-region: drag; display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
            }
            .drag-header .brand { font-size: 11px; font-weight: 900; letter-spacing: 0.2em; color: #34d399; display: flex; align-items: center; gap: 8px; }
            .drag-header .brand .dot { width: 6px; height: 6px; background: #34d399; border-radius: 50%; box-shadow: 0 0 10px #34d399; }
            
            .controls { -webkit-app-region: no-drag; display: flex; gap: 8px; }
            .action-btn { 
              background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e4e4e7;
              padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; transition: all 0.2s; text-transform: uppercase;
            }
            .action-btn:hover { background: rgba(52,211,153,0.1); border-color: #34d399; color: #34d399; }
            .close-btn { background: transparent; border: none; color: #ef4444; font-size: 14px; cursor: pointer; padding: 0 4px; font-weight: bold; }

            .tabs { display: flex; -webkit-app-region: no-drag; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); }
            .tab { flex: 1; padding: 10px; text-align: center; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; color: #a1a1aa; cursor: pointer; text-transform: uppercase; border-bottom: 2px solid transparent; }
            .tab.active { color: #34d399; border-bottom: 2px solid #34d399; background: rgba(52,211,153,0.05); }

            .content-area { flex: 1; position: relative; overflow: hidden; -webkit-app-region: no-drag; }
            
            .view { position: absolute; inset: 0; padding: 16px; overflow: auto; display: none; z-index: 1; }
            .view.active { display: block; z-index: 2; }

            #image-view { align-items: center; justify-content: center; }
            #image-view.active { display: flex; }

            #loading-overlay {
              position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
              background: rgba(10,10,10,0.95); z-index: 10; gap: 20px;
            }
            .loader {
              width: 48px; height: 48px; border: 3px solid rgba(52,211,153,0.1); border-radius: 50%;
              border-top-color: #34d399; border-bottom-color: #34d399; animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
            }
            @keyframes spin { 100% { transform: rotate(360deg); } }
            .loading-text { font-size: 12px; font-weight: bold; letter-spacing: 0.3em; color: #34d399; animation: pulse 1.5s infinite; }

            pre { margin: 0; }
            #raw-image { max-width: 100%; max-height: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="glass-panel">
            
            <div class="drag-header">
              <div class="brand"><div class="dot"></div> OS EXTRACTOR</div>
              <div class="controls">
                <button class="action-btn" onclick="copyData('text')">Copy Code</button>
                <button class="action-btn" onclick="copyData('image')">Copy Image</button>
                <button class="close-btn" onclick="window.close()">✕</button>
              </div>
            </div>

            <div class="tabs">
              <div class="tab active" onclick="switchTab('text')">TEXT / CODE</div>
              <div class="tab" onclick="switchTab('image')">SOURCE IMAGE</div>
            </div>
            
            <div class="content-area">
              <div id="loading-overlay">
                <div class="loader"></div>
                <div class="loading-text" id="loading-status">RUNNING AI VISION...</div>
              </div>

              <div id="text-view" class="view active">
                <pre><code id="extracted-code" contenteditable="true" spellcheck="false" style="outline: none; display: block;"></code></pre>
              </div>
              <div id="image-view" class="view">
                <img id="raw-image" src="${base64DataUrl}">
              </div>
            </div>
          </div>
          
          <script>
            const { ipcRenderer } = require('electron');
            let rawExtractedText = '';

            function switchTab(tab) {
              document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
              document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
              event.target.classList.add('active');
              document.getElementById(tab + '-view').classList.add('active');
            }

            function copyData(type) {
              const btns = document.querySelectorAll('.action-btn');
              if (type === 'text' && rawExtractedText) {
                ipcRenderer.send('copy-extracted-text', rawExtractedText);
                btns[0].innerText = 'COPIED!'; setTimeout(() => btns[0].innerText = 'COPY CODE', 1500);
              } else if (type === 'image') {
                ipcRenderer.send('copy-extracted-image', '${base64DataUrl}');
                btns[1].innerText = 'COPIED!'; setTimeout(() => btns[1].innerText = 'COPY IMAGE', 1500);
              }
            }

            window.injectResult = function(rawText, highlightedHTML) {
              rawExtractedText = rawText;
              document.getElementById('loading-overlay').style.display = 'none';
              document.getElementById('extracted-code').innerHTML = highlightedHTML;
            }

            window.injectError = function(errorMsg) {
              document.getElementById('loading-status').innerText = 'ERROR: ' + errorMsg;
              document.getElementById('loading-status').style.color = '#ef4444';
              document.querySelector('.loader').style.display = 'none';
            }
          </script>
        </body>
        </html>
      `

      await fs.writeFile(filePath, widgetHtml, 'utf-8')

      const finalWidth = Math.min(Math.max(coordinates.width, 450), 800)
      const finalHeight = Math.min(Math.max(coordinates.height + 100, 300), 700)

      resultWindow = new BrowserWindow({
        x: coordinates.x,
        y: coordinates.y,
        width: finalWidth,
        height: finalHeight,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
      })

      resultWindow.setAlwaysOnTop(true, 'screen-saver')
      resultWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
      await resultWindow.loadFile(filePath)
      resultWindow.on('closed', () => {
        if (filePath) fs.unlink(filePath).catch(() => {})
      })

      let extractedCode = ''
      let detectedLanguage = 'javascript'

      try {
        const apiKey = (import.meta.env as any).VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
        if (!apiKey) throw new Error('GEMINI_API_KEY is missing from environment variables.')

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Extract text/code. Output ONLY as JSON: {'language': 'javascript/python/etc', 'code': 'extracted text'}. No markdown blocks."
                    },
                    { inline_data: { mime_type: 'image/png', data: rawBase64 } }
                  ]
                }
              ]
            })
          }
        )

        const data = await response.json()
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (aiResponse) {
          try {
            const parsed = JSON.parse(
              aiResponse
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim()
            )
            detectedLanguage = (parsed.language || 'javascript').toLowerCase()
            extractedCode = parsed.code || ''
          } catch (e) {
            extractedCode = aiResponse
          }
        } else {
          throw new Error('AI returned an empty or invalid response.')
        }

        await executeClipboardyWrite(extractedCode)
        console.log('📋 Auto-Copied to OS Clipboard via Gemini 2.5.')

        const grammar = Prism.languages[detectedLanguage] || Prism.languages.javascript
        const highlightedHTML = Prism.highlight(extractedCode, grammar, detectedLanguage)

        const escapedRaw = extractedCode
          .replace(/\\/g, '\\\\')
          .replace(/\`/g, '\\`')
          .replace(/\$/g, '\\$')
        const escapedHTML = highlightedHTML
          .replace(/\\/g, '\\\\')
          .replace(/\`/g, '\\`')
          .replace(/\$/g, '\\$')

        if (resultWindow && !resultWindow.isDestroyed()) {
          resultWindow.webContents.executeJavaScript(
            `window.injectResult(\`${escapedRaw}\`, \`${escapedHTML}\`);`
          )
        }
      } catch (error: any) {
        console.error('Extraction failed:', error)
        if (resultWindow && !resultWindow.isDestroyed()) {
          resultWindow.webContents.executeJavaScript(
            `window.injectError('${error.message || 'Engine Failure'}');`
          )
        }
      }
    } catch (error) {
      console.error('Peeler Crash:', error)
    }
  })
}
