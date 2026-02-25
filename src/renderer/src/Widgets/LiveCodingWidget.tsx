import { useState, useEffect } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { FileCode2, ExternalLink, X, Sparkles } from 'lucide-react'

export default function LiveCodingWidget() {
  const monaco = useMonaco()
  const [isVisible, setIsVisible] = useState(false)
  const [filename, setFilename] = useState('')
  const [filePath, setFilePath] = useState('')
  const [code, setCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('iris-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ token: 'comment', foreground: '10b981', fontStyle: 'italic' }],
        colors: { 'editor.background': '#00000000' }
      })
      monaco.editor.setTheme('iris-dark')
    }
  }, [monaco])

  useEffect(() => {
    const handleStartCoding = async (e: any) => {
      const { prompt, file_name } = e.detail
      setFilename(file_name)
      setCode('// Initializing IRIS Neural Forge...\n')
      setIsVisible(true)
      setIsGenerating(true)

      const result = await window.electron.ipcRenderer.invoke('start-live-coding', {
        prompt,
        filename: file_name
      })
      if (result.success) setFilePath(result.filePath)
      setIsGenerating(false)
    }

    const handleOpenVSCode = () => {
      if (filePath) window.electron.ipcRenderer.invoke('open-in-vscode', filePath)
    }

    const handleCodeChunk = (_e: any, chunkText: string) => {
      setCode((prev) => prev + chunkText)
    }

    window.addEventListener('ai-start-coding', handleStartCoding)
    window.addEventListener('ai-open-vscode', handleOpenVSCode)
    window.electron.ipcRenderer.on('live-code-chunk', handleCodeChunk)

    return () => {
      window.removeEventListener('ai-start-coding', handleStartCoding)
      window.removeEventListener('ai-open-vscode', handleOpenVSCode)
      window.electron.ipcRenderer.removeAllListeners('live-code-chunk')
    }
  }, [filePath])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-10">
      <div className="w-full max-w-4xl h-[70vh] flex flex-col bg-[#0a0a0a] border border-emerald-500/30 rounded-xl shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">
        <div className="h-12 bg-black border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sparkles
              className={`w-4 h-4 ${isGenerating ? 'text-emerald-400 animate-spin' : 'text-emerald-500'}`}
            />
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-mono text-emerald-100">{filename || 'Building...'}</span>
          </div>

          <div className="flex items-center gap-3">
            {!isGenerating && filePath && (
              <button
                onClick={() => window.electron.ipcRenderer.invoke('open-in-vscode', filePath)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-xs font-mono text-emerald-300 transition"
              >
                <ExternalLink className="w-3 h-3" /> OPEN IN VS CODE
              </button>
            )}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative pt-4 bg-[#050505]">
          <Editor
            height="100%"
            language={filename.endsWith('.py') ? 'python' : 'typescript'}
            theme="iris-dark"
            value={code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace"
            }}
          />
        </div>
      </div>
    </div>
  )
}
