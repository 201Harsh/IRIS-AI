export const runDeepResearch = async (query: string): Promise<string> => {
  try {
    window.dispatchEvent(new CustomEvent('deep-research-start', { detail: { query } }))

    const tavilyKey = localStorage.getItem('iris_tailvy_api_key') || ''
    const groqKey = localStorage.getItem('iris_groq_api_key') || ''

    const result = await window.electron.ipcRenderer.invoke('execute-deep-research', {
      query,
      tavilyKey,
      groqKey
    })

    if (result.success) {
      window.dispatchEvent(
        new CustomEvent('deep-research-done', {
          detail: { success: true, summary: result.summary }
        })
      )
      // Removed the URL reference since Notion is gone
      return `✅ Research complete. Here is a summary of the data so you can inform the user: ${result.summary}`
    }

    window.dispatchEvent(new CustomEvent('deep-research-done', { detail: { success: false } }))
    return `❌ Research failed: ${result.error}`
  } catch (error) {
    return `❌ System failure: ${String(error)}`
  }
}

// ❌ runReadNotion has been completely removed.
