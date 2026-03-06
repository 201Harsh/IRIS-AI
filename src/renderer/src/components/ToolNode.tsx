import { useState } from 'react'
import { Handle, Position, useReactFlow } from 'reactflow'
import {
  RiTerminalBoxLine,
  RiGlobalLine,
  RiPhoneLine,
  RiSettings4Line,
  RiDeleteBinLine,
  RiFlashlightLine,
  RiEditBoxLine,
  RiKeyboardLine,
  RiVolumeUpLine,
  RiMailLine,
  RiServerLine
} from 'react-icons/ri'
import 'react-tooltip/dist/react-tooltip.css'
import { ListStartIcon } from 'lucide-react'

export const getIcon = (name: string, size = 16) => {
  if (name.includes('mobile') || name.includes('whatsapp'))
    return <RiPhoneLine size={size} className="text-blue-400" />
  if (name.includes('terminal') || name.includes('code') || name.includes('app'))
    return <RiTerminalBoxLine size={size} className="text-emerald-400" />
  if (name.includes('web') || name.includes('search') || name.includes('research'))
    return <RiGlobalLine size={size} className="text-cyan-400" />
  if (name.includes('type') || name.includes('shortcut') || name.includes('sequence'))
    return <RiKeyboardLine size={size} className="text-yellow-400" />
  if (name.includes('volume')) return <RiVolumeUpLine size={size} className="text-pink-400" />
  if (name.includes('email')) return <RiMailLine size={size} className="text-orange-400" />
  if (name.includes('wormhole')) return <RiServerLine size={size} className="text-purple-400" />

  if (name === 'WAIT') return <RiFlashlightLine size={size} className="text-purple-400" />
  if (name === 'TRIGGER') return <ListStartIcon size={size} className="text-red-400" />
  return <RiSettings4Line size={size} className="text-zinc-400" />
}

export default function ToolNode({ data, id }: any) {
  const { tool, comment, openParameterEditor } = data
  const { setNodes, setEdges } = useReactFlow()
  const [isHovered, setIsHovered] = useState(false)

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id))
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id))
  }

  const isTrigger = tool.name === 'TRIGGER'
  const isWait = tool.name === 'WAIT'

  return (
    <div
      className="bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl min-w-50 max-w-62.5 font-sans text-zinc-100 group transition-all hover:border-emerald-500/50 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isTrigger && !isWait && (
        <Handle
          type="target"
          position={Position.Left}
          id="target-left"
          className="w-2.5 h-4 bg-zinc-400 rounded-sm border-none -ml-1"
        />
      )}
      {isWait && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="target-left"
            className="w-2.5 h-4 bg-zinc-400 rounded-sm border-none -ml-1"
          />
          <Handle
            type="target"
            position={Position.Top}
            id="target-top"
            className="w-4 h-2.5 bg-zinc-400 rounded-sm border-none -mt-1"
          />
        </>
      )}

      <div className="flex items-center justify-between p-2.5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#09090b] rounded shadow-inner border border-white/5">
            {getIcon(tool.name, 18)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[11px] tracking-widest uppercase text-zinc-200 leading-none">
              {tool.name.replace(/_/g, ' ')}
            </span>
            {comment && (
              <span className="text-[9px] text-zinc-500 italic mt-1 truncate max-w-30">
                {comment}
              </span>
            )}
          </div>
        </div>

        <div
          className={`flex flex-col gap-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <button
            onClick={() => openParameterEditor(id)}
            className="text-zinc-500 hover:text-emerald-400 bg-black/40 p-1 rounded cursor-pointer"
          >
            <RiEditBoxLine size={12} />
          </button>
          <button
            onClick={deleteNode}
            className="text-zinc-500 hover:text-red-400 bg-black/40 p-1 rounded cursor-pointer"
          >
            <RiDeleteBinLine size={12} />
          </button>
        </div>
      </div>

      {isTrigger && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="source-bottom"
          className="w-4 h-2.5 bg-emerald-500 rounded-sm border-none -mb-1"
        />
      )}
      {isWait && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="source-right"
            className="w-2.5 h-4 bg-emerald-500 rounded-sm border-none -mr-1"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="source-bottom"
            className="w-4 h-2.5 bg-emerald-500 rounded-sm border-none -mb-1"
          />
        </>
      )}
      {!isTrigger && !isWait && (
        <Handle
          type="source"
          position={Position.Right}
          id="source-right"
          className="w-2.5 h-4 bg-emerald-500 rounded-sm border-none -mr-1"
        />
      )}
    </div>
  )
}
