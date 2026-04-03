import { useState, useEffect, useRef } from 'react'
import {
  RiBrainLine,
  RiArrowDropDownLine,
  RiMore2Fill,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiEditBoxLine
} from 'react-icons/ri'

interface MacroMenuProps {
  loadMacroToCanvas: (macro: any) => void
}

export default function MacroManagementMenu({ loadMacroToCanvas }: MacroMenuProps) {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isMainOpen, setIsMainOpen] = useState(false)
  const [activeWorkflowActions, setActiveWorkflowActions] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const loadWorkflowsList = async () => {
    try {
      const res = await (window as any).electron.ipcRenderer.invoke('load-workflows')
      if (res.success) setWorkflows(res.workflows || [])
    } catch (e) {
    }
  }

  useEffect(() => {
    if (isMainOpen) loadWorkflowsList()
  }, [isMainOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMainOpen(false)
        setActiveWorkflowActions(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuRef])

  const handleEdit = (macro: any) => {
    loadMacroToCanvas(macro)
    setIsMainOpen(false)
  }

  const handleDelete = async (macroName: string) => {
    if (
      window.confirm(
        `Are you sure you want to purge macro "${macroName}" from the neural net? This cannot be undone.`
      )
    ) {
      await (window as any).electron.ipcRenderer.invoke('delete-workflow', { name: macroName })
      loadWorkflowsList()
      setActiveWorkflowActions(null)
    }
  }

  const handleDuplicate = async (macro: any) => {
    const newMacro = { ...macro, name: `${macro.name} Copy` }
    loadMacroToCanvas(newMacro)
    setIsMainOpen(false)
    alert(`Duplicated to canvas as '${newMacro.name}'. Change the name and save to finalize.`)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMainOpen(!isMainOpen)}
        className={`flex items-center gap-3 px-4 py-2 bg-[#18181b] border rounded-lg text-sm text-zinc-300 font-medium transition-all cursor-pointer ${isMainOpen ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-[#27272a] hover:border-zinc-700'}`}
      >
        <RiBrainLine className="text-emerald-500" />
        Neural Patterns ({workflows.length})
        <RiArrowDropDownLine
          size={18}
          className={`text-zinc-600 transition-transform ${isMainOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isMainOpen && (
        <div className="absolute top-12 left-0 w-80 bg-[#111113] border border-[#27272a] rounded-xl shadow-2xl z-50 p-2 flex flex-col gap-1 max-h-96 overflow-y-auto scrollbar-small animate-in fade-in duration-200">
          <h4 className="text-[10px] font-black tracking-widest text-zinc-600 p-2 uppercase border-b border-[#27272a] mb-2">
            INGESTED MACROS
          </h4>

          {workflows.length === 0 && (
            <p className="text-xs text-zinc-700 p-4 text-center italic">
              No macros saved in the neural net.
            </p>
          )}

          {workflows.map((macro: any) => (
            <div key={macro.name} className="relative group">
              <button
                onClick={() => handleEdit(macro)}
                className="w-full text-left flex flex-col gap-1 p-3 rounded-lg hover:bg-zinc-800/60 group cursor-pointer border border-transparent hover:border-white/5"
              >
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wide group-hover:text-emerald-400">
                  {macro.name}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono italic">
                  Saved: {new Date(macro.updatedAt).toLocaleString()}
                </span>
              </button>

              <button
                onClick={() =>
                  setActiveWorkflowActions(activeWorkflowActions === macro.name ? null : macro.name)
                }
                className="absolute top-3 right-3 p-1 rounded-md text-zinc-700 hover:text-white hover:bg-zinc-700 group cursor-pointer z-10"
              >
                <RiMore2Fill size={16} />
              </button>

              {activeWorkflowActions === macro.name && (
                <div className="absolute top-8 right-2 w-32 bg-black border border-[#27272a] rounded-lg shadow-xl z-20 p-1 flex flex-col animate-in scale-95 fade-in duration-100">
                  {[
                    { label: 'Edit', icon: <RiEditBoxLine />, action: () => handleEdit(macro) },
                    {
                      label: 'Duplicate',
                      icon: <RiFileCopyLine />,
                      action: () => handleDuplicate(macro)
                    },
                    {
                      label: 'Purge',
                      icon: <RiDeleteBinLine />,
                      className: 'text-red-400 hover:bg-red-950/40',
                      action: () => handleDelete(macro.name)
                    }
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={btn.action}
                      className={`flex items-center gap-2 p-2 rounded text-[10px] uppercase font-bold text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer ${btn.className}`}
                    >
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
