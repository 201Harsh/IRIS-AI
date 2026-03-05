import { useState, useEffect } from 'react'
import { RiCloseLine, RiSave3Line } from 'react-icons/ri'

export default function ParameterEditorDrawer({ nodeData, updateNodeInputs, closeEditor }: any) {
  const tool = nodeData?.data?.tool
  const [localInputs, setLocalInputs] = useState<any>({})
  const [localComment, setLocalComment] = useState('')

  useEffect(() => {
    if (nodeData) {
      setLocalInputs(nodeData.data.inputs || {})
      setLocalComment(nodeData.data.comment || '')
    }
  }, [nodeData])

  if (!nodeData || !tool) return null

  const handleInputChange = (key: string, value: string) => {
    setLocalInputs((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateNodeInputs(nodeData.id, localInputs, localComment)
    closeEditor()
  }

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right-8 duration-200">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
        <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
          Configure Module
        </span>
        <button
          onClick={closeEditor}
          className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <RiCloseLine size={20} />
        </button>
      </div>

      <div className="p-5 grow overflow-y-auto flex flex-col gap-6 custom-scrollbar">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">
            {tool.name.replace(/_/g, ' ')}
          </h3>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">{tool.description}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
            Node Label / Comment
          </label>
          <input
            type="text"
            placeholder="e.g., 'Boot up Next.js server'"
            className="bg-zinc-900 border border-white/10 rounded-md text-xs p-2.5 text-white outline-none focus:border-emerald-500 transition-colors placeholder-zinc-700"
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
          />
        </div>

        <div className="h-px w-full bg-white/5" />

        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
            Parameters
          </h4>

          {tool.parameters?.properties && Object.keys(tool.parameters.properties).length > 0 ? (
            Object.entries(tool.parameters.properties).map(([key, prop]: any) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest">
                  {key.replace(/_/g, ' ')}
                </label>

                {prop.enum ? (
                  <select
                    className="bg-zinc-900 border border-white/10 rounded-md text-xs p-2.5 text-white outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    value={localInputs[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  >
                    <option value="">Select option...</option>
                    {prop.enum.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    rows={2}
                    placeholder={prop.description || ''}
                    className="bg-zinc-900 border border-white/10 rounded-md text-xs p-2.5 text-white outline-none focus:border-emerald-500 transition-colors placeholder-zinc-700 resize-none font-mono"
                    value={localInputs[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-[10px] text-zinc-500 italic uppercase tracking-widest">
              No configuration needed.
            </p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 bg-black/40">
        <button
          onClick={handleSave}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-black py-2.5 rounded-lg text-[11px] font-black tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RiSave3Line size={16} /> APPLY CHANGES
        </button>
      </div>
    </div>
  )
}
