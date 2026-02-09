export interface ChatMessage {
  role: 'user' | 'model'
  parts: [{ text: string }]
}

export const saveMessage = async (role: 'user' | 'model' | 'iris', text: string) => {
  try {
    if (!text) return

    const safeRole = role === 'iris' ? 'model' : role

    await window.electron.ipcRenderer.invoke('add-message', {
      role: safeRole,
      parts: [{ text: text }]
    })
  } catch (err) {
  }
}

export const getHistory = async (): Promise<ChatMessage[]> => {
  try {
    const history = await window.electron.ipcRenderer.invoke('get-history')
    return history || []
  } catch (e) {
    return []
  }
}
