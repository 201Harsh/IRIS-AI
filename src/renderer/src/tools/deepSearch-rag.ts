export const runDeepResearch = async (query: string): Promise<string> => {
  try {
    window.dispatchEvent(new CustomEvent('deep-research-start', { detail: { query } }))
    // @ts-ignore
    const result = await window.electron.ipcRenderer.invoke('execute-deep-research', query)

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
  // @ts-ignore
  const result = await window.electron.ipcRenderer.invoke('read-notion-reports')
  return result.success
    ? `Here are the latest Notion reports:\n${result.data}`
    : `Failed to read Notion: ${result.error}`
}
