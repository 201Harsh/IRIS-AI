export const playSpotifyMusic = async (songName: string) => {
  try {
    console.log(`🎵 Booting up Spotify for: ${songName}`)

    // 1. Launch or Focus Spotify
    await window.electron.ipcRenderer.invoke('open-app', 'spotify')

    // 2. The Ghost Sequence
    const navActions = [
      { type: 'wait', ms: 5000 }, // Give Spotify time to open/focus
      { type: 'click' }, // Force OS focus steal
      { type: 'press', key: 'k', modifiers: ['control'] }, // Spotify Search Shortcut
      { type: 'wait', ms: 800 },
      { type: 'press', key: 'a', modifiers: ['control'] }, // Highlight any old search text
      { type: 'press', key: 'backspace' }, // Clear the search bar
      { type: 'type', text: songName }, // Ghost type the requested song
      { type: 'wait', ms: 800 },
      { type: 'press', key: 'enter' }, // Execute search
      { type: 'wait', ms: 1500 }, // Wait for internet results to load
      // Navigate to the "Top Result" play button and hit it
      { type: 'press', key: 'tab' },
      { type: 'wait', ms: 200 },
      { type: 'press', key: 'tab' },
      { type: 'wait', ms: 200 },
      { type: 'press', key: 'enter' },
      { type: 'wait', ms: 200 },
      { type: 'press', key: 'enter' } // Double tap enter ensures it plays the top track
    ]

    await window.electron.ipcRenderer.invoke('ghost-sequence', navActions)

    return `✅ Now playing ${songName} on Spotify.`
  } catch (error) {
    console.error(error)
    return `❌ Failed to play ${songName}.`
  }
}
