export const ingestCodebase = async (dirPath: string): Promise<string> => {
  try {
    window.dispatchEvent(new CustomEvent('oracle-ingest-start', { detail: { path: dirPath } }))

    // @ts-ignore
    const cleanupListener = window.electron.ipcRenderer.on(
      'oracle-progress',
      (_ipcEvent: any, data: any) => {
        const payload = data || _ipcEvent
        window.dispatchEvent(new CustomEvent('oracle-progress', { detail: payload }))
      }
    )

    // @ts-ignore
    const result = await window.electron.ipcRenderer.invoke('ingest-codebase', dirPath)

    if (typeof cleanupListener === 'function') cleanupListener()

    if (result.success) {
      window.dispatchEvent(
        new CustomEvent('oracle-ingest-done', { detail: { chunks: result.totalChunks } })
      )
      const msg = result.wasResumed
        ? `✅ Successfully resumed and completed ingestion. Memory Banks fully loaded.`
        : `✅ Successfully ingested directory. Generated ${result.totalChunks} vectors.`
      return msg
    }
    return `❌ Ingestion Aborted or Failed: ${result.error}`
  } catch (error) {
    return `❌ System failure: ${String(error)}`
  }
}

export const consultOracle = async (query: string): Promise<string> => {
  try {
    window.dispatchEvent(new CustomEvent('oracle-thinking'))
    // @ts-ignore
    const result = await window.electron.ipcRenderer.invoke('consult-oracle', query)

    if (result.success) {
      window.dispatchEvent(
        new CustomEvent('oracle-answered', { detail: { answer: result.answer } })
      )
      return `Code Analysis:\n${result.answer}`
    }
    return `❌ AI failed: ${result.error}`
  } catch (error) {
    return `❌ System failure: ${String(error)}`
  }
}

// Tied to the red "STOP SCAN" button in the UI
export const cancelIngestion = async (): Promise<void> => {
  // @ts-ignore
  await window.electron.ipcRenderer.invoke('cancel-ingestion')
}
