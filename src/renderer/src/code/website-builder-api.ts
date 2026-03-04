export const buildAnimatedWebsite = async (prompt: string) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('build-animated-website', { prompt })
    if (res.success) {
      return `✅ Website generated successfully and saved to ${res.filePath}.`
    } else {
      return `❌ System Error during synthesis: ${res.error}`
    }
  } catch (error) {
    return `System Error: Unable to establish connection to the Live Forge.`
  }
}
