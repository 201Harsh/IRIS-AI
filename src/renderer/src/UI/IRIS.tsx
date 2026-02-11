import { useState, useEffect, useRef } from 'react'
import Sphere from '@renderer/components/Sphere'
import {
  RiMicLine,
  RiMicOffLine,
  RiVideoChatLine,
  RiVideoChatFill,
  RiCpuLine,
  RiRadarLine,
  RiRecordCircleLine,
  RiWifiLine,
  RiComputerLine,
  RiCameraLine,
  RiTerminalBoxLine,
  RiShieldFlashLine,
  RiSwapBoxLine,
  RiShutDownLine
} from 'react-icons/ri'
import { GiPowerButton, GiTinker } from 'react-icons/gi'
import { FaMemory } from 'react-icons/fa6'
import { getSystemStatus } from '@renderer/services/system-info'
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

const IRIS = ({
  isSystemActive,
  toggleSystem,
  isMicMuted,
  toggleMic,
  isVideoOn,
  visionMode,
  startVision,
  stopVision,
  activeStream
}: IrisProps) => {
  const [showSourceModal, setShowSourceModal] = useState<boolean>(false)
  const [stats, setStats] = useState<any>(null)
  const [time, setTime] = useState<Date>(new Date())

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && activeStream && isVideoOn) {
      videoRef.current.srcObject = activeStream
      videoRef.current.play().catch((e) => console.log('Playback error', e))
    }
  }, [activeStream, isVideoOn])

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
      getSystemStatus().then(setStats)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleVisionBtnClick = () => {
    if (isVideoOn) {
      stopVision()
    } else {
      setShowSourceModal(true)
    }
  }

  const systemMetrics = [
    { icon: <RiCpuLine />, label: 'CPU', val: isSystemActive && stats ? `${stats.cpu}%` : '--' },
    {
      icon: <FaMemory />,
      label: 'RAM',
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

  const neonText = 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]'
  const glassPanel =
    'bg-emerald-950/10 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]'

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center overflow-hidden font-mono text-emerald-500 selection:bg-emerald-500/30 select-none relative">
      {showSourceModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`${glassPanel} w-[90vw] max-w-lg p-6 rounded-3xl border border-emerald-500/40 flex flex-col gap-6 shadow-[0_0_100px_rgba(16,185,129,0.2)]`}
          >
            <h2 className={`text-3xl font-black italic tracking-tighter text-center ${neonText}`}>
              VISION LINK
            </h2>
            <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-emerald-500/10">
              <button
                onClick={() => {
                  startVision('camera')
                  setShowSourceModal(false)
                }}
                className="flex-1 py-4 rounded-lg flex items-center justify-center gap-3 bg-zinc-900 hover:bg-emerald-500 hover:text-black transition-all"
              >
                <RiCameraLine size={24} /> WEBCAM
              </button>
              <button
                onClick={() => {
                  startVision('screen')
                  setShowSourceModal(false)
                }}
                className="flex-1 py-4 rounded-lg flex items-center justify-center gap-3 bg-zinc-900 hover:bg-emerald-500 hover:text-black transition-all"
              >
                <RiComputerLine size={24} /> SCREEN
              </button>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSourceModal(false)}
                className="flex-1 py-4 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold tracking-widest text-sm"
              >
                ABORT
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-6 left-6 md:top-12 md:left-14 xl:top-[5vh] xl:left-0 xl:w-full flex flex-col items-start xl:items-center z-50 pointer-events-none transition-all duration-700">
        <div className="flex items-center gap-3 mb-1">
          <RiShieldFlashLine
            className={`text-4xl md:text-5xl xl:text-4xl ${neonText} animate-pulse`}
          />
          <h1
            className={`text-5xl md:text-6xl xl:text-9xl font-black italic tracking-tighter leading-none ${neonText}`}
          >
            IRIS
          </h1>
        </div>
        <div className="flex gap-4 mt-2 xl:mt-4 text-[10px] md:text-[11px] tracking-[0.2em] xl:tracking-[0.6em] font-bold opacity-80 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/20">
          <span
            className={`animate-pulse underline decoration-emerald-500/50 ${isSystemActive ? 'text-emerald-400' : 'text-red-500'}`}
          >
            {isSystemActive ? 'SYSTEM_ONLINE' : 'OFFLINE'}
          </span>
          <span className={neonText}>{time.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 xl:hidden z-40">
        {systemMetrics.map((m, i) => (
          <div
            key={i}
            className={`${glassPanel} w-14 h-14 p-1 flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 backdrop-blur-md`}
          >
            <span className="text-lg mb-0.5 text-emerald-400">{m.icon}</span>
            <span className="text-[7px] opacity-60 font-bold tracking-tighter">{m.label}</span>
            <span className="text-[9px] font-bold text-emerald-100">{m.val}</span>
          </div>
        ))}
      </div>

      <div className="absolute left-12 flex-col gap-6 w-80 h-[50%] justify-center hidden xl:flex z-40 pointer-events-none">
        <div
          className={`p-5 ${glassPanel} rounded-br-[3rem] border-l-4 border-l-emerald-500 relative`}
        >
          <div className="absolute -top-3 -left-3 text-[8px] bg-emerald-500 text-black px-2 font-bold uppercase">
            Biometrics
          </div>
          <div className="flex justify-between text-[10px] mb-4 opacity-70">
            <span>NEURAL_LOAD</span>
            <span className={neonText}>{isSystemActive ? '42.8%' : '0.0%'}</span>
          </div>
          <div className="flex items-end gap-1 h-12 md:h-16">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 transition-all duration-500 ${isSystemActive ? 'bg-emerald-500/30' : 'bg-zinc-900'}`}
                style={{ height: isSystemActive ? `${20 + Math.random() * 80}%` : '5%' }}
              />
            ))}
          </div>
        </div>
        <div
          className={`flex-1 p-5 ${glassPanel} text-[9px] space-y-2 rounded-xl relative overflow-hidden bg-black/40`}
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/20 pb-2 mb-2">
            <RiTerminalBoxLine /> <span>SYSTEM_STDOUT</span>
          </div>
          <div className="opacity-60 space-y-1 font-mono">
            <p>{'>'} kernel_loader v2.1</p>
            <p>
              {'>'} {isSystemActive ? 'connecting_neural_net...' : 'waiting_for_power...'}
            </p>
            <p className={isSystemActive ? 'text-emerald-400' : ''}>
              {'>'} {isSystemActive ? 'HANDSHAKE_COMPLETE' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-4 xl:right-12 xl:top-auto xl:h-[60%] xl:w-96 flex flex-col gap-4 justify-start xl:justify-center items-end z-50">
        <div
          className={`p-6 ${glassPanel} rounded-bl-[3rem] flex-col items-center w-full relative hidden xl:flex`}
        >
          <div className="absolute -top-3 -right-3 text-[8px] bg-emerald-500 text-black px-2 font-bold uppercase">
            Radar
          </div>
          <RiWifiLine className="absolute top-4 left-4 text-emerald-400 animate-pulse" size={24} />
          <div className="relative w-32 h-32">
            <div
              className={`absolute inset-0 border border-emerald-500/10 rounded-full ${isSystemActive ? 'animate-[ping_4s_infinite]' : ''}`}
            />
            <RiRadarLine
              size={40}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
            />
          </div>
        </div>

        <div
          className={`w-40 md:w-60 xl:w-full aspect-video ${glassPanel} rounded-xl xl:rounded-2xl p-1 relative overflow-hidden transition-all duration-500 ${isVideoOn ? 'opacity-100 border-emerald-400/50' : 'opacity-50 grayscale'}`}
        >
          <div className="absolute inset-0 z-20 pointer-events-none" />
          <div
            className={`absolute top-2 left-2 z-30 flex items-center gap-2 px-2 py-1 rounded-md backdrop-blur-2xl ${isVideoOn ? 'bg-red-500 border border-red-500/50' : 'bg-zinc-800'}`}
          >
            <RiRecordCircleLine
              className={`${isVideoOn ? 'text-red-50 animate-pulse' : 'text-zinc-500'}`}
              size={8}
            />
            <span
              className={`text-[8px] font-bold tracking-widest ${isVideoOn ? 'text-red-50' : 'text-zinc-500'}`}
            >
              {isVideoOn ? (visionMode === 'screen' ? 'SCR' : 'LIVE') : 'OFF'}
            </span>
          </div>

          {isVideoOn && (
            <button
              onClick={() => startVision(visionMode === 'camera' ? 'screen' : 'camera')}
              className="absolute bottom-2 right-2 z-30 p-1.5 rounded-lg bg-black/60 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black transition-all"
            >
              <RiSwapBoxLine size={14} />
            </button>
          )}

          <video
            ref={videoRef}
            className={`w-full h-full object-cover rounded-lg xl:rounded-xl bg-black ${visionMode === 'camera' ? '-scale-x-100' : ''}`}
            autoPlay
            playsInline
            muted
          />
        </div>

        <div className="hidden grid-cols-2 gap-3 w-full xl:grid">
          {systemMetrics.map((m, i) => (
            <div
              key={i}
              className={`${glassPanel} p-3 flex flex-col items-center justify-center rounded-2xl`}
            >
              <span className="text-xl mb-1">{m.icon}</span>
              <span className="text-[12px] opacity-80 uppercase tracking-tighter font-bold">
                {m.label}
              </span>
              <span className="text-xs font-semibold mt-1 tracking-widest">{m.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER SPHERE */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        <div
          className={`w-[80vw] h-[80vw] sm:w-[75vh] sm:h-[75vh] max-w-full transition-all duration-1000 ${isSystemActive ? 'drop-shadow-[0_0_80px_rgba(16,185,129,0.25)] opacity-100' : 'opacity-85 grayscale-65'}`}
        >
          <Sphere />
        </div>
      </div>

      <div className="absolute bottom-[4vh] w-full flex flex-col items-center z-50 px-4 md:px-6 pb-4">
        <div
          className={`flex items-center justify-around w-full max-w-[95vw] md:max-w-4xl h-20 md:h-28 ${glassPanel} rounded-2xl md:rounded-4xl px-4 md:px-16 relative overflow-hidden transition-transform duration-500 scale-75 origin-bottom xl:scale-100`}
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent animate-[scan_5s_linear_infinite] opacity-30" />

          <button
            onClick={toggleMic}
            className={`cursor-pointer group flex flex-col items-center transition-all ${isMicMuted ? 'text-red-500' : neonText}`}
          >
            <div className="p-2 md:p-4 rounded-xl group-hover:bg-emerald-500/10 border border-transparent group-hover:border-emerald-500/20">
              {isMicMuted ? (
                <RiMicOffLine className="text-xl md:text-4xl" />
              ) : (
                <RiMicLine className="text-xl md:text-4xl" />
              )}
            </div>
            <span className="hidden sm:block text-[9px] font-black mt-1 tracking-widest uppercase">
              Mic
            </span>
          </button>

          <button onClick={toggleSystem} className="cursor-pointer relative group px-2">
            <div
              className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${isSystemActive ? 'bg-emerald-400/40 scale-150 animate-pulse' : 'bg-red-950 scale-100'}`}
            />
            <div
              className={`relative p-3 md:p-4 rounded-full border-2 md:border-[3px] transition-all duration-700 ${isSystemActive ? 'bg-emerald-950/90 border-emerald-400 rotate-180' : 'bg-zinc-900 border-zinc-700'}`}
            >
              {isSystemActive ? (
                <GiPowerButton className={`text-2xl md:text-5xl ${neonText}`} />
              ) : (
                <RiShutDownLine className="text-2xl md:text-5xl text-zinc-600" />
              )}
            </div>
          </button>

          <button
            onClick={handleVisionBtnClick}
            className={`cursor-pointer group flex flex-col items-center transition-all ${!isSystemActive ? 'opacity-50 cursor-not-allowed' : ''} ${isVideoOn ? neonText : 'text-zinc-700'}`}
          >
            <div className="p-2 md:p-4 rounded-xl group-hover:bg-emerald-500/10 border border-transparent group-hover:border-emerald-500/20">
              {isVideoOn ? (
                <RiVideoChatFill className="text-xl md:text-4xl" />
              ) : (
                <RiVideoChatLine className="text-xl md:text-4xl" />
              )}
            </div>
            <span className="hidden sm:block text-[9px] font-black mt-1 tracking-widest uppercase">
              Vision
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default IRIS
