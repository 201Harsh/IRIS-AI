import { useState, useEffect } from 'react'
import MiniOverlay from './components/MiniOverlay'
import TitleBar from './components/Titlebar'
import IRIS from './UI/IRIS'

const App = () => {
  const [isOverlay, setIsOverlay] = useState(false)

  useEffect(() => {
    // Listen for the toggle event from Main Process
    window.electron.ipcRenderer.on('overlay-mode', (_e, mode) => setIsOverlay(mode))
    return () => {
      window.electron.ipcRenderer.removeAllListeners('overlay-mode')
    }
  }, [])

  // 🛑 OVERLAY MODE: Show ONLY the Pill
  if (isOverlay) {
    return (
      <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-transparent">
        <MiniOverlay />
      </div>
    )
  }

  // 🖥️ DASHBOARD MODE: Show TitleBar + IRIS
  return (
    <div className="flex flex-col h-screen w-screen bg-black overflow-hidden relative border border-emerald-500/20 rounded-xl">
      <TitleBar />
      <div className="flex-1 relative">
        <IRIS />
      </div>
    </div>
  )
}

export default App
