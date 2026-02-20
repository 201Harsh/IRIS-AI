export const getLiveLocation = async () => {
  try {
    const location = await window.electron.ipcRenderer.invoke('get-live-location')

    if (!location) {
      return null
    }

    return location
  } catch (error) {
    return null
  }
}
