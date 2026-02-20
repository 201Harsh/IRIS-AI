import { GiArtificialIntelligence } from 'react-icons/gi'
import {
  RiKey2Line,
  RiSave3Line,
  RiUserVoiceLine,
  RiUserLine,
  RiCpuLine,
  RiTimerFlashLine,
  RiTempHotLine,
  RiDatabase2Line,
} from 'react-icons/ri'

const SettingsView = ({ glassPanel }: { glassPanel: string }) => (
  <div className="flex-1 p-4 md:p-8 lg:p-12 flex flex-col gap-8 animate-in fade-in zoom-in duration-300 w-full overflow-y-auto scrollbar-small bg-black min-h-screen text-emerald-50">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-emerald-500/20 pb-6">
      <div className="flex items-center gap-6">
        <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
          <GiArtificialIntelligence size={40} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
            System Settings
          </h2>
          <p className="text-xs md:text-sm text-emerald-400/70 font-mono mt-1 tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Online
          </p>
        </div>
      </div>
      <div className="text-right hidden md:block">
        <p className="text-[10px] text-emerald-500/50 font-mono tracking-widest">UPTIME</p>
        <p className="text-lg font-mono text-emerald-400">42h 12m</p>
      </div>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[
        { label: 'CPU USAGE', value: '42%', icon: RiCpuLine, width: '42%' },
        { label: 'LATENCY', value: '14ms', icon: RiTimerFlashLine, width: '14%' },
        { label: 'TEMPERATURE', value: '68°C', icon: RiTempHotLine, width: '68%' },
        { label: 'RAM USAGE', value: '8.4 GB', icon: RiDatabase2Line, width: '75%' }
      ].map((stat, i) => (
        <div
          key={i}
          className="bg-zinc-950/80 border border-emerald-900/40 p-4 rounded-xl shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <stat.icon
              size={20}
              className="text-emerald-500/70 group-hover:text-emerald-400 transition-colors"
            />
            <span className="text-emerald-400 font-mono text-lg font-bold">{stat.value}</span>
          </div>
          <p className="text-[9px] md:text-[10px] text-emerald-100 font-mono tracking-widest mb-2">
            {stat.label}
          </p>
          <div className="w-full h-1 bg-emerald-950/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] transition-all duration-1000"
              style={{ width: stat.width }}
            ></div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <div
        className={`${glassPanel} p-6 md:p-8 flex flex-col gap-6 bg-zinc-950/80 border border-emerald-900/30 hover:border-emerald-400/40 transition-all duration-300 rounded-xl`}
      >
        <div className="flex justify-between items-end">
          <span className="text-xs md:text-sm font-bold text-emerald-100 flex items-center gap-2 tracking-wide">
            <RiUserLine className="text-emerald-400" size={18} /> User Name
          </span>
        </div>
        <div className="flex items-center bg-black border border-emerald-500/30 rounded-lg px-4 py-3 focus-within:border-emerald-400 focus-within:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all">
          <input
            type="text"
            placeholder="Enter your name..."
            className="bg-transparent border-none outline-none text-sm text-emerald-400 w-full placeholder:text-emerald-900"
          />
        </div>
      </div>

      <div
        className={`${glassPanel} p-6 md:p-8 flex flex-col gap-6 bg-zinc-950/80 border border-emerald-900/30 hover:border-emerald-400/40 transition-all duration-300 rounded-xl`}
      >
        <div className="flex justify-between items-end">
          <span className="text-xs md:text-sm font-bold text-emerald-100 flex items-center gap-2 tracking-wide">
            <RiCpuLine className="text-emerald-400" size={18} /> AI Model
          </span>
        </div>
        <div className="flex items-center bg-black border border-emerald-500/30 rounded-lg px-4 py-3 focus-within:border-emerald-400 focus-within:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all">
          <select className="bg-transparent border-none outline-none text-sm text-emerald-400 w-full cursor-pointer appearance-none">
            <option value="gemini-1.5-pro" className="bg-zinc-950 text-emerald-400">
              Gemini 1.5 Pro
            </option>
            <option value="gemini-1.5-flash" className="bg-zinc-950 text-emerald-400">
              Gemini 1.5 Flash
            </option>
            <option value="iris-custom" className="bg-zinc-950 text-emerald-400">
              IRIS Local Model
            </option>
          </select>
        </div>
      </div>

      <div
        className={`${glassPanel} p-6 md:p-8 flex flex-col gap-6 bg-zinc-950/80 border border-emerald-900/30 hover:border-emerald-400/40 transition-all duration-300 rounded-xl`}
      >
        <div className="flex justify-between items-end">
          <span className="text-xs md:text-sm font-bold text-emerald-100 flex items-center gap-2 tracking-wide">
            <RiUserVoiceLine className="text-emerald-400" size={18} /> Voice Profile
          </span>
        </div>
        <div className="flex gap-4">
          {['FEMALE', 'MALE'].map((s) => (
            <button
              key={s}
              className={`flex-1 py-3 md:py-4 text-xs font-bold border rounded-lg transition-all tracking-wide ${
                s === 'FEMALE'
                  ? 'bg-emerald-950/50 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                  : 'bg-black border-emerald-900/50 text-emerald-700 hover:border-emerald-400/50 hover:text-emerald-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`${glassPanel} p-6 md:p-8 flex flex-col gap-6 bg-zinc-950/80 border border-emerald-900/30 hover:border-emerald-400/40 transition-all duration-300 rounded-xl`}
      >
        <div className="flex justify-between items-end">
          <span className="text-xs md:text-sm font-bold text-emerald-100 flex items-center gap-2 tracking-wide">
            <RiKey2Line className="text-emerald-400" size={18} /> Custom API Key
          </span>
        </div>
        <div className="flex items-center bg-black border border-emerald-500/30 rounded-lg px-4 py-3 focus-within:border-emerald-400 focus-within:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all">
          <input
            type="password"
            placeholder="Enter API Key..."
            className="bg-transparent border-none outline-none text-sm text-emerald-400 w-full placeholder:text-emerald-900"
          />
          <button className="text-emerald-800 hover:text-emerald-400 transition-all">
            <RiSave3Line size={20} />
          </button>
        </div>
      </div>
    </div>
  </div>
)

export default SettingsView
