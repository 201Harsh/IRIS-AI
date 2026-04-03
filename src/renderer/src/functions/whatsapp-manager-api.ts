export const sendWhatsAppMessage = async (name: string, message: string, filePath?: string) => {
  try {

    if (filePath) {
      await window.electron.ipcRenderer.invoke('copy-file-to-clipboard', filePath)
    }

    await window.electron.ipcRenderer.invoke('open-app', 'whatsapp')

    const navActions = [
      { type: 'wait', ms: 1500 },
      { type: 'click' },
      { type: 'press', key: 'n', modifiers: ['control'] },
      { type: 'wait', ms: 500 },
      { type: 'press', key: 'a', modifiers: ['control'] },
      { type: 'press', key: 'backspace' },
      { type: 'type', text: name },
      { type: 'wait', ms: 500 },
      { type: 'press', key: 'down' },
      { type: 'press', key: 'enter' },
      { type: 'wait', ms: 500 },
      { type: 'click' }
    ]
    await window.electron.ipcRenderer.invoke('ghost-sequence', navActions)

    if (filePath) {
      await window.electron.ipcRenderer.invoke('ghost-sequence', [
        { type: 'press', key: 'v', modifiers: ['control'] },
        { type: 'wait', ms: 2500 },
        { type: 'type', text: message },
        { type: 'press', key: 'enter' }
      ])
    } else {
      await window.electron.ipcRenderer.invoke('ghost-sequence', [
        { type: 'paste', text: message },
        { type: 'wait', ms: 500 },
        { type: 'press', key: 'enter' }
      ])
    }

    return `✅ Message sent to ${name}.`
  } catch (error) {
    return '❌ Failed to send.'
  }
}

export const scheduleWhatsAppMessage = async (
  name: string,
  message: string,
  delayMinutes: number,
  filePath?: string
) => {
  if (!delayMinutes || delayMinutes <= 0) {
    return await sendWhatsAppMessage(name, message, filePath)
  }

 

  setTimeout(
    () => {
      window.electron.ipcRenderer.invoke('ghost-sequence', [{ type: 'type', text: '' }])

      sendWhatsAppMessage(name, message, filePath)
    },
    delayMinutes * 60 * 1000
  )

  return `✅ Scheduled! I will send the message to ${name} in ${delayMinutes} minutes.`
}

