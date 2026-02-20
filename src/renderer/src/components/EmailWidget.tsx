import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiMailSendLine,
  RiCloseLine,
  RiUser3Line,
  RiTimeLine,
  RiMailCheckLine,
  RiArrowLeftLine,
  RiAttachment2
} from 'react-icons/ri'

interface Attachment {
  filename: string
  mimeType: string
  size: number
}

interface ParsedEmail {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  body: string
  attachments: Attachment[]
}

export default function EmailWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [emails, setEmails] = useState<ParsedEmail[]>([])
  const [selectedEmail, setSelectedEmail] = useState<ParsedEmail | null>(null)

  useEffect(() => {
    const handleEvent = (event: any) => {
      const { emails } = event.detail

      if (emails && emails.length > 0) {
        setEmails(emails)
        setIsVisible(true)
        setSelectedEmail(null) 
      } else {
        setEmails([])
        setIsVisible(true)
      }
    }

    window.addEventListener('show-emails', handleEvent)
    return () => window.removeEventListener('show-emails', handleEvent)
  }, [])

  if (!isVisible) return null

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const cleanSender = (from: string) => from.replace(/<.*>/, '').trim()

  return (
    <div className="fixed inset-0 z-9050 flex items-center justify-center bg-black/90 backdrop-blur-md p-10 animate-in fade-in zoom-in duration-300">
      <div className="relative w-full max-w-5xl h-[85vh] border-2 border-emerald-500/50 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.15)] bg-zinc-950 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/50 shrink-0 z-10">
          <div className="flex items-center gap-4">
            {selectedEmail ? (
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-3 bg-white/5 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 rounded-xl transition-all"
              >
                <RiArrowLeftLine size={24} />
              </button>
            ) : (
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <RiMailSendLine className="text-emerald-400" size={24} />
              </div>
            )}

            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] text-zinc-200">
                {selectedEmail ? 'SECURE MESSAGE VIEW' : 'SECURE INBOX LINK'}
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
                {selectedEmail
                  ? cleanSender(selectedEmail.from)
                  : `INTERCEPTED BY IRIS // ${emails.length} MESSAGES`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 hover:border-red-500 rounded-xl transition-all"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!selectedEmail && (
              <motion.div
                key="inbox"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 overflow-y-auto scrollbar-small p-6"
              >
                {emails.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4">
                    <RiMailCheckLine size={48} className="opacity-20" />
                    <p className="text-xs tracking-widest opacity-50 font-mono">INBOX IS EMPTY</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className="group p-5 bg-white-[0.02] hover:bg-white-[0.05] border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono bg-emerald-400/10 px-3 py-1.5 rounded-md border border-emerald-400/20 max-w-[60%]">
                              <RiUser3Line size={14} className="shrink-0" />
                              <span className="truncate">{cleanSender(email.from)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {email.attachments.length > 0 && (
                                <div className="flex items-center gap-1 text-emerald-500/70">
                                  <RiAttachment2 size={14} />
                                  <span className="text-[10px] font-mono">
                                    {email.attachments.length}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-mono uppercase">
                                <RiTimeLine size={12} />
                                <span>
                                  {new Date(email.date).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-zinc-200 font-bold text-base mb-1 group-hover:text-white transition-colors truncate">
                              {email.subject}
                            </h3>
                            <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                              {email.preview}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {selectedEmail && (
              <motion.div
                key="open-email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0 flex flex-col bg-zinc-900/50"
              >
                <div className="p-6 border-b border-white/5 shrink-0 bg-black/20">
                  <h1 className="text-2xl font-bold text-white mb-4">{selectedEmail.subject}</h1>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-zinc-300">
                        <span className="text-zinc-500">From:</span> {selectedEmail.from}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {new Date(selectedEmail.date).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {selectedEmail.attachments.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-3">
                      {selectedEmail.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-lg hover:border-emerald-500/50 transition-colors cursor-default"
                        >
                          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-md">
                            <RiAttachment2 size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-zinc-200 font-bold max-w-37.5 truncate">
                              {file.filename}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">
                              {formatBytes(file.size)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 bg-white overflow-hidden">
                  <iframe
                    title="email-body"
                    srcDoc={selectedEmail.body}
                    className="w-full h-full bg-white rounded-lg border-0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
