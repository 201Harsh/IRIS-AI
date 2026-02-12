import { getRunningApps } from '@renderer/services/get-apps'
import { useEffect, useState } from 'react'
import { RiAppsLine, RiLayoutGridLine } from 'react-icons/ri'

const AppsView = ({ glassPanel }: { glassPanel: string }) => {
  const [apps, setApps] = useState<string[]>([])

  useEffect(() => {
    getRunningApps().then(setApps)
    const interval = setInterval(() => getRunningApps().then(setApps), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 p-8 overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-400 tracking-widest flex items-center gap-2">
            <RiAppsLine /> ACTIVE PROCESSES
          </h2>
          <span className="text-xs font-mono text-emerald-500">{apps.length} RUNNING</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 scrollbar-small pb-4">
          {apps.map((app, i) => (
            <div
              key={i}
              className={`${glassPanel} p-4 flex items-center gap-3 hover:bg-white/5 transition-all cursor-pointer group border-emerald-500/10`}
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 border border-white/5 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                <RiLayoutGridLine />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-zinc-300 truncate">{app}</div>
                <div className="text-[9px] text-emerald-600 flex items-center gap-1">● ACTIVE</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AppsView
