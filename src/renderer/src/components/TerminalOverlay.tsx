import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

export default function TerminalOverlay() {
  const containerRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  const [isVisible, setIsVisible] = useState(false)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (xtermRef.current) return

    const initTimer = setTimeout(() => {
      if (!containerRef.current) return


      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block', 
        theme: {
          background: '#050505', 
          foreground: '#00ff41',
          cursor: '#00ff41',
          selectionBackground: 'rgba(0, 255, 65, 0.3)',
          black: '#050505',
          green: '#00ff41',
          red: '#ff003c',
          cyan: '#00e5ff'
        },
        fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
        fontSize: 12,
        lineHeight: 1.1,
        letterSpacing: 0.5,
        rows: 16,
        cols: 80,
        convertEol: true,
        allowProposedApi: true
      })

      const fitAddon = new FitAddon()
      fitAddonRef.current = fitAddon
      term.loadAddon(fitAddon)

      term.open(containerRef.current)
      xtermRef.current = term

      try {
        fitAddon.fit()
      } catch (e) {}

      term.writeln('\x1b[32m╔════════════════════════════════════════╗\x1b[0m')
      term.writeln('\x1b[32m║  SYSTEM CORE: ONLINE                   ║\x1b[0m')
      term.writeln('\x1b[32m║  PROTOCOL: IRIS_GHOST_SHELL_V2         ║\x1b[0m')
      term.writeln('\x1b[32m╚════════════════════════════════════════╝\x1b[0m')
      term.writeln('')
    }, 100)

    const cleanupListener = window.electron.ipcRenderer.on('terminal-data', (_event, data) => {
      setIsVisible(true)

      if (xtermRef.current) {
        xtermRef.current.write(data)
        requestAnimationFrame(() => {
          try {
            fitAddonRef.current?.fit()
          } catch (e) {}
        })
      }

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 10000) 
    })

    return () => {
      clearTimeout(initTimer)
      cleanupListener()
      xtermRef.current?.dispose()
    }
  }, [])

  return (
    <div
      className={`fixed bottom-6 right-6 z-9999 w-162.5 transition-all duration-500 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative bg-black/85 backdrop-blur-md border border-green-500/30 rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.15)] overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-size-[100%_2px,3px_100%] opacity-20"></div>

        <div className="flex items-center justify-between px-3 py-2 bg-green-900/10 border-b border-green-500/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#00ff41]"></div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-green-400/80 uppercase">
              IRIS TERMINAL // EXEC_MODE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] text-green-600/50 font-mono">PID: 8094</span>
            <button
              onClick={() => setIsVisible(false)}
              className="text-green-500/50 hover:text-green-400 transition-colors text-xs font-mono"
            >
              [MINIMIZE]
            </button>
          </div>
        </div>

        <div className="relative p-2 h-85 bg-transparent scrollbar-small">
          <div
            ref={containerRef}
            style={{ height: '100%', width: '100%' }}
            className="terminal-container"
          />
        </div>

            <div className="h-1 w-full bg-linear-to-r from-green-500/0 via-green-500/30 to-green-500/0"></div>
      </div>
    </div>
  )
}
