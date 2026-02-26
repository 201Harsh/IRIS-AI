import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  Files,
  TerminalSquare,
  X,
  Clock,
  Timer,
  Percent,
  Octagon,
  Activity
} from 'lucide-react'
import { cancelIngestion } from '@renderer/tools/rag-oracle-tool'

export default function OracleWidget() {
  const [status, setStatus] = useState<
    'idle' | 'scanning' | 'ingesting' | 'thinking' | 'done' | 'cancelled'
  >('idle')
  const [path, setPath] = useState('')

  const [chunkCount, setChunkCount] = useState(0)
  const [fileCount, setFileCount] = useState(0)
  const [targetTotalFiles, setTargetTotalFiles] = useState(0)
  const [message, setMessage] = useState('')
  const [currentFile, setCurrentFile] = useState('')

  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number>(0)

  const [logStream, setLogStream] = useState<string[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)

  const addLog = (log: string) => {
    setLogStream((prev) => [...prev, log].slice(-6))
  }

  const handleClose = () => setStatus('idle')

  const handleStop = async () => {
    addLog('[SYSTEM OVERRIDE] -> PROCESS HALTED BY USER')
    setStatus('cancelled')
    setMessage(`Scan paused. Progress saved for ${fileCount} files.`)
    await cancelIngestion()
    setTimeout(() => setStatus('idle'), 5000)
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logStream])

  useEffect(() => {
    let interval: NodeJS.Timeout
    // 🚨 THE FIX: Removed the redundant !== 'cancelled' check
    if ((status === 'scanning' || status === 'ingesting') && startTime) {
      interval = setInterval(() => setElapsedMs(Date.now() - startTime), 1000)
    }
    return () => clearInterval(interval)
  }, [status, startTime])

  useEffect(() => {
    const onIngestStart = (e: any) => {
      setStatus('scanning')
      setPath(e.detail.path || 'Unknown Directory')
      setLogStream(['Starting Directory Scan...', 'Checking for saved progress...'])
      setStartTime(Date.now())
      setElapsedMs(0)
    }

    const onProgress = (e: any) => {
      if (!e.detail) return
      if (e.detail.status === 'cancelled') {
        setStatus('cancelled')
        return
      }

      if (e.detail.totalFiles) setTargetTotalFiles(e.detail.totalFiles)
      if (e.detail.filesProcessed) setFileCount(e.detail.filesProcessed)
      if (e.detail.chunks) setChunkCount(e.detail.chunks)

      if (e.detail.status === 'scanning') {
        setStatus('scanning')
        if (e.detail.totalFound) setTargetTotalFiles(e.detail.totalFound)
        if (e.detail.file !== 'Scan Complete') addLog(`Found: ${e.detail.file}`)
      } else if (e.detail.status === 'reading') {
        setStatus('ingesting')
        setCurrentFile(e.detail.file)
        addLog(`[READING] -> ${e.detail.file}...`)
      } else if (e.detail.status === 'embedded') {
        setStatus('ingesting')
        addLog(`[SAVED] -> ${e.detail.file}`)
      }
    }

    const onIngestDone = (e: any) => {
      if (status !== 'cancelled') {
        setStatus('done')
        setMessage(e.detail.message || `Successfully processed ${e.detail.chunks} vectors.`)
        setTimeout(() => setStatus('idle'), 5000)
      }
    }
    const onThinking = () => {
      setStatus('thinking')
      setMessage('AI is reading the code...')
      setLogStream(['Searching saved files...'])
    }
    const onAnswered = () => {
      setStatus('done')
      setMessage('Complete. Sending response.')
      setTimeout(() => setStatus('idle'), 5000)
    }

    window.addEventListener('oracle-ingest-start', onIngestStart)
    window.addEventListener('oracle-progress', onProgress)
    window.addEventListener('oracle-ingest-done', onIngestDone)
    window.addEventListener('oracle-thinking', onThinking)
    window.addEventListener('oracle-answered', onAnswered)

    return () => {
      window.removeEventListener('oracle-ingest-start', onIngestStart)
      window.removeEventListener('oracle-progress', onProgress)
      window.removeEventListener('oracle-ingest-done', onIngestDone)
      window.removeEventListener('oracle-thinking', onThinking)
      window.removeEventListener('oracle-answered', onAnswered)
    }
  }, [status])

  if (status === 'idle') return null

  const percentRaw = targetTotalFiles > 0 ? (fileCount / targetTotalFiles) * 100 : 0
  const percentFormatted = percentRaw.toFixed(1)

  let etaMs = 0
  const filesRemaining = targetTotalFiles - fileCount
  if (fileCount > 0 && filesRemaining > 0) {
    const timePerFile = elapsedMs / fileCount
    etaMs = timePerFile * filesRemaining
  } else if (filesRemaining > 0 && status === 'ingesting') {
    etaMs = filesRemaining * 4000
  }

  const formatTime = (ms: number) => {
    if (!isFinite(ms) || ms < 0) return '--:--'
    const totalSeconds = Math.floor(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0')
    const s = (totalSeconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const isPaused = status === 'cancelled' || status === 'done'

  return (
    <div className="absolute inset-0 z-999 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-8">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl bg-[#050505] border border-emerald-500/30 rounded-2xl shadow-[0_0_100px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col relative"
        >
          <motion.div
            className={`absolute top-0 left-0 h-0.5 z-10 transition-colors ${status === 'cancelled' ? 'bg-red-500' : 'bg-emerald-500'}`}
            initial={{ width: '0%' }}
            animate={{
              width:
                status === 'scanning' || status === 'ingesting' || status === 'thinking'
                  ? '100%'
                  : '0%'
            }}
            transition={{
              duration: 1.5,
              repeat:
                status === 'scanning' || status === 'ingesting' || status === 'thinking'
                  ? Infinity
                  : 0,
              ease: 'linear'
            }}
          />

          <div className="h-16 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              {status === 'scanning' && (
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              )}
              {status === 'ingesting' && (
                <Database className="w-6 h-6 text-emerald-400 animate-pulse" />
              )}
              {status === 'thinking' && (
                <BrainCircuit className="w-6 h-6 text-emerald-400 animate-pulse" />
              )}
              {status === 'done' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
              {status === 'cancelled' && <Octagon className="w-6 h-6 text-red-500" />}
              <span
                className={`text-base font-black tracking-[0.2em] uppercase ${status === 'cancelled' ? 'text-red-500' : 'text-emerald-400'}`}
              >
                {status === 'scanning'
                  ? 'Scanning Folders'
                  : status === 'ingesting'
                    ? `Reading Files ${isPaused ? '(Paused)' : ''}`
                    : status === 'thinking'
                      ? 'AI Computing'
                      : status === 'cancelled'
                        ? 'Process Paused'
                        : 'System Ready'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <motion.div layout className="p-10 flex flex-col gap-8">
            {status === 'scanning' || status === 'ingesting' ? (
              <motion.div layout className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TerminalSquare className="w-5 h-5 text-emerald-500/50" />
                    <span className="text-sm font-mono text-zinc-400 break-all line-clamp-1">
                      {path}
                    </span>
                  </div>
                  <button
                    onClick={handleStop}
                    disabled={isPaused}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black tracking-widest transition-all shadow-lg ${isPaused ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}
                  >
                    <Octagon className="w-4 h-4" />
                    {isPaused ? 'PAUSED' : 'STOP SCAN'}
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity
                        className={`w-5 h-5 ${status === 'ingesting' && !isPaused ? 'text-emerald-400 animate-pulse' : 'text-emerald-500/50'}`}
                      />
                      <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
                        {status === 'scanning'
                          ? 'Looking for files...'
                          : `Processing: ${currentFile || 'Loading...'}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Percent className="w-5 h-5" />
                      <motion.span
                        className="text-xl font-black"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {percentFormatted}%
                      </motion.span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
                    <motion.div
                      className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] rounded-full absolute top-0 left-0"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentRaw}%` }}
                      transition={{ ease: 'easeInOut', duration: 0.3 }}
                    />
                    <motion.div
                      className="h-full bg-emerald-500/20 absolute top-0 left-0"
                      animate={{
                        width:
                          targetTotalFiles > 0 ? `${(fileCount / targetTotalFiles) * 100}%` : '0%'
                      }}
                      transition={{ ease: 'linear', duration: 0.1 }}
                    />
                  </div>
                </div>

                <div
                  ref={terminalRef}
                  className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6 h-45 overflow-y-auto relative font-mono text-sm scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
                >
                  {logStream.map((log, i) => (
                    <motion.div
                      key={i + log}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-emerald-400/80 mb-2 flex items-start gap-3"
                    >
                      <span className="text-zinc-600 font-bold mt-0.5">&gt;</span>
                      <span className="break-all">{log}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <StatBox
                    icon={Files}
                    label="Files Done"
                    value={fileCount}
                    total={targetTotalFiles}
                  />
                  <StatBox
                    icon={Database}
                    label="Saved Vectors"
                    value={chunkCount}
                    iconColor="text-emerald-500"
                    valueColor="text-emerald-400"
                  />
                  <StatBox icon={Clock} label="Time Taken" textValue={formatTime(elapsedMs)} />
                  <StatBox
                    icon={Timer}
                    label="Time Left"
                    textValue={formatTime(etaMs)}
                    iconColor="text-emerald-500"
                    valueColor="text-emerald-400"
                    animate={status === 'ingesting' && !isPaused}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div layout className="flex flex-col items-center justify-center py-20">
                <h2
                  className={`text-3xl font-black mb-3 ${status === 'cancelled' ? 'text-red-500' : 'text-white'}`}
                >
                  {status === 'thinking'
                    ? 'ANALYZING CODE'
                    : status === 'cancelled'
                      ? 'SCAN PAUSED'
                      : 'PROCESS COMPLETE'}
                </h2>
                <p
                  className={`text-base font-mono ${status === 'cancelled' ? 'text-red-400/80' : 'text-zinc-400'}`}
                >
                  {message}
                </p>
                <div
                  className={`mt-8 text-sm font-mono flex flex-col items-center gap-2 ${status === 'cancelled' ? 'text-red-500/50' : 'text-emerald-500/50'}`}
                >
                  {logStream.slice(-3).map((log, idx) => (
                    <span key={idx} className={status === 'thinking' ? 'animate-pulse' : ''}>
                      {log}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const StatBox = ({
  icon: Icon,
  label,
  value,
  total,
  textValue,
  iconColor = 'text-zinc-500',
  valueColor = 'text-white',
  animate = false
}: any) => (
  <div
    className={`flex flex-col justify-center p-5 rounded-xl border ${animate ? 'border-emerald-500/20 bg-emerald-500/5' : 'bg-black/40 border-white/5'}`}
  >
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${iconColor}`} />
      <span
        className={`text-xs font-bold tracking-widest uppercase ${iconColor.replace('text-', 'text-').replace('500', '500/70')}`}
      >
        {label}
      </span>
    </div>
    {textValue ? (
      <span
        className={`text-4xl font-black font-mono ${valueColor} ${animate ? 'animate-pulse' : ''}`}
      >
        {textValue}
      </span>
    ) : (
      <div className="flex items-baseline gap-1">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-4xl font-black ${valueColor}`}
        >
          {value}
        </motion.span>
        {total !== undefined && <span className="text-lg font-mono text-zinc-500">/ {total}</span>}
      </div>
    )}
  </div>
)
