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
  RiPulseLine,
  RiShieldFlashLine,
  RiTerminalBoxLine,
  RiRecordCircleLine,
  RiWifiLine,
  RiWifiOffLine
} from 'react-icons/ri'
import { GiPowerButton, GiTinker } from 'react-icons/gi'
import { irisService } from '@renderer/services/Iris-voice-ai'

const IRIS = () => {
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false)
  const [isVideoOn, setIsVideoOn] = useState<boolean>(false)
  const [isSystemActive, setIsSystemActive] = useState<boolean>(false)
  const [time, setTime] = useState<Date>(new Date())

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 🔇 REAL-TIME MUTE HOOK
  useEffect(() => {
    irisService.setMute(isMicMuted)
  }, [isMicMuted])

  // --- 🔌 CONNECT / DISCONNECT LOGIC ---
  const toggleSystem = async () => {
    if (!isSystemActive) {
      try {
        await irisService.connect()
        setIsSystemActive(true)
      } catch (err) {
        console.error('Connection Failed:', err)
      }
    } else {
      irisService.disconnect()
      setIsSystemActive(false)

      // Kill Video Stream
      setIsVideoOn(false)
      if (videoRef.current && videoRef.current.srcObject) {
        ;(videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop())
        videoRef.current.srcObject = null
      }
    }
  }

  // --- 📹 VIDEO STREAM LOGIC ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }

        // Send Frame every 500ms
        intervalId = setInterval(() => {
          if (videoRef.current && irisService.socket?.readyState === WebSocket.OPEN) {
            const canvas = document.createElement('canvas')
            canvas.width = 480
            canvas.height = 360
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
              const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1]
              irisService.sendVideoFrame(base64)
            }
          }
        }, 500)
      } catch (err) {
        setIsVideoOn(false)
      }
    }

    if (isVideoOn && isSystemActive) startVideo()
    else if (videoRef.current?.srcObject) {
      ;(videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    return () => clearInterval(intervalId)
  }, [isVideoOn, isSystemActive])

  const neonText = 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]'
  const glassPanel =
    'bg-emerald-950/10 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]'

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center overflow-hidden font-mono text-emerald-500 selection:bg-emerald-500/30 select-none">
      {/* --- CORNER BORDERS (Restored) --- */}
      <div className="absolute inset-0 border-2 border-emerald-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[15vw] h-[15vw] max-w-48 max-h-48 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-4xl md:rounded-tl-[4rem] m-4 md:m-6" />
      <div className="absolute bottom-0 right-0 w-[15vw] h-[15vw] max-w-48 max-h-48 border-b-2 border-r-2 border-emerald-500/40 rounded-br-4xl md:rounded-br-[4rem] m-4 md:m-6" />
      <div className="absolute top-0 right-0 w-[8vw] h-[8vw] max-w-24 max-h-24 border-t-2 border-r-2 border-emerald-500/20 rounded-tr-3xl m-4 md:m-6 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[8vw] h-[8vw] max-w-24 max-h-24 border-b-2 border-l-2 border-emerald-500/20 rounded-bl-3xl m-4 md:m-6 opacity-50" />

      {/* --- TOP CENTER IDENTITY --- */}
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

      {/* --- LEFT SIDEBAR (Restored) --- */}
      <div className="absolute left-6 xl:left-12 flex-col gap-6 w-64 lg:w-80 h-[50%] justify-center hidden lg:flex">
        {/* Biometrics */}
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

        {/* Sync Pulse */}
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

        {/* Console */}
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

      {/* --- RIGHT SIDEBAR (Restored + Video) --- */}
      <div className="absolute right-6 xl:right-12 flex-col gap-6 w-64 lg:w-80 h-[60%] justify-center hidden lg:flex items-end z-50">
        {/* Radar & Connect Status */}
        <div
          className={`p-6 ${glassPanel} rounded-bl-[3rem] flex flex-col items-center w-full relative`}
        >
          <div className="absolute -top-3 -right-3 text-[8px] bg-emerald-500 text-black px-2 font-bold uppercase">
            Radar
          </div>

          {/* 📡 NEW: CONNECTED ICON */}
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

        {/* 📹 LIVE VIDEO PREVIEW (Visible) */}
        <div
          className={`w-full aspect-video ${glassPanel} rounded-2xl p-1 relative overflow-hidden transition-all duration-500 ${isVideoOn ? 'opacity-100 border-emerald-400/50' : 'opacity-40 grayscale'}`}
        >
          <div className="absolute inset-0 z-20 bg-[linear-gradient(rgba(0,255,127,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,127,0.03)_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />

          <div
            className={`absolute top-2 left-2 z-30 flex items-center gap-2 px-2 py-1 rounded-md ${isVideoOn ? 'bg-red-500/20 border border-red-500/50' : 'bg-zinc-800'}`}
          >
            <RiRecordCircleLine
              className={`${isVideoOn ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}
              size={10}
            />
            <span
              className={`text-[8px] font-bold tracking-widest ${isVideoOn ? 'text-red-400' : 'text-zinc-500'}`}
            >
              {isVideoOn ? 'LIVE' : 'OFF'}
            </span>
          </div>

          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-xl bg-black"
            autoPlay
            playsInline
            muted
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { icon: <RiCpuLine />, label: 'CPU', val: isSystemActive ? '12%' : '--' },
            { icon: <GiTinker />, label: 'TEMP', val: isSystemActive ? '41°C' : '--' }
          ].map((m, i) => (
            <div
              key={i}
              className={`${glassPanel} p-3 flex flex-col items-center justify-center rounded-2xl`}
            >
              <span className="text-xl mb-1">{m.icon}</span>
              <span className="text-[8px] opacity-40 uppercase tracking-tighter">{m.label}</span>
              <span className="text-xs font-bold mt-1 tracking-widest">{m.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- CENTER: SPHERE --- */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        <div
          className={`w-[80vw] h-[80vw] sm:w-[60vh] sm:h-[60vh] max-w-full transition-all duration-1000 ${isSystemActive ? 'drop-shadow-[0_0_80px_rgba(16,185,129,0.25)] opacity-100' : 'opacity-30 grayscale'}`}
        >
          <Sphere />
        </div>
      </div>

      {/* --- BOTTOM CONTROLS --- */}
      <div className="absolute bottom-[4vh] w-full flex flex-col items-center z-50 px-4 md:px-6">
        {/* Audio Spectrum */}
        <div className="flex items-end gap-px md:gap-1 h-12 mb-6 opacity-30 px-10 max-w-4xl w-full overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-300 ${isSystemActive ? 'bg-emerald-500' : 'bg-zinc-800'}`}
              style={{ height: `${isSystemActive ? 10 + Math.random() * 90 : 5}%` }}
            />
          ))}
        </div>

        {/* Control Buttons */}
        <div
          className={`flex items-center justify-around w-full max-w-[95vw] md:max-w-4xl h-20 md:h-28 ${glassPanel} rounded-2xl md:rounded-4xl px-4 md:px-16 relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-400 to-transparent animate-[scan_5s_linear_infinite] opacity-30" />

          {/* Mic */}
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

          {/* Power */}
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

          {/* Vision */}
          <button
            onClick={() => isSystemActive && setIsVideoOn(!isVideoOn)}
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
