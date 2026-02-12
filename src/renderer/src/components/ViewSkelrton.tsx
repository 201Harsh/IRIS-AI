import { RiLoader4Line } from 'react-icons/ri'

const ViewSkeleton = () => {
  return (
    <div className="w-full h-full p-8 animate-in fade-in duration-500">
      <div className="w-full h-full bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl p-6 flex flex-col gap-6 relative overflow-hidden">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent z-10" />

        {/* Header Skeleton */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="w-48 h-6 bg-white/5 rounded animate-pulse" />
            <div className="w-24 h-3 bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-2 gap-6 flex-1">
          <div className="bg-white/5 rounded-xl animate-pulse h-full opacity-50" />
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 rounded-xl animate-pulse h-32 opacity-50" />
            <div className="bg-white/5 rounded-xl animate-pulse flex-1 opacity-50" />
          </div>
        </div>

        {/* Loading Icon Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-emerald-500/50">
          <RiLoader4Line className="animate-spin text-4xl" />
          <span className="text-[10px] tracking-[0.3em] font-mono">INITIALIZING MODULE...</span>
        </div>
      </div>
    </div>
  )
}

export default ViewSkeleton
