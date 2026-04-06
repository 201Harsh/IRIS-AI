import { IpcMain } from 'electron'
import { tavily } from '@tavily/core'
import Groq from 'groq-sdk'

export default function registerDeepResearch({ ipcMain }: { ipcMain: IpcMain }) {
  ipcMain.handle('execute-deep-research', async (event, { query, tavilyKey, groqKey }) => {
    try {
      if (!tavilyKey || !groqKey) {
        throw new Error('Missing API Keys. Please configure Tavily and Groq in the Command Center.')
      }

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
        Output ONLY a JSON object with a key "summary" containing a detailed, well-formatted markdown summary of your findings.
        Context: ${rawContext}
        `

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' }
      })

      const jsonString =
        chatCompletion.choices[0]?.message?.content || '{"summary": "No data generated."}'
      const parsedData = JSON.parse(jsonString)
      const extractedSummary = parsedData.summary || 'No data generated.'

      event.sender.send('oracle-progress', {
        status: 'embedded',
        file: 'Research synthesis complete...',
        totalFound: 3
      })

      return { success: true, summary: extractedSummary }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })
}
