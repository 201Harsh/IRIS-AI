export const runIndexDirectory = async (folderPath: string) => {
  try {
    window.dispatchEvent(
      new CustomEvent('semantic-start', { detail: { mode: 'Index', target: folderPath } })
    )
    // @ts-ignore
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

// src/renderer/src/services/oracle-tools.ts
export const runSmartSearch = async (query: string) => {
  try {
    window.dispatchEvent(
      new CustomEvent('semantic-start', { detail: { mode: 'Search', target: query } })
    )
    // @ts-ignore
    const result = await window.electron.ipcRenderer.invoke('search-files', { query })
    window.dispatchEvent(
      new CustomEvent('semantic-done', { detail: { success: !result.includes('❌'), result } })
    )
    return result
  } catch (err) {
    window.dispatchEvent(new CustomEvent('semantic-done', { detail: { success: false } }))
    return `Error: ${err}`
  }
}
