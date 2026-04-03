export const playSpotifyMusic = async (songName: string) => {
  try {

    await window.electron.ipcRenderer.invoke('open-app', 'spotify')

    const navActions = [
      { type: 'wait', ms: 5000 },
      { type: 'click' },
      { type: 'press', key: 'k', modifiers: ['control'] },
      { type: 'wait', ms: 800 },
      { type: 'press', key: 'a', modifiers: ['control'] },
      { type: 'press', key: 'backspace' },
      { type: 'type', text: songName },
      { type: 'wait', ms: 800 },
      { type: 'press', key: 'enter' },
      { type: 'wait', ms: 1500 },
      { type: 'press', key: 'tab' },
      { type: 'wait', ms: 200 },
      { type: 'press', key: 'tab' },
      { type: 'wait', ms: 200 },
      { type: 'press', key: 'enter' },
      { type: 'wait', ms: 200 },
      { type: 'press', key: 'enter' }
    ]

    await window.electron.ipcRenderer.invoke('ghost-sequence', navActions)

    return `✅ Now playing ${songName} on Spotify.`
  } catch (error) {
    return `❌ Failed to play ${songName}.`
  }
}
