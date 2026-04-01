import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, ArrowRight, Cpu, Eye, EyeOff, ShieldCheck, HardDrive } from 'lucide-react'

interface SetupProps {
  onSetupComplete?: () => void
}

export default function SetupPage({ onSetupComplete }: SetupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showGroqKey, setShowGroqKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)

  const [keys, setKeys] = useState({
    groq: '',
    gemini: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Send to Electron safeStorage via IPC here
    // window.electron?.ipcRenderer.invoke('secure-save-keys', keys)

    setTimeout(() => {
      setIsLoading(false)
      if (onSetupComplete) onSetupComplete()
    }, 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#10b981] selection:text-black">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#10b981]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#044a33]/30 blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute inset-0 bg-[linear-linear(to_right,#ffffff03_1px,transparent_1px),linear-linear(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none mix-blend-overlay" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-6">
            <Cpu className="w-8 h-8 text-[#10b981]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
            System{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10b981] to-emerald-200">
              Ignition
            </span>
          </h1>
          <p className="text-gray-400 text-sm font-mono tracking-widest uppercase">
            Provide Keys to Initialize Local OS
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#0a0a0a] border border-white/10 rounded-4xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#10b981]/50 to-transparent opacity-50" />

          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300 font-mono leading-relaxed">
              SECURITY PROTOCOL: Your API keys are encrypted and stored <b>strictly locally</b> on
              your machine. They never touch our servers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-200 uppercase tracking-wider ml-1 flex justify-between">
                <span>Groq API Key</span>
                <span className="text-gray-500">Required</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-500 group-focus-within:text-[#10b981] transition-colors" />
                </div>
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  required
                  value={keys.groq}
                  onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
                  placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#10b981] transition-colors focus:outline-none cursor-pointer"
                >
                  {showGroqKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-200 uppercase tracking-wider ml-1 flex justify-between">
                <span>Gemini API Key</span>
                <span className="text-gray-500">Required</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-500 group-focus-within:text-[#10b981] transition-colors" />
                </div>
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  required
                  value={keys.gemini}
                  onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                  placeholder="AIzaSy_xxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#10b981] transition-colors focus:outline-none cursor-pointer"
                >
                  {showGeminiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !keys.groq || !keys.gemini}
              className="cursor-pointer w-full relative group overflow-hidden rounded-xl bg-[#10b981] text-black font-bold py-4 mt-4 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="flex items-center justify-center gap-2 relative z-10">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <HardDrive className="w-5 h-5" />
                    <span>Boot Local Engine</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}
