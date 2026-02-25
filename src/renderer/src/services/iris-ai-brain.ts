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
  } catch (err) {}
}

export const getHistory = async (): Promise<ChatMessage[]> => {
  try {
    const history = await window.electron.ipcRenderer.invoke('get-history')
    return history || []
  } catch (e) {
    return []
  }
}

export const saveCoreMemory = async (fact: string): Promise<string> => {
  try {
    const success = await window.electron.ipcRenderer.invoke('save-core-memory', fact)

    if (success) {
      return `✅ Successfully committed to permanent memory: "${fact}"`
    }
    return '❌ System failure: Could not save to permanent memory.'
  } catch (error) {
    console.error('Memory Save Error:', error)
    return `❌ System failure: ${String(error)}`
  }
}

export const retrieveCoreMemory = async (): Promise<string> => {
  try {
    const memories = await window.electron.ipcRenderer.invoke('search-core-memory')

    if (memories && memories.length > 0) {
      return `Here is the permanent memory bank data:\n${JSON.stringify(memories)}`
    }
    return 'The permanent memory bank is currently empty.'
  } catch (error) {
    console.error('Memory Retrieve Error:', error)
    return `❌ System failure: ${String(error)}`
  }
}
