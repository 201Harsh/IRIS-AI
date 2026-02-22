import { useState, useEffect, useRef } from 'react'
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
  RiCameraLensLine,
  RiLockPasswordLine,
  RiSunLine,
  RiTerminalBoxLine,
  RiHome5Line,
  RiHistoryLine,
  RiAddLine
} from 'react-icons/ri'

const PhoneView = ({ glassPanel }: { glassPanel?: string }) => {
  const [ip, setIp] = useState(() => localStorage.getItem('iris_adb_ip') || '')
  const [port, setPort] = useState(() => localStorage.getItem('iris_adb_port') || '5555')
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const [uiMode, setUiMode] = useState<'history' | 'manual'>('history')
  const [errorMsg, setErrorMsg] = useState('')
  const [deviceHistory, setDeviceHistory] = useState<any[]>([])

  const screenRef = useRef<HTMLImageElement>(null)
  const isStreaming = useRef(false)
  const knownNotifs = useRef<string[]>([]) // ⚡ AI MEMORY: Remembers old notifications

  const [telemetry, setTelemetry] = useState({
    model: 'UNKNOWN DEVICE',
    os: 'ANDROID --',
    battery: { level: 0, isCharging: false, temp: '0.0' },
    storage: { used: '0 GB', total: '0 GB TOTAL', percent: 0 }
  })

  // 🔔 AUTONOMOUS NOTIFICATION TRACKER
  const checkNotifications = async () => {
    try {
      const res = await window.electron.ipcRenderer.invoke('adb-get-notifications')
      if (res.success && res.data) {
        const currentNotifs: string[] = res.data

        // Find notifications that we haven't seen before
        const newNotifs = currentNotifs.filter((n) => !knownNotifs.current.includes(n))

        // If there is a new message, AND it's not the very first time we are loading...
        if (newNotifs.length > 0 && knownNotifs.current.length > 0) {
          console.log('🔔 NEW ALERT INTERCEPTED:', newNotifs[0])

          // ⚡ FIRE THE GLOBAL AI TRIGGER
          window.dispatchEvent(
            new CustomEvent('ai-force-speak', {
              detail: `System Alert: The user just received a new mobile notification. Please announce it to them out loud naturally and briefly: "${newNotifs[0]}"`
            })
          )
        }

        knownNotifs.current = currentNotifs // Update memory
      }
    } catch (e) {}
  }

  useEffect(() => {
    window.electron.ipcRenderer.invoke('adb-get-history').then((data) => {
      setDeviceHistory(data)
    })
  }, [status])

  const connectToDevice = async (targetIp: string, targetPort: string) => {
    if (!targetIp || !targetPort) return setErrorMsg('IP and Port are required.')
    setStatus('connecting')
    setErrorMsg('')

    try {
      const res = await window.electron.ipcRenderer.invoke('adb-connect', {
        ip: targetIp,
        port: targetPort
      })
      if (res.success) {
        setStatus('connected')
        isStreaming.current = true
        fetchTelemetry()
        startScreenStream()
      } else {
        setStatus('idle')
        setErrorMsg('Connection failed. Device offline or debugging disabled.')
      }
    } catch (e) {
      setStatus('idle')
      setErrorMsg('Electron IPC Error.')
    }
  }

  const handleManualConnect = () => {
    localStorage.setItem('iris_adb_ip', ip)
    localStorage.setItem('iris_adb_port', port)
    connectToDevice(ip, port)
  }

  const handleDisconnect = async () => {
    isStreaming.current = false
    try {
      await window.electron.ipcRenderer.invoke('adb-disconnect')
    } catch (e) {}
    setStatus('idle')
    if (screenRef.current) screenRef.current.src = ''
  }

  const executeQuickCommand = async (action: 'camera' | 'wake' | 'lock' | 'home') => {
    try {
      await window.electron.ipcRenderer.invoke('adb-quick-action', { action })
    } catch (e) {}
  }

  const fetchTelemetry = async () => {
    try {
      const res = await window.electron.ipcRenderer.invoke('adb-telemetry')
      if (res.success) setTelemetry(res.data)
    } catch (e) {}
  }

  const startScreenStream = async () => {
    if (!isStreaming.current) return
    try {
      const res = await window.electron.ipcRenderer.invoke('adb-screenshot')
      if (res.success && res.image && screenRef.current) {
        screenRef.current.src = res.image
      }
    } catch (e) {}

    if (isStreaming.current) {
      requestAnimationFrame(startScreenStream)
    }
  }

  useEffect(() => {
    let interval: any
    if (status === 'connected') {
      interval = setInterval(fetchTelemetry, 5000)
    }
    return () => clearInterval(interval)
  }, [status])

  if (status !== 'connected' && uiMode === 'history') {
    return (
      <div className="flex-1 flex flex-col items-center justify-start pt-16 p-10 animate-in fade-in duration-300 bg-[#050505] min-h-screen text-emerald-50 relative overflow-y-auto scrollbar-small">
        <div className="w-full max-w-6xl flex flex-col items-center">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 mb-6 inline-block">
              <RiHistoryLine className="text-emerald-400" size={32} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-[0.2em] uppercase">
              NEURAL ARCHIVE
            </h1>
            <p className="text-xs text-emerald-500 font-mono tracking-widest mt-2">
              SELECT A TARGET DEVICE FOR UPLINK
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            {deviceHistory.map((dev, i) => (
              <button
                key={i}
                onClick={() => connectToDevice(dev.ip, dev.port)}
                className="w-55 h-110 bg-black border-8 border-zinc-900 rounded-[3rem] relative flex flex-col p-2 group hover:border-emerald-500/50 transition-all duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]"
              >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full z-20 group-hover:bg-emerald-900/50 transition-colors"></div>
                <div className="flex-1 bg-linear-to-b from-zinc-900 to-black rounded-[2.2rem] overflow-hidden flex flex-col items-center justify-center p-6 relative">
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                  <RiSmartphoneLine
                    size={64}
                    className="text-zinc-700 group-hover:text-emerald-400 mb-6 transition-colors duration-500 drop-shadow-[0_0_15px_rgba(16,185,129,0)] group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
                  <h3 className="text-lg font-black text-white mb-2 tracking-widest text-center uppercase z-10">
                    {dev.model}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 group-hover:text-emerald-300 z-10">
                    <RiWifiLine /> {dev.ip}:{dev.port}
                  </div>
                  <div className="mt-8 px-6 py-2 border border-zinc-700 group-hover:border-emerald-500 bg-transparent group-hover:bg-emerald-500 text-zinc-500 group-hover:text-black font-bold text-[10px] tracking-widest rounded-full transition-all z-10">
                    UPLINK
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={() => setUiMode('manual')}
              className="w-55 h-110 bg-transparent border-4 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-[3rem] flex flex-col items-center justify-center group transition-all duration-500 hover:bg-emerald-500/5"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-900 group-hover:bg-emerald-500 flex items-center justify-center text-zinc-500 group-hover:text-black transition-all mb-4">
                <RiAddLine size={32} />
              </div>
              <span className="text-xs font-bold text-zinc-500 group-hover:text-emerald-400 tracking-widest uppercase">
                CONNECT MOBILE
              </span>
            </button>
          </div>

          {errorMsg && (
            <div className="mt-10 p-4 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {deviceHistory.length === 0 && (
            <div className="mt-20 w-full max-w-4xl border-t border-zinc-900 pt-16">
              <h3 className="text-sm font-bold text-emerald-100 tracking-wide flex items-center justify-center gap-2 mb-10">
                <RiInformationLine className="text-emerald-400" size={20} /> CONNECTION PROTOCOL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mb-4 text-emerald-400 font-bold">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-widest">
                    Developer Options
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                    Open Settings &gt; About Phone. Tap "Build Number" 7 times to enable Developer
                    Mode.
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mb-4 text-emerald-400 font-bold">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-widest">
                    Wireless Debugging
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                    Go to Settings &gt; Developer Options. Turn on "Wireless Debugging". Ensure both
                    devices are on the same Wi-Fi.
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mb-4 text-emerald-400 font-bold">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-widest">
                    Establish Link
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                    Tap on "Wireless Debugging" to retrieve your IP address and Port. Click the
                    Connect Mobile card above.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (status !== 'connected' && uiMode === 'manual') {
    return (
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 p-6 animate-in fade-in duration-300 bg-[#050505] min-h-screen text-emerald-50">
        <div className="w-full lg:w-1/3 max-w-sm flex flex-col gap-4">
          <div className="p-6 bg-black border border-emerald-900/40 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-400/30">
                <FaAndroid className="text-emerald-400 text-2xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Connect Device</h2>
                <p className="text-[10px] text-emerald-400/70 font-mono">WIRELESS ADB</p>
              </div>
            </div>
            <button
              onClick={() => setUiMode('history')}
              className="text-[10px] font-bold tracking-widest text-emerald-500 hover:text-emerald-300 uppercase px-3 py-1.5 border border-emerald-500/30 rounded-lg"
            >
              BACK
            </button>
          </div>

          <div
            className={`${glassPanel || 'bg-zinc-950'} p-6 border border-emerald-900/40 rounded-2xl shadow-lg flex flex-col gap-5`}
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
              onClick={handleManualConnect}
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
            <div className="flex-1 bg-linear-to-b from-emerald-950/30 to-black p-6 flex flex-col items-center justify-center">
              <RiSmartphoneLine size={64} className="text-emerald-900 animate-pulse" />
              <p className="text-[10px] font-mono text-emerald-900 mt-4 tracking-widest">
                AWAITING TARGET
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 p-10 animate-in fade-in duration-500 bg-[#0a0a0a] min-h-screen">
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
        <div className="w-full max-w-[320px] h-162.5 bg-black rounded-[3rem] border-12 border-[#1a1a1a] shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden flex flex-col">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-end px-3 gap-2 shadow-md">
            <div className="w-2 h-2 rounded-full bg-purple-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>

          <img ref={screenRef} alt="" className="w-full h-full object-cover" />

          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"></div>
        </div>
      </div>

      <div className="w-1/4 flex flex-col h-162.5 relative">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col h-full shadow-lg">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <RiTerminalBoxLine className="text-purple-400" size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                SYSTEM CONTROLS
              </h3>
              <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                NEURAL UPLINK SECURED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-auto">
            <button
              onClick={() => executeQuickCommand('camera')}
              className="group flex flex-col items-center justify-center gap-3 p-6 bg-black/50 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-2xl transition-all"
            >
              <RiCameraLensLine
                size={28}
                className="text-zinc-500 group-hover:text-purple-400 transition-colors"
              />
              <span className="text-[10px] font-bold text-white tracking-widest">CAMERA</span>
            </button>

            <button
              onClick={() => executeQuickCommand('lock')}
              className="group flex flex-col items-center justify-center gap-3 p-6 bg-black/50 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-2xl transition-all"
            >
              <RiLockPasswordLine
                size={28}
                className="text-zinc-500 group-hover:text-purple-400 transition-colors"
              />
              <span className="text-[10px] font-bold text-white tracking-widest">LOCK</span>
            </button>

            <button
              onClick={() => executeQuickCommand('wake')}
              className="group flex flex-col items-center justify-center gap-3 p-6 bg-black/50 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-2xl transition-all"
            >
              <RiSunLine
                size={28}
                className="text-zinc-500 group-hover:text-purple-400 transition-colors"
              />
              <span className="text-[10px] font-bold text-white tracking-widest">WAKE</span>
            </button>

            <button
              onClick={() => executeQuickCommand('home')}
              className="group flex flex-col items-center justify-center gap-3 p-6 bg-black/50 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-2xl transition-all"
            >
              <RiHome5Line
                size={28}
                className="text-zinc-500 group-hover:text-purple-400 transition-colors"
              />
              <span className="text-[10px] font-bold text-white tracking-widest">HOME</span>
            </button>
          </div>

          <div className="mb-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
            <p className="text-[10px] text-purple-400 font-mono leading-relaxed text-center">
              IRIS is listening via the primary neural audio interface. Voice commands for app
              execution are online.
            </p>
          </div>

          <button
            onClick={handleDisconnect}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl tracking-widest transition-all duration-300 border border-red-500/30 flex items-center justify-center gap-3"
          >
            <RiShutDownLine size={20} /> SEVER CONNECTION
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhoneView
