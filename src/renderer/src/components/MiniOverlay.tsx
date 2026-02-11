import { useState, useEffect, useRef } from 'react'
import {
  RiMicLine,
  RiMicOffLine,
  RiComputerLine,
  RiCameraLine,
  RiFullscreenLine,
  RiDragMove2Fill
} from 'react-icons/ri'
import { GiPowerButton } from 'react-icons/gi'
import { irisService } from '@renderer/services/Iris-voice-ai'
import { VisionMode } from '../App'

interface OverlayProps {
  isSystemActive: boolean
  toggleSystem: () => void
  isMicMuted: boolean
  toggleMic: () => void
  isVideoOn: boolean
  visionMode: VisionMode
  startVision: (mode: 'camera' | 'screen') => void
  stopVision: () => void
}

const MiniOverlay = ({
  isSystemActive,
  toggleSystem,
  isMicMuted,
  toggleMic,
  isVideoOn,
  visionMode,
  startVision,
  stopVision
}: OverlayProps) => {
  const [isTalking, setIsTalking] = useState(false)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | any | null>(null)

  // 1. Audio Visualizer
  useEffect(() => {
    if (isSystemActive && irisService.analyser) {
      analyzerRef.current = irisService.analyser
      dataArrayRef.current = new Uint8Array(irisService.analyser.frequencyBinCount)
      const checkAudio = () => {
        if (analyzerRef.current && dataArrayRef.current) {
          analyzerRef.current.getByteFrequencyData(dataArrayRef.current)
          const avg = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length
          setIsTalking(avg > 10)
        }
        if (isSystemActive) requestAnimationFrame(checkAudio)
      }
      checkAudio()
    } else {
      setIsTalking(false)
    }
  }, [isSystemActive])

  // 2. Vision Handling (Toggle Logic)
  const handleVisionClick = (mode: 'camera' | 'screen') => {
    if (isVideoOn && visionMode === mode) {
      stopVision() // Click active mode -> Turn Off
    } else {
      startVision(mode) // Click new/inactive mode -> Start/Switch
    }
  }

  const expand = () => {
    // @ts-ignore
    window.electron.ipcRenderer.send('toggle-overlay')
  }

  return (
    <div className="w-full h-full flex items-center justify-between px-3 bg-zinc-950/90 backdrop-blur-xl rounded-full border border-emerald-500/30 drag-region overflow-hidden">
      {/* STATUS DOT */}
      <div className="flex items-center gap-3 no-drag">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isSystemActive ? (isTalking ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_#10b981]' : 'border-emerald-500/50 bg-emerald-900/20') : 'border-zinc-700 bg-zinc-900'}`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${isSystemActive ? (isTalking ? 'bg-emerald-400' : 'bg-emerald-600') : 'bg-red-900'}`}
          />
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-2 no-drag">
        {/* Mic */}
        <button
          onClick={toggleMic}
          disabled={!isSystemActive}
          className={`p-2.5 rounded-full transition-all ml-1 ${!isSystemActive ? 'opacity-30' : isMicMuted ? 'text-red-500 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}
        >
          {isMicMuted ? <RiMicOffLine size={18} /> : <RiMicLine size={18} />}
        </button>

        {/* Power */}
        <button
          onClick={toggleSystem}
          className={`p-3 rounded-full border transition-all duration-500 shadow-lg mx-1 ${isSystemActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-600 text-zinc-500 hover:text-red-400'}`}
        >
          <GiPowerButton size={20} className={isSystemActive ? 'animate-pulse' : ''} />
        </button>

        {/* Camera Toggle */}
        <button
          onClick={() => handleVisionClick('camera')}
          disabled={!isSystemActive}
          className={`p-2.5 rounded-full transition-all ${!isSystemActive ? 'opacity-30' : isVideoOn && visionMode === 'camera' ? 'text-red-400 bg-red-500/10 animate-pulse border border-red-500/30' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
          title="Toggle Camera"
        >
          <RiCameraLine size={18} />
        </button>

        {/* Screen Toggle */}
        <button
          onClick={() => handleVisionClick('screen')}
          disabled={!isSystemActive}
          className={`p-2.5 rounded-full transition-all ${!isSystemActive ? 'opacity-30' : isVideoOn && visionMode === 'screen' ? 'text-red-400 bg-red-500/10 animate-pulse border border-red-500/30' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
          title="Toggle Screen"
        >
          <RiComputerLine size={18} />
        </button>
      </div>

      {/* EXPAND */}
      <div className="pl-4 border-l border-emerald-500/20 no-drag flex items-center gap-2">
        <button
          onClick={expand}
          className="p-2 rounded-full text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
        >
          <RiFullscreenLine size={16} />
        </button>
        <div className="drag-region cursor-move text-emerald-500/30">
          <RiDragMove2Fill size={14} />
        </div>
      </div>
    </div>
  )
}

export default MiniOverlay
