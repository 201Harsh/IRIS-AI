import { useState, useEffect } from 'react'
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
  RiTerminalBoxLine
} from 'react-icons/ri'
import { GiPowerButton, GiTinker } from 'react-icons/gi'

const IRIS = () => {
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isSystemActive, setIsSystemActive] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const neonText = 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]'
  const glassPanel =
    'bg-emerald-950/10 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]'

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center overflow-hidden font-mono text-emerald-500 selection:bg-emerald-500/30 select-none">
      {/* --- SIDE CURVE HUD FRAME --- */}
      <div className="absolute inset-0 border-2 border-emerald-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[15vw] h-[15vw] max-w-48 max-h-48 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-4xl md:rounded-tl-[4rem] m-4 md:m-6" />
      <div className="absolute bottom-0 right-0 w-[15vw] h-[15vw] max-w-48 max-h-48 border-b-2 border-r-2 border-emerald-500/40 rounded-br-4xl md:rounded-br-[4rem] m-4 md:m-6" />
      <div className="absolute top-0 right-0 w-[8vw] h-[8vw] max-w-24 max-h-24 border-t-2 border-r-2 border-emerald-500/20 rounded-tr-3xl m-4 md:m-6 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[8vw] h-[8vw] max-w-24 max-h-24 border-b-2 border-l-2 border-emerald-500/20 rounded-bl-3xl m-4 md:m-6 opacity-50" />

      {/* --- TOP CENTER: THE IDENTITY --- */}
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
          <span className="animate-pulse underline decoration-emerald-500/50">SYSTEM_READY</span>
          <span className={neonText}>{time.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* --- SIDEBAR DATA WINGS (Hidden on small windows) --- */}
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
            <span className={neonText}>78.4%</span>
          </div>
          <div className="flex items-end gap-1 h-12 md:h-16">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500/30 hover:bg-emerald-400 transition-all duration-500"
                style={{ height: `${20 + Math.random() * 80}%` }}
              />
            ))}
          </div>
        </div>

        {/* Sync Pulse */}
        <div className={`p-4 ${glassPanel} flex items-center gap-4 rounded-xl`}>
          <RiPulseLine className="text-3xl animate-[bounce_1.5s_infinite] opacity-80" />
          <div>
            <div className="text-[8px] opacity-40 uppercase tracking-tighter">Sync_Pulse</div>
            <div className="text-xl font-black text-emerald-300">STABLE</div>
          </div>
        </div>

        {/* Console Log */}
        <div
          className={`flex-1 p-5 ${glassPanel} text-[9px] space-y-2 rounded-xl relative overflow-hidden bg-black/40`}
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/20 pb-2 mb-2">
            <RiTerminalBoxLine /> <span>SYSTEM_STDOUT</span>
          </div>
          <div className="opacity-60 space-y-1">
            <p className="animate-pulse">{'>'} _init_engine</p>
            <p className="text-emerald-300/80">{'>'} voice_api_mount</p>
            <p className="text-emerald-500">{'>'} handshake_ok</p>
          </div>
        </div>
      </div>

      <div className="absolute right-6 xl:right-12 flex-col gap-6 w-64 lg:w-80 h-[50%] justify-center hidden lg:flex items-end">
        {/* Radar */}
        <div
          className={`p-6 ${glassPanel} rounded-bl-[3rem] flex flex-col items-center w-full relative`}
        >
          <div className="absolute -top-3 -right-3 text-[8px] bg-emerald-500 text-black px-2 font-bold uppercase">
            Radar
          </div>
          <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40">
            <div className="absolute inset-0 border border-emerald-500/10 rounded-full animate-[ping_4s_infinite]" />
            <div className="absolute inset-4 border border-emerald-500/30 rounded-full" />
            <div className="absolute inset-0 border-t-2 border-emerald-400 rounded-full animate-[spin_3s_linear_infinite]" />
            <RiRadarLine
              size={40}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
            />
          </div>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { icon: <RiCpuLine />, label: 'KERNEL', val: 'V2.0' },
            { icon: <GiTinker />, label: 'TEMP', val: '41°C' }
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

      {/* --- CENTER: THE SOUL --- */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        <div className="w-[80vw] h-[80vw] sm:w-[60vh] sm:h-[60vh] max-w-full drop-shadow-[0_0_80px_rgba(16,185,129,0.25)]">
          <Sphere />
        </div>
      </div>

      {/* --- BOTTOM: THE CONTROL HUB --- */}
      <div className="absolute bottom-[4vh] w-full flex flex-col items-center z-50 px-4 md:px-6">
        {/* Responsive Spectrum */}
        <div className="flex items-end gap-px md:gap-1 h-12 mb-6 opacity-30 px-10 max-w-4xl w-full overflow-hidden">
          {[...Array(window.innerWidth < 768 ? 30 : 60)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-emerald-500 rounded-t-sm transition-all duration-300"
              style={{ height: `${10 + Math.random() * 90}%`, opacity: isMicMuted ? 0.1 : 0.8 }}
            />
          ))}
        </div>

        {/* Control Panel */}
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
              Mic_Link
            </span>
          </button>

          {/* Main Power */}
          <button
            onClick={() => setIsSystemActive(!isSystemActive)}
            className="cursor-pointer relative group px-2"
          >
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

          {/* Video */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`cursor-pointer group flex flex-col items-center transition-all ${isVideoOn ? neonText : 'text-zinc-700'}`}
          >
            <div className="p-2 md:p-4 rounded-xl group-hover:bg-emerald-500/10 border border-transparent group-hover:border-emerald-500/20">
              {isVideoOn ? (
                <RiVideoChatFill className="text-xl md:text-4xl" />
              ) : (
                <RiVideoChatLine className="text-xl md:text-4xl" />
              )}
            </div>
            <span className="hidden sm:block text-[9px] font-black mt-1 tracking-widest uppercase">
              Vision_Input
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default IRIS
