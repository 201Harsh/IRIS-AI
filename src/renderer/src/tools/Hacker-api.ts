export const executeRealityHack = async (url: string, mode: string, customText?: string) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('hack-website', { url, mode, customText })
    if (res.success) {
      return `Successfully hacked ${url} By IRIS.`
    } else {
      return `Hack failed. The target firewall blocked the injection: ${res.error}`
    }
  } catch (error) {
    return `System Error: Unable to establish connection to the web renderer.`
  }
}
