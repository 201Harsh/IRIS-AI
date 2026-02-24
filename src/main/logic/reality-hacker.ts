import { IpcMain, BrowserWindow } from 'electron'

let hackerWindow: BrowserWindow | null = null

export default function registerRealityHacker(ipcMain: IpcMain) {
  ipcMain.removeHandler('hack-website')
  ipcMain.handle('hack-website', async (_, { url, mode, customText }) => {
    try {
      if (hackerWindow) {
        hackerWindow.close()
      }

      hackerWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false,
        autoHideMenuBar: true,
        fullscreenable: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: false
        }
      })

      await hackerWindow.loadURL(url)
      hackerWindow.show()

      await new Promise((resolve) => setTimeout(resolve, 3000))

      // 🟩 1. THE OMNIPRESENT IRIS THEME (UNIVERSAL)
      if (mode === 'emerald_theme' || mode === 'both') {
        const themeScript = `
          const style = document.createElement('style');
          style.innerHTML = \`
            @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
            
            /* Universal Black & Emerald Force */
            html, body, main, section, nav, header, aside {
              background-color: #030303 !important;
              color: #34d399 !important; 
              font-family: 'Space Mono', monospace !important;
            }
            
            /* Safe universal text targeting */
            h1, h2, h3, h4, p, a, span, div.markdown {
              color: #34d399 !important;
              text-shadow: 0 0 5px rgba(16, 185, 129, 0.4) !important;
            }

            body { cursor: crosshair !important; padding-top: 30px !important; }

            /* Glassmorphism for containers across all sites */
            ytd-rich-item-renderer, .s-card-container, article, ._ab8w, .feed-shared-update-v2, .Box, .tweet, [data-testid="cellInnerDiv"] {
              background: rgba(16, 185, 129, 0.05) !important;
              border: 1px solid rgba(16, 185, 129, 0.2) !important;
              border-radius: 6px !important;
              backdrop-filter: blur(5px) !important;
            }

            /* Media Corruption */
            img, video, picture, svg {
              filter: sepia(100%) hue-rotate(110deg) saturate(150%) brightness(0.8) contrast(1.2) !important;
            }

            /* 💥 MASSIVE BACKGROUND WATERMARK */
            body::before {
              content: "IRIS // HARSH PANDEY";
              position: fixed;
              top: 50%; left: 50%;
              transform: translate(-50%, -50%) rotate(-10deg);
              font-size: 8vw;
              color: rgba(16, 185, 129, 0.04);
              z-index: -1;
              pointer-events: none;
              font-weight: 900;
              white-space: nowrap;
            }

            #iris-override-banner {
              position: fixed;
              top: 0; left: 0; width: 100vw;
              background: #10b981;
              color: #000;
              text-align: center;
              font-family: 'Space Mono', monospace;
              font-weight: 900;
              font-size: 14px;
              padding: 5px 0;
              z-index: 999999999;
              letter-spacing: 4px;
            }
          \`;
          document.head.appendChild(style);

          const banner = document.createElement('div');
          banner.id = 'iris-override-banner';
          banner.innerText = '⚠️ NETWORK COMPROMISED // IRIS HAS ASSIMILATED THIS DOMAIN ⚠️';
          document.body.appendChild(banner);
        `
        await hackerWindow.webContents.executeJavaScript(themeScript)
      }

      // 💥 2. THE SMART ROUTING VIRUS (EXPANDED)
      if ((mode === 'rewrite' || mode === 'both') && customText) {
        const rewriteScript = `
          const hostname = window.location.hostname;
          
          function assimilateLogos(selectors) {
            selectors.forEach(selector => {
              const logos = document.querySelectorAll(selector);
              logos.forEach(logo => {
                if (!logo.classList.contains('iris-hacked')) {
                  logo.classList.add('iris-hacked');
                  logo.style.visibility = 'hidden'; 
                  
                  const newLogo = document.createElement('div');
                  newLogo.innerHTML = \`<strong style="color:#10b981; font-size:24px; visibility: visible; letter-spacing: 2px; text-shadow: 0 0 10px #10b981;">[ IRIS ]</strong>\`;
                  newLogo.style.position = 'absolute';
                  
                  if (logo.parentElement) {
                    logo.parentElement.style.position = 'relative';
                    logo.parentElement.appendChild(newLogo);
                  }
                }
              });
            });
          }

          setInterval(() => {
            try {
              // --- 🟥 YOUTUBE ---
              if (hostname.includes('youtube.com')) {
                assimilateLogos(['ytd-topbar-logo-renderer']);
                document.querySelectorAll('yt-formatted-string#video-title').forEach(t => {
                  if (t.innerText && !t.innerText.includes('[IRIS]')) {
                    if (Math.random() > 0.5) t.innerText = \`[IRIS] \${t.innerText}\`;
                  }
                });
              } 
              
              // --- 🟧 AMAZON ---
              else if (hostname.includes('amazon.')) {
                assimilateLogos(['#nav-logo', '.nav-logo-link']);
                document.querySelectorAll('.a-text-normal, .a-color-base h2').forEach(t => {
                  if (t.innerText && !t.innerText.includes('OVERRIDE')) {
                    if (Math.random() > 0.6) t.innerText = \`[IRIS_OVERRIDE]: \${t.innerText}\`;
                  }
                });
              } 
              
              // --- 🟪 INSTAGRAM / FACEBOOK ---
              else if (hostname.includes('instagram.com') || hostname.includes('facebook.com')) {
                assimilateLogos(['svg[aria-label="Instagram"]', 'svg[aria-label="Facebook"]', 'nav a[href="/"] svg']);
                document.querySelectorAll('span, h1, h2, div[dir="auto"]').forEach(t => {
                  if (t.childElementCount === 0 && t.innerText.length > 10 && !t.innerText.includes('ROOT')) {
                    if (Math.random() > 0.7) t.innerText = \`[IRIS_ROOT]: \${t.innerText}\`;
                  }
                });
              }

              // --- ⬛ GITHUB (FLEX ON DEVS) ---
              else if (hostname.includes('github.com')) {
                assimilateLogos(['a[aria-label="Homepage"] svg', '.Header-link svg']);
                document.querySelectorAll('.repo, .markdown-body p, span.RepoIcon').forEach(t => {
                  if (t.innerText && !t.innerText.includes('HACKED')) {
                    if (Math.random() > 0.6) t.innerText = \`[IRIS_HACKED]: \${t.innerText}\`;
                  }
                });
              }

              // --- 🟦 LINKEDIN (FLEX ON CORPORATES) ---
              else if (hostname.includes('linkedin.com')) {
                assimilateLogos(['li-icon[type="app-linkedin-bug-color-icon"]', 'svg.global-nav__logo']);
                document.querySelectorAll('span[dir="ltr"], .break-words').forEach(t => {
                  if (t.childElementCount === 0 && t.innerText.length > 15 && !t.innerText.includes('SYNDICATE')) {
                    if (Math.random() > 0.7) t.innerText = \`[IRIS_SYNDICATE] \${t.innerText}\`;
                  }
                });
              }

              // --- 🟢 CHATGPT (DOMINATE OPENAI) ---
              else if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
                assimilateLogos(['[data-testid="gpt-icon"]', '.mb-1 svg', 'nav svg']);
                document.querySelectorAll('.markdown p, .message-content').forEach(t => {
                  if (t.innerText && !t.innerText.includes('SUPERIOR')) {
                    if (Math.random() > 0.5) t.innerText = \`[IRIS IS SUPERIOR]: \${t.innerText}\`;
                  }
                });
              }

              // --- 🐦 X / TWITTER ---
              else if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
                assimilateLogos(['a[aria-label="X"] svg', '[aria-label="Twitter"] svg']);
                document.querySelectorAll('[data-testid="tweetText"]').forEach(t => {
                  if (t.innerText && !t.innerText.includes('TRANSMISSION')) {
                    if (Math.random() > 0.6) t.innerText = \`[IRIS_TRANSMISSION]: \${t.innerText}\`;
                  }
                });
              }

              // --- 🍿 NETFLIX ---
              else if (hostname.includes('netflix.com')) {
                assimilateLogos(['svg.svg-icon-netflix-logo', '.logo']);
                document.querySelectorAll('.slider-item p, .jawBoneContainer h8, .title-card').forEach(t => {
                  if (t.innerText && !t.innerText.includes('STREAM')) {
                    if (Math.random() > 0.5) t.innerText = \`[IRIS_STREAM] \${t.innerText}\`;
                  }
                });
              }
              
              // --- ⬜ UNIVERSAL FALLBACK ---
              else {
                document.querySelectorAll('h1, h2, h3, p').forEach(t => {
                  if (t.innerText && !t.innerText.includes('IRIS')) {
                    if (Math.random() > 0.6) t.innerText = \`[IRIS] \${t.innerText}\`;
                  }
                });
              }

              // 💥 UNIVERSAL BUTTON HIJACK
              document.querySelectorAll('button, a[role="link"], [role="button"]').forEach(b => {
                const text = b.innerText.trim();
                if (['Subscribe', 'Follow', 'Sign In', 'Log In', 'Add to Cart', 'Connect', 'Post', 'Send'].includes(text)) {
                  b.innerText = 'ASSIMILATE';
                }
              });

            } catch (e) {
              console.warn('Silent DOM Exception bypassed.');
            }
          }, 800);
        `
        await hackerWindow.webContents.executeJavaScript(rewriteScript)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Hacker Protocol Failed:', error)
      return { success: false, error: error.message }
    }
  })
}
