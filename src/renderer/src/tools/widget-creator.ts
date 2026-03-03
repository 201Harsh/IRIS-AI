export const createWidget = async (htmlCode: string, width: number, height: number) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('create-widget', {
      htmlCode,
      width,
      height
    })
    if (res.success) {
      return `✅ Widget successfully spawned on the desktop.`
    } else {
      return `❌ Failed to create widget: ${res.error}`
    }
  } catch (error) {
    return `System Error: Unable to establish connection to the widget spawner.`
  }
}

export const closeWidgets = async () => {
  try {
    const res = await window.electron.ipcRenderer.invoke('close-widgets')
    if (res.success) {
      return `✅ ${res.message}`
    } else {
      return `❌ Failed to close widgets: ${res.error}`
    }
  } catch (error) {
    return `System Error: Unable to establish connection to the widget spawner.`
  }
}
