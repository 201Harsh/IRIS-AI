import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderDown,
  Image as ImageIcon,
  FileText,
  Code2,
  TerminalSquare,
  CheckCircle2,
  Zap,
  ChevronRight,
  Film,
  Archive
} from 'lucide-react'

export default function SmartDropZonesWidget() {
  const [status, setStatus] = useState<'idle' | 'sorting' | 'done'>('idle')
  const [targetCategory, setTargetCategory] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<string>('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [basePath, setBasePath] = useState('')
  const [logStream, setLogStream] = useState<string[]>([])

  const terminalRef = useRef<HTMLDivElement>(null)

  const addLog = (log: string) => {
    setLogStream((prev) => [...prev, log].slice(-10))
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logStream])

  useEffect(() => {
    const handleStart = (e: any) => {
      setStatus('sorting')
      setBasePath(e.detail.path)
      setProgress({ current: 0, total: e.detail.total })
      setLogStream(['[SYSTEM] -> Initializing Smart Directory Router...'])
    }

    const handleUpdate = (e: any) => {
      const { category, fileName, current, total } = e.detail
      setTargetCategory(category.toLowerCase())
      setCurrentFile(fileName)
      setProgress({ current, total })
      addLog(`[ROUTED] -> ${fileName} => /${category}/`)
    }

    const handleDone = (e: any) => {
      setTargetCategory(null)
      if (e.detail?.error) {
        addLog('[ERROR] -> Process halted.')
      } else {
        addLog('[SYSTEM] -> Directory Sort Complete. All assets secured.')
        setStatus('done')
      }
      setTimeout(() => setStatus('idle'), 3000)
    }

    window.addEventListener('dropzone-start', handleStart)
    window.addEventListener('dropzone-update', handleUpdate)
    window.addEventListener('dropzone-done', handleDone)

    return () => {
      window.removeEventListener('dropzone-start', handleStart)
      window.removeEventListener('dropzone-update', handleUpdate)
      window.removeEventListener('dropzone-done', handleDone)
    }
  }, [])

  if (status === 'idle') return null

  const percentRaw = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  const folders = [
    {
      id: 'images',
      label: 'Images',
      icon: ImageIcon,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30'
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: Film,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30'
    },
    {
      id: 'documents',
      label: 'Docs',
      icon: FileText,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    },
    {
      id: 'code',
      label: 'Source',
      icon: Code2,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30'
    },
    {
      id: 'misc',
      label: 'Misc',
      icon: Archive,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30'
    }
  ]

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-md p-8 animate-in fade-in duration-200">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="w-full max-w-3xl bg-[#050505] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
        >
          <motion.div
            className="absolute top-0 left-0 h-1 bg-white z-10"
            initial={{ width: '0%' }}
            animate={{ width: `${percentRaw}%` }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
          />

          <div className="h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-8">
            <div className="flex items-center gap-3">
              {status === 'sorting' ? (
                <Zap className="w-5 h-5 text-white animate-pulse" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              <span className="text-sm font-black tracking-[0.2em] uppercase text-white">
                {status === 'sorting' ? 'High-Speed Asset Router' : 'Routing Complete'}
              </span>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              {progress.current} / {progress.total} FILES
            </div>
          </div>

          <div className="p-8 flex flex-col gap-8">
            <div className="flex items-center gap-3 bg-[#0a0a0a] border border-zinc-800 rounded-lg p-3">
              <TerminalSquare className="w-5 h-5 text-zinc-500" />
              <span className="text-xs font-mono text-zinc-400 truncate">{basePath}</span>
            </div>

            <div className="flex justify-center gap-6 py-4">
              {folders.map((folder) => {
                const isTargeted =
                  targetCategory?.includes(folder.id) ||
                  (folder.id === 'images' && targetCategory?.includes('photo')) ||
                  (folder.id === 'documents' && targetCategory?.includes('pdf')) ||
                  (folder.id === 'code' && targetCategory?.includes('dev')) ||
                  (folder.id === 'videos' &&
                    (targetCategory?.includes('video') || targetCategory?.includes('mp4'))) ||
                  (folder.id === 'misc' && targetCategory?.includes('misc'))

                return (
                  <motion.div
                    key={folder.id}
                    animate={isTargeted ? { scale: 1.05, y: -5 } : { scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className={`w-40 h-32 rounded-xl border flex flex-col items-center justify-center gap-3 transition-colors duration-200
                      ${isTargeted ? `${folder.bg} ${folder.border}` : 'bg-black/40 border-white/5 opacity-50'}`}
                  >
                    <folder.icon
                      className={`w-8 h-8 ${isTargeted ? folder.color : 'text-zinc-600'}`}
                    />
                    <span
                      className={`text-[10px] font-bold tracking-widest uppercase ${isTargeted ? 'text-white' : 'text-zinc-600'}`}
                    >
                      {folder.label}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {status === 'sorting' && currentFile && (
              <motion.div
                key={currentFile}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-md border border-white/10"
              >
                <FolderDown className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-mono text-white truncate">{currentFile}</span>
              </motion.div>
            )}

            <div
              ref={terminalRef}
              className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 h-40 overflow-hidden relative font-mono text-[11px]"
            >
              {logStream.map((log, i) => (
                <motion.div
                  key={i + log}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-1.5 flex items-start gap-2 text-zinc-400"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600 mt-0.5" />
                  <span className={log.includes('[ROUTED]') ? 'text-white' : ''}>{log}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
