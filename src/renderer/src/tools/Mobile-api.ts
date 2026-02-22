export const openMobileApp = async (packageName: string) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('adb-open-app', { packageName })
    if (res.success) {
      return `Successfully launched the app (${packageName}) on the connected mobile device.`
    } else {
      return `Failed to open ${packageName}. Make sure the app is installed. Reason: ${res.error}`
    }
  } catch (error) {
    return `System Error: The mobile bridge is offline or the command failed.`
  }
}

export const closeMobileApp = async (packageName: string) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('adb-close-app', { packageName })
    if (res.success) {
      return `Successfully closed and force-stopped the app (${packageName}).`
    } else {
      return `Failed to close ${packageName}. Reason: ${res.error}`
    }
  } catch (error) {
    return `System Error: The mobile bridge is offline.`
  }
}

export const tapMobileScreen = async (xPercent: number, yPercent: number) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('adb-tap', { xPercent, yPercent })
    if (res.success) {
      return `Successfully tapped the screen at X: ${xPercent}%, Y: ${yPercent}%.`
    } else {
      return `Failed to tap screen. Reason: ${res.error}`
    }
  } catch (error) {
    return `System Error: Mobile bridge offline.`
  }
}

export const swipeMobileScreen = async (direction: string) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('adb-swipe', {
      direction: direction.toLowerCase()
    })
    if (res.success) {
      return `Successfully swiped ${direction} on the device.`
    } else {
      return `Failed to swipe. Reason: ${res.error}`
    }
  } catch (error) {
    console.error(error)
    return `System Error: Mobile bridge offline.`
  }
}

export const fetchMobileInfo = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-mobile-info-ai')
    return result
  } catch (e) {
    console.error(e)
    return 'System Error: Mobile telemetry bridge is offline.'
  }
}
