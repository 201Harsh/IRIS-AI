import { useState, useEffect } from 'react'
import IRIS from './IRIS'
import MiniOverlay from '@renderer/components/MiniOverlay'

const IrisMain = () => {
  const [isOverlay, setIsOverlay] = useState(false)

  useEffect(() => {
    // Listen for backend toggle command
    window.electron.ipcRenderer.on('overlay-mode', (_e, mode) => setIsOverlay(mode))
    return () => {
      window.electron.ipcRenderer.removeAllListeners('overlay-mode')
    }
  }, [])

  // If in overlay mode, show ONLY the pill
  if (isOverlay) return <MiniOverlay />

  // Otherwise show the full dashboard (Your existing UI)
  return <IRIS />
}

export default IrisMain