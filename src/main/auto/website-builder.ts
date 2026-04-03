import { ipcMain, BrowserWindow, app } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { GoogleGenAI } from '@google/genai'

let previewWin: BrowserWindow | null = null

export default function registerWebsiteBuilder() {
  ipcMain.handle('build-animated-website', async (event, { prompt, geminiKey }) => {
    if (!event) return
    try {
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

      if (!geminiKey || geminiKey.trim() === '') {
        throw new Error(
          'Missing Gemini API Key. Please configure it in the Command Center Vault (Settings Tab).'
        )
      }

      const ai = new GoogleGenAI({ apiKey: geminiKey })

      const sysPrompt = `You are an elite, Awwwards-winning frontend developer and UI/UX designer. 
Build a highly animated, visually stunning, clean, and premium website based on the user prompt.

CRITICAL RULES:
1. FORMAT: Use a SINGLE HTML file containing all HTML, CSS (in <style>), and JS (in <script>). Start strictly with <!DOCTYPE html>. DO NOT wrap in markdown blockquotes.
2. TECH STACK: 
   - Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
   - GSAP Core & ScrollTrigger: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script> <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
3. REAL IMAGERY ONLY (NO BROKEN LINKS):
   - NEVER invent or hallucinate Unsplash IDs or random URLs. They will break.
   - For ALL background and layout images, you MUST strictly use: "https://picsum.photos/1920/1080?random={number}" (Replace {number} with any digit from 1 to 50).
   - For Avatars, use: "https://i.pravatar.cc/150?img={number}" (Replace {number} with 1 to 50).
   - Use inline <svg> for icons.
4. EYE-CATCHING HERO ELEMENTS & MICRO-INTERACTIONS:
   - Hero Flair: The Hero section MUST include dynamic decorative elements to look premium. Add glowing background orbs (using Tailwind's blur-[100px] and opacity), a slowly rotating circular text stamp (e.g., 'EST 2024 • PREMIUM QUALITY •'), or small floating glassmorphism UI cards overlapping the main image.
   - Magnetic Buttons: Write vanilla JS with GSAP to make the main CTA buttons "magnetic" (the button moves slightly toward the cursor when hovering nearby).
   - Hover States: Add slick, sweeping gradients or scale-up effects (hover:scale-105 transition-transform) to all clickable elements and cards.
5. CONTENT DENSITY & LAYOUT:
   - Generate rich, realistic copy for all sections. NO empty spaces or generic "lorem ipsum" if possible.
   - Use beautiful CSS Grid / Bento-box layouts for Features/Services.
   - Rely heavily on stunning Typography (large fonts, contrasting weights).
6. EXACT THEMING & COLORS:
   - STOP defaulting to Tailwind's 'slate' or 'gray' classes. Use custom arbitrary hex values to match the vibe perfectly.
   - AI/Tech: Pitch black (bg-[#000000]), sleek glass, intense neon accents (text-[#39ff14] or cyan).
   - Cafe/Food: Warm earth tones, deep espresso browns (bg-[#1c140d]), creamy off-whites (text-[#f5ebd7]). NO SLATE GRAYS.
   - Corporate/SaaS: Absolute whites (bg-white), deep navy, trust-building blues.
7. SECTIONS (Must include 5-6 distinct sections):
   - Hero Section: High impact, full-screen. Large GSAP text reveals, the required eye-catching flair (orbs/stamps), and a working background image.
   - About/Mission: Heavy typography focus fading in on scroll.
   - Features/Services: Grid/Bento layout packed with details and hover glows.
   - Showcase/Gallery: Multiple working images in a masonry or horizontal scroll layout.
   - CTA & Footer: High energy, magnetic buttons, large text.

OUTPUT ONLY RAW HTML.`

      const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: `${sysPrompt}\n\nUSER PROMPT: ${prompt}`
      })

      let fullCode = ''

      for await (const chunk of response) {
        if (chunk.text) {
          fullCode += chunk.text

          let cleanCode = fullCode.replace(/^```html\n?/, '').replace(/```$/, '')

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

      const dirPath = path.join(app.getPath('userData'), 'Websites')
      await fs.mkdir(dirPath, { recursive: true })

      const filePath = path.join(dirPath, `website_${Date.now()}.html`)
      const finalSaveCode = fullCode.replace(/^```html\n?/, '').replace(/```$/, '')
      await fs.writeFile(filePath, finalSaveCode.trim(), 'utf-8')

      return { success: true, filePath }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
