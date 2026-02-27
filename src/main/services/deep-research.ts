import { IpcMain } from 'electron'
import { Client } from '@notionhq/client'
import { tavily } from '@tavily/core'
import Groq from 'groq-sdk'

export default function registerDeepResearch({ ipcMain }: { ipcMain: IpcMain }) {
  ipcMain.handle('execute-deep-research', async (event, query: string) => {
    try {
      const tavilyKey =
        (import.meta.env as any).VITE_TAVILY_API_KEY || (process.env as any).VITE_TAVILY_API_KEY
      const notionKey =
        (import.meta.env as any).VITE_NOTION_API_KEY || (process.env as any).VITE_NOTION_API_KEY
      const notionDbId =
        (import.meta.env as any).VITE_NOTION_DATABASE_ID ||
        (process.env as any).VITE_NOTION_DATABASE_ID
      const groqKey =
        (import.meta.env as any).MAIN_VITE_GROQ_API_KEY || (process.env as any).VITE_GROQ_API_KEY

      if (!tavilyKey || !notionKey || !notionDbId || !groqKey) throw new Error('Missing API Keys.')

      event.sender.send('oracle-progress', {
        status: 'scanning',
        file: 'IRIS and Tavily Neural Search Active...',
        totalFound: 1
      })

      const tvly = tavily({ apiKey: tavilyKey })
      const tavilyData = await tvly.search(query, {
        searchDepth: 'advanced',
        includeAnswer: true,
        maxResults: 5
      })
      const rawContext = tavilyData.results
        .map((r: any) => `Source: ${r.url}\nContent: ${r.content}`)
        .join('\n\n')

      event.sender.send('oracle-progress', {
        status: 'reading',
        file: 'Llama 3.1 Instantly Synthesizing Data...',
        totalFound: 2
      })

      const groq = new Groq({ apiKey: groqKey })
      const prompt = `
        You are an elite research analyst. Answer: "${query}".
        Output ONLY a JSON object with a key "blocks" containing an array of Notion block objects (types: heading_2, heading_3, paragraph, bulleted_list_item).
        Each object MUST have a "text" key that is a simple STRING. Do not use nested objects for text.
        Context: ${rawContext}
      `

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' }
      })

      const jsonString = chatCompletion.choices[0]?.message?.content || '{"blocks": []}'
      const parsedData = JSON.parse(jsonString)
      const notionBlocksData = parsedData.blocks || []

      event.sender.send('oracle-progress', {
        status: 'embedded',
        file: 'Injecting into Notion DB...',
        totalFound: 3
      })

      const notionChildren = notionBlocksData.map((block: any) => {
        let safeText = 'No content generated.'

        if (typeof block.text === 'string') {
          safeText = block.text
        } else if (typeof block.text === 'object' && block.text !== null) {
          safeText = block.text.content || block.text.text || JSON.stringify(block.text)
        } else {
          safeText = String(block.text || '')
        }

        if (safeText.length > 2000) safeText = safeText.substring(0, 1995) + '...'

        const safeType = ['heading_2', 'heading_3', 'paragraph', 'bulleted_list_item'].includes(
          block.type
        )
          ? block.type
          : 'paragraph'

        return {
          object: 'block',
          type: safeType,
          [safeType]: {
            rich_text: [{ type: 'text', text: { content: safeText } }]
          }
        }
      })

      const extractedSummary =
        notionChildren
          .map((b: any) => b[b.type].rich_text[0].text.content)
          .join('\n')
          .substring(0, 800) + '...'

      const notion = new Client({ auth: notionKey })
      const newPage = await notion.pages.create({
        parent: { database_id: notionDbId },
        properties: { Name: { title: [{ text: { content: `IRIS Deep-Dive: ${query}` } }] } },
        children: notionChildren
      })

      return { success: true, url: (newPage as any).url, summary: extractedSummary }
    } catch (error) {
      console.error(error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('read-notion-reports', async () => {
    try {
      const notionKey =
        (import.meta.env as any).VITE_NOTION_API_KEY || (process.env as any).VITE_NOTION_API_KEY
      const notionDbId =
        (import.meta.env as any).VITE_NOTION_DATABASE_ID ||
        (process.env as any).VITE_NOTION_DATABASE_ID

      const response = await fetch(`https://api.notion.com/v1/databases/${notionDbId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notionKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page_size: 5 })
      })

      if (!response.ok) {
        throw new Error(`Notion API Rejected: ${response.statusText}`)
      }

      const data = await response.json()

      const results = data.results
        .map((page: any) => {
          const titleObj = page.properties.Name?.title?.[0]
          const title = titleObj ? titleObj.plain_text : 'Untitled Report'
          return `Report: ${title} (URL: ${page.url})`
        })
        .join('\n')

      return { success: true, data: results || 'No reports found.' }
    } catch (error) {
      console.error(error)
      return { success: false, error: String(error) }
    }
  })
}
