import { useState, useEffect, useRef } from 'react'
import Sphere from '@renderer/components/Sphere'
import {
  RiMicLine,
  RiMicOffLine,
  RiVideoChatLine,
  RiShutDownLine,
  RiVideoChatFill,
  RiCpuLine,
  RiRadarLine,
  RiRecordCircleLine,
  RiWifiLine,
  RiWifiOffLine,
  RiComputerLine,
  RiCameraLine,
  RiTerminalBoxLine,
  RiPulseLine,
  RiShieldFlashLine
} from 'react-icons/ri'
import { GiPowerButton, GiTinker } from 'react-icons/gi'
import { irisService } from '@renderer/services/Iris-voice-ai'
import { FaMemory } from 'react-icons/fa6'
import { getSystemStatus } from '@renderer/services/system-info'
import { HiComputerDesktop } from 'react-icons/hi2'
import { getScreenSourceId } from '@renderer/hooks/CaptureDesktop'

const IRIS = () => {
  const [isMicMuted, setIsMicMuted] = useState<boolean>(true)
  const [isVideoOn, setIsVideoOn] = useState<boolean>(false)
  const [isSystemActive, setIsSystemActive] = useState<boolean>(false)

  const [showSourceModal, setShowSourceModal] = useState<boolean>(false)
  const [visionMode, setVisionMode] = useState<'camera' | 'screen'>('camera')

  const [stats, setStats] = useState<any>(null)
  const [time, setTime] = useState<Date>(new Date())

  const videoRef = useRef<HTMLVideoElement>(null)
  const previewRef = useRef<HTMLVideoElement>(null)
  const activeStreamRef = useRef<MediaStream | null>(null)
  const aiIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // ... (Keep Clock, Mic Sync, ToggleSystem, TurnOffVision EXACTLY AS BEFORE) ...
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
      if (isSystemActive && !irisService.isConnected) {
        setIsSystemActive(false)
        setIsMicMuted(true)
        turnOffVision()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isSystemActive])

  useEffect(() => {
    irisService.setMute(isMicMuted)
  }, [isMicMuted])

  const toggleSystem = async () => {
    if (!isSystemActive) {
      try {
        await irisService.connect()
        setIsSystemActive(true)
        setIsMicMuted(false)
      } catch (err) {
        setIsSystemActive(false)
        turnOffVision()
      }
    } else {
      irisService.disconnect()
      setIsSystemActive(false)
      setIsMicMuted(true)
      turnOffVision()
    }
  }

  const turnOffVision = () => {
    setIsVideoOn(false)
    setShowSourceModal(false)
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop())
      activeStreamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    if (aiIntervalRef.current) {
      clearInterval(aiIntervalRef.current)
      aiIntervalRef.current = null
    }
  }

  // ----------------------------------------------------------------
  // 🛠️ THE FIX: ROBUST STREAM GETTER
  // ----------------------------------------------------------------
  const getStream = async (mode: 'camera' | 'screen') => {
    // Stop existing
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop())
    }

    try {
      let stream: MediaStream

      if (mode === 'camera') {
        // Standard Webcam
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        })
      } else {
        // 🚀 ELECTRON SCREEN SHARE FIX
        // 1. Get the Source ID from Main Process
        const sourceId = await getScreenSourceId()

        if (!sourceId) {
          console.error('No Screen Source Found')
          return null
        }

        // 2. Use getUserMedia with Electron-specific constraints
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            // @ts-ignore: Mandatory is an Electron property
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              minWidth: 1280,
              maxWidth: 1920,
              minHeight: 720,
              maxHeight: 1080
            }
          }
        })
      }
      return stream
    } catch (err) {
      console.error('Stream Error:', err)
      return null
    }
  }
  // ----------------------------------------------------------------

  // ... (Keep Button Handler, useEffect for Modal, confirmSource, startAIProcessing) ...
  const handleVisionBtnClick = () => {
    if (isVideoOn) {
      turnOffVision()
    } else {
      setVisionMode('camera')
      setShowSourceModal(true)
    }
  }

  useEffect(() => {
    if (showSourceModal) {
      ;(async () => {
        const stream = await getStream(visionMode)
        if (stream) {
          activeStreamRef.current = stream
          if (previewRef.current) {
            previewRef.current.srcObject = stream
            try {
              await previewRef.current.play()
            } catch (e) {}
          }
          stream.getVideoTracks()[0].onended = () => turnOffVision()
        }
      })()
    }
  }, [showSourceModal, visionMode])

  const confirmSource = async () => {
    if (activeStreamRef.current) {
      if (videoRef.current) {
        videoRef.current.srcObject = activeStreamRef.current
        try {
          await videoRef.current.play()
        } catch (e) {}
      }
      startAIProcessing()
      setIsVideoOn(true)
      setShowSourceModal(false)
    }
  }

  const startAIProcessing = () => {
    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current)
    aiIntervalRef.current = setInterval(() => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        irisService.socket?.readyState === WebSocket.OPEN
      ) {
        const canvas = document.createElement('canvas')
        canvas.width = visionMode === 'screen' ? 800 : 480
        canvas.height = visionMode === 'screen' ? 450 : 360
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
          const quality = visionMode === 'screen' ? 0.6 : 0.5
          const base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1]
          irisService.sendVideoFrame(base64)
        }
      }
    }, 1000)
  }

  // ... (Keep Stats & UI) ...
  useEffect(() => {
    getSystemStatus().then(setStats)
    const interval = setInterval(() => getSystemStatus().then(setStats), 5000)
    return () => clearInterval(interval)
  }, [])

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
      {/* MODAL */}
      {showSourceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`${glassPanel} w-[600px] p-6 rounded-3xl border border-emerald-500/40 flex flex-col gap-6 shadow-[0_0_100px_rgba(16,185,129,0.2)]`}
          >
            <h2 className={`text-3xl font-black italic tracking-tighter text-center ${neonText}`}>
              VISION LINK
            </h2>

            <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-emerald-500/10">
              <button
                onClick={() => setVisionMode('camera')}
                className={`flex-1 py-4 rounded-lg flex items-center justify-center gap-3 transition-all ${visionMode === 'camera' ? 'bg-emerald-500 text-black font-black' : 'hover:bg-white/5 text-zinc-500'}`}
              >
                <RiCameraLine size={24} /> WEBCAM
              </button>
              <button
                onClick={() => setVisionMode('screen')}
                className={`flex-1 py-4 rounded-lg flex items-center justify-center gap-3 transition-all ${visionMode === 'screen' ? 'bg-emerald-500 text-black font-black' : 'hover:bg-white/5 text-zinc-500'}`}
              >
                <RiComputerLine size={24} /> SCREEN
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-emerald-500/20 relative group">
              <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-contain ${visionMode === 'camera' ? '-scale-x-100' : ''}`}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={turnOffVision}
                className="flex-1 py-4 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold tracking-widest text-sm"
              >
                ABORT
              </button>
              <button
                onClick={confirmSource}
                className="flex-[2] py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black tracking-widest text-sm shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                ESTABLISH UPLINK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 border-2 border-emerald-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[15vw] h-[15vw] max-w-48 max-h-48 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-4xl md:rounded-tl-[4rem] m-4 md:m-6" />
      <div className="absolute bottom-0 right-0 w-[15vw] h-[15vw] max-w-48 max-h-48 border-b-2 border-r-2 border-emerald-500/40 rounded-br-4xl md:rounded-br-[4rem] m-4 md:m-6" />
      <div className="absolute top-0 right-0 w-[8vw] h-[8vw] max-w-24 max-h-24 border-t-2 border-r-2 border-emerald-500/20 rounded-tr-3xl m-4 md:m-6 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[8vw] h-[8vw] max-w-24 max-h-24 border-b-2 border-l-2 border-emerald-500/20 rounded-bl-3xl m-4 md:m-6 opacity-50" />

      {/* --- HEADER --- */}
      <div className="absolute top-[5vh] flex flex-col items-center z-50 pointer-events-none w-full">
        <div className="flex items-center gap-4 mb-2">
          <div className="hidden sm:block w-16 h-px bg-linear-to-r from-transparent via-emerald-500 to-emerald-500" />
          <RiShieldFlashLine className={`text-xl md:text-2xl ${neonText} animate-pulse`} />
          <div className="hidden sm:block w-16 h-px bg-linear-to-l from-transparent via-emerald-500 to-emerald-500" />
        </div>
        <h1
          className={`text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-none ${neonText}`}
        >
          IRIS
        </h1>
        <div className="flex gap-4 md:gap-8 mt-4 text-[9px] md:text-[11px] tracking-[0.4em] md:tracking-[0.6em] font-bold opacity-80 bg-emerald-950/30 px-4 py-1 rounded-full border border-emerald-500/20">
          <span
            className={`animate-pulse underline decoration-emerald-500/50 ${isSystemActive ? 'text-emerald-400' : 'text-red-500'}`}
          >
            {isSystemActive ? 'SYSTEM_ONLINE' : 'OFFLINE'}
          </span>
          <span className={neonText}>{time.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* --- LEFT PANEL --- */}
      <div className="absolute left-6 xl:left-12 flex-col gap-6 w-64 lg:w-80 h-[50%] justify-center hidden lg:flex">
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
        <div className={`p-4 ${glassPanel} flex items-center gap-4 rounded-xl`}>
          <RiPulseLine
            className={`text-3xl ${isSystemActive ? 'animate-bounce text-emerald-400' : 'text-zinc-700'}`}
          />
          <div>
            <div className="text-[8px] opacity-40 uppercase tracking-tighter">Sync_Pulse</div>
            <div
              className={`text-xl font-black ${isSystemActive ? 'text-emerald-300' : 'text-zinc-600'}`}
            >
              {isSystemActive ? 'STABLE' : 'NULL'}
            </div>
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

      {/* --- RIGHT PANEL --- */}
      <div className="absolute right-6 xl:right-12 flex-col gap-6 w-64 lg:w-80 h-[60%] justify-center hidden lg:flex items-end z-50">
        <div
          className={`p-6 ${glassPanel} rounded-bl-[3rem] flex flex-col items-center w-full relative`}
        >
          <div className="absolute -top-3 -right-3 text-[8px] bg-emerald-500 text-black px-2 font-bold uppercase">
            Radar
          </div>
          <div className="absolute top-4 left-4 flex flex-col items-center">
            {isSystemActive ? (
              <RiWifiLine className="text-emerald-400 animate-pulse" size={24} />
            ) : (
              <RiWifiOffLine className="text-red-500 opacity-50" size={24} />
            )}
          </div>
          <div className="relative w-32 h-32">
            <div
              className={`absolute inset-0 border border-emerald-500/10 rounded-full ${isSystemActive ? 'animate-[ping_4s_infinite]' : ''}`}
            />
            <div
              className={`absolute inset-0 border-t-2 border-emerald-400 rounded-full ${isSystemActive ? 'animate-[spin_3s_linear_infinite]' : ''}`}
            />
            <RiRadarLine
              size={40}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
            />
          </div>
        </div>

        {/* MAIN VIDEO */}
        <div
          className={`w-full h-full aspect-video ${glassPanel} rounded-2xl p-1 relative overflow-hidden transition-all duration-500 ${isVideoOn ? 'opacity-100 border-emerald-400/50' : 'opacity-40 grayscale'}`}
        >
          <div className="absolute inset-0 z-20 bg-[linear-gradient(rgba(0,255,127,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,127,0.03)_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />
          <div
            className={`absolute top-2 left-2 z-30 flex items-center gap-2 px-2 py-1 rounded-md backdrop-blur-2xl ${isVideoOn ? 'bg-red-500 border border-red-500/50' : 'bg-zinc-800'}`}
          >
            <RiRecordCircleLine
              className={`${isVideoOn ? 'text-red-50 animate-pulse' : 'text-zinc-500'}`}
              size={10}
            />
            <span
              className={`text-[8px] font-bold tracking-widest ${isVideoOn ? 'text-red-50' : 'text-zinc-500'}`}
            >
              {isVideoOn ? (visionMode === 'screen' ? 'SCREEN' : 'LIVE') : 'OFF'}
            </span>
          </div>
          <video
            ref={videoRef}
            className={`w-full h-full object-cover rounded-xl bg-black ${visionMode === 'camera' ? '-scale-x-100' : ''}`}
            autoPlay
            playsInline
            muted
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
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

      {/* --- CENTER --- */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        <div
          className={`w-[80vw] h-[80vw] sm:w-[60vh] sm:h-[60vh] max-w-full transition-all duration-1000 ${isSystemActive ? 'drop-shadow-[0_0_80px_rgba(16,185,129,0.25)] opacity-100' : 'opacity-65 grayscale-50'}`}
        >
          <Sphere />
        </div>
      </div>

      {/* --- BOTTOM --- */}
      <div className="absolute bottom-[4vh] w-full flex flex-col items-center z-50 px-4 md:px-6">
        <div className="flex items-end gap-px md:gap-1 h-12 mb-6 opacity-30 px-10 max-w-4xl w-full overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-300 ${isSystemActive ? 'bg-emerald-500' : 'bg-zinc-800'}`}
              style={{ height: `${isSystemActive ? 10 + Math.random() * 90 : 5}%` }}
            />
          ))}
        </div>
        <div
          className={`flex items-center justify-around w-full max-w-[95vw] md:max-w-4xl h-20 md:h-28 ${glassPanel} rounded-2xl md:rounded-4xl px-4 md:px-16 relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent animate-[scan_5s_linear_infinite] opacity-30" />

          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
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
