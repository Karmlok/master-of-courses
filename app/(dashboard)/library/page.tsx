'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BookMarked, Search, Download, Loader2, BookOpen, Users } from 'lucide-react'

const METHODOLOGY_LABELS: Record<string, string> = {
  FIVE_E: '5E', LAB: 'Lab', STANDARD: 'Standard', FLIPPED: 'Flipped',
}
const METHODOLOGY_COLORS: Record<string, string> = {
  FIVE_E: '#534AB7', LAB: '#1D9E75', STANDARD: '#185FA5', FLIPPED: '#BA7517',
}
const TYPE_EMOJI: Record<string, string> = {
  PIANO: '📋', SPIEGAZIONE: '📖', ESERCIZI: '✏️', VERIFICA: '📝',
  SCHEDA: '📄', DIAPOSITIVE: '🖥️', COMPITO: '🏠', SIMULATION: '▶️',
}

const GRADES = ['1', '2', '3', '4', '5']

interface LibraryLesson {
  id: string
  title: string
  subject: string
  classYear: number
  schoolType: string
  methodology: string
  importCount: number
  publishedAt: string | null
  isOwn: boolean
  author: string
  activityCount: number
  activityTypes: string[]
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function LibraryPage() {
  const router = useRouter()
  const [lessons, setLessons] = useState<LibraryLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [sort, setSort] = useState<'recent' | 'popular'>('recent')
  const [importingId, setImportingId] = useState<string | null>(null)
  const [confirmLesson, setConfirmLesson] = useState<LibraryLesson | null>(null)

  const fetchLessons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort })
      if (search) params.set('search', search)
      if (subjectFilter) params.set('subject', subjectFilter)
      if (gradeFilter) params.set('grade', gradeFilter)
      const res = await fetch(`/api/library?${params}`)
      const json = await res.json()
      if (json.success) setLessons(json.data)
    } finally {
      setLoading(false)
    }
  }, [search, subjectFilter, gradeFilter, sort])

  useEffect(() => {
    const t = setTimeout(fetchLessons, 300)
    return () => clearTimeout(t)
  }, [fetchLessons])

  async function handleImport(lesson: LibraryLesson) {
    setImportingId(lesson.id)
    setConfirmLesson(null)
    try {
      const res = await fetch(`/api/library/${lesson.id}/import`, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        router.push(`/lessons/${json.data.id}`)
      }
    } finally {
      setImportingId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BookMarked size={24} className="text-[#534AB7]" />
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Libreria delle lezioni</h1>
        </div>
        <p className="text-gray-500 text-sm ml-9">
          Scopri e importa lezioni create dalla community dei docenti
        </p>
      </div>

      {/* Filtri */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Ricerca */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca lezione..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
          />
        </div>

        {/* Materia */}
        <input
          type="text"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          placeholder="Materia..."
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] w-36"
        />

        {/* Classe */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
        >
          <option value="">Tutte le classi</option>
          {GRADES.map((g) => <option key={g} value={g}>{g}ª</option>)}
        </select>

        {/* Ordinamento */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          {(['recent', 'popular'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                sort === s ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'recent' ? 'Recenti' : 'Popolari'}
            </button>
          ))}
        </div>
      </div>

      {/* Risultati */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          Caricamento...
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Nessuna lezione trovata</p>
          <p className="text-gray-400 text-sm mt-1">
            Prova a modificare i filtri, o pubblica tu la prima!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              {/* Titolo + badge materia */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-semibold text-[#1A1A2E] leading-snug line-clamp-2">
                    {lesson.title}
                  </h3>
                  {lesson.isOwn && (
                    <span className="shrink-0 text-xs bg-[#EEEDFE] text-[#534AB7] px-2 py-0.5 rounded-full font-medium">
                      Tua
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {lesson.subject}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {lesson.classYear}ª
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: METHODOLOGY_COLORS[lesson.methodology] ?? '#534AB7' }}
                  >
                    {METHODOLOGY_LABELS[lesson.methodology] ?? lesson.methodology}
                  </span>
                </div>
              </div>

              {/* Attività */}
              {lesson.activityTypes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {lesson.activityTypes.map((t) => (
                    <span key={t} className="text-xs text-gray-400" title={t}>
                      {TYPE_EMOJI[t] ?? '📄'}
                    </span>
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    {lesson.activityCount} {lesson.activityCount === 1 ? 'attività' : 'attività'}
                  </span>
                </div>
              )}

              {/* Footer: autore + data + import */}
              <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs font-medium text-gray-700">{lesson.author}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{formatDate(lesson.publishedAt)}</span>
                    {lesson.importCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users size={10} />
                        {lesson.importCount}
                      </span>
                    )}
                  </div>
                </div>

                {lesson.isOwn ? (
                  <span className="text-xs text-[#534AB7] bg-[#EEEDFE] px-3 py-1.5 rounded-lg font-medium">
                    Tua lezione
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmLesson(lesson)}
                    disabled={importingId === lesson.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#534AB7] hover:bg-[#3C3489] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {importingId === lesson.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Download size={12} />
                    )}
                    Importa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale conferma importazione */}
      {confirmLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-[#1A1A2E] mb-2">
              Importa lezione
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Vuoi importare <strong>&ldquo;{confirmLesson.title}&rdquo;</strong> di {confirmLesson.author}?
              Verrà aggiunta alle tue lezioni come copia modificabile.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmLesson(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={() => handleImport(confirmLesson)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#534AB7] hover:bg-[#3C3489] rounded-lg"
              >
                <Download size={14} />
                Importa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
