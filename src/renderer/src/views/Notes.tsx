import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  RiStickyNoteLine,
  RiDeleteBinLine,
  RiFileTextLine,
  RiMarkdownLine,
  RiAddLine,
  RiSave3Line,
  RiCloseLine,
  RiEditLine // ⚡ Imported Edit Icon
} from 'react-icons/ri'

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

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [editOriginalFilename, setEditOriginalFilename] = useState<string | null>(null)

  const fetchNotes = async () => {
    try {
      const data = await window.electron.ipcRenderer.invoke('get-notes')
      setNotes(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchNotes()
    const interval = setInterval(fetchNotes, 3000) // Poll for AI updates
    return () => clearInterval(interval)
  }, [])


  const startCreating = () => {
    setSelectedNote(null)
    setEditOriginalFilename(null)
    setNewTitle('')
    setNewContent('')
    setIsEditorOpen(true)
  }

  const startEditing = () => {
    if (!selectedNote) return

    setEditOriginalFilename(selectedNote.filename)
    setNewTitle(selectedNote.title)

    const cleanContent = selectedNote.content.replace(/^# .+\n\n/, '')
    setNewContent(cleanContent)

    setIsEditorOpen(true)
  }

  const cancelEditor = () => {
    setIsEditorOpen(false)
    setEditOriginalFilename(null)
  }

  const saveManualNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) return


    await window.electron.ipcRenderer.invoke('save-note', {
      title: newTitle,
      content: newContent
    })

    setIsEditorOpen(false)
    setEditOriginalFilename(null)
    fetchNotes()

    setTimeout(() => {
      window.electron.ipcRenderer.invoke('get-notes').then((data: Note[]) => {
        const created = data.find((n) =>
          n.title.toLowerCase().includes(newTitle.toLowerCase().replace(/ /g, '_'))
        )
        if (created) setSelectedNote(created)
      })
    }, 500)
  }

  const deleteNote = async (filename: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await window.electron.ipcRenderer.invoke('delete-note', filename)
    fetchNotes()
    if (selectedNote?.filename === filename) setSelectedNote(null)
  }

  return (
    <div className="flex-1 bg-gray-900/70 h-full grid grid-cols-12 gap-6 p-6 animate-in fade-in zoom-in duration-300">
      {/* --- LEFT: NOTES LIST --- */}
      <div className="col-span-4 flex flex-col gap-4 h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-zinc-100">
            <RiStickyNoteLine className="text-emerald-400" />
            <span className="text-xs font-bold tracking-widest">MEMORY BANK</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-mono mr-2">{notes.length} ITEMS</span>
            {/* ⚡ CREATE BUTTON */}
            <button
              onClick={startCreating}
              className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-black transition-all"
              title="Create Manual Note"
            >
              <RiAddLine size={14} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-small">
          {notes.length === 0 ? (
            <div className="text-center text-zinc-600 text-xs mt-10">
              <p>No memories saved.</p>
              <p className="mt-2 opacity-50">Click + or ask IRIS.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.filename}
                onClick={() => {
                  setIsEditorOpen(false)
                  setSelectedNote(note)
                }}
                className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedNote?.filename === note.filename && !isEditorOpen
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-zinc-900/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="overflow-hidden">
                  <h3
                    className={`text-xs font-bold truncate ${selectedNote?.filename === note.filename && !isEditorOpen ? 'text-emerald-100' : 'text-zinc-300'}`}
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

      {/* --- RIGHT: PREVIEW OR EDITOR --- */}
      <div
        className={`col-span-8 ${glassPanel || ''} bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col overflow-hidden relative`}
      >
        {/* MODE 1: CREATE / EDIT NOTE */}
        {isEditorOpen ? (
          <div className="flex-1 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
              <input
                type="text"
                placeholder="ENTER NOTE TITLE..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-transparent border-none outline-none text-lg font-bold text-white placeholder-zinc-600 w-full tracking-wider"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={cancelEditor}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <RiCloseLine size={20} />
                </button>
              </div>
            </div>

            <textarea
              placeholder="Write your note in Markdown..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm font-mono text-zinc-300 placeholder-zinc-700 leading-relaxed p-2 scrollbar-small"
            />

            <div className="flex justify-end pt-4">
              <button
                onClick={saveManualNote}
                disabled={!newTitle || !newContent}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-black font-bold text-xs rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RiSave3Line /> {editOriginalFilename ? 'UPDATE MEMORY' : 'SAVE TO MEMORY'}
              </button>
            </div>
          </div>
        ) : selectedNote ? (
          /* MODE 2: READ NOTE */
          <>
            <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
              <div className="flex items-center gap-2 text-zinc-300">
                <RiMarkdownLine size={18} className="opacity-50" />
                <span className="text-xs font-bold tracking-wider">{selectedNote.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-zinc-600 bg-black/20 px-2 py-1 rounded">
                  READ ONLY
                </span>
                {/* ⚡ EDIT BUTTON */}
                <button
                  onClick={startEditing}
                  className="text-zinc-500 hover:text-emerald-400 transition-colors"
                  title="Edit Note"
                >
                  <RiEditLine size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-small bg-zinc-950/30">
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {selectedNote.content}
                </ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          /* MODE 3: EMPTY STATE */
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 gap-4">
            <RiFileTextLine size={48} className="opacity-20" />
            <span className="text-xs tracking-widest opacity-50">
              SELECT A DATA NODE OR CREATE NEW
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesView
