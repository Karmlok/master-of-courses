'use client'

import { useState, useEffect } from 'react'
import { X, Search, Loader2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lesson {
  id: string
  title: string
  status: string
  module: {
    title: string
    course: { subject: string; classYear?: number; classSection?: string }
  }
}

interface LinkLessonModalProps {
  phaseTitle: string
  onLink: (lesson: Lesson | null, customTitle: string) => Promise<void>
  onClose: () => void
}

export function LinkLessonModal({ phaseTitle, onLink, onClose }: LinkLessonModalProps) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Lesson | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<'existing' | 'manual'>('existing')

  useEffect(() => {
    fetch('/api/lessons')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setLessons(json.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = lessons.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.module.course.subject.toLowerCase().includes(search.toLowerCase())
  )

  async function handleConfirm() {
    if (mode === 'existing' && !selected) return
    if (mode === 'manual' && !customTitle.trim()) return
    setSaving(true)
    await onLink(mode === 'existing' ? selected : null, mode === 'manual' ? customTitle.trim() : selected!.title)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[#1A1A2E]">Aggiungi lezione alla fase</h2>
            <p className="text-xs text-gray-500 mt-0.5">{phaseTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Switcher */}
        <div className="flex border-b border-gray-100 px-6 shrink-0">
          {(['existing', 'manual'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'py-3 px-2 mr-4 text-sm font-medium border-b-2 transition-colors',
                mode === m ? 'border-[#534AB7] text-[#534AB7]' : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {m === 'existing' ? 'Lezione esistente' : 'Titolo manuale'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {mode === 'existing' && (
            <>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per titolo o materia..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-[#534AB7]" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  {lessons.length === 0
                    ? 'Nessuna lezione trovata. Crea prima una lezione nei tuoi corsi.'
                    : 'Nessun risultato per questa ricerca.'}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filtered.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelected(lesson)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-xl border-2 transition-all',
                        selected?.id === lesson.id
                          ? 'border-[#534AB7] bg-[#EEEDFE]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      )}
                    >
                      <p className={cn('text-sm font-medium', selected?.id === lesson.id ? 'text-[#534AB7]' : 'text-[#1A1A2E]')}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <BookOpen size={11} />
                        {lesson.module.course.subject} · {lesson.module.title}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {mode === 'manual' && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-gray-500">
                Inserisci un titolo libero per questa lezione nella fase — non sarà collegata a nessuna lezione esistente.
              </p>
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="es. Introduzione al tema, Laboratorio pratico..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || (mode === 'existing' && !selected) || (mode === 'manual' && !customTitle.trim())}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Collega lezione
          </button>
        </div>
      </div>
    </div>
  )
}
