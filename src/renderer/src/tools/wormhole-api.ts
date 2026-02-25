export const deployWormhole = async (port: number): Promise<string> => {
  try {
    // @ts-ignore
    const result = await window.electron.ipcRenderer.invoke('open-wormhole', port)

    if (result.success) {
      // 🚨 Pass BOTH the URL and the Password to the UI Widget 🚨
      window.dispatchEvent(
        new CustomEvent('wormhole-opened', {
          detail: { url: result.url, password: result.password }
        })
      )
      return `✅ Wormhole active. The project is live globally at ${result.url}. The bypass password is ${result.password}.`
    }

    return '❌ Failed to open wormhole. Check if the port is valid.'
  } catch (error) {
    console.error('Wormhole Deployment Error:', error)
    return `❌ System failure: ${String(error)}`
  }
}

export const closeWormhole = async (): Promise<string> => {
  try {
    // @ts-ignore
    await window.electron.ipcRenderer.invoke('close-wormhole')
    window.dispatchEvent(new CustomEvent('wormhole-closed'))
    return '✅ Wormhole closed securely. Port is no longer exposed.'
  } catch (error) {
    console.error('Wormhole Close Error:', error)
    return `❌ System failure: ${String(error)}`
  }
}
