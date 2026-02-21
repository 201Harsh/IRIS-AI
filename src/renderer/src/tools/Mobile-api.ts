export const openMobileApp = async (packageName: string) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('adb-open-app', { packageName })

    if (res.success) {
      return `Successfully launched the app (${packageName}) on the connected mobile device.`
    } else {
      return `Failed to open ${packageName}. Make sure the app is actually installed on the device. Reason: ${res.error}`
    }
  } catch (error) {
    return `System Error: The mobile bridge is offline or the command failed.`
  }
}
