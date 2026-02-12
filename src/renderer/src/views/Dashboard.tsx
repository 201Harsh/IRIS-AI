import { useEffect, useState, useCallback, useRef } from 'react'
import Sphere from '@renderer/components/Sphere'
import {
  RiCpuLine,
  RiCameraLine,
  RiTerminalBoxLine,
  RiSwapBoxLine,
  RiLayoutGridLine,
  RiMicLine,
  RiMicOffLine,
  RiPhoneFill,
  RiHistoryLine
} from 'react-icons/ri'
import { FaMemory } from 'react-icons/fa6'
import { GiTinker } from 'react-icons/gi'
import { HiComputerDesktop } from 'react-icons/hi2'
import { VisionMode } from '@renderer/App'

interface IrisProps {
  isSystemActive: boolean
  toggleSystem: () => void
  isMicMuted: boolean
  toggleMic: () => void
  isVideoOn: boolean
  visionMode: VisionMode
  startVision: (mode: 'camera' | 'screen') => void
  stopVision: () => void
  activeStream: MediaStream | null
}

interface DashboardViewProps {
  props: IrisProps
  stats: any
  chatHistory: any[]
  onVisionClick: () => void
}

const glassPanel = 'bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl'

const DashboardView = ({ props, stats, chatHistory, onVisionClick }: DashboardViewProps) => {
  const {
    isSystemActive,
    isVideoOn,
    visionMode,
    startVision,
    activeStream,
    toggleMic,
    toggleSystem,
    isMicMuted
  } = props

  const [debugStatus, setDebugStatus] = useState<string>('Init')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chatHistory])

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      if (node) {
        if (activeStream && isVideoOn) {
          setDebugStatus(`Attaching ${activeStream.id}`)
          node.srcObject = activeStream
          node.onloadedmetadata = () => {
            setDebugStatus('Playing')
            node.play().catch((e) => setDebugStatus(`Error: ${e.message}`))
          }
        } else {
          setDebugStatus('No Stream Source')
          node.srcObject = null
        }
      }
    },
    [activeStream, isVideoOn, visionMode]
  )

  const toggleSource = () => {
    if (!isSystemActive) return
    const nextMode = visionMode === 'camera' ? 'screen' : 'camera'
    startVision(nextMode)
  }

  const systemMetrics = [
    {
      icon: <RiCpuLine />,
      label: 'CPU LOAD',
      val: isSystemActive && stats ? `${stats.cpu}%` : '--'
    },
    {
      icon: <FaMemory />,
      label: 'RAM USAGE',
      val: isSystemActive && stats ? `${stats.memory.usedPercentage}%` : '--'
    },
    {
      icon: <GiTinker />,
      label: 'TEMP',
      val: isSystemActive && stats ? `${stats.temperature}°C` : '--'
    },
    {
      icon: <HiComputerDesktop />,
      label: 'OS',
      val: isSystemActive && stats ? `${stats.os.type}` : '--'
    }
  ]

  return (
    <div className="flex-1 p-4 grid grid-cols-12 gap-4 h-full overflow-hidden relative animate-in fade-in zoom-in duration-300 w-full">
      <div className="hidden lg:flex col-span-3 flex-col gap-4 h-full z-40">
        <div className={`${glassPanel} flex-1 flex flex-col p-1 overflow-hidden relative group`}>
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isVideoOn ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : 'bg-zinc-600'}`}
            />
            <span
              className={`text-[9px] font-bold tracking-widest ${isVideoOn ? 'text-red-400/80' : 'text-zinc-600'}`}
            >
              {isVideoOn ? (visionMode === 'screen' ? 'SCREEN FEED' : 'VISUAL INPUT') : 'OFFLINE'}
            </span>
          </div>

          {isVideoOn && (
            <button
              onClick={toggleSource}
              className="absolute top-2 right-2 z-30 p-1.5 rounded-md bg-black/50 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all"
              title="Switch Input"
            >
              <RiSwapBoxLine size={14} />
            </button>
          )}

          <div
            className={`w-full h-full rounded-xl overflow-hidden bg-black relative border border-white/5 transition-all ${isVideoOn ? 'opacity-100' : 'opacity-30'}`}
          >
            <video
              key={visionMode} 
              ref={setVideoRef} 
              className={`w-full h-full object-cover ${visionMode === 'camera' ? '-scale-x-100' : ''}`}
              autoPlay
              playsInline
              muted
            />

            {isVideoOn && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-[8px] text-emerald-500 font-mono px-1">
                STATUS: {debugStatus}
              </div>
            )}

            {!isVideoOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-50">
                <RiCameraLine size={24} />
                <span className="text-[9px] font-mono">NO SIGNAL</span>
              </div>
            )}
          </div>
        </div>

        <div className={`${glassPanel} h-48 p-4 flex flex-col gap-3`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] font-bold tracking-widest text-zinc-400">
              <RiLayoutGridLine className="inline mr-1" /> METRICS
            </span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
          </div>
          <div className="grid grid-cols-2 gap-2 h-full">
            {systemMetrics.map((m, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-lg p-2 flex flex-col justify-between border border-white/5"
              >
                <div className="flex justify-between items-start text-zinc-500">
                  <span className="text-sm">{m.icon}</span>
                  <span className="text-[8px] font-mono opacity-50">{m.label}</span>
                </div>
                <span className="text-sm font-bold text-emerald-400 text-right">{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-6 relative flex flex-col items-center justify-center">
        <div
          className={`lg:hidden absolute top-4 right-4 w-32 h-24 ${glassPanel} z-50 overflow-hidden transition-all ${isVideoOn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <video
            key={`mini-${visionMode}`}
            ref={setVideoRef}
            className={`w-full h-full object-cover ${visionMode === 'camera' ? '-scale-x-100' : ''}`}
            autoPlay
            playsInline
            muted
          />
        </div>

        <div
          className={`w-[60vh] h-[60vh] max-w-full transition-all duration-1000 ${isSystemActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale'}`}
        >
          <Sphere />
        </div>

        <div className="absolute bottom-10 z-50">
          <div
            className={`${glassPanel} px-6 py-3 rounded-full flex items-center gap-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
          >
            <button
              onClick={onVisionClick}
              className={`p-3 rounded-full transition-all ${isVideoOn ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-zinc-400'}`}
            >
              {isVideoOn ? <RiSwapBoxLine size={20} /> : <RiCameraLine size={20} />}
            </button>

            <button onClick={toggleSystem} className="relative group mx-2">
              <div
                className={`p-4 rounded-full border-2 transition-all duration-500 ${isSystemActive ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_20px_#10b981]' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}
              >
                <RiPhoneFill size={24} className={isSystemActive ? 'animate-pulse' : ''} />
              </div>
            </button>

            <button
              onClick={toggleMic}
              className={`p-3 rounded-full transition-all ${isMicMuted ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}
            >
              {isMicMuted ? <RiMicOffLine size={20} /> : <RiMicLine size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex col-span-3 flex-col overflow-auto h-full z-40">
        <div className={`${glassPanel} h-full p-4 flex flex-col`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
            <span className="text-[10px] font-bold tracking-widest text-zinc-400">
              <RiTerminalBoxLine className="inline mr-1" /> TRANSCRIPT
            </span>
            <span className="text-[8px] font-mono text-emerald-500/50">LIVE-LOG</span>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-small">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-2 opacity-50">
                <RiHistoryLine size={24} />
                <span className="text-[9px] tracking-widest uppercase font-mono">
                  No Data Stream
                </span>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[95%] py-2 px-3 rounded-lg text-[11px] leading-relaxed border font-mono font-semibold ${msg.role === 'user' ? 'bg-emerald-900/20 border-emerald-500/20 text-emerald-100/90 rounded-br-none' : 'bg-zinc-900/50 border-white/5 text-zinc-400 rounded-bl-none'}`}
                  >
                    {msg.parts && msg.parts[0] ? msg.parts[0].text : msg.content}
                  </div>
                  <span className="text-[8px] font-bold opacity-20 mt-1 uppercase tracking-wider">
                    {msg.role === 'model' ? 'IRIS' : 'YOU'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
