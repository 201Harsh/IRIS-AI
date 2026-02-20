import { GiArtificialIntelligence } from 'react-icons/gi'
import { RiKey2Line, RiSave3Line, RiUserVoiceLine, RiUserLine, RiCpuLine } from 'react-icons/ri'

const SettingsView = ({ glassPanel }: { glassPanel: string }) => (
  <div className="flex-1 p-8 md:p-12 flex flex-col gap-8 animate-in fade-in zoom-in duration-300 max-w-5xl mx-auto w-full overflow-y-auto scrollbar-small bg-black min-h-screen text-green-50">
    {/* HEADER */}
    <div className="flex items-center gap-6 border-b border-green-500/20 pb-8">
      <div className="p-4 bg-green-950/30 rounded-2xl border border-green-500/40 shadow-[0_0_15px_rgba(57,255,20,0.15)]">
        <GiArtificialIntelligence size={40} className="text-[#39ff14]" />
      </div>
      <div>
        <h2 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">
          IRIS // SYSTEM CONFIG
        </h2>
        <p className="text-xs text-[#39ff14]/70 font-mono mt-1 tracking-widest">
          OVERRIDE PROTOCOLS ACTIVE
        </p>
      </div>
    </div>

    {/* SETTINGS GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 1. OPERATOR NAME */}
      <div
        className={`${glassPanel} p-8 flex flex-col gap-6 bg-black/80 border border-green-900/30 hover:border-[#39ff14]/40 transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,1)]`}
      >
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold text-green-100 flex items-center gap-2 tracking-wide">
            <RiUserLine className="text-[#39ff14]" size={18} /> Operator Name
          </span>
        </div>
        <div className="flex items-center bg-black border border-green-500/30 rounded-lg px-4 py-3 focus-within:border-[#39ff14] focus-within:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all">
          <input
            type="text"
            placeholder="Enter designation..."
            className="bg-transparent border-none outline-none text-sm text-[#39ff14] w-full font-mono placeholder:text-green-900"
          />
        </div>
      </div>

      {/* 2. AI MODEL SELECTION */}
      <div
        className={`${glassPanel} p-8 flex flex-col gap-6 bg-black/80 border border-green-900/30 hover:border-[#39ff14]/40 transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,1)]`}
      >
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold text-green-100 flex items-center gap-2 tracking-wide">
            <RiCpuLine className="text-[#39ff14]" size={18} /> Neural Engine Model
          </span>
        </div>
        <div className="flex items-center bg-black border border-green-500/30 rounded-lg px-4 py-3 focus-within:border-[#39ff14] focus-within:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all">
          <select className="bg-transparent border-none outline-none text-sm text-[#39ff14] w-full font-mono cursor-pointer appearance-none">
            <option value="gemini-1.5-pro" className="bg-zinc-950 text-[#39ff14]">
              Gemini 1.5 Pro
            </option>
            <option value="gemini-1.5-flash" className="bg-zinc-950 text-[#39ff14]">
              Gemini 1.5 Flash
            </option>
            <option value="iris-custom" className="bg-zinc-950 text-[#39ff14]">
              IRIS Custom Core
            </option>
          </select>
        </div>
      </div>

      {/* 3. VOICE PROFILE */}
      <div
        className={`${glassPanel} p-8 flex flex-col gap-6 bg-black/80 border border-green-900/30 hover:border-[#39ff14]/40 transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,1)]`}
      >
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold text-green-100 flex items-center gap-2 tracking-wide">
            <RiUserVoiceLine className="text-[#39ff14]" size={18} /> Voice Synthesis
          </span>
        </div>
        <div className="flex gap-4">
          {['FEMALE', 'MALE'].map((s) => (
            <button
              key={s}
              className={`flex-1 py-3 text-xs font-bold border rounded-lg transition-all font-mono tracking-widest ${
                s === 'FEMALE'
                  ? 'bg-green-950/50 border-[#39ff14] text-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                  : 'bg-black border-green-900/50 text-green-800 hover:border-[#39ff14]/50 hover:text-[#39ff14]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 4. API KEY */}
      <div
        className={`${glassPanel} p-8 flex flex-col gap-6 bg-black/80 border border-green-900/30 hover:border-[#39ff14]/40 transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,1)]`}
      >
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold text-green-100 flex items-center gap-2 tracking-wide">
            <RiKey2Line className="text-[#39ff14]" size={18} /> Custom API Key
          </span>
        </div>
        <div className="flex items-center bg-black border border-green-500/30 rounded-lg px-4 py-3 focus-within:border-[#39ff14] focus-within:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all">
          <input
            type="password"
            placeholder="Enter override key..."
            className="bg-transparent border-none outline-none text-sm text-[#39ff14] w-full font-mono placeholder:text-green-900"
          />
          <button className="text-green-800 hover:text-[#39ff14] hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.8)] transition-all">
            <RiSave3Line size={20} />
          </button>
        </div>
        <p className="text-[10px] text-green-700 font-mono">
          Overrides the default network credentials.
        </p>
      </div>
    </div>
  </div>
)

export default SettingsView
