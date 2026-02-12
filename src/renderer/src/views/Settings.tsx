import { GiArtificialIntelligence } from "react-icons/gi"
import { RiKey2Line, RiSave3Line, RiUserVoiceLine } from "react-icons/ri"

const SettingsView = ({ glassPanel }: { glassPanel: string }) => (
  <div className="flex-1 p-12 flex flex-col gap-8 animate-in fade-in zoom-in duration-300 max-w-5xl mx-auto w-full overflow-y-auto scrollbar-small">
    <div className="flex items-center gap-6 border-b border-white/5 pb-8">
      <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
        <GiArtificialIntelligence size={40} className="text-purple-400" />
      </div>
      <div>
        <h2 className="text-2xl font-black italic tracking-tighter text-zinc-100">SYSTEM CONFIG</h2>
        <p className="text-xs text-purple-400/60 font-mono mt-1">CORE PARAMETERS</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-8">
      <div className={`${glassPanel} p-8 flex flex-col gap-6`}>
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold text-zinc-300 flex items-center gap-2">
            <RiUserVoiceLine /> Voice Profile
          </span>
        </div>
        <div className="flex gap-3">
          {['FEMALE (Puck)', 'MALE (Kore)', 'NEUTRAL'].map((s) => (
            <button
              key={s}
              className={`flex-1 py-3 text-[10px] font-bold border rounded-lg transition-all ${s.includes('FEMALE') ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className={`${glassPanel} p-8 flex flex-col gap-6`}>
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold text-zinc-300 flex items-center gap-2">
            <RiKey2Line /> Custom API Key
          </span>
        </div>
        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-3 py-2">
          <input
            type="password"
            placeholder="Enter Gemini API Key..."
            className="bg-transparent border-none outline-none text-xs text-zinc-200 w-full font-mono placeholder:text-zinc-700"
          />
          <button className="text-zinc-500 hover:text-emerald-400">
            <RiSave3Line />
          </button>
        </div>
        <p className="text-[9px] text-zinc-600">Overrides the default environment key.</p>
      </div>
    </div>
  </div>
)

export default SettingsView