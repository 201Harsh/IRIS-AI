import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Cpu, Sparkles, Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { FormDataLogin } from '../types/form-type'
import { useAuthStore } from '../store/auth-store'
import ErrorBox from '@renderer/utils/ErrorBox'
import AxiosInstance from '@renderer/config/AxiosInstance'

interface LoginProps {
  onLoginSuccess?: () => void
}

export default function LoginPage({ onLoginSuccess }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [FormData, setFormData] = useState<FormDataLogin>({
    email: '',
    password: ''
  })

  const setAccessToken = useAuthStore.getState().setAccessToken

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleGoogleLogin = () => {
    window.open(`${import.meta.env.VITE_BACKEND_KEY}/users/google`, '_blank')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!FormData.email || !FormData.password) {
      setError('Please fill in all fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(FormData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      const response = await AxiosInstance.post('/users/login', FormData)

      if (response.status === 200) {
        setSuccess('Login successful! Redirecting to System Ignition...')
        setFormData({
          email: '',
          password: ''
        })

        const accessToken = response.data.accessToken
        setAccessToken(accessToken)

        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess()
        }, 1500)
      }
    } catch (error: any) {
        console.log(error.response.data)
      if (error.response && error.response.data) {
        setError(
          typeof error.response.data === 'string'
            ? error.response.data
            : error.response.data.message || 'Login failed. Please check your credentials.'
        )
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
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
            Access your control panel
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#0a0a0a] border border-white/10 rounded-4xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#10b981]/50 to-transparent opacity-50" />

          {error && <ErrorBox type="error" message={error} onClose={() => setError(null)} />}
          {success && (
            <ErrorBox type="success" message={success} onClose={() => setSuccess(null)} />
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-200 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-[#10b981] transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  value={FormData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  placeholder="harsh@vitalstudios.com"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1 pr-1">
                <label className="text-xs font-mono text-gray-200 uppercase tracking-wider">
                  Secure Password
                </label>
                <a
                  href="#"
                  className="text-xs text-[#10b981] hover:text-emerald-400 transition-colors font-mono"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-[#10b981] transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  value={FormData.password}
                  onChange={handleChange}
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#10b981] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full relative group overflow-hidden rounded-xl bg-[#10b981] text-black font-bold py-4 mt-2 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="flex items-center justify-center gap-2 relative z-10">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Access System</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              Or Auth With
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="w-full flex items-center justify-center">
            <button
              onClick={handleGoogleLogin}
              className="cursor-pointer flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#050505] border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-sm font-medium text-gray-300"
            >
              <FcGoogle className="w-5 h-5" />
              Continue With Google
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Don't have an access key?{' '}
            <button
              onClick={() => window.open(`${import.meta.env.VITE_FRONTEND_KEY}/signup`, '_blank')}
              className="text-[#10b981] font-semibold hover:text-emerald-400 transition-colors flex items-center justify-center gap-1 cursor-pointer bg-transparent border-none p-0"
            >
              Deploy Engine <Sparkles className="w-3 h-3" />
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
