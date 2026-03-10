import { useState, useEffect, useRef } from 'react'
import {
  RiShieldKeyholeLine,
  RiFingerprintLine,
  RiScan2Line,
  RiLockPasswordLine,
  RiCameraLensLine,
  RiAlertLine
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

  // Split Setup States
  const [needsPinSetup, setNeedsPinSetup] = useState(false)
  const [needsFaceSetup, setNeedsFaceSetup] = useState(false)

  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [aiStatus, setAiStatus] = useState('INITIALIZING HARDWARE...')
  const [isFaceMatched, setIsFaceMatched] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const laserRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // @ts-ignore
    if (window.electron?.ipcRenderer) {
      // @ts-ignore
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
    if (authMode === 'face' && !isLoading) {
      startHardware()
      if (laserRef.current) {
        gsap.fromTo(
          laserRef.current,
          { top: '0%', opacity: 0.8 },
          { top: '100%', opacity: 0.8, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' }
        )
      }
    } else {
      stopCamera()
      inputRef.current?.focus()
    }
  }, [authMode, isLoading])

  const startHardware = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch((e) => console.warn('Autoplay prevented:', e))
      }
    } catch (err) {
      console.error('Camera Hardware Error:', err)
      setAiStatus('CAMERA HARDWARE OFFLINE - USE PIN')
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

  // ==========================================
  // 👁️ BIOMETRIC FACE ENGINE
  // ==========================================
  const loadNeuralNets = async (isFaceSetup: boolean) => {
    try {
      setAiStatus('LOADING NEURAL NETS...')
      const MODEL_URL = '/models'
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

  const startScanning = (isFaceSetup: boolean) => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
    setIsScanning(true)

    scanIntervalRef.current = setInterval(async () => {
      // Pause scanning if we are currently displaying an error
      if (!videoRef.current || videoRef.current.readyState !== 4 || error) return

      try {
        const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 })
        const detection = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceLandmarks()
          .withFaceDescriptor()

        if (detection) {
          const descriptorArray = Array.from(detection.descriptor)

          if (isFaceSetup) {
            setAiStatus('FACE ACQUIRED. ENROLLING BIOMETRICS...')
            // @ts-ignore
            await window.electron.ipcRenderer.invoke('setup-vault-face', descriptorArray)
            clearInterval(scanIntervalRef.current!)
            setNeedsFaceSetup(false)
            setTimeout(() => {
              stopCamera()
              onUnlock()
            }, 1000)
          } else {
            setAiStatus('ANALYZING BIOMETRICS...')
            // @ts-ignore
            const isMatch = await window.electron.ipcRenderer.invoke(
              'verify-vault-face',
              descriptorArray
            )

            if (isMatch) {
              clearInterval(scanIntervalRef.current!)
              setIsFaceMatched(true)
              setAiStatus('IDENTITY VERIFIED. ACCESS GRANTED.')
              setTimeout(() => {
                stopCamera()
                onUnlock()
              }, 1000)
            } else {
              // 🚨 FULL RED INTRUDER LOCKDOWN
              setError(true)
              setAiStatus('UNKNOWN ENTITY DETECTED')
              setTimeout(() => {
                setError(false)
                setAiStatus('SCANNING FOR AUTHORIZATION...')
              }, 2500) // Stay red for 2.5 seconds before resuming scan
            }
          }
        } else {
          if (!isFaceMatched && !error) setAiStatus('NO FACE IN FRAME. ALIGN CENTER.')
        }
      } catch (scanErr) {
        console.error('Scan error:', scanErr)
      }
    }, 800)
  }

  // ==========================================
  // 🔢 PIN ENGINE
  // ==========================================
  const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error || authMode !== 'pin') return
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 4) {
      setPin(value)
      if (value.length === 4) processPin(value)
    }
  }

  const processPin = async (currentPin: string) => {
    if (needsPinSetup) {
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('setup-vault-pin', currentPin)
      onUnlock()
    } else {
      // @ts-ignore
      const isValid = await window.electron.ipcRenderer.invoke('verify-vault-pin', currentPin)
      if (isValid) {
        setTimeout(() => onUnlock(), 300)
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

  if (isLoading) return <div className="w-screen h-screen bg-black"></div>

  // Visual text helper
  const headerText = error
    ? 'SECURITY BREACH'
    : isFaceMatched
      ? 'AUTHORIZATION GRANTED'
      : needsPinSetup || needsFaceSetup
        ? 'INITIALIZE VAULT'
        : 'SYSTEM LOCKED'

  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen bg-black relative overflow-hidden select-none"
      onClick={() => authMode === 'pin' && inputRef.current?.focus()}
    >
      {/* 🚨 Dynamic Background (Pulses Red on Error) */}
      <div
        className={`absolute inset-0 transition-colors duration-500 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] ${error ? 'from-red-900/40 via-red-950/10 to-black' : isFaceMatched ? 'from-emerald-900/20 via-black to-black' : 'from-emerald-900/5 via-black to-black'}`}
      ></div>

      <div
        className={`z-10 flex flex-col items-center gap-8 p-12 w-[600px] rounded-3xl backdrop-blur-xl border transition-all duration-300 ${error ? 'border-red-500/80 bg-red-950/40 shadow-[0_0_80px_rgba(239,68,68,0.3)]' : isFaceMatched ? 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'border-emerald-500/10 bg-zinc-950/60 shadow-2xl'}`}
      >
        <div className="text-center space-y-3">
          <h1
            className={`text-2xl font-black tracking-[0.4em] transition-colors flex items-center justify-center gap-3 ${error ? 'text-red-500' : isFaceMatched ? 'text-emerald-400' : 'text-zinc-100'}`}
          >
            {error && <RiAlertLine size={28} className="animate-pulse" />}
            {headerText}
          </h1>
          <div
            className={`px-4 py-1.5 rounded-full inline-block border ${error ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-black/40 border-white/5 text-zinc-400'}`}
          >
            <p className="text-[11px] font-mono tracking-widest font-bold">
              {authMode === 'face'
                ? aiStatus
                : needsPinSetup
                  ? 'CREATE MASTER SECURE PIN'
                  : 'AWAITING MANUAL OVERRIDE'}
            </p>
          </div>
        </div>

        <div className="min-h-[450px] flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {/* 👁️ MASSIVE FACE SCANNER VIEW */}
            {authMode === 'face' && (
              <motion.div
                key="face-view"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`relative flex items-center justify-center w-[400px] h-[400px] rounded-2xl border-[3px] overflow-hidden transition-colors duration-300 bg-black ${error ? 'border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]'}`}
              >
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${error ? 'opacity-40 grayscale' : 'opacity-90'}`}
                  autoPlay
                  muted
                  playsInline
                />

                {/* 🚨 GSAP Laser Scanner (Turns Red on Error) */}
                {isScanning && !isFaceMatched && (
                  <div
                    ref={laserRef}
                    className={`absolute left-0 w-full h-[3px] z-20 transition-colors duration-300 ${error ? 'bg-red-500 shadow-[0_0_20px_#ef4444,0_0_40px_#ef4444]' : 'bg-emerald-400 shadow-[0_0_20px_#34d399,0_0_40px_#34d399]'}`}
                  ></div>
                )}

                {/* HUD Tactical Corners */}
                <div
                  className={`absolute top-4 left-4 w-8 h-8 border-t-[3px] border-l-[3px] z-10 transition-colors duration-300 ${error ? 'border-red-500' : 'border-emerald-500'}`}
                ></div>
                <div
                  className={`absolute top-4 right-4 w-8 h-8 border-t-[3px] border-r-[3px] z-10 transition-colors duration-300 ${error ? 'border-red-500' : 'border-emerald-500'}`}
                ></div>
                <div
                  className={`absolute bottom-4 left-4 w-8 h-8 border-b-[3px] border-l-[3px] z-10 transition-colors duration-300 ${error ? 'border-red-500' : 'border-emerald-500'}`}
                ></div>
                <div
                  className={`absolute bottom-4 right-4 w-8 h-8 border-b-[3px] border-r-[3px] z-10 transition-colors duration-300 ${error ? 'border-red-500' : 'border-emerald-500'}`}
                ></div>

                {isFaceMatched && (
                  <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center backdrop-blur-md z-30">
                    <RiFingerprintLine size={90} className="text-emerald-400 animate-in zoom-in" />
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center backdrop-blur-sm z-30">
                    <RiAlertLine size={72} className="text-red-500 mb-2" />
                    <span className="text-red-400 font-bold tracking-widest text-xs">
                      INTRUDER ALERT
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* 🔢 TACTICAL PIN VIEW */}
            {authMode === 'pin' && (
              <motion.div
                key="pin-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-8"
              >
                <div
                  className={`p-8 rounded-full transition-colors duration-300 ${error ? 'text-red-500 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]'}`}
                >
                  {needsPinSetup ? (
                    <RiLockPasswordLine size={64} />
                  ) : (
                    <RiShieldKeyholeLine size={64} />
                  )}
                </div>

                <div className="flex gap-6 my-4">
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = pin.length > index
                    const isActive = pin.length === index && !error
                    return (
                      <div
                        key={index}
                        className={`w-16 h-20 flex items-center justify-center text-3xl rounded-xl border-2 transition-all duration-300 ${
                          isFilled
                            ? error
                              ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                              : 'border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                            : isActive
                              ? 'border-emerald-500/50 bg-black/60 shadow-[0_0_20px_rgba(16,185,129,0.1)] scale-105'
                              : 'border-white/5 bg-black/40 text-zinc-700'
                        }`}
                      >
                        {isFilled ? (
                          <span className="animate-in zoom-in duration-200">●</span>
                        ) : isActive ? (
                          <span className="animate-pulse text-emerald-500/50">|</span>
                        ) : (
                          ''
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isFaceMatched && (
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
            className="mt-4 px-8 py-3 rounded-full border border-zinc-800 bg-black text-[11px] font-bold tracking-[0.2em] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all flex items-center gap-3 shadow-lg"
          >
            {authMode === 'face' ? (
              <RiLockPasswordLine size={16} />
            ) : (
              <RiCameraLensLine size={16} />
            )}
            {authMode === 'face' ? 'MANUAL OVERRIDE (PIN)' : 'ENABLE OPTICS (FACE ID)'}
          </button>
        )}

        <input
          ref={inputRef}
          type="text"
          pattern="\d*"
          value={pin}
          onChange={handlePinChange}
          className="opacity-0 absolute -left-[9999px]"
          maxLength={4}
          autoComplete="off"
        />
      </div>

      <div className="absolute bottom-8 text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
        IRIS Kernel Security V3.5 • Biometric Linked
      </div>
    </div>
  )
}
