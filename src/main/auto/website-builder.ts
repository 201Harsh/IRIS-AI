import { ipcMain, BrowserWindow, app } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { GoogleGenAI } from '@google/genai'

let previewWin: BrowserWindow | null = null

export default function registerWebsiteBuilder() {
  ipcMain.handle('build-animated-website', async (event, { prompt }) => {
    try {
      // 1. Create the Live Forge Window
      previewWin = new BrowserWindow({
        width: 1280,
        height: 720,
        title: 'IRIS Live Forge :: Web Synthesis',
        backgroundColor: '#050505',
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      // 2. Load the Base Shell
      const shellHtml = `
        <html>
          <body style="margin:0; overflow:hidden; background: #050505;">
            <div id="loader" style="position:absolute; top:10px; left:10px; color:#00ffaa; font-family:monospace; font-size:12px; z-index:9999; text-shadow: 0 0 5px #00ffaa;">
              [ IRIS LIVE FORGE :: SYNTHESIZING UI... ]
            </div>
            <iframe id="live-frame" style="width:100vw; height:100vh; border:none;"></iframe>
          </body>
        </html>
      `
      await previewWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(shellHtml)}`)

      // 3. Initialize Gemini API
      const apiKey =
        (import.meta.env as any).VITE_GEMINI_API_KEY ||
        (import.meta.env as any).MAIN_VITE_GEMINI_API_KEY ||
        (process.env as any).VITE_GEMINI_API_KEY

      if (!apiKey)
        throw new Error('API Key missing. Make sure VITE_GEMINI_API_KEY is in your .env file.')

      const ai = new GoogleGenAI({ apiKey })

      // 4. The Strict Developer Prompt
      const sysPrompt = `You are an elite, award-winning frontend developer and UI/UX designer. 
      Build a highly animated, visually stunning website based on the user prompt.
      
      CRITICAL RULES:
      1. Use a SINGLE HTML file format containing everything.
      2. USE TAILWIND CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
      3. USE GSAP for smooth animations: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
      4. Ensure dark-mode, cyberpunk, or modern sleek aesthetics unless specified otherwise.
      5. OUTPUT ONLY RAW HTML. Do NOT wrap the output in markdown blockquotes (e.g., no \`\`\`html). Just start with <!DOCTYPE html>.`

      // 🚨 FIX: Using the exact model string that is working in your iris-coder.ts
      const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: `${sysPrompt}\n\nUSER PROMPT: ${prompt}`
      })

      let fullCode = ''

      // 5. Stream and Inject Real-Time into the iframe
      for await (const chunk of response) {
        if (chunk.text) {
          fullCode += chunk.text

          // Clean up any accidental markdown blockquotes
          let cleanCode = fullCode.replace(/^```html\n?/, '').replace(/```$/, '')

          // Safely inject into the iframe's srcdoc
          const safeCode = encodeURIComponent(cleanCode)
          if (previewWin && !previewWin.isDestroyed()) {
            previewWin.webContents
              .executeJavaScript(
                `
              document.getElementById('live-frame').srcdoc = decodeURIComponent('${safeCode.replace(/'/g, "\\'")}');
            `
              )
              .catch(() => {})
          }
        }
      }

      // Hide the loader text when finished
      if (previewWin && !previewWin.isDestroyed()) {
        previewWin.webContents
          .executeJavaScript(
            `
          document.getElementById('loader').innerText = '[ SYNTHESIS COMPLETE ]'; 
          setTimeout(() => document.getElementById('loader').style.display = 'none', 3000);
        `
          )
          .catch(() => {})
      }

      // 6. Save the physical file to your PC
      const dirPath = path.join(app.getPath('userData'), 'Websites')
      await fs.mkdir(dirPath, { recursive: true })

      const filePath = path.join(dirPath, `website_${Date.now()}.html`)
      const finalSaveCode = fullCode.replace(/^```html\n?/, '').replace(/```$/, '')
      await fs.writeFile(filePath, finalSaveCode.trim(), 'utf-8')

      return { success: true, filePath }
    } catch (err) {
      console.error('Live Forge Error:', err)
      return { success: false, error: String(err) }
    }
  })
}
