import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
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
  RiLockPasswordLine,
  RiScan2Line,
  RiAddLine,
  RiRecordCircleLine
} from 'react-icons/ri'

const SettingsView = () => {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])

  // GSAP Animation for Telemetry Bars
  useEffect(() => {
    barsRef.current.forEach((bar, i) => {
      if (bar) {
        const width: any = bar.getAttribute('data-width')
        gsap.fromTo(
          bar,
          { width: '0%' },
          { width: width, duration: 1.5, ease: 'power3.out', delay: 0.2 + i * 0.1 }
        )
      }
    })
  }, [])

  // Framer Motion Stagger Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  }

  const inputClass =
    'flex items-center bg-black/50 border border-white/5 rounded-lg px-4 py-3 focus-within:border-white/20 focus-within:bg-zinc-900/50 transition-all duration-300 w-full group'

  return (
    <div className="flex-1 p-6 md:p-10 lg:p-16 flex flex-col items-center bg-black min-h-screen text-zinc-100 overflow-y-auto scrollbar-small">
      {/* Centered Max-Width Container for Professional Look */}
      <motion.div
        className="w-full max-w-5xl flex flex-col gap-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ⚡ HEADER SECTION */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6"
        >
          <div className="flex items-center gap-5">
            <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/10 shadow-sm flex items-center justify-center">
              <GiArtificialIntelligence size={32} className="text-zinc-100" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Command Center</h2>
              <p className="text-xs text-zinc-500 font-mono mt-1 tracking-widest flex items-center gap-2 uppercase">
                <RiRecordCircleLine className="text-zinc-400 animate-pulse" size={12} />
                System Online & Secure
              </p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[9px] text-zinc-600 font-mono tracking-widest uppercase">
              System Uptime
            </p>
            <p className="text-sm font-mono text-zinc-300">42h 12m 04s</p>
          </div>
        </motion.div>

        {/* 📊 TELEMETRY WIDGETS */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'CPU LOAD', value: '42%', icon: RiCpuLine, width: '42%' },
            { label: 'WSS LATENCY', value: '14ms', icon: RiTimerFlashLine, width: '14%' },
            { label: 'CORE TEMP', value: '68°C', icon: RiTempHotLine, width: '68%' },
            { label: 'RAM USAGE', value: '8.4 GB', icon: RiDatabase2Line, width: '75%' }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-white/5 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:bg-zinc-900/80 transition-colors duration-500"
            >
              <div className="flex justify-between items-start mb-6">
                <stat.icon
                  size={18}
                  className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
                />
                <span className="text-zinc-100 font-mono text-base">{stat.value}</span>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest mb-3 uppercase">
                  {stat.label}
                </p>
                <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                  <div
                    ref={(el: any) => (barsRef.current[i] = el)}
                    data-width={stat.width}
                    className="h-full bg-zinc-300 rounded-full"
                    style={{ width: '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 🎛️ CORE SETTINGS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {/* 1. USER IDENTITY */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-white/5 p-7 rounded-2xl flex flex-col gap-5 hover:border-white/10 transition-all"
          >
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <RiUserLine className="text-zinc-500" size={16} /> User Designation
              </span>
            </div>
            <div className={inputClass}>
              <input
                type="text"
                placeholder="Enter operator name..."
                className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full placeholder:text-zinc-600"
              />
              <button className="text-zinc-600 hover:text-zinc-200 transition-colors ml-2">
                <RiSave3Line size={18} />
              </button>
            </div>
          </motion.div>

          {/* 2. VOICE PROFILE */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-white/5 p-7 rounded-2xl flex flex-col gap-5 hover:border-white/10 transition-all"
          >
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <RiUserVoiceLine className="text-zinc-500" size={16} /> OS Voice Profile
              </span>
            </div>
            <div className="flex gap-3 h-[46px]">
              {['FEMALE', 'MALE'].map((s) => (
                <button
                  key={s}
                  className={`flex-1 flex items-center justify-center text-[11px] font-bold rounded-lg transition-all tracking-widest ${
                    s === 'FEMALE'
                      ? 'bg-zinc-200 text-black shadow-sm'
                      : 'bg-black/50 border border-white/5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* 3. API KEY OVERRIDE */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-white/5 p-7 rounded-2xl flex flex-col gap-5 hover:border-white/10 transition-all"
          >
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <RiKey2Line className="text-zinc-500" size={16} /> Gemini Neural Uplink (API Key)
              </span>
            </div>
            <div className={inputClass}>
              <input
                type="password"
                placeholder="••••••••••••••••••••••••••"
                className="bg-transparent border-none outline-none text-sm font-mono text-zinc-200 w-full placeholder:text-zinc-700"
              />
              <button className="text-zinc-600 hover:text-zinc-200 transition-colors ml-2">
                <RiSave3Line size={18} />
              </button>
            </div>
          </motion.div>

          {/* 4. MASTER PIN RESET */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-white/5 p-7 rounded-2xl flex flex-col gap-5 hover:border-white/10 transition-all"
          >
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <RiLockPasswordLine className="text-zinc-500" size={16} /> Update Master PIN
              </span>
            </div>
            <div className={inputClass}>
              <input
                type="password"
                maxLength={4}
                pattern="\d*"
                placeholder="Enter new 4-digit PIN..."
                className="bg-transparent border-none outline-none text-sm font-mono text-zinc-200 w-full placeholder:text-zinc-700 tracking-[0.3em]"
              />
              <button className="text-zinc-600 hover:text-zinc-200 transition-colors ml-2">
                <RiSave3Line size={18} />
              </button>
            </div>
          </motion.div>

          {/* 5. BIOMETRIC REGISTRY */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-white/5 p-7 rounded-2xl flex flex-col gap-6 hover:border-white/10 transition-all md:col-span-2"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <RiScan2Line className="text-zinc-500" size={16} /> Biometric Vault Access
              </span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest bg-white/5 px-2 py-1 rounded-md">
                1 FACE ENROLLED
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                Register additional biometric profiles to grant vault access to trusted operators.
                Facial descriptors are mathematically encrypted and stored strictly offline.
              </p>

              <button className="w-full md:w-auto px-6 py-3 rounded-lg bg-zinc-100 text-black font-semibold tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-white transition-all duration-300 group/btn">
                <RiAddLine
                  size={16}
                  className="group-hover/btn:rotate-90 transition-transform duration-300"
                />
                ENROLL NEW FACE
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default SettingsView
