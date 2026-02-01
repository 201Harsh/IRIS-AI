import { useState } from 'react'
import Sphere from '@renderer/components/Sphere'
import {
  RiMicLine,
  RiMicOffLine,
  RiVideoChatLine,
  RiShutDownLine,
  RiVideoChatFill
} from 'react-icons/ri'
import { GiPowerButton } from 'react-icons/gi'

const IRIS = () => {
  // UI States
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isSystemActive, setIsSystemActive] = useState(true)

  // Styling Constants for Neon Emerald
  const neonText = 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]'
  const glassPanel = 'bg-emerald-950/20 backdrop-blur-md border border-emerald-500/30 rounded-2xl'

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Header - Fixed Top */}
      <div className="absolute top-14 z-10">
        <h1 className={`text-7xl font-bold tracking-tighter ${neonText}`}>IRIS AI</h1>
        <div className="w-full h-px bg-linear-to-r from-transparent via-emerald-500 to-transparent mt-2 opacity-50" />
      </div>

      {/* The Particle Sphere */}
      <div className="w-full h-full flex items-center justify-center">
        <Sphere />
      </div>

      {/* Control HUD - Bottom */}
      <div
        className={`absolute bottom-14 w-11/12 max-w-2xl h-32 flex items-center justify-around px-8 ${glassPanel} shadow-[0_0_30px_rgba(6,78,59,0.5)]`}
      >
        {/* Mic Toggle */}
        <button
          onClick={() => setIsMicMuted(!isMicMuted)}
          className={`p-4 rounded-full transition-all duration-300 ${isMicMuted ? 'text-red-500 border-red-500/50' : neonText + ' border-emerald-500/50'} border hover:scale-110`}
        >
          {isMicMuted ? <RiMicOffLine size={32} /> : <RiMicLine size={32} />}
        </button>

        {/* System Start/End Toggle */}
        <button
          onClick={() => setIsSystemActive(!isSystemActive)}
          className={`p-6 rounded-full transition-all duration-500 shadow-inner ${isSystemActive ? 'bg-emerald-500/20 ' + neonText : 'bg-zinc-800 text-zinc-500'} border-2 border-emerald-500/50`}
        >
          {isSystemActive ? <GiPowerButton size={48} /> : <RiShutDownLine size={48} />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`p-4 rounded-full transition-all duration-300 ${!isVideoOn ? 'text-zinc-500 border-zinc-500/30' : neonText + ' border-emerald-500/50'} border hover:scale-110`}
        >
          {isVideoOn ? <RiVideoChatLine size={32} /> : <RiVideoChatFill size={32} />}
        </button>
      </div>
    </div>
  )
}

export default IRIS
