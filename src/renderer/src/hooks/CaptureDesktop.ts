// Add this function
export const getScreenSourceId = async (): Promise<string | null> => {
  try {
    return await window.electron.ipcRenderer.invoke('get-screen-source')
  } catch (err) {
    console.error('Failed to get screen source', err)
    return null
  }
}