import { FaAndroid } from 'react-icons/fa6'
import { RiLinkM, RiWifiLine, RiSmartphoneLine, RiInformationLine } from 'react-icons/ri'

const PhoneView = ({ glassPanel }: { glassPanel: string }) => (
  <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 p-6 animate-in fade-in zoom-in duration-300 bg-black min-h-screen text-emerald-50">
    <div className="w-full lg:w-1/3 max-w-sm flex flex-col gap-4">
      <div className="p-6 bg-zinc-950/80 border border-emerald-900/40 rounded-2xl shadow-lg flex items-center gap-4">
        <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-400/30">
          <FaAndroid className="text-emerald-400 text-2xl" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Connect Device</h2>
          <p className="text-[10px] text-emerald-400/70 font-mono">WIRELESS ADB</p>
        </div>
      </div>

      <div
        className={`${glassPanel} p-6 bg-zinc-950/80 border border-emerald-900/40 rounded-2xl shadow-lg flex flex-col gap-6`}
      >
        <div>
          <label className="text-xs font-bold text-emerald-400/80 tracking-wide mb-2 block">
            IP Address
          </label>
          <div className="flex items-center bg-black border border-emerald-900/50 rounded-lg px-4 py-3 focus-within:border-emerald-400 transition-all">
            <RiWifiLine className="text-emerald-400 mr-3" size={18} />
            <input
              type="text"
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
              placeholder="5555"
              className="bg-transparent border-none outline-none text-sm text-emerald-400 w-full font-mono placeholder:text-emerald-900"
            />
          </div>
        </div>

        <button className="w-full py-3 bg-emerald-950 border border-emerald-400/50 hover:bg-emerald-400 text-emerald-400 hover:text-black font-bold rounded-lg tracking-wide transition-all duration-300">
          Connect
        </button>
      </div>
    </div>

    <div className="w-full lg:w-1/3 flex justify-center py-4">
      <div className="w-full max-w-75 h-150 bg-zinc-950 rounded-[3rem] border-10 border-zinc-900 shadow-2xl relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-900 rounded-b-xl z-20"></div>

        <div className="flex-1 bg-linear-to-b from-emerald-950/30 to-black p-6 flex flex-col">
          <div className="flex justify-between items-center text-[10px] text-emerald-500 font-medium mt-2">
            <span>9:41</span>
            <div className="flex gap-1">
              <RiWifiLine size={12} />
              <div className="w-4 h-2 bg-emerald-500 rounded-sm"></div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h1 className="text-5xl font-light text-white tracking-tight">09:41</h1>
            <p className="text-xs text-emerald-400/70 mt-2 tracking-wide">WAITING FOR CONNECTION</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-full bg-emerald-950/50 flex items-center justify-center border border-emerald-500/30">
              <RiSmartphoneLine size={32} className="text-emerald-400" />
            </div>
            <div className="absolute w-32 h-32 border border-emerald-500/20 rounded-full animate-ping opacity-50"></div>
          </div>
        </div>
      </div>
    </div>

    <div className="w-full lg:w-1/3 max-w-sm flex flex-col h-full justify-center">
      <div
        className={`${glassPanel} p-6 bg-zinc-950/80 border border-emerald-900/40 rounded-2xl shadow-lg h-125 overflow-y-auto scrollbar-small`}
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
                Open <span className="text-emerald-400">Settings &gt; About Phone</span>. Tap "Build
                Number" 7 times to enable Developer Mode.
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

export default PhoneView
