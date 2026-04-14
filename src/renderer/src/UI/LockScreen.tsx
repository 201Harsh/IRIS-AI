import { useState, useEffect, useRef } from 'react'
import {
  RiShieldKeyholeLine,
  RiShieldCheckLine,
  RiFingerprintLine,
  RiLockPasswordLine,
  RiCameraLensLine,
  RiAlertLine,
  RiDatabase2Line,
  RiCpuLine,
  RiWifiLine,
  RiLoader4Line
} from 'react-icons/ri'
import * as faceapi from 'face-api.js'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'

interface LockScreenProps {
  onUnlock: () => void
}

type AuthMode = 'face' | 'pin'

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('face')
  const [pin, setPin] = useState('')

  const [needsPinSetup, setNeedsPinSetup] = useState(false)
  const [needsFaceSetup, setNeedsFaceSetup] = useState(false)

  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [aiStatus, setAiStatus] = useState('INITIALIZING OPTICS...')
  const [isScanning, setIsScanning] = useState(false)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [decryptProgress, setDecryptProgress] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const laserRef = useRef<HTMLDivElement>(null)

  const [time, setTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer
        .invoke('check-vault-status')
        .then((status: { hasPin: boolean; hasFace: boolean }) => {
          setNeedsPinSetup(!status.hasPin)
          setNeedsFaceSetup(!status.hasFace)
          setIsLoading(false)
          if (authMode === 'face') loadNeuralNets(!status.hasFace)
        })
        .catch(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (authMode === 'face' && !isLoading && !isAuthorized) {
      startHardware()
      if (laserRef.current) {
        gsap.fromTo(
          laserRef.current,
          { top: '5%', opacity: 0 },
          { top: '95%', opacity: 0.8, duration: 2.5, repeat: -1, yoyo: true, ease: 'power1.inOut' }
        )
      }
    } else if (!isAuthorized) {
      stopCamera()
      inputRef.current?.focus()
    }
  }, [authMode, isLoading, isAuthorized])

  const startHardware = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch((e) => console.warn('Autoplay prevented:', e))
      }
    } catch (err) {
      console.error('Camera Hardware Error:', err)
      setAiStatus('OPTICS OFFLINE - USE OVERRIDE')
    }
  }

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const loadNeuralNets = async (isFaceSetup: boolean) => {
    try {
      setAiStatus('LOADING NEURAL NETS...')
      const MODEL_URL = './models'

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ])
      startScanning(isFaceSetup)
    } catch (err) {
      setAiStatus('AI OFFLINE - USE PIN BACKUP')
    }
  }

  const triggerAccessGranted = () => {
    setIsAuthorized(true)
    setError(false)
    stopCamera()
    setAiStatus('IDENTITY VERIFIED. DECRYPTING VAULT...')

    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(progressInterval)
      }
      setDecryptProgress(progress)
    }, 150)

    setTimeout(() => setAiStatus('ESTABLISHING NEURAL UPLINK...'), 1200)
    setTimeout(() => setAiStatus('WORKSPACE READY. REDIRECTING.'), 2200)

    setTimeout(() => {
      onUnlock()
    }, 3500)
  }

  const startScanning = (isFaceSetup: boolean) => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
    setIsScanning(true)

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4 || error || isAuthorized) return

      try {
        const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 })
        const detection = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceLandmarks()
          .withFaceDescriptor()

        if (detection) {
          const descriptorArray = Array.from(detection.descriptor)

          if (isFaceSetup) {
            clearInterval(scanIntervalRef.current!)
            setAiStatus('FACE ACQUIRED. ENROLLING BIOMETRICS...')
            await window.electron.ipcRenderer.invoke('setup-vault-face', descriptorArray)
            setNeedsFaceSetup(false)
            triggerAccessGranted()
          } else {
            setAiStatus('ANALYZING BIOMETRICS...')
            const isMatch = await window.electron.ipcRenderer.invoke(
              'verify-vault-face',
              descriptorArray
            )

            if (isMatch) {
              clearInterval(scanIntervalRef.current!)
              triggerAccessGranted()
            } else {
              setError(true)
              setAiStatus('UNKNOWN ENTITY DETECTED')
              setTimeout(() => {
                setError(false)
                setAiStatus('SCANNING FOR AUTHORIZATION...')
              }, 2500)
            }
          }
        } else {
          if (!error) setAiStatus('NO FACE IN FRAME. ALIGN CENTER.')
        }
      } catch (scanErr) {
        console.error('Scan error:', scanErr)
      }
    }, 800)
  }

  const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error || authMode !== 'pin' || isAuthorized) return
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 4) {
      setPin(value)
      if (value.length === 4) processPin(value)
    }
  }

  const processPin = async (currentPin: string) => {
    if (needsPinSetup) {
      await window.electron.ipcRenderer.invoke('setup-vault-pin', currentPin)
      triggerAccessGranted()
    } else {
      const isValid = await window.electron.ipcRenderer.invoke('verify-vault-pin', currentPin)
      if (isValid) {
        triggerAccessGranted()
      } else {
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
          inputRef.current?.focus()
        }, 800)
      }
    }
  }

  if (isLoading) return <div className="w-screen h-screen bg-[#030303]"></div>

  const headerText = error
    ? 'SECURITY BREACH'
    : isAuthorized
      ? 'AUTHORIZATION GRANTED'
      : needsPinSetup || needsFaceSetup
        ? 'INITIALIZE VAULT'
        : 'SYSTEM LOCKED'

  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen bg-[#030303] relative overflow-hidden select-none font-sans"
      onClick={() => authMode === 'pin' && !isAuthorized && inputRef.current?.focus()}
    >
      <div
        className={`absolute inset-0 transition-colors duration-700 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] ${
          error
            ? 'from-red-900/20 via-[#030303] to-[#030303]'
            : isAuthorized
              ? 'from-emerald-900/30 via-[#030303] to-[#030303]'
              : 'from-emerald-900/5 via-[#030303] to-[#030303]'
        }`}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none mix-blend-screen opacity-50" />

      <div className="absolute top-0 w-full h-12 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-8 z-50 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <RiCpuLine
              size={14}
              className={isAuthorized ? 'text-emerald-400' : 'text-emerald-600'}
            />{' '}
            KERNEL ACTIVE
          </span>
          <span className="flex items-center gap-2">
            <RiDatabase2Line
              size={14}
              className={isAuthorized ? 'text-emerald-400 animate-pulse' : ''}
            />{' '}
            {isAuthorized ? 'DECRYPTING' : 'ENCLAVE SECURE'}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <RiWifiLine size={14} /> LOCALHOST
          </span>
          <span className="text-white font-bold">{time}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`z-10 flex flex-col items-center gap-8 p-10 w-137.5 rounded-4xl backdrop-blur-2xl border transition-all duration-700 ${
          error
            ? 'border-red-500/50 bg-red-950/10 shadow-[0_0_100px_rgba(239,68,68,0.2)]'
            : isAuthorized
              ? 'border-emerald-400/60 bg-emerald-950/20 shadow-[0_0_120px_rgba(16,185,129,0.3)] scale-[1.02]'
              : 'border-white/10 bg-black/40 shadow-2xl'
        }`}
      >
        <div className="text-center space-y-4 w-full">
          <h1
            className={`text-2xl font-black tracking-[0.3em] transition-colors duration-300 flex items-center justify-center gap-3 uppercase ${
              error
                ? 'text-red-500'
                : isAuthorized
                  ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'text-white'
            }`}
          >
            {error && <RiAlertLine size={28} className="animate-pulse" />}
            {headerText}
          </h1>

          <div className="flex items-center justify-center w-full">
            <div
              className={`px-4 py-1.5 rounded-md border backdrop-blur-md flex items-center gap-2 transition-all duration-300 ${
                error
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : isAuthorized
                    ? 'bg-emerald-500/10 border-emerald-400/50 text-emerald-400'
                    : 'bg-black/60 border-white/10 text-zinc-400'
              }`}
            >
              {!error && !isAuthorized && (
                <RiFingerprintLine
                  size={12}
                  className={isScanning ? 'animate-pulse text-emerald-500' : ''}
                />
              )}
              {isAuthorized && (
                <RiLoader4Line size={12} className="animate-spin text-emerald-400" />
              )}
              <p className="text-[10px] font-mono tracking-widest font-bold uppercase">
                {aiStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="h-70 flex items-center justify-center w-full relative">
          <AnimatePresence mode="wait">
            {isAuthorized && (
              <motion.div
                key="authorized-view"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col items-center justify-center relative"
              >
                <div className="relative flex items-center justify-center mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    className="absolute w-36 h-36 rounded-full border-t-2 border-r-2 border-emerald-500/30"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                    className="absolute w-28 h-28 rounded-full border-b-2 border-l-2 border-emerald-400/50"
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="relative z-10 bg-emerald-500/10 p-6 rounded-full border border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  >
                    <RiShieldCheckLine size={48} className="text-emerald-400" />
                  </motion.div>
                </div>

                <div className="w-3/4 flex flex-col gap-2">
                  <div className="flex justify-between text-[9px] font-mono text-emerald-400 tracking-widest font-bold">
                    <span>DECRYPTING VAULT</span>
                    <span>{decryptProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-emerald-900/30">
                    <motion.div
                      className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
                      style={{ width: `${decryptProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {!isAuthorized && authMode === 'face' && (
              <motion.div
                key="face-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ duration: 0.3 }}
                className={`relative flex items-center justify-center w-full h-full rounded-3xl border overflow-hidden transition-all duration-500 bg-[#050505] ${
                  error
                    ? 'border-red-500/50 shadow-[inset_0_0_50px_rgba(239,68,68,0.2)]'
                    : 'border-emerald-500/20 shadow-[inset_0_0_40px_rgba(16,185,129,0.05)]'
                }`}
              >
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-all duration-500 ${
                    error ? 'opacity-30 grayscale blur-[2px]' : 'opacity-80'
                  }`}
                  autoPlay
                  muted
                  playsInline
                />

                <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl m-2" />

                {isScanning && !error && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      ref={laserRef}
                      className="absolute left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_20px_#34d399,0_0_40px_#34d399] z-20"
                    />
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/70" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-500/70" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-500/70" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/70" />
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                    <RiAlertLine
                      size={64}
                      className="text-red-500 mb-3 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse"
                    />
                    <span className="text-red-500 font-mono tracking-[0.3em] text-xs font-bold bg-black/80 px-4 py-1 rounded">
                      ACCESS DENIED
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {!isAuthorized && authMode === 'pin' && (
              <motion.div
                key="pin-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full gap-10 w-full"
              >
                <div
                  className={`p-6 rounded-2xl border transition-colors duration-500 ${
                    error
                      ? 'border-red-500/30 text-red-500 bg-red-950/20'
                      : 'border-white/10 text-zinc-400 bg-black/60'
                  }`}
                >
                  {needsPinSetup ? (
                    <RiLockPasswordLine size={48} />
                  ) : (
                    <RiShieldKeyholeLine size={48} />
                  )}
                </div>

                <div className="flex gap-4">
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = pin.length > index
                    const isActive = pin.length === index && !error
                    return (
                      <div
                        key={index}
                        className={`w-16 h-20 flex items-center justify-center text-2xl rounded-xl border transition-all duration-300 ${
                          isFilled
                            ? error
                              ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                              : 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : isActive
                              ? 'border-emerald-500/70 bg-black shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-105'
                              : 'border-white/10 bg-black/40 text-zinc-700'
                        }`}
                      >
                        {isFilled ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-3xl"
                          >
                            ●
                          </motion.span>
                        ) : isActive ? (
                          <span className="animate-pulse text-emerald-500/50 text-3xl font-light">
                            |
                          </span>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isAuthorized && (
          <button
            onClick={() => {
              if (authMode === 'face') {
                setAuthMode('pin')
                setTimeout(() => inputRef.current?.focus(), 400)
              } else {
                setAuthMode('face')
                setPin('')
              }
            }}
            className="mt-2 px-6 py-3 rounded-lg border border-white/5 bg-black/50 text-[10px] font-bold tracking-[0.15em] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-950/30 transition-all flex items-center gap-3 backdrop-blur-md"
          >
            {authMode === 'face' ? (
              <RiLockPasswordLine size={16} />
            ) : (
              <RiCameraLensLine size={16} />
            )}
            {authMode === 'face' ? 'INITIATE MANUAL OVERRIDE' : 'ENGAGE OPTICAL SCANNER'}
          </button>
        )}

        <input
          ref={inputRef}
          type="text"
          pattern="\d*"
          value={pin}
          onChange={handlePinChange}
          className="opacity-0 absolute -left-2499.75"
          maxLength={4}
          autoComplete="off"
          disabled={isAuthorized}
        />
      </motion.div>

      <div className="absolute bottom-6 flex flex-col items-center gap-1 z-50">
        <span className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase">
          IRIS Kernel Security Engine V3.5
        </span>
        <span className="text-[8px] font-mono tracking-widest text-emerald-700/50 uppercase">
          100% Local Execution Environment
        </span>
      </div>
    </div>
  )
}
