export const executeSmartDropZones = async (
  base_directory: string,
  files: Array<{ file_path: string; category: string }>
) => {
  try {
    console.log(`⚡ Igniting Fast Sort in: ${base_directory}`)

    window.dispatchEvent(
      new CustomEvent('dropzone-start', { detail: { total: files.length, path: base_directory } })
    )
    await new Promise((resolve) => setTimeout(resolve, 300)) // Quick beat for UI to pop in

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = file.file_path.split('\\').pop() || file.file_path.split('/').pop()
      const targetFolder = `${base_directory}\\${file.category}`

      await window.electron.ipcRenderer.invoke('move-file-to-category', {
        sourcePath: file.file_path,
        targetFolder
      })

      window.dispatchEvent(
        new CustomEvent('dropzone-update', {
          detail: {
            category: file.category,
            fileName,
            current: i + 1,
            total: files.length
          }
        })
      )

      await new Promise((resolve) => setTimeout(resolve, 150))
    }

    window.dispatchEvent(new CustomEvent('dropzone-done'))
    return `✅ Instant sort complete. ${files.length} files routed.`
  } catch (error) {
    console.error(error)
    window.dispatchEvent(new CustomEvent('dropzone-done', { detail: { error: true } }))
    return '❌ Smart Drop Zones failed.'
  }
}
