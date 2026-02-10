import { RiSubtractLine, RiCloseLine, RiCheckboxBlankLine } from 'react-icons/ri'

const TitleBar = () => {
  const minimize = () => window.electron.ipcRenderer.send('window-min')
  const maximize = () => window.electron.ipcRenderer.send('window-max') // ⚡ New Resize Handler
  const close = () => window.electron.ipcRenderer.send('window-close')

  return (
    <div className="w-full h-10 flex items-center justify-between px-4 py-4 bg-zinc-900 border-b border-zinc-700 drag-region select-none z-1000">
      {/* LEFT: Branding */}
      <div className="flex items-center gap-2 opacity-60">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <div className="text-[10px] font-bold text-zinc-300 tracking-[0.2em]">
          IRIS OS // SYSTEM
        </div>
      </div>

      {/* RIGHT: Window Controls */}
      <div className="flex gap-4 no-drag text-zinc-400">
        {/* Minimize */}
        <button
          onClick={minimize}
          className="hover:text-white transition-colors p-1"
          title="Minimize"
        >
          <RiSubtractLine size={16} />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={maximize}
          className="hover:text-white transition-colors p-1"
          title="Maximize"
        >
          <RiCheckboxBlankLine size={14} />
        </button>

        {/* Close */}
        <button
          onClick={close}
          className="hover:text-red-500 hover:bg-red-500/10 rounded transition-all p-1"
          title="Close System"
        >
          <RiCloseLine size={18} />
        </button>
      </div>
    </div>
  )
}

export default TitleBar
