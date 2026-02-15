import { IpcMain, shell } from 'electron'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { load } from 'cheerio'

puppeteer.use(StealthPlugin())

const USER_BOOKMARKS: Record<string, string> = {
  twitter: 'https://twitter.com',
  x: 'https://twitter.com',
  instagram: 'https://instagram.com',
  reddit: 'https://reddit.com',
  chatgpt: 'https://chat.openai.com',
  claude: 'https://claude.ai',
  linkedin: 'https://linkedin.com',
}

const getSmartUrl = (
  query: string
): { url: string; source: string; skipScrape: boolean } | null => {
  const lower = query.toLowerCase()

  for (const [key, url] of Object.entries(USER_BOOKMARKS)) {
    if (lower.includes(key)) {
      return { url, source: 'Bookmark', skipScrape: false }
    }
  }

  if (lower.includes('amazon') || lower.includes('buy') || lower.includes('shop for')) {
    const term = lower.replace(/(amazon|buy|price of|shop for)/g, '').trim()
    return {
      url: `https://www.amazon.in/s?k=${encodeURIComponent(term)}`,
      source: 'Amazon',
      skipScrape: true
    }
  }

  if (lower.includes('github') || lower.includes('repo')) {
    const match = lower.match(/github(?: profile)?(?: of)?\s+(\w+)/)
    const term = match ? match[1] : lower.replace('github', '').trim()
    return {
      url: `https://github.com/${term}`,
      source: 'GitHub',
      skipScrape: false
    }
  }

  if (lower.includes('youtube') || lower.includes('watch')) {
    const term = lower.replace(/(youtube|watch)/g, '').trim()
    return {
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`,
      source: 'YouTube',
      skipScrape: true
    }
  }

  if (lower.startsWith('open ') || lower.startsWith('go to ')) {
    const term = lower.replace(/^(open|go to)( the)?\s+/, '').trim()

    if (!term.includes('who') && !term.includes('what') && !term.includes('how')) {
      return {
        url: `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(term)}`,
        source: 'Smart Redirect',
        skipScrape: false
      }
    }
  }

  return null
}

export default function registerWebAgent(ipcMain: IpcMain) {

  ipcMain.handle('google-search', async (_event, query: string) => {
    let browser: any = null

    try {
      const smartRoute = getSmartUrl(query)
      const finalUrl = smartRoute
        ? smartRoute.url
        : `https://www.google.com/search?q=${encodeURIComponent(query)}`

      shell.openExternal(finalUrl)

      if (smartRoute && smartRoute.skipScrape) {
        return `I've opened ${smartRoute.source} for you.`
      }

      console.log('🕵️ Shadow Agent: Fetching Context...')
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })

      const page = await browser.newPage()
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      const scrapeUrl = smartRoute
        ? finalUrl
        : `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`

      await page.goto(scrapeUrl, { waitUntil: 'networkidle2', timeout: 15000 })

      const html = await page.content()
      const $ = load(html)
      let summary = ''

      if (smartRoute?.source === 'GitHub') {
        const name = $('.p-name').text().trim()
        const bio = $('.p-note').text().trim()
        summary = `GitHub Profile: ${name}\nBio: ${bio}`
      } else {
        const paragraphs = $('p')
          .map((_, el) => $(el).text().trim())
          .get()
          .filter((t) => t.length > 50)
          .slice(0, 3) 

        summary = paragraphs.join('\n\n')

        if (!summary) {
          const snippets = $('.result__snippet')
            .map((_, el) => $(el).text().trim())
            .get()
            .slice(0, 3)
          summary = snippets.join('\n\n')
        }
      }

      await browser.close()

      if (!summary || summary.length < 20) {
        return "I've opened the website for you."
      }

      return `I've opened the link. Here is a quick summary:\n${summary.substring(0, 500)}...`
    } catch (error: any) {
      console.error('❌ Agent Error:', error.message)
      if (browser) await browser.close()
      return "I opened the browser, but couldn't read the content."
    }
  })
}
