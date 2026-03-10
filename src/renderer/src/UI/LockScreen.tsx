import { useState, useEffect, useRef } from 'react'
import { RiShieldKeyholeLine, RiFingerprintLine } from 'react-icons/ri'

interface LockScreenProps {
  onUnlock: () => void
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('')
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the hidden input immediately
    inputRef.current?.focus()

    // Check if the vault is already configured
    // @ts-ignore
    if (window.electron?.ipcRenderer) {
      // @ts-ignore
      window.electron.ipcRenderer
        .invoke('check-vault-status')
        .then((isSetup: boolean) => {
          setIsSetupMode(!isSetup)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    } else {
      setIsLoading(false) // Fallback for pure browser viewing
    }
  }, [])

  // Keep focus on the hidden input if user clicks anywhere
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) return // Don't allow typing while error animation plays

    const value = e.target.value.replace(/\D/g, '') // Only allow numbers
    if (value.length <= 4) {
      setPin(value)

      // Auto-submit when 4 digits are reached
      if (value.length === 4) {
        processPin(value)
      }
    }
  }

  const processPin = async (currentPin: string) => {
    if (isSetupMode) {
      // @ts-ignore
      if (window.electron?.ipcRenderer) {
        // @ts-ignore
        await window.electron.ipcRenderer.invoke('setup-vault-pin', currentPin)
      }
      onUnlock()
    } else {
      // @ts-ignore
      let isValid = true
      // @ts-ignore
      if (window.electron?.ipcRenderer) {
        // @ts-ignore
        isValid = await window.electron.ipcRenderer.invoke('verify-vault-pin', currentPin)
      }

      if (isValid) {
        // Add a tiny delay so it feels authentic before unlocking
        setTimeout(() => onUnlock(), 300)
      } else {
        // Trigger error shake animation
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

  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen bg-black relative overflow-hidden select-none"
      onClick={handleContainerClick}
    >
      {/* Dynamic Background */}
      <div
        className={`absolute inset-0 transition-colors duration-500 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] ${
          error ? 'from-red-900/10 via-black to-black' : 'from-emerald-900/10 via-black to-black'
        }`}
      ></div>

      <div
        className={`z-10 flex flex-col items-center gap-8 p-12 rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
          error
            ? 'border-red-500/30 bg-red-950/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] translate-x-1 animate-pulse'
            : 'border-emerald-500/10 bg-zinc-950/60 shadow-2xl'
        }`}
      >
        {/* Icon Header */}
        <div
          className={`p-6 rounded-full transition-colors duration-300 ${
            error
              ? 'text-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
              : 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
          }`}
        >
          {isSetupMode ? <RiFingerprintLine size={48} /> : <RiShieldKeyholeLine size={48} />}
        </div>

        <div className="text-center space-y-2">
          <h1
            className={`text-xl font-black tracking-[0.4em] transition-colors ${
              error ? 'text-red-500' : 'text-zinc-100'
            }`}
          >
            {isSetupMode ? 'INITIALIZE VAULT' : error ? 'ACCESS DENIED' : 'SYSTEM LOCKED'}
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500">
            {isSetupMode ? 'CREATE MASTER SECURE PIN' : 'AWAITING AUTHENTICATION'}
          </p>
        </div>

        {/* Tactical PIN Cells */}
        <div className="flex gap-4 my-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index
            const isActive = pin.length === index && !error

            return (
              <div
                key={index}
                className={`w-14 h-16 flex items-center justify-center text-xl rounded-xl border-2 transition-all duration-300 ${
                  isFilled
                    ? error
                      ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : isActive
                      ? 'border-emerald-500/50 bg-black/60 shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-105'
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

        {/* Hidden Input to capture native keyboard events */}
        <input
          ref={inputRef}
          type="text"
          pattern="\d*"
          value={pin}
          onChange={handlePinChange}
          className="opacity-0 absolute -left-[9999px]"
          maxLength={4}
          autoComplete="off"
          autoFocus={true}
        />
      </div>

      <div className="absolute bottom-8 text-[9px] font-mono tracking-widest text-zinc-600 uppercase">
        IRIS Kernel Security V1.0
      </div>
    </div>
  )
}
