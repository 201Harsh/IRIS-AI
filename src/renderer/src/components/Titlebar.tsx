import { useState, useEffect } from 'react'
import {
  RiSubtractLine,
  RiCloseLine,
  RiCheckboxBlankLine,
  RiCheckboxMultipleBlankLine
} from 'react-icons/ri'

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    if (window.electron && window.electron.process) {
      setIsMac(window.electron.process.platform === 'darwin')
    } else {
      setIsMac(navigator.userAgent.toLowerCase().includes('mac'))
    }
  }, [])

  const minimize = () => window.electron.ipcRenderer.send('window-min')
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
    window.electron.ipcRenderer.send('window-max')
  }
  const close = () => window.electron.ipcRenderer.send('window-close')

  return (
    <div className="w-full h-24 flex items-center justify-between px-4 bg-zinc-900 border-b border-zinc-800 drag-region select-none z-1000 relative">
      {isMac && (
        <div className="flex items-center gap-2 no-drag z-50">
          <button
            onClick={close}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600 flex items-center justify-center group"
          >
            <span className="hidden group-hover:block text-[8px] text-red-900 font-bold">×</span>
          </button>
          <button
            onClick={minimize}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 border border-yellow-600 flex items-center justify-center group"
          >
            <span className="hidden group-hover:block text-[8px] text-yellow-900 font-bold">−</span>
          </button>
          <button
            onClick={toggleMaximize}
            className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 flex items-center justify-center group"
          >
            <span className="hidden group-hover:block text-[6px] text-emerald-900 font-bold">
              ↗
            </span>
          </button>
        </div>
      )}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 opacity-60 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
        <div className="text-[11px] font-bold text-zinc-300 tracking-[0.3em]">
          IRIS OS // {isMac ? 'MAC' : 'SYSTEM'}
        </div>
      </div>

      {!isMac && (
        <div className="flex h-full no-drag ml-auto -mr-4 z-50">
          <button
            onClick={minimize}
            className="w-12 h-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <RiSubtractLine size={16} />
          </button>
          <button
            onClick={toggleMaximize}
            className="w-12 h-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            {isMaximized ? (
              <RiCheckboxMultipleBlankLine size={14} />
            ) : (
              <RiCheckboxBlankLine size={14} />
            )}
          </button>
          <button
            onClick={close}
            className="w-12 h-full flex items-center justify-center text-zinc-400 hover:bg-red-600 hover:text-white transition-colors"
          >
            <RiCloseLine size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

export default TitleBar
