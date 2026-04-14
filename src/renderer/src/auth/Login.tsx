import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu,
  ShieldCheck,
  TerminalSquare,
  Network,
  Fingerprint,
  Activity,
  Database,
  Lock
} from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const [bootLogs, setBootLogs] = useState<string[]>([])
  const [isReady, setIsReady] = useState(false)

  const handleGoogleLogin = () => {
    window.open(`${import.meta.env.VITE_BACKEND_KEY}/users/google`, '_blank')
  }

  // OS Boot Sequence Simulation
  useEffect(() => {
    const sequence = [
      'SYS_BOOT: INITIATING KERNEL...',
      'SECURE_ENCLAVE: MOUNTED',
      'NEURAL_LINK: ESTABLISHING...',
      'IPC_BRIDGE: [OK]',
      'LOCAL_VAULT: WAITING FOR DECRYPTION',
      'AGENTIC_ROUTER: ONLINE',
      'AWAITING OPERATOR HANDSHAKE...'
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < sequence.length) {
        setBootLogs((prev) => [...prev, sequence[currentStep]])
        currentStep++
      } else {
        setIsReady(true)
        clearInterval(interval)
      }
    }, 350)

    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  }

  const cardVariants: any = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    }
  }

  const panelVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  }

  const rightPanelVariants: any = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-emerald-50 font-sans flex items-center justify-center p-4 lg:p-8 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-100">
      {/* Ambient Dark Neon Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-125 h-125 bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-125 h-125 bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Cybernetic Grid Background */}
      <div className="absolute inset-0 bg-[linear-linear(to_right,#10b98105_1px,transparent_1px),linear-linear(to_bottom,#10b98105_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none mix-blend-screen" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
      >
        {/* LEFT PANEL: Live Terminal (Hidden on small screens) */}
        <motion.div
          variants={panelVariants}
          className="hidden lg:flex col-span-3 flex-col h-125 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
            <TerminalSquare className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
              System Log
            </h3>
          </div>
          <div className="flex-1 flex flex-col justify-end font-mono text-[10px] leading-relaxed tracking-wider overflow-hidden">
            <AnimatePresence>
              {bootLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-2 ${index === bootLogs.length - 1 ? 'text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'text-zinc-500'}`}
                >
                  <span className="opacity-50 mr-2 text-emerald-700">{`>`}</span> {log}
                </motion.div>
              ))}
            </AnimatePresence>
            {isReady && (
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-emerald-400 mt-1"
              >
                _
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CENTER PANEL: Main Auth Card */}
        <motion.div
          variants={cardVariants}
          className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center"
        >
          {/* Top Logo & Title */}
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-black border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] mb-6 overflow-hidden">
              {/* Laser Scan Effect */}
              <motion.div
                className="absolute left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_15px_#34d399]"
                animate={{ top: ['-10%', '110%', '-10%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              <Cpu className="w-10 h-10 text-emerald-400 relative z-10" />
            </div>

            <h1 className="text-4xl font-black tracking-[0.2em] uppercase text-white mb-2 drop-shadow-md">
              IRIS <span className="text-emerald-500">OS</span>
            </h1>
            <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase">
              Autonomous Local Workspace
            </p>
          </div>

          {/* Login Box */}
          <div className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-40" />

            <div className="mb-8 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                OAuth handshake is processed externally to ensure local vault integrity. The system
                will bridge upon verification.
              </p>
            </div>

            <div className="w-full relative group">
              <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300" />

              <button
                onClick={handleGoogleLogin}
                disabled={!isReady}
                className={`relative flex w-full items-center justify-center gap-3 py-4 px-6 rounded-xl bg-zinc-950 border border-white/10 text-white transition-all font-bold text-xs tracking-widest uppercase shadow-lg ${!isReady ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black hover:border-emerald-500/50'}`}
              >
                <FcGoogle className="w-5 h-5" />
                Initialize Link
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-emerald-500/50 text-[10px] font-mono tracking-widest uppercase">
              <Fingerprint size={14} />
              Secure Encrypted Handshake
            </div>
          </div>
        </motion.div>

        {/* RIGHT PANEL: System Status (Hidden on small screens) */}
        <motion.div
          variants={rightPanelVariants}
          className="hidden lg:flex col-span-3 flex-col h-125 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
              Telemetry
            </h3>
          </div>

          <div className="flex flex-col gap-6 font-mono">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] tracking-widest text-zinc-500">
                <span className="flex items-center gap-2">
                  <Network size={12} /> NETWORK
                </span>
                <span className={isReady ? 'text-emerald-400' : 'text-yellow-500'}>
                  {isReady ? 'SECURE' : 'WAITING'}
                </span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${isReady ? 'w-full bg-emerald-500' : 'w-1/3 bg-yellow-500 animate-pulse'}`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] tracking-widest text-zinc-500">
                <span className="flex items-center gap-2">
                  <Database size={12} /> LOCAL VAULT
                </span>
                <span className="text-zinc-400">ENCRYPTED</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500/50" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] tracking-widest text-zinc-500">
                <span className="flex items-center gap-2">
                  <Lock size={12} /> BIOMETRICS
                </span>
                <span className="text-zinc-400">STANDBY</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[10%] h-full bg-emerald-500/30" />
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl">
            <p className="text-[9px] text-emerald-400/80 tracking-widest uppercase leading-relaxed">
              IRIS OS Operates strictly within local environments. External pings are limited to
              authorized LLM endpoints.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
