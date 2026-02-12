import { FaAndroid } from 'react-icons/fa6'
import {
  RiLinkM,
  RiQrCodeLine,
  RiSignalTowerLine,
  RiSmartphoneLine,
  RiWifiLine
} from 'react-icons/ri'

const PhoneView = ({ glassPanel }: { glassPanel: string }) => (
  <div className="flex-1 flex items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
    <div
      className={`${glassPanel} w-full max-w-4xl h-125 flex overflow-hidden border-emerald-500/10`}
    >
      <div className="w-1/2 p-10 border-r border-white/5 bg-black/20 flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
            <FaAndroid className="text-emerald-400 text-3xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-wide">ADB BRIDGE</h2>
            <p className="text-[10px] text-zinc-500 font-mono">WIRELESS DEBUGGING PROTOCOL</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="text-[9px] font-bold text-zinc-500 tracking-widest ml-1 mb-1 block">
              IP ADDRESS
            </label>
            <div className="flex items-center bg-black/60 border border-white/10 rounded-lg px-4 py-3 focus-within:border-emerald-500/30 transition-colors">
              <RiWifiLine className="text-zinc-600 mr-3" />
              <input
                type="text"
                placeholder="192.168.1.x"
                className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full font-mono placeholder:text-zinc-800"
              />
            </div>
          </div>
          <div>
            <label className="text-[9px] font-bold text-zinc-500 tracking-widest ml-1 mb-1 block">
              PORT
            </label>
            <div className="flex items-center bg-black/60 border border-white/10 rounded-lg px-4 py-3 focus-within:border-emerald-500/30 transition-colors">
              <RiLinkM className="text-zinc-600 mr-3" />
              <input
                type="text"
                placeholder="5555"
                className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full font-mono placeholder:text-zinc-800"
              />
            </div>
          </div>
        </div>
        <button className="mt-8 w-full py-3 bg-emerald-600/90 hover:bg-emerald-500 text-black font-bold rounded-lg tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-center justify-center gap-2 text-xs">
          <RiQrCodeLine size={16} /> INITIATE PAIRING
        </button>
      </div>
      <div className="w-1/2 p-10 flex flex-col bg-black/40">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-zinc-400 tracking-widest">NEARBY DEVICES</h3>
          <RiSignalTowerLine className="text-zinc-600 animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl gap-3">
          <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center">
            <RiSmartphoneLine size={32} className="text-zinc-700" />
          </div>
          <span className="text-[10px] text-zinc-600 font-mono tracking-widest">
            SCANNING NETWORK...
          </span>
        </div>
      </div>
    </div>
  </div>
)

export default PhoneView
