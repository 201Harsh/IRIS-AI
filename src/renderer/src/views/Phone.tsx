import { useState, useEffect } from 'react'
import { FaAndroid } from 'react-icons/fa6'
import {
  RiLinkM,
  RiWifiLine,
  RiSmartphoneLine,
  RiInformationLine,
  RiSignalWifi3Line,
  RiBattery2ChargeLine,
  RiDatabase2Line,
  RiShutDownLine,
  RiRobot2Line,
  RiSendPlane2Line,
  RiMicLine
} from 'react-icons/ri'
import { motion } from 'framer-motion'

const PhoneView = ({ glassPanel }: { glassPanel?: string }) => {
  const [ip, setIp] = useState('')
  const [port, setPort] = useState('5555')
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const [screenImage, setScreenImage] = useState<string | null>(null)

  const [telemetry, setTelemetry] = useState({
    model: 'UNKNOWN DEVICE',
    os: 'ANDROID --',
    battery: { level: 0, isCharging: false, temp: '0.0' },
    storage: { used: '0 GB', total: '0 GB TOTAL', percent: 0 }
  })

  const handleConnect = async () => {
    if (!ip || !port) return setErrorMsg('IP and Port are required.')
    setStatus('connecting')
    setErrorMsg('')

    try {
      const res = await window.electron.ipcRenderer.invoke('adb-connect', { ip, port })
      if (res.success) {
        setStatus('connected')
        fetchTelemetry()
        fetchScreen() 
      } else {
        setStatus('idle')
        setErrorMsg('Connection failed. Verify IP and Wireless Debugging.')
      }
    } catch (e) {
      setStatus('idle')
      setErrorMsg('Electron IPC missing. Are you running in browser?')
    }
  }

  const handleDisconnect = async () => {
    try {
      await window.electron.ipcRenderer.invoke('adb-disconnect', { ip, port })
    } catch (e) {}
    setStatus('idle')
    setScreenImage(null) 
  }

  const fetchTelemetry = async () => {
    try {
      const res = await window.electron.ipcRenderer.invoke('adb-telemetry', { ip, port })
      if (res.success) setTelemetry(res.data)
    } catch (e) {}
  }

  const fetchScreen = async () => {
    try {
      const res = await window.electron.ipcRenderer.invoke('adb-screenshot')
      if (res.success && res.image) {
        setScreenImage(res.image)
      }
    } catch (e) {}
  }

  useEffect(() => {
    let interval: any
    if (status === 'connected') {
      interval = setInterval(() => {
        fetchTelemetry()
        fetchScreen()
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [status])


  if (status !== 'connected') {
    return (
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 p-6 animate-in fade-in zoom-in duration-300 bg-black min-h-screen text-emerald-50">
        <div className="w-full lg:w-1/3 max-w-sm flex flex-col gap-4">
          <div className="p-6 bg-black border border-emerald-900/40 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-400/30">
              <FaAndroid className="text-emerald-400 text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Connect Device</h2>
              <p className="text-[10px] text-emerald-400/70 font-mono">WIRELESS ADB</p>
            </div>
          </div>

          <div
            className={`${glassPanel || 'bg-zinc-950'} p-6 border border-emerald-900/40 rounded-2xl shadow-lg flex flex-col gap-6`}
          >
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-mono">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-emerald-400/80 tracking-wide mb-2 block">
                IP Address
              </label>
              <div className="flex items-center bg-black border border-emerald-900/50 rounded-lg px-4 py-3 focus-within:border-emerald-400 transition-all">
                <RiWifiLine className="text-emerald-400 mr-3" size={18} />
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="192.168.1.xxx"
                  className="bg-transparent border-none outline-none text-sm text-emerald-400 w-full font-mono placeholder:text-emerald-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-400/80 tracking-wide mb-2 block">
                Port
              </label>
              <div className="flex items-center bg-black border border-emerald-900/50 rounded-lg px-4 py-3 focus-within:border-emerald-400 transition-all">
                <RiLinkM className="text-emerald-400 mr-3" size={18} />
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="5555"
                  className="bg-transparent border-none outline-none text-sm text-emerald-400 w-full font-mono placeholder:text-emerald-900"
                />
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={status === 'connecting'}
              className="w-full py-3 bg-emerald-950 border border-emerald-400/50 hover:bg-emerald-400 text-emerald-400 hover:text-black font-bold rounded-lg tracking-wide transition-all duration-300"
            >
              {status === 'connecting' ? 'INITIALIZING LINK...' : 'CONNECT SECURELY'}
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex justify-center py-4">
          <div className="w-full max-w-75 h-150 bg-zinc-950 rounded-[3rem] border-10 border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-800 rounded-b-xl z-20"></div>

            <div className="flex-1 bg-linear-to-b from-emerald-950/30 to-black p-6 flex flex-col">
              <div className="flex justify-between items-center text-[10px] text-emerald-500 font-medium mt-2">
                <span>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex gap-1">
                  <RiWifiLine size={12} />
                  <div className="w-4 h-2 bg-emerald-500 rounded-sm"></div>
                </div>
              </div>

              <div className="mt-16 text-center">
                <h1 className="text-5xl font-light text-white tracking-tight">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h1>
                <p className="text-xs text-emerald-400/70 mt-2 tracking-wide font-mono animate-pulse">
                  WAITING FOR CONNECTION
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-20 h-20 rounded-full bg-emerald-950/50 flex items-center justify-center border border-emerald-500/30 z-10">
                  <RiSmartphoneLine size={32} className="text-emerald-400" />
                </div>
                {status === 'connecting' && (
                  <div className="absolute w-32 h-32 border border-emerald-500/50 rounded-full animate-ping opacity-50"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 max-w-sm flex flex-col h-full justify-center">
          <div
            className={`${glassPanel || 'bg-zinc-950/80'} p-6 border border-emerald-900/40 rounded-2xl shadow-lg h-112.5 overflow-y-auto scrollbar-small`}
          >
            <h3 className="text-sm font-bold text-emerald-100 tracking-wide flex items-center gap-2 mb-6 pb-4 border-b border-emerald-900/50">
              <RiInformationLine className="text-emerald-400" size={18} /> How to Connect
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-100 mb-1">Developer Options</h4>
                  <p className="text-xs text-emerald-500/80 leading-relaxed">
                    Open <span className="text-emerald-400">Settings &gt; About Phone</span>. Tap
                    "Build Number" 7 times to enable Developer Mode.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-100 mb-1">Wireless Debugging</h4>
                  <p className="text-xs text-emerald-500/80 leading-relaxed">
                    Go to <span className="text-emerald-400">Settings &gt; Developer Options</span>.
                    Turn on "Wireless Debugging". Make sure you are on the same Wi-Fi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-100 mb-1">Enter Details</h4>
                  <p className="text-xs text-emerald-500/80 leading-relaxed">
                    Tap on "Wireless Debugging" to see your{' '}
                    <span className="text-emerald-400">IP address and Port</span>. Enter them on the
                    left panel and click Connect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 p-10 animate-in fade-in zoom-in duration-500 bg-[#0a0a0a] min-h-screen">
      <div className="w-1/4 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
            <RiSmartphoneLine className="text-purple-400" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-widest uppercase">
              {telemetry.model}
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
              {telemetry.os}
            </p>
          </div>
        </div>

        <div className="flex justify-between text-[10px] font-mono text-cyan-500 border-b border-white/5 pb-4 mb-4">
          <span>UPTIME: LIVE</span>
          <span className="text-orange-500">TEMP: {telemetry.battery.temp}°C</span>
        </div>

        <h3 className="text-fuchsia-500 font-bold tracking-widest text-sm text-center my-6 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
          DEVICE TELEMETRY
        </h3>

        <div className="flex flex-col gap-4">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest">NETWORK</span>
              <RiSignalWifi3Line className="text-purple-500" />
            </div>
            <h4 className="text-2xl font-black text-white">ACTIVE</h4>
            <span className="text-[10px] font-mono text-zinc-500">TCP/IP BRIDGE</span>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest">BATTERY</span>
              <RiBattery2ChargeLine className="text-green-500" />
            </div>
            <div className="flex justify-between items-end mb-2">
              <h4 className="text-3xl font-black text-white">{telemetry.battery.level}%</h4>
              <span className="text-[10px] font-mono text-green-500">
                {telemetry.battery.isCharging ? 'CHARGING' : 'DISCHARGING'}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-green-500 h-1.5 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                style={{ width: `${telemetry.battery.level}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest">STORAGE</span>
              <RiDatabase2Line className="text-orange-500" />
            </div>
            <div className="flex justify-between items-end mb-2">
              <h4 className="text-3xl font-black text-white">{telemetry.storage.used}</h4>
              <span className="text-[10px] font-mono text-zinc-500">{telemetry.storage.total}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-orange-500 h-1.5 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                style={{ width: `${telemetry.storage.percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/3 flex justify-center relative">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="w-full max-w-[320px] h-162.5 bg-black rounded-[3rem] border-12 border-[#1a1a1a] shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-end px-3 gap-2 shadow-md">
            <div className="w-2 h-2 rounded-full bg-purple-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>

          {screenImage ? (
            <img
              src={screenImage}
              alt="Live Phone Screen"
              className="w-full h-full object-cover animate-in fade-in duration-500"
            />
          ) : (
            <div className="flex-1 bg-linear-to-b from-purple-900 via-purple-950 to-[#111] flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-purple-400 font-mono tracking-widest animate-pulse">
                ESTABLISHING VIDEO LINK...
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="w-1/4 flex flex-col h-162.5 relative">
        <button
          onClick={handleDisconnect}
          className="absolute -top-10 right-0 p-2 bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-red-500/30 flex items-center gap-2"
        >
          <RiShutDownLine /> DISCONNECT
        </button>

        <div className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col h-full shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <RiRobot2Line className="text-purple-400" size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                MOBILE ASSISTANT
              </h3>
              <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> ONLINE
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm w-4/5">
              <p className="text-xs text-white font-mono leading-relaxed">
                MOBILE SYSTEM ONLINE. ROOT ACCESS ESTABLISHED.
              </p>
            </div>
            <p className="text-[9px] font-bold text-zinc-700 tracking-widest ml-1 -mt-2">
              IRIS
            </p>
          </div>

          <div className="mt-auto bg-black border border-white/5 rounded-2xl p-2 pl-4 flex items-center gap-3">
            <RiMicLine
              className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Ask anything..."
              className="bg-transparent border-none outline-none text-sm text-white w-full font-mono placeholder:text-zinc-600"
            />
            <button className="p-3 bg-white/5 hover:bg-purple-500 text-zinc-400 hover:text-white rounded-xl transition-all">
              <RiSendPlane2Line />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhoneView
