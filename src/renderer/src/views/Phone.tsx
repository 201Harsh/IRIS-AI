import { useState, useEffect, useRef } from 'react'
import { FaAndroid } from 'react-icons/fa6'
import {
  RiLinkM,
  RiWifiLine,
  RiSmartphoneLine,
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
  RiAddLine,
  RiTerminalLine,
  RiFileCopyLine,
  RiCheckLine
} from 'react-icons/ri'

const PhoneView = ({ glassPanel }: { glassPanel?: string }) => {
  const [ip, setIp] = useState(() => localStorage.getItem('iris_adb_ip') || '')
  const [port, setPort] = useState(() => localStorage.getItem('iris_adb_port') || '5555')
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const [uiMode, setUiMode] = useState<'history' | 'manual'>('history')
  const [errorMsg, setErrorMsg] = useState('')
  const [deviceHistory, setDeviceHistory] = useState<any[]>([])
  const [copied, setCopied] = useState(false) // Added state for the copy button

  const screenRef = useRef<HTMLImageElement>(null)
  const isStreaming = useRef(false)
  const knownNotifs = useRef<string[]>([])
  const hasAutoConnected = useRef(false)

  const [telemetry, setTelemetry] = useState({
    model: 'UNKNOWN DEVICE',
    os: 'ANDROID --',
    battery: { level: 0, isCharging: false, temp: '0.0' },
    storage: { used: '0 GB', total: '0 GB TOTAL', percent: 0 }
  })

  useEffect(() => {
    window.electron.ipcRenderer.invoke('adb-get-history').then((data) => {
      setDeviceHistory(data)

      if (data.length > 0 && !hasAutoConnected.current) {
        hasAutoConnected.current = true

        const lastDevice = data[data.length - 1]

        if (lastDevice && lastDevice.ip) {
          setIp(lastDevice.ip)
          setPort(lastDevice.port)
          connectToDevice(lastDevice.ip, lastDevice.port)
        }
      }
    })
  }, [])

  const checkNotifications = async () => {
    try {
      const res = await window.electron.ipcRenderer.invoke('adb-get-notifications')
      if (res.success && res.data) {
        const currentNotifs: string[] = res.data

        if (knownNotifs.current.length === 0) {
          knownNotifs.current = currentNotifs
          return
        }

        const newNotifs = currentNotifs.filter((n) => !knownNotifs.current.includes(n))

        if (newNotifs.length > 0) {
          window.dispatchEvent(
            new CustomEvent('ai-force-speak', {
              detail: `System Alert: The user just received a new mobile notification. Announce it out loud briefly: "${newNotifs[0]}"`
            })
          )
          knownNotifs.current = currentNotifs
        }
      }
    } catch (e) {}
  }

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
        setErrorMsg('Connection refused. Ensure TCP/IP daemon is running (adb tcpip 5555).')
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

  // Handle the copy action for the daemon command
  const handleCopyCommand = () => {
    navigator.clipboard.writeText('adb tcpip 5555')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    let interval: any
    if (status === 'connected') {
      interval = setInterval(() => {
        fetchTelemetry()
        checkNotifications()
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [status])

  if (status !== 'connected' && uiMode === 'history') {
    return (
      <div className="flex-1 flex flex-col items-center justify-start pt-16 p-10 animate-in fade-in duration-300 bg-[#050505] min-h-screen text-emerald-50 relative overflow-y-auto scrollbar-small pb-24">
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
                <div className="flex-1 bg-gradient-to-b from-zinc-900 to-black rounded-[2.2rem] overflow-hidden flex flex-col items-center justify-center p-6 relative">
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
                    {status === 'connecting' && ip === dev.ip ? 'LINKING...' : 'UPLINK'}
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
                NEW DEVICE
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status !== 'connected' && uiMode === 'manual') {
    return (
      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-8 p-6 md:p-12 animate-in fade-in duration-300 bg-[#050505] min-h-[100dvh] overflow-y-auto text-emerald-50 pb-24">
        {/* Left Column: Connection Form */}
        <div className="w-full lg:w-1/3 max-w-md flex flex-col gap-6 shrink-0">
          <div className="p-6 bg-black border border-emerald-900/40 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-400/30">
                <FaAndroid className="text-emerald-400 text-2xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Device Uplink</h2>
                <p className="text-[10px] text-emerald-400/70 font-mono">TCP/IP CONFIGURATION</p>
              </div>
            </div>

            {deviceHistory.length > 0 && (
              <button
                onClick={() => setUiMode('history')}
                className="text-[10px] font-bold tracking-widest text-emerald-500 hover:text-emerald-300 hover:bg-emerald-500/10 uppercase px-3 py-1.5 border border-emerald-500/30 rounded-lg transition-all shrink-0 ml-2"
              >
                ARCHIVE
              </button>
            )}
          </div>

          <div
            className={`${glassPanel || 'bg-zinc-950'} p-8 border border-emerald-900/40 rounded-2xl shadow-lg flex flex-col gap-6`}
          >
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-mono leading-relaxed">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-emerald-400/80 tracking-wide mb-3 block">
                Target IP Address
              </label>
              <div className="flex items-center bg-black border border-emerald-900/50 rounded-xl px-5 py-4 focus-within:border-emerald-400 transition-all">
                <RiWifiLine className="text-emerald-400 mr-3" size={20} />
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="192.168.1.xxx"
                  className="bg-transparent border-none outline-none text-base text-emerald-400 w-full font-mono placeholder:text-emerald-900/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-400/80 tracking-wide mb-3 block">
                Target Port
              </label>
              <div className="flex items-center bg-black border border-emerald-900/50 rounded-xl px-5 py-4 focus-within:border-emerald-400 transition-all">
                <RiLinkM className="text-emerald-400 mr-3" size={20} />
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="5555"
                  className="bg-transparent border-none outline-none text-base text-emerald-400 w-full font-mono placeholder:text-emerald-900/50"
                />
              </div>
            </div>

            <button
              onClick={handleManualConnect}
              disabled={status === 'connecting'}
              className="w-full mt-4 py-5 bg-emerald-950 border border-emerald-400/50 hover:bg-emerald-400 text-emerald-400 hover:text-black font-bold rounded-xl tracking-widest transition-all duration-300 uppercase text-sm"
            >
              {status === 'connecting' ? 'INITIALIZING LINK...' : 'ESTABLISH CONNECTION'}
            </button>
          </div>
        </div>

        {/* Right Column: Setup Protocol Guide */}
        <div className="w-full lg:w-1/2 max-w-2xl flex flex-col">
          <div className="bg-black border border-emerald-900/40 rounded-2xl shadow-lg p-8 md:p-10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <RiTerminalLine size={240} />
            </div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <RiTerminalBoxLine className="text-emerald-500" size={28} />
              <h3 className="text-base font-bold tracking-[0.2em] text-emerald-400 uppercase">
                First-Time Setup Protocol
              </h3>
            </div>

            <p className="text-sm text-zinc-400 font-mono mb-10 leading-relaxed relative z-10 pr-4">
              Wireless ADB requires the device's TCP/IP daemon to be initialized via USB first.
              Follow these steps to prepare your device for remote uplink.
            </p>

            <div className="space-y-8 relative z-10">
              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    1
                  </div>
                  <div className="w-px h-full bg-emerald-900/30 my-2"></div>
                </div>
                <div className="pb-3">
                  <h4 className="text-sm font-bold text-white tracking-wider mb-2">
                    ENABLE USB DEBUGGING
                  </h4>
                  <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                    Go to{' '}
                    <span className="text-emerald-400/70">Settings &gt; Developer Options</span> on
                    your Android and enable USB Debugging. (If hidden, tap "Build Number" 7 times in
                    About Phone).
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    2
                  </div>
                  <div className="w-px h-full bg-emerald-900/30 my-2"></div>
                </div>
                <div className="pb-3">
                  <h4 className="text-sm font-bold text-white tracking-wider mb-2">
                    PHYSICAL LINK
                  </h4>
                  <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                    Connect the device to this PC via USB cable. Accept the "Allow USB debugging"
                    prompt on your phone's screen.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    3
                  </div>
                  <div className="w-px h-full bg-emerald-900/30 my-2"></div>
                </div>
                <div className="pb-3 w-full">
                  <h4 className="text-sm font-bold text-white tracking-wider mb-2">
                    START THE DAEMON
                  </h4>
                  <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-3">
                    Open your PC's Command Prompt / Terminal and execute the following command to
                    open the port:
                  </p>

                  {/* Updated Code Block with Copy Button */}
                  <div className="relative group w-full">
                    <code className="block w-full bg-zinc-950 border border-emerald-900/30 text-emerald-400 text-sm p-4 pr-14 rounded-xl tracking-widest font-mono">
                      adb tcpip 5555
                    </code>
                    <button
                      onClick={handleCopyCommand}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-600 hover:text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-all"
                      title="Copy command"
                    >
                      {copied ? (
                        <RiCheckLine size={20} className="text-emerald-400" />
                      ) : (
                        <RiFileCopyLine size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center text-xs font-bold text-black shrink-0">
                    4
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wider mb-2">
                    SEVER CABLE & CONNECT
                  </h4>
                  <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                    Disconnect the USB cable. Find your phone's Wi-Fi IP address, enter it in the
                    form to the left, and establish the connection.
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
    <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 p-10 animate-in fade-in duration-500 bg-[#0a0a0a] min-h-screen overflow-y-auto">
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
        <div className="w-full max-w-[320px] h-[650px] bg-black rounded-[3rem] border-[12px] border-[#1a1a1a] shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden flex flex-col">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-end px-3 gap-2 shadow-md">
            <div className="w-2 h-2 rounded-full bg-purple-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <img ref={screenRef} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"></div>
        </div>
      </div>

      <div className="w-1/4 flex flex-col h-[650px] relative">
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
