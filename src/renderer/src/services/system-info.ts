export interface SystemStats {
  cpu: string
  memory: {
    total: string
    free: string
    usedPercentage: string
  }
  temperature: number
  os: {
    type: string
    uptime: string
  }
}

export interface AppItem {
  name: string
  id: string
}

export const getSystemStatus = async (): Promise<SystemStats | null> => {
  try {
    return await window.electron.ipcRenderer.invoke('get-system-stats')
  } catch (error) {
    console.error('Stats Error:', error)
    return null
  }
}

export const getAllApps = async (): Promise<AppItem[]> => {
  try {
    const apps = await window.electron.ipcRenderer.invoke('get-installed-apps')
    return Array.isArray(apps) ? apps : []
  } catch (error) {
    console.error('App Fetch Error:', error)
    return []
  }
}

export const getDrives = async (): Promise<any[]> => {
  try {
    return await window.electron.ipcRenderer.invoke('get-drives')
  } catch (error) {
    return []
  }
}
