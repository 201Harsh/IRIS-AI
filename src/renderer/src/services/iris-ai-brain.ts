export interface Message {
  role: 'user' | 'iris';
  parts: [{ text: string }];
}

export const saveMessage = async (role: 'user' | 'iris', text: string) => {
  if (!text || text.trim() === "") return; 

  try {
    await window.electron.ipcRenderer.invoke('add-message', {
      role: role,
      parts: [{ text: text }]
    });
  } catch (err) {
    console.error("Failed to send message to backend:", err);
  }
}

export const getHistory = async (): Promise<Message[]> => {
  try {
    return await window.electron.ipcRenderer.invoke('get-history');
  } catch (e) {
    return [];
  }
}