import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, ExternalLink, CloudLightning } from 'lucide-react'

export default function WormholeWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    const handleOpen = (e: any) => {
      setUrl(e.detail.url)
      setIsVisible(true)
    }
    const handleClose = () => setIsVisible(false)

    window.addEventListener('wormhole-opened', handleOpen)
    window.addEventListener('wormhole-closed', handleClose)

    return () => {
      window.removeEventListener('wormhole-opened', handleOpen)
      window.removeEventListener('wormhole-closed', handleClose)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-999 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-8">
      <div className="w-full max-w-3xl bg-[#050505] border border-emerald-500/30 rounded-2xl shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col relative">
        <div className="h-14 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <CloudLightning className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-sm font-black tracking-[0.2em] text-emerald-400 uppercase">
              Cloudflare Wormhole
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-zinc-500 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 md:p-10 flex flex-col md:flex-row items-start gap-10">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <QRCodeSVG value={url} size={200} level="H" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              Scan to connect
            </span>
          </div>

          <div className="flex-1 flex flex-col w-full min-w-0">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
              GLOBAL TUNNEL OPEN
            </h2>
            <p className="text-sm font-mono text-zinc-400 mb-8 leading-relaxed">
              Your localhost is now securely routed through the Cloudflare Edge Network. Latency
              optimized.
            </p>

            <div className="mb-8 w-full">
              <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase mb-2 block">
                Secure Public Route
              </span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start justify-between gap-4 p-4 bg-black/50 border border-white/10 rounded-xl hover:border-emerald-500/50 transition-colors group cursor-pointer shadow-inner w-full"
              >
                <span className="text-sm font-mono text-emerald-300 break-all leading-relaxed">
                  {url}
                </span>
                <ExternalLink className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 shrink-0 mt-0.5" />
              </a>
            </div>

            <div className="flex items-center gap-3 mt-auto">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
              <span className="text-xs font-mono text-emerald-500/70 uppercase tracking-widest">
                Connection Stable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
