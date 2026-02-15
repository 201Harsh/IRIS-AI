import { useState, useEffect, Suspense, lazy } from 'react'
import {
  RiWifiLine,
  RiShieldFlashLine,
  RiLayoutGridLine,
  RiBrainLine,
  RiFolderOpenLine,
  RiPhoneLine,
  RiSettings4Line,
  RiBatteryChargeLine,
  RiCameraLine,
  RiComputerLine,
  RiCloseLine
} from 'react-icons/ri'
import { getSystemStatus } from '@renderer/services/system-info'
import { VisionMode } from '@renderer/App'
import { getHistory } from '@renderer/services/iris-ai-brain'
import ViewSkeleton from '@renderer/components/ViewSkelrton'

const DashboardView = lazy(() => import('../views/Dashboard'))
const AppsView = lazy(() => import('../views/APP'))
const NotesView = lazy(() => import('../views/Notes'))
const PhoneView = lazy(() => import('../views/Phone'))
const SettingsView = lazy(() => import('../views/Settings'))
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

const glassPanel = 'bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl'

const IRIS = (props: IrisProps) => {
  const [activeTab, setActiveTab] = useState('DASHBOARD')
  const [stats, setStats] = useState<any>(null)
  const [time, setTime] = useState<Date>(new Date())
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [showSourceModal, setShowSourceModal] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
      getSystemStatus().then(setStats)
    }, 500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getHistory()
      if (Array.isArray(history)) setChatHistory(history.slice(-12))
    }
    fetchHistory()
    const interval = setInterval(fetchHistory, 500)
    return () => clearInterval(interval)
  }, [])

  const handleVisionClick = () => {
    if (props.isVideoOn) {
      props.stopVision()
    } else {
      setShowSourceModal(true)
    }
  }

  return (
    <div className="h-screen w-full bg-black text-zinc-300 font-sans overflow-hidden select-none flex flex-col relative pb-5">
      <div className="h-14 w-full flex items-center justify-between px-6 bg-zinc-950/80 border-b border-white/5 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <RiShieldFlashLine className="text-emerald-500 text-xl animate-pulse" />
          <div className="flex flex-col leading-none">
            <span className="font-black tracking-[0.2em] text-sm text-zinc-100">IRIS OS</span>
            <span className="text-[8px] font-mono text-emerald-500/60 tracking-widest">
              SYSTEM VER 2.0
            </span>
          </div>
        </div>

        <div className="hidden md:flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          {[
            { id: 'DASHBOARD', icon: <RiLayoutGridLine /> },
            { id: 'APPS', icon: <RiBrainLine /> },
            { id: 'NOTES', icon: <RiFolderOpenLine /> },
            { id: 'PHONE', icon: <RiPhoneLine /> },
            { id: 'CONNECT', icon: <RiSettings4Line /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-5 py-1.5 text-[9px] font-bold tracking-widest rounded-md transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.id}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 text-[9px] font-mono font-bold opacity-60">
          <div className="flex items-center gap-2 text-emerald-500">
            <RiWifiLine /> <span>LINKED</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <RiBatteryChargeLine /> <span>100%</span>
          </div>
          <div className="bg-zinc-800 px-2 py-1 rounded text-zinc-300">
            {time.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black">
        <Suspense fallback={<ViewSkeleton />}>
          {activeTab === 'DASHBOARD' && (
            <DashboardView
              props={props}
              stats={stats}
              chatHistory={chatHistory}
              onVisionClick={handleVisionClick}
            />
          )}
          {activeTab === 'APPS' && <AppsView />}
          {activeTab === 'NOTES' && <NotesView glassPanel={glassPanel} />}
          {activeTab === 'PHONE' && <PhoneView glassPanel={glassPanel} />}
          {activeTab === 'CONNECT' && <SettingsView glassPanel={glassPanel} />}
        </Suspense>
      </div>

      {showSourceModal && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`${glassPanel} w-96 p-1 border-emerald-500/30 flex flex-col shadow-2xl`}>
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
              <span className="text-xs font-bold tracking-widest text-emerald-400">
                ESTABLISH UPLINK
              </span>
              <button
                onClick={() => setShowSourceModal(false)}
                className="cursor-pointer text-zinc-500 hover:text-white"
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  props.startVision('camera')
                  setShowSourceModal(false)
                }}
                className="cursor-pointer group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-black/40 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
              >
                <div className="p-3 rounded-full bg-zinc-900 group-hover:bg-emerald-500 text-zinc-400 group-hover:text-black transition-colors">
                  <RiCameraLine size={28} />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-300 group-hover:text-emerald-400">
                  CAMERA FEED
                </span>
              </button>

              <button
                onClick={() => {
                  props.startVision('screen')
                  setShowSourceModal(false)
                }}
                className="cursor-pointer group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-black/40 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
              >
                <div className="p-3 rounded-full bg-zinc-900 group-hover:bg-emerald-500 text-zinc-400 group-hover:text-black transition-colors">
                  <RiComputerLine size={28} />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-300 group-hover:text-emerald-400">
                  SCREEN SHARE
                </span>
              </button>
            </div>

            <div className="p-3 bg-black/20 text-center">
              <p className="text-[9px] text-zinc-600 font-mono">
                SELECT INPUT SOURCE FOR NEURAL PROCESSING
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IRIS
