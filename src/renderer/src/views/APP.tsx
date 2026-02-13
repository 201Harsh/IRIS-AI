import { useState, useEffect, useRef, useCallback } from 'react'
import {
  RiAppsLine,
  RiTerminalBoxLine,
  RiChromeLine,
  RiCodeLine,
  RiSpotifyLine,
  RiDiscordLine,
  RiGamepadLine
} from 'react-icons/ri'
import { getAllApps, AppItem } from '@renderer/services/system-info'

const SmartIcon = ({ name }: { name: string }) => {
  if (!name) return <div className="w-10 h-10 bg-zinc-800 rounded-lg border border-white/5" />

  const lower = name.toLowerCase()
  let icon = <RiTerminalBoxLine size={20} />
  let color = 'text-zinc-400'
  let bg = 'bg-zinc-800'

  // Simple heuristics for colors
  if (lower.includes('chrome') || lower.includes('edge')) {
    icon = <RiChromeLine size={20} />
    color = 'text-blue-400'
    bg = 'bg-blue-500/10'
  } else if (lower.includes('code') || lower.includes('dev')) {
    icon = <RiCodeLine size={20} />
    color = 'text-cyan-400'
    bg = 'bg-cyan-500/10'
  } else if (lower.includes('spotify') || lower.includes('music')) {
    icon = <RiSpotifyLine size={20} />
    color = 'text-green-400'
    bg = 'bg-green-500/10'
  } else if (lower.includes('discord') || lower.includes('telegram')) {
    icon = <RiDiscordLine size={20} />
    color = 'text-indigo-400'
    bg = 'bg-indigo-500/10'
  } else if (lower.includes('game') || lower.includes('launcher')) {
    icon = <RiGamepadLine size={20} />
    color = 'text-purple-400'
    bg = 'bg-purple-500/10'
  }

  return (
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center border border-white/5 ${bg} ${color} shadow-sm group-hover:scale-110 transition-transform`}
    >
      {icon}
    </div>
  )
}

const AppCard = ({ app }: { app: AppItem }) => (
  <div
    onClick={() => window.electron.ipcRenderer.invoke('open-app', app.name)}
    className="bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group active:scale-95"
  >
    <SmartIcon name={app.name} />
    <div className="flex-1 overflow-hidden">
      <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
        {app.name}
      </div>
      <div className="text-[8px] text-zinc-600 truncate font-mono mt-1 opacity-70 group-hover:opacity-100">
        INSTALLED
      </div>
    </div>
  </div>
)

const AppsView = () => {
  const [allApps, setAllApps] = useState<AppItem[]>([])
  const [visibleApps, setVisibleApps] = useState<AppItem[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastAppElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleApps.length < allApps.length) {
          setPage((prev) => prev + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, visibleApps.length, allApps.length]
  )

  useEffect(() => {
    getAllApps().then((raw) => {
      console.log('📦 Apps Loaded:', raw.length)

      // 🛡️ SANITIZE: Ensure we only keep valid objects
      const cleanData = (Array.isArray(raw) ? raw : []).filter(
        (item) => item && typeof item === 'object' && item.name && item.id
      )

      setAllApps(cleanData)
      setVisibleApps(cleanData.slice(0, 15)) // Show first 15
      setLoading(false)
    })
  }, [])

  // 2. Pagination
  useEffect(() => {
    if (page > 1) {
      const nextBatch = allApps.slice(0, page * 12 + 6)
      setVisibleApps(nextBatch)
    }
  }, [page, allApps])

  return (
    <div className="flex-1 p-8 h-full flex flex-col animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <RiAppsLine className="text-emerald-400" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-200 tracking-widest">SYSTEM APPLICATIONS</h2>
            <p className="text-[10px] text-zinc-500 font-mono">INDEXED SOFTWARE LIBRARY</p>
          </div>
        </div>
        <div className="text-xs font-mono text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">
          {loading ? 'INDEXING...' : `${allApps.length} FOUND`}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 pb-4 scrollbar-small min-h-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleApps.map((app, index) => {
            const safeKey = `${app.id}-${index}`

            if (visibleApps.length === index + 1) {
              return (
                <div ref={lastAppElementRef} key={safeKey}>
                  <AppCard app={app} />
                </div>
              )
            } else {
              return <AppCard key={safeKey} app={app} />
            }
          })}

          {loading && (
            <div className="text-zinc-500 text-xs p-4 text-center col-span-full">
              Scanning System...
            </div>
          )}

          {!loading && visibleApps.length === 0 && (
            <div className="text-zinc-500 text-xs p-10 text-center col-span-full">
              No Apps Found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppsView
