import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Cpu, Search, CheckCircle2 } from 'lucide-react'

gsap.registerPlugin(useGSAP)

export default function SemanticWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState('')
  const [statusText, setStatusText] = useState('Booting Search Engine...')
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: containerRef })

  const handleStart = contextSafe((e: any) => {
    setTarget(e.detail.target)
    setIsSuccess(null)
    setIsOpen(true)
    setStatusText('Waking Llama 3.1 Neural Core...')
    if (progressRef.current) gsap.to(progressRef.current, { width: '5%', duration: 0.5 })
  })

  const handleProgress = contextSafe(
    (_event: any, data: { status: string; text: string; progress: number }) => {
      if (textRef.current) {
        gsap.to(textRef.current, {
          y: -5,
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            setStatusText(data.text)
            gsap.to(textRef.current, { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' })
          }
        })
      }
      if (progressRef.current)
        gsap.to(progressRef.current, {
          width: `${data.progress}%`,
          duration: 0.5,
          ease: 'power1.out'
        })
    }
  )

  const handleDone = contextSafe((e: any) => {
    const success = e.detail.success
    setIsSuccess(success)
    if (textRef.current) {
      gsap.to(textRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        onComplete: () => {
          setStatusText(success ? `Protocol Complete.` : 'Protocol Failed.')
          gsap.to(textRef.current, { opacity: 1, y: 0, duration: 0.3 })
        }
      })
    }
    if (progressRef.current)
      gsap.to(progressRef.current, {
        width: '100%',
        backgroundColor: success ? '#3b82f6' : '#ef4444',
        duration: 0.6
      })
    setTimeout(() => setIsOpen(false), 4000)
  })

  useEffect(() => {
    window.addEventListener('semantic-start', handleStart)
    window.addEventListener('semantic-done', handleDone)
    // @ts-ignore
    window.electron.ipcRenderer.on('semantic-progress', handleProgress)
    return () => {
      window.removeEventListener('semantic-start', handleStart)
      window.removeEventListener('semantic-done', handleDone)
      // @ts-ignore
      window.electron.ipcRenderer.removeAllListeners('semantic-progress')
    }
  }, [handleStart, handleProgress, handleDone])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(15px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          // 🚨 CENTERED MASSIVE WIDGET CLASSES HERE 🚨
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.9)] z-9999 text-white font-sans flex flex-col justify-center"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-blue-400 animate-[pulse_2s_ease-in-out_infinite]" />
              <h3 className="text-sm font-bold tracking-[0.3em] text-blue-400 uppercase">
                Omni-System Search
              </h3>
            </div>
            {isSuccess === true && (
              <CheckCircle2 className="w-6 h-6 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-full" />
            )}
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2 font-semibold">
              Target Intent
            </p>
            <p className="text-lg font-medium text-gray-100 leading-relaxed border-l-2 border-blue-500 pl-4">
              {target}
            </p>
          </div>

          <div className="flex items-center gap-4 mb-6 bg-white/3 py-3 px-4 rounded-lg border border-white/5">
            <Search className="w-5 h-5 text-blue-500" />
            <div ref={textRef} className="text-sm text-gray-300 font-mono tracking-wider">
              {statusText}
            </div>
          </div>

          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-blue-500 rounded-full w-0 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
