import { useState, useEffect, useRef } from 'react'
import {
  RiMicLine,
  RiMicOffLine,
  RiComputerLine,
  RiStopCircleLine,
  RiFullscreenLine,
  RiDragMove2Fill
} from 'react-icons/ri'
import { GiPowerButton } from 'react-icons/gi'
import { irisService } from '@renderer/services/Iris-voice-ai'
import { getScreenSourceId } from '@renderer/hooks/CaptureDesktop'

const MiniOverlay = () => {
  const [isSystemActive, setIsSystemActive] = useState(irisService.isConnected)
  const [isMuted, setIsMuted] = useState(true) 
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isTalking, setIsTalking] = useState(false)

  const analyzerRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | any | null>(null)
  const videoRef = useRef<HTMLVideoElement>(document.createElement('video')) 
  const activeStreamRef = useRef<MediaStream | null>(null)
  const aiIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsSystemActive(irisService.isConnected)
    if (irisService.isConnected) setIsMuted(false)
  }, [])

  useEffect(() => {
    if (isSystemActive && irisService.analyser) {
      analyzerRef.current = irisService.analyser
      dataArrayRef.current = new Uint8Array(irisService.analyser.frequencyBinCount)

      const checkAudio = () => {
        if (analyzerRef.current && dataArrayRef.current) {
          analyzerRef.current.getByteFrequencyData(dataArrayRef.current)
          const avg = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length
          setIsTalking(avg > 10)
        }
        if (isSystemActive) requestAnimationFrame(checkAudio)
      }
      checkAudio()
    } else {
      setIsTalking(false)
    }
  }, [isSystemActive])

  const toggleSystem = async () => {
    if (!isSystemActive) {
      try {
        await irisService.connect()
        setIsSystemActive(true)
        setIsMicMuted(false)
      } catch (err) {
        console.error(err)
        setIsSystemActive(false)
      }
    } else {
      turnOffVision() 
      irisService.disconnect()
      setIsSystemActive(false)
      setIsMicMuted(true)
    }
  }

  const setIsMicMuted = (muted: boolean) => {
    setIsMuted(muted)
    irisService.setMute(muted)
  }

  const toggleVision = async () => {
    if (isVideoOn) {
      turnOffVision()
    } else {
      if (!isSystemActive) return 

      try {
        const sourceId = await getScreenSourceId()
        if (!sourceId) return

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            // @ts-ignore
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              maxWidth: 1280,
              maxHeight: 720
            }
          }
        })

        activeStreamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        startAIProcessing()
        setIsVideoOn(true)

        stream.getVideoTracks()[0].onended = () => turnOffVision()
      } catch (err) {
        console.error('Overlay Vision Error:', err)
        turnOffVision()
      }
    }
  }

  const turnOffVision = () => {
    setIsVideoOn(false)
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop())
      activeStreamRef.current = null
    }
    if (aiIntervalRef.current) {
      clearInterval(aiIntervalRef.current)
      aiIntervalRef.current = null
    }
  }

  const startAIProcessing = () => {
    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current)
    aiIntervalRef.current = setInterval(() => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        irisService.socket?.readyState === WebSocket.OPEN
      ) {
        const canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 450
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
          const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1]
          irisService.sendVideoFrame(base64)
        }
      }
    }, 2000)
  }

  const expand = () => window.electron.ipcRenderer.send('toggle-overlay')

  return (
    <div className="w-full h-full flex items-center justify-between px-4 bg-zinc-950/90 backdrop-blur-xl rounded-full border border-emerald-500/30 shadow-[0_4px_30px_rgba(16,185,129,0.2)] drag-region overflow-hidden">
      <div className="flex items-center gap-3 no-drag">
        <div
          className={`
          w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300
          ${
            isSystemActive
              ? isTalking
                ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_#10b981]'
                : 'border-emerald-500/50 bg-emerald-900/20'
              : 'border-zinc-700 bg-zinc-900'
          }
        `}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              isSystemActive ? (isTalking ? 'bg-emerald-400' : 'bg-emerald-600') : 'bg-red-900'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 no-drag">
        <button
          onClick={() => setIsMicMuted(!isMuted)}
          disabled={!isSystemActive}
          className={`p-2.5 rounded-full transition-all ${
            !isSystemActive
              ? 'opacity-30 cursor-not-allowed text-zinc-500'
              : isMuted
                ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
          }`}
        >
          {isMuted ? <RiMicOffLine size={18} /> : <RiMicLine size={18} />}
        </button>

        <button
          onClick={toggleSystem}
          className={`p-3 rounded-full border transition-all duration-500 shadow-lg ${
            isSystemActive
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
              : 'bg-zinc-800 border-zinc-600 text-zinc-500 hover:text-red-400 hover:border-red-500/50'
          }`}
        >
          <GiPowerButton size={20} className={isSystemActive ? 'animate-pulse' : ''} />
        </button>

        <button
          onClick={toggleVision}
          disabled={!isSystemActive}
          className={`p-2.5 rounded-full transition-all ${
            !isSystemActive
              ? 'opacity-30 cursor-not-allowed text-zinc-500'
              : isVideoOn
                ? 'text-red-400 bg-red-500/10 animate-pulse'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {isVideoOn ? <RiStopCircleLine size={18} /> : <RiComputerLine size={18} />}
        </button>
      </div>

      <div className="pl-3 border-l border-emerald-500/20 no-drag flex items-center gap-2">
        <button
          onClick={expand}
          className="p-2 rounded-full text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
          title="Expand to Dashboard"
        >
          <RiFullscreenLine size={16} />
        </button>
        <div className="drag-region cursor-move text-emerald-500/30 hover:text-emerald-400 transition-colors">
          <RiDragMove2Fill size={14} />
        </div>
      </div>
    </div>
  )
}

export default MiniOverlay
