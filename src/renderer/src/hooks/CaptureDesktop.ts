export const getScreenSourceId = async (): Promise<string | null> => {
  try {
    return await window.electron.ipcRenderer.invoke('get-screen-source')
  } catch (err) {
    return null
  }
}