import { ipcMain, BrowserWindow, app, screen, globalShortcut, clipboard } from 'electron'
import { keyboard, Key } from '@nut-tree-fork/nut-js'
import path from 'path'
import fs from 'fs/promises'

let phantomWindow: BrowserWindow | null = null

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
            
            .phantom-bar {
              width: 100vw; height: 100vh; box-sizing: border-box;
              background: rgba(10, 10, 10, 0.9); backdrop-filter: blur(24px);
              border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 12px;
              box-shadow: 0 15px 50px rgba(0,0,0,0.9), 0 0 20px rgba(52, 211, 153, 0.15);
              display: flex; align-items: flex-start; padding: 16px; gap: 12px;
            }

            .ghost-icon {
              width: 20px; height: 20px; color: #34d399; flex-shrink: 0; margin-top: 2px;
              animation: float 3s ease-in-out infinite;
            }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

            textarea {
              flex: 1; background: transparent; border: none; outline: none;
              color: #e4e4e7; font-size: 14px; font-weight: 500; font-family: 'Consolas', monospace;
              resize: none; height: 100%; line-height: 1.5;
            }
            textarea::placeholder { color: #52525b; font-family: 'Inter', sans-serif; font-style: italic; }

            /* Custom invisible scrollbar for ultra-clean look */
            textarea::-webkit-scrollbar { width: 4px; }
            textarea::-webkit-scrollbar-track { background: transparent; }
            textarea::-webkit-scrollbar-thumb { background: rgba(52, 211, 153, 0.3); border-radius: 10px; }

            .loader { display: none; width: 16px; height: 16px; border: 2px solid rgba(52,211,153,0.2); border-top-color: #34d399; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; margin-top: 2px; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="phantom-bar">
            <svg class="ghost-icon" id="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
            <div class="loader" id="loader"></div>
            <textarea id="prompt" placeholder="Command the ghost... (Shift+Enter for new line)" autocomplete="off" spellcheck="false" autofocus></textarea>
          </div>

          <script>
            const { ipcRenderer } = require('electron');
            const input = document.getElementById('prompt');
            const icon = document.getElementById('icon');
            const loader = document.getElementById('loader');

            // Auto-focus the textarea instantly
            window.onload = () => input.focus();

            // Handle Pro Keybinds (Enter to submit, Shift+Enter for new line)
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                ipcRenderer.send('phantom-close');
              }
              
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Stop it from making a new line when submitting
                
                if (input.value.trim() !== '') {
                  // UI transition to loading state
                  input.disabled = true;
                  input.style.color = '#34d399';
                  icon.style.display = 'none';
                  loader.style.display = 'block';
                  
                  // Send multi-line prompt to Node.js backend
                  ipcRenderer.send('phantom-execute', input.value.trim());
                }
              }
            });
          </script>
        </body>
        </html>
      `
      await fs.writeFile(filePath, htmlCode, 'utf-8')

      phantomWindow = new BrowserWindow({
        x: Math.round(cursorPoint.x - 250),
        y: Math.round(cursorPoint.y - 140), 
        width: 500,
        height: 140,
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
      console.error('Phantom Forge Error:', error)
    }
  }

  globalShortcut.register('CommandOrControl+Alt+Space', summonPhantom)

  ipcMain.on('phantom-close', () => {
    if (phantomWindow) phantomWindow.close()
  })

  ipcMain.on('phantom-execute', async (event, promptText) => {
    if (!event) return
    try {
      const apiKey = (import.meta.env as any).VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
      if (!apiKey) throw new Error('API key missing.')

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Phantom, a raw text generation engine. Output ONLY the exact raw text or code requested. Do NOT use markdown code blocks (like \`\`\`javascript). Do NOT add conversational filler like "Here is the code". Just output the exact raw string that should be typed into the user's application.\n\nUser Request: ${promptText}`
                  }
                ]
              }
            ]
          })
        }
      )

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!aiResponse) throw new Error('AI failed to generate response.')

      if (phantomWindow) phantomWindow.close()

      await new Promise((r) => setTimeout(r, 150))

      const originalClipboard = clipboard.readText()
      clipboard.writeText(aiResponse)

      const isMac = process.platform === 'darwin'
      const modifier = isMac ? Key.LeftSuper : Key.LeftControl

      keyboard.config.autoDelayMs = 10
      await keyboard.pressKey(modifier, Key.V)
      await keyboard.releaseKey(Key.V, modifier)

      setTimeout(() => {
        clipboard.writeText(originalClipboard)
      }, 500)

      console.log('👻 Phantom Injection Complete.')
    } catch (error) {
      console.error('Phantom Execution Failed:', error)
      if (phantomWindow) phantomWindow.close()
    }
  })
}
