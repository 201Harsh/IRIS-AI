import {
  ipcMain,
  BrowserWindow,
  app,
  screen,
  globalShortcut,
  clipboard,
  safeStorage
} from 'electron'
import { keyboard, Key } from '@nut-tree-fork/nut-js'
import path from 'path'
import fs from 'fs/promises'
import fsSync from 'fs'

let phantomWindow: BrowserWindow | null = null

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function registerPhantomKeyboard() {
  const summonPhantom = async () => {
    if (phantomWindow) return

    try {
      const cursorPoint = screen.getCursorScreenPoint()

      const widgetDir = path.join(app.getPath('userData'), 'DynamicWidgets')
      await fs.mkdir(widgetDir, { recursive: true })
      const filePath = path.join(widgetDir, `phantom_ui_${Date.now()}.html`)

      const htmlCode = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; font-family: 'Inter', sans-serif; background: transparent; }
            
            .phantom-container {
              width: 100vw; height: 100vh; box-sizing: border-box;
              background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(24px);
              border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 12px;
              box-shadow: 0 15px 50px rgba(0,0,0,0.9), 0 0 20px rgba(52, 211, 153, 0.15);
              display: flex; flex-direction: column; padding: 16px; gap: 12px;
            }

            .input-row {
              display: flex; align-items: flex-start; gap: 12px; width: 100%;
            }

            .ghost-icon {
              width: 20px; height: 20px; color: #34d399; flex-shrink: 0; margin-top: 2px;
              animation: float 3s ease-in-out infinite;
            }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

            textarea {
              flex: 1; background: transparent; border: none; outline: none;
              color: #e4e4e7; font-size: 14px; font-weight: 500; font-family: 'Consolas', monospace;
              resize: none; height: 40px; line-height: 1.5;
            }
            textarea::placeholder { color: #52525b; font-family: 'Inter', sans-serif; font-style: italic; }

            .loader { 
              display: none; width: 16px; height: 16px; 
              border: 2px solid rgba(52,211,153,0.2); border-top-color: #34d399; 
              border-radius: 50%; animation: spin 0.8s linear infinite; 
              flex-shrink: 0; margin-top: 2px; 
            }
            @keyframes spin { 100% { transform: rotate(360deg); } }

            /* The Streaming Output Box */
            #stream-output {
              display: none;
              color: #34d399;
              font-family: 'Consolas', monospace;
              font-size: 12px;
              line-height: 1.6;
              white-space: pre-wrap;
              overflow-y: auto;
              flex: 1;
              border-top: 1px dashed rgba(52, 211, 153, 0.2);
              padding-top: 10px;
              text-shadow: 0 0 5px rgba(52, 211, 153, 0.4);
            }

            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(52, 211, 153, 0.3); border-radius: 10px; }
          </style>
        </head>
        <body>
          <div class="phantom-container">
            <div class="input-row">
              <svg class="ghost-icon" id="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
              <div class="loader" id="loader"></div>
              <textarea id="prompt" placeholder="Command the ghost... (Shift+Enter for new line)" autocomplete="off" spellcheck="false" autofocus></textarea>
            </div>
            <div id="stream-output"></div>
          </div>

          <script>
            const { ipcRenderer } = require('electron');
            const input = document.getElementById('prompt');
            const icon = document.getElementById('icon');
            const loader = document.getElementById('loader');
            const streamOutput = document.getElementById('stream-output');

            window.onload = () => input.focus();

            input.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                ipcRenderer.send('phantom-close');
              }
              
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                
                if (input.value.trim() !== '') {
                  // Lock input and show loading animation
                  input.disabled = true;
                  input.style.color = '#52525b';
                  icon.style.display = 'none';
                  loader.style.display = 'block';
                  
                  // Expand window to show stream
                  streamOutput.style.display = 'block';
                  ipcRenderer.send('phantom-resize', 400); 
                  
                  ipcRenderer.send('phantom-execute-stream', input.value.trim());
                }
              }
            });

            // Listen for incoming stream chunks from the main process
            ipcRenderer.on('phantom-stream-chunk', (event, text) => {
              loader.style.display = 'none'; // Hide loader once typing starts
              icon.style.display = 'block'; // Show ghost again
              
              streamOutput.textContent += text;
              streamOutput.scrollTop = streamOutput.scrollHeight; // Auto-scroll to bottom
            });

            // Listen for missing API key alerts
            ipcRenderer.on('phantom-error', (event, errorMsg) => {
              loader.style.display = 'none';
              icon.style.display = 'block';
              streamOutput.style.display = 'block';
              streamOutput.style.color = '#ef4444'; // Red for error
              streamOutput.textContent = errorMsg;
              ipcRenderer.send('phantom-resize', 150); 
            });
          </script>
        </body>
        </html>
      `
      await fs.writeFile(filePath, htmlCode, 'utf-8')

      phantomWindow = new BrowserWindow({
        x: Math.round(cursorPoint.x - 250),
        y: Math.round(cursorPoint.y - 40),
        width: 500,
        height: 80,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        type: 'toolbar',
        webPreferences: { nodeIntegration: true, contextIsolation: false }
      })

      phantomWindow.setAlwaysOnTop(true, 'screen-saver')
      phantomWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
      await phantomWindow.loadFile(filePath)

      phantomWindow.on('blur', () => {
        if (phantomWindow) {
          phantomWindow.close()
          phantomWindow = null
        }
      })

      phantomWindow.on('closed', () => {
        phantomWindow = null
        fs.unlink(filePath).catch(() => {})
      })
    } catch (error) {
    }
  }

  globalShortcut.register('CommandOrControl+Alt+Space', summonPhantom)

  ipcMain.on('phantom-close', () => {
    if (phantomWindow) phantomWindow.close()
  })

  ipcMain.on('phantom-resize', (event, height) => {
    if (!event) {
      console.warn('Received phantom-resize event without event object.')
    }
    if (phantomWindow) {
      const bounds = phantomWindow.getBounds()
      phantomWindow.setBounds({ width: bounds.width, height: height, x: bounds.x, y: bounds.y })
    }
  })

  ipcMain.on('phantom-execute-stream', async (event, promptText) => {
    if (!event) return
    try {
      let apiKey = ''
      const secureConfigPath = path.join(app.getPath('userData'), 'iris_secure_vault.json')

      if (fsSync.existsSync(secureConfigPath)) {
        try {
          const data = JSON.parse(fsSync.readFileSync(secureConfigPath, 'utf8'))
          if (safeStorage.isEncryptionAvailable()) {
            apiKey = safeStorage.decryptString(Buffer.from(data.gemini, 'base64'))
          } else {
            apiKey = Buffer.from(data.gemini, 'base64').toString('utf8')
          }
        } catch (e) {
          console.error('Failed to read secure vault for Phantom Key:', e)
        }
      }

      if (!apiKey || apiKey.trim() === '') {
        if (phantomWindow) {
          phantomWindow.webContents.send(
            'phantom-error',
            'CRITICAL: Missing Gemini API Key.\nPlease launch the main IRIS Dashboard and update your Command Center Vault.'
          )
        }
        return
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Phantom, an inline code generator. Output ONLY the raw text or code requested. NO markdown formatting blocks like \`\`\`python. NO conversational text. Just the exact string.\n\nRequest: ${promptText}`
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.body) throw new Error('ReadableStream not supported.')

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullGeneratedText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr === '[DONE]') continue

            try {
              const parsed = JSON.parse(dataStr)
              const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''

              if (textChunk) {
                fullGeneratedText += textChunk
                if (phantomWindow) {
                  phantomWindow.webContents.send('phantom-stream-chunk', textChunk)
                }
              }
            } catch (e) {
              console.error('Failed to parse stream chunk', e)
            }
          }
        }
      }

      console.log('👻 Phantom Streaming Complete. Injecting via Clipboard.')

      await sleep(400)
      if (phantomWindow) phantomWindow.close()

      await sleep(150)

      const originalClipboard = clipboard.readText()

      clipboard.writeText(fullGeneratedText)

      const isMac = process.platform === 'darwin'
      const modifier = isMac ? Key.LeftSuper : Key.LeftControl

      keyboard.config.autoDelayMs = 10
      await keyboard.pressKey(modifier, Key.V)
      await keyboard.releaseKey(Key.V, modifier)

      setTimeout(() => {
        clipboard.writeText(originalClipboard)
      }, 500)
    } catch (error) {
      console.error('Phantom Streaming Execution Failed:', error)
      if (phantomWindow) {
        phantomWindow.webContents.send('phantom-error', `Execution Failed: ${String(error)}`)
      }
    }
  })
}
