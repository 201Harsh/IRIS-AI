export const runIndexDirectory = async (folderPath: string) => {
  try {
    window.dispatchEvent(
      new CustomEvent('semantic-start', { detail: { mode: 'Index', target: folderPath } })
    )
    const result = await window.electron.ipcRenderer.invoke('index-folder', folderPath)
    window.dispatchEvent(
      new CustomEvent('semantic-done', { detail: { success: !result.includes('❌'), result } })
    )
    return result
  } catch (err) {
    window.dispatchEvent(new CustomEvent('semantic-done', { detail: { success: false } }))
    return `Error: ${err}`
  }
}

export const runSmartSearch = async (query: string) => {
  try {
    window.dispatchEvent(
      new CustomEvent('semantic-start', { detail: { mode: 'Search', target: query } })
    )

    const groqKey = localStorage.getItem('iris_groq_api_key') || ''

    if (!groqKey.trim()) {
      throw new Error(
        'Missing Groq API Key. Please update it in the Command Center Vault (Settings Tab).'
      )
    }

    const result = await window.electron.ipcRenderer.invoke('search-files', { query, groqKey })

    window.dispatchEvent(
      new CustomEvent('semantic-done', { detail: { success: !result.includes('❌'), result } })
    )
    return result
  } catch (err) {
    window.dispatchEvent(new CustomEvent('semantic-done', { detail: { success: false } }))
    return `Error: ${err}`
  }
}
