import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { RiStickyNoteLine, RiDeleteBinLine, RiFileTextLine, RiMarkdownLine } from 'react-icons/ri'

// Type Definition
interface Note {
  filename: string
  title: string
  content: string
  createdAt: Date
}

// 🎨 Helper Component for Code Blocks in Markdown
const MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    return !inline ? (
      <div className="bg-black/50 rounded-lg p-3 my-2 border border-white/10 font-mono text-xs overflow-x-auto">
        <code {...props}>{children}</code>
      </div>
    ) : (
      <code
        className="bg-white/10 px-1 py-0.5 rounded text-emerald-400 font-mono text-xs"
        {...props}
      >
        {children}
      </code>
    )
  }
}

const NotesView = ({ glassPanel }: { glassPanel?: string }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  // Fetch Notes Function
  const fetchNotes = async () => {
    try {
      const data = await window.electron.ipcRenderer.invoke('get-notes')
      setNotes(data)
      // Auto-select first note if none selected
      if (!selectedNote && data.length > 0) setSelectedNote(data[0])
    } catch (e) {
      console.error(e)
    }
  }

  // Load on Mount
  useEffect(() => {
    fetchNotes()
    // Poll every 3 seconds to auto-update if AI writes a new note
    const interval = setInterval(fetchNotes, 3000)
    return () => clearInterval(interval)
  }, [])

  const deleteNote = async (filename: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the note when clicking delete
    await window.electron.ipcRenderer.invoke('delete-note', filename)
    fetchNotes()
    if (selectedNote?.filename === filename) setSelectedNote(null)
  }

  return (
    <div className="flex-1 h-full grid grid-cols-12 gap-6 p-6 animate-in fade-in zoom-in duration-300">
      {/* --- LEFT: NOTES LIST --- */}
      <div className="col-span-4 flex flex-col gap-4 h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-zinc-100">
            <RiStickyNoteLine className="text-emerald-400" />
            <span className="text-xs font-bold tracking-widest">MEMORY BANK</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{notes.length} ITEMS</span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-small">
          {notes.length === 0 ? (
            <div className="text-center text-zinc-600 text-xs mt-10">
              <p>No memories saved.</p>
              <p className="mt-2 opacity-50">"IRIS, save this plan..."</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.filename}
                onClick={() => setSelectedNote(note)}
                className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedNote?.filename === note.filename
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-zinc-900/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="overflow-hidden">
                  <h3
                    className={`text-xs font-bold truncate ${selectedNote?.filename === note.filename ? 'text-emerald-100' : 'text-zinc-300'}`}
                  >
                    {note.title.toUpperCase()}
                  </h3>
                  <p className="text-[9px] text-zinc-500 mt-1 font-mono">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={(e) => deleteNote(note.filename, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <RiDeleteBinLine size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- RIGHT: PREVIEW AREA --- */}
      <div
        className={`col-span-8 ${glassPanel} bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col overflow-hidden`}
      >
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
              <div className="flex items-center gap-2 text-zinc-300">
                <RiMarkdownLine size={18} className="opacity-50" />
                <span className="text-xs font-bold tracking-wider">{selectedNote.title}</span>
              </div>
              <div className="text-[9px] font-mono text-zinc-600 bg-black/20 px-2 py-1 rounded">
                READ ONLY MODE
              </div>
            </div>

            {/* Note Content (Markdown Render) */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-small bg-zinc-950/30">
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {selectedNote.content}
                </ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 gap-4">
            <RiFileTextLine size={48} className="opacity-20" />
            <span className="text-xs tracking-widest opacity-50">SELECT A DATA NODE</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesView
