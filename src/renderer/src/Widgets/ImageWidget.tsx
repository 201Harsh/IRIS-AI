import { useState, useEffect, useRef } from 'react'

export default function ImageWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [debugMsg, setDebugMsg] = useState('')

  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const handleEvent = (event: any) => {
      const { url, prompt, loading, error, errorMessage } = event.detail

      setPrompt(prompt)

      // 1. Loading State
      if (loading) {
        setIsVisible(true)
        setLoading(true)
        setHasError(false)
        setImageSrc('')
        setStatusText('IRIS IS CRAFTING YOUR IMAGE...')
        return
      }

      // 2. Error State
      if (error) {
        setHasError(true)
        setLoading(false)
        setDebugMsg(errorMessage || 'API Error')
        return
      }

      if (url) {
        downloadAndAutoSave(url, prompt)
      }
    }

    window.addEventListener('image-gen', handleEvent)
    return () => window.removeEventListener('image-gen', handleEvent)
  }, [])

  const downloadAndAutoSave = async (url: string, currentPrompt: string) => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setStatusText('DOWNLOADING & SAVING...')

      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) throw new Error(`Download Error: ${response.status}`)

      const blob = await response.blob()

      const objectUrl = URL.createObjectURL(blob)
      setImageSrc(objectUrl)
      setLoading(false)
      setHasError(false)

      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64data = reader.result

        console.log('💾 Auto-saving to Gallery...')
        await window.electron.ipcRenderer.invoke('save-image-to-gallery', {
          title: currentPrompt,
          base64Data: base64data
        })

        setStatusText('SAVED TO GALLERY ✔️')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Auto-Save Failed:', err)
      setHasError(true)
      setDebugMsg('Failed to download/save image.')
      setLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-9050 flex items-center justify-center bg-black/90 backdrop-blur-md p-10 animate-in fade-in zoom-in duration-300">
      <div className="relative max-w-5xl max-h-[85vh] border-2 border-orange-500/50 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(249,115,22,0.2)] bg-black">
        <div className="absolute top-0 left-0 w-full z-10 p-4 flex justify-between items-start pointer-events-none">
          <div className="bg-black/80 backdrop-blur border border-orange-500/50 px-4 py-2 rounded-lg pointer-events-auto">
            <h2 className="text-orange-400 font-bold tracking-widest text-xs uppercase font-mono">
              IRIS Image Generator // {prompt.slice(0, 30)}...
            </h2>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500 px-4 py-2 rounded-lg font-bold pointer-events-auto transition-all"
          >
            CLOSE
          </button>
        </div>

        <div className="relative w-full h-full flex items-center justify-center min-w-200 min-h-125">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-orange-400 font-mono text-sm animate-pulse tracking-widest">
                {statusText}
              </p>
            </div>
          )}

          {hasError && (
            <div className="text-center text-red-500 px-10 max-w-xl">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold font-mono">GENERATION PAUSED</h3>
              <p className="text-sm opacity-90 mt-2 font-mono bg-red-900/20 p-4 rounded border border-red-500/30">
                {debugMsg}
              </p>
            </div>
          )}

          {!loading && !hasError && imageSrc && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Generated"
                className="w-full h-auto max-h-full object-contain animate-in fade-in duration-1000"
              />
              <div className="absolute bottom-4 right-4 bg-green-500/20 text-green-400 border border-green-500/50 px-3 py-1 rounded-full text-xs font-bold font-mono animate-in slide-in-from-bottom-2 fade-in duration-700 delay-500">
                💾 SAVED TO GALLERY
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
