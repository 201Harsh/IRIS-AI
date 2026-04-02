export const runDeepResearch = async (query: string): Promise<string> => {
  try {
    window.dispatchEvent(new CustomEvent('deep-research-start', { detail: { query } }))

    // 1. EXTRACT ALL REQUIRED NEURAL UPLINKS FROM LOCAL STORAGE
    const tavilyKey = localStorage.getItem('iris_tailvy_api_key') || ''
    const notionKey = localStorage.getItem('iris_notion_api_key') || ''
    const notionDbId = localStorage.getItem('iris_notion_db_id') || '' // Ensure this is added to Settings UI!
    const groqKey = localStorage.getItem('iris_groq_api_key') || ''

    // 2. PASS KEYS ALONG WITH QUERY TO THE IPC BACKEND
    const result = await window.electron.ipcRenderer.invoke('execute-deep-research', {
      query,
      tavilyKey,
      notionKey,
      notionDbId,
      groqKey
    })

    if (result.success) {
      window.dispatchEvent(
        new CustomEvent('deep-research-done', {
          detail: { success: true, summary: result.summary }
        })
      )
      return `✅ Research complete. URL: ${result.url}. Here is a summary of the data so you can inform the user: ${result.summary}`
    }

    window.dispatchEvent(new CustomEvent('deep-research-done', { detail: { success: false } }))
    return `❌ Research failed: ${result.error}`
  } catch (error) {
    return `❌ System failure: ${String(error)}`
  }
}

export const runReadNotion = async (): Promise<string> => {
  try {
    // 1. EXTRACT NOTION CREDENTIALS
    const notionKey = localStorage.getItem('iris_notion_api_key') || ''
    const notionDbId = localStorage.getItem('iris_notion_db_id') || ''

    // 2. PASS TO IPC BACKEND
    const result = await window.electron.ipcRenderer.invoke('read-notion-reports', {
      notionKey,
      notionDbId
    })

    return result.success
      ? `Here are the latest Notion reports:\n${result.data}`
      : `Failed to read Notion: ${result.error}`
  } catch (error) {
    return `❌ System failure: ${String(error)}`
  }
}
