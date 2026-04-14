import { motion } from 'framer-motion'
import { Cpu, ShieldCheck } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.open(`${import.meta.env.VITE_BACKEND_KEY}/users/google`, '_blank')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
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
            Authenticate{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10b981] to-emerald-200">
              IRIS
            </span>
          </h1>
          <p className="text-gray-400 text-sm font-mono tracking-widest uppercase">
            Initialize secure neural link
          </p>
        </motion.div>
        

        <motion.div
          variants={itemVariants}
          className="bg-[#0a0a0a] border border-white/10 rounded-4xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#10b981]/50 to-transparent opacity-50" />

          <div className="mb-8 p-4 rounded-xl bg-[#10b981]/5 border border-[#10b981]/20 flex items-start gap-3 w-full">
            <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
            <p className="text-xs text-gray-300 font-mono leading-relaxed">
              Authentication is processed externally. Your browser will open a secure window to
              verify your identity.
            </p>
          </div>

          <div className="w-full flex items-center justify-center mb-2">
            <button
              onClick={handleGoogleLogin}
              className="cursor-pointer flex w-full items-center justify-center gap-3 py-4 px-4 rounded-xl bg-white text-black hover:bg-gray-100 transition-all font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <FcGoogle className="w-6 h-6" />
              Continue With Google
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

