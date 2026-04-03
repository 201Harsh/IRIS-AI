const activateCodingMode = async () => {
  await window.electron.ipcRenderer.invoke('set-volume', 80)

  await window.electron.ipcRenderer.invoke('open-app', 'vscode')

  await window.electron.ipcRenderer.invoke(
    'google-search',
    'https://www.youtube.com/results?search_query=lofi+chill+radio+live'
  )

  await new Promise((r) => setTimeout(r, 6000))

  try {
    const screen = await window.electron.ipcRenderer.invoke('get-screen-size')

    const targetX = Math.round(screen.width * 0.35)
    const targetY = Math.round(screen.height * 0.3)


    await window.electron.ipcRenderer.invoke('ghost-click-coordinate', { x: targetX, y: targetY })
  } catch (e) {
    await window.electron.ipcRenderer.invoke('ghost-sequence', [{ type: 'click' }])
  }

  return '✅ Coding Mode Active: Volume 80%, VS Code Open, Lofi Playing.'
}

const runTerminal = async (command: string, path?: string) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('run-shell-command', {
      command,
      cwd: path
    })
    if (res.success) return `✅ Output:\n${res.output}`
    return `❌ Failed:\n${res.output}`
  } catch (e) {
    return 'System Error.'
  }
}

const openInVsCode = async (path: string) => {
  try {
    return (await window.electron.ipcRenderer.invoke('open-in-vscode', path)).success
      ? `✅ Opened in VS Code.`
      : '❌ Failed.'
  } catch (e) {
    return 'Error'
  }
}

export { activateCodingMode, runTerminal, openInVsCode }