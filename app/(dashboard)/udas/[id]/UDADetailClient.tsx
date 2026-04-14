'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Pencil, Trash2, FileDown, Sparkles, Loader2, ChevronDown, ChevronUp,
  Clock, BookOpen, Calendar, Plus, ExternalLink, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { UDAExporter } from '@/components/uda/UDAExporter'
import { LinkLessonModal } from '@/components/uda/LinkLessonModal'
import { cn } from '@/lib/utils'

// ─── Tipi ─────────────────────────────────────────────────────────────────────

interface PhaseLesson {
  id: string
  title: string
  notes: string | null
  position: number
  lesson: { id: string; title: string; status: string } | null
}

interface Phase {
  id: string
  title: string
  description: string | null
  hours: number
  methodology: string | null
  tools: string | null
  position: number
  lessons: PhaseLesson[]
}

interface UDA {
  id: string
  title: string
  subjects: string[]
  classYear: number
  classSection: string
  schoolType: string
  period: string | null
  totalHours: number
  finalProduct: string | null
  europeanCompetences: string | null
  learningGoals: string | null
  knowledgeSkills: string | null
  evaluationCriteria: string | null
  evaluationRubric: string | null
  status: 'DRAFT' | 'READY' | 'PUBLISHED'
  createdAt: string
  phases: Phase[]
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: 'DRAFT' | 'READY' | 'PUBLISHED'; label: string; className: string }[] = [
  { value: 'DRAFT',     label: 'Bozza',      className: 'bg-gray-100 text-gray-600' },
  { value: 'READY',     label: 'Pronta',     className: 'bg-green-100 text-green-700' },
  { value: 'PUBLISHED', label: 'Pubblicata', className: 'bg-[#EEEDFE] text-[#534AB7]' },
]

const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
  'bg-emerald-100 text-emerald-700', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700', 'bg-cyan-100 text-cyan-700',
]

// ─── Sezione collassabile ──────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-base font-semibold text-[#1A1A2E]">{title}</h2>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-gray-100">{children}</div>}
    </div>
  )
}

// ─── Sotto-sezione curricolare ─────────────────────────────────────────────────

function CurricularSection({
  label, value, field, udaId, udaTitle, subjects, classYear, section, onUpdate,
}: {
  label: string; value: string | null; field: string; udaId: string
  udaTitle: string; subjects: string[]; classYear: number
  section: 'competences' | 'goals' | 'knowledge'
  onUpdate: (field: string, value: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value ?? '')
  const [loading, setLoading] = useState(false)

  async function regenerate() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityTypes: ['UDA_CURRICULAR'], udaTitle, subjects, classYear, udaSection: section }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let content = ''
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; content += decoder.decode(value) } }
      setText(content)
      onUpdate(field, content)
      await fetch(`/api/udas/${udaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: content }) })
      toast.success('Sezione aggiornata')
    } catch { toast.error('Errore nella rigenerazione') }
    finally { setLoading(false) }
  }

  async function saveEdit() {
    await fetch(`/api/udas/${udaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: text }) })
    onUpdate(field, text)
    setEditing(false)
    toast.success('Salvato')
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <div className="flex gap-2">
          <button onClick={regenerate} disabled={loading} className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline disabled:opacity-50">
            {loading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
            Rigenera con IA
          </button>
          <button onClick={() => setEditing((e) => !e)} className="text-xs text-gray-500 hover:underline">
            {editing ? 'Annulla' : 'Modifica'}
          </button>
        </div>
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none font-mono" />
          <button onClick={saveEdit} className="px-4 py-1.5 bg-[#534AB7] text-white text-xs font-semibold rounded-lg">Salva</button>
        </div>
      ) : text ? (
        <div className="prose prose-sm max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: text }} />
      ) : (
        <p className="text-sm text-gray-400 italic">Non ancora generato</p>
      )}
    </div>
  )
}

// ─── Componente principale ────────────────────────────────────────────────────

export function UDADetailClient({ uda: initial }: { uda: UDA }) {
  const router = useRouter()
  const [uda, setUda] = useState(initial)
  const [showExporter, setShowExporter] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  // Modal collegamento lezione
  const [linkPhaseId, setLinkPhaseId] = useState<string | null>(null)
  const linkPhase = uda.phases.find((p) => p.id === linkPhaseId) ?? null

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === uda.status)!

  function updateField(field: string, value: string) {
    setUda((prev) => ({ ...prev, [field]: value }))
  }

  // ── Cambio stato ─────────────────────────────────────────────────────────────

  async function changeStatus(newStatus: 'DRAFT' | 'READY' | 'PUBLISHED') {
    if (newStatus === uda.status) { setShowStatusMenu(false); return }
    setChangingStatus(true)
    setShowStatusMenu(false)
    try {
      const res = await fetch(`/api/udas/${uda.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setUda((prev) => ({ ...prev, status: newStatus }))
      toast.success(`Stato aggiornato: ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}`)
    } catch {
      toast.error('Errore durante il cambio stato')
    } finally {
      setChangingStatus(false)
    }
  }

  // ── Elimina UDA ───────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!confirm("Eliminare questa UDA? L'operazione non può essere annullata.")) return
    const res = await fetch(`/api/udas/${uda.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('UDA eliminata'); router.push('/udas') }
    else toast.error("Errore durante l'eliminazione")
  }

  // ── Elimina fase ──────────────────────────────────────────────────────────────

  async function handleDeletePhase(phaseId: string) {
    if (!confirm('Eliminare questa fase?')) return
    const res = await fetch(`/api/udas/${uda.id}/phases/${phaseId}`, { method: 'DELETE' })
    if (res.ok) {
      setUda((prev) => ({ ...prev, phases: prev.phases.filter((p) => p.id !== phaseId) }))
      toast.success('Fase eliminata')
    } else toast.error("Errore durante l'eliminazione")
  }

  // ── Collega lezione alla fase ─────────────────────────────────────────────────

  async function handleLinkLesson(
    lesson: { id: string; title: string; status: string } | null,
    title: string
  ) {
    if (!linkPhaseId) return
    const res = await fetch(`/api/udas/${uda.id}/phases/${linkPhaseId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: lesson?.id ?? null, title }),
    })
    const json = await res.json()
    if (!json.success) { toast.error('Errore nel collegamento'); return }
    const newLink: PhaseLesson = { id: json.link.id, title, notes: null, position: 0, lesson: lesson ? { id: lesson.id, title: lesson.title, status: lesson.status } : null }
    setUda((prev) => ({
      ...prev,
      phases: prev.phases.map((p) =>
        p.id === linkPhaseId ? { ...p, lessons: [...p.lessons, newLink] } : p
      ),
    }))
    toast.success('Lezione collegata')
    setLinkPhaseId(null)
  }

  // ── Rimuovi collegamento lezione ──────────────────────────────────────────────

  async function handleUnlinkLesson(phaseId: string, phaseLessonId: string) {
    const res = await fetch(`/api/udas/${uda.id}/phases/${phaseId}/lessons`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phaseLessonId }),
    })
    if (res.ok) {
      setUda((prev) => ({
        ...prev,
        phases: prev.phases.map((p) =>
          p.id === phaseId ? { ...p, lessons: p.lessons.filter((l) => l.id !== phaseLessonId) } : p
        ),
      }))
      toast.success('Collegamento rimosso')
    } else toast.error('Errore durante la rimozione')
  }

  // ── Rigenera rubrica ──────────────────────────────────────────────────────────

  async function regenerateRubric() {
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityTypes: ['UDA_RUBRIC'], udaTitle: uda.title, subjects: uda.subjects, classYear: uda.classYear, finalProduct: uda.finalProduct }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let content = ''
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; content += decoder.decode(value) } }
      setUda((prev) => ({ ...prev, evaluationRubric: content }))
      await fetch(`/api/udas/${uda.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evaluationRubric: content }) })
      toast.success('Rubrica rigenerata')
    } catch { toast.error('Errore nella rigenerazione') }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1A1A2E]">{uda.title}</h1>

              {/* Badge stato cliccabile */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu((s) => !s)}
                  disabled={changingStatus}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-80',
                    currentStatus.className
                  )}
                >
                  {changingStatus ? <Loader2 size={10} className="animate-spin" /> : null}
                  {currentStatus.label}
                  <ChevronDown size={10} />
                </button>

                {showStatusMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[130px]">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => changeStatus(opt.value)}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-2',
                          uda.status === opt.value ? 'opacity-50 cursor-default' : ''
                        )}
                      >
                        <span className={cn('w-2 h-2 rounded-full', opt.value === 'DRAFT' ? 'bg-gray-400' : opt.value === 'READY' ? 'bg-green-500' : 'bg-[#534AB7]')} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {uda.subjects.map((s, i) => (
                <span key={s} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>{s}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><BookOpen size={13} />{uda.classYear}ª {uda.classSection} — {uda.schoolType}</span>
              {uda.period && <span className="flex items-center gap-1.5"><Calendar size={13} />{uda.period}</span>}
              <span className="flex items-center gap-1.5"><Clock size={13} />{uda.totalHours}h totali</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowExporter(true)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg transition-colors">
              <FileDown size={14} />Esporta Word
            </button>
            <button onClick={() => router.push(`/udas/${uda.id}/edit`)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg transition-colors">
              <Pencil size={14} />Modifica
            </button>
            <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Chiudi menu stato cliccando fuori */}
      {showStatusMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
      )}

      {/* ── Sezione 1: Riferimenti curricolari ── */}
      <Section title="Riferimenti curricolari">
        {[
          { label: 'Competenze chiave europee', value: uda.europeanCompetences, field: 'europeanCompetences', section: 'competences' as const },
          { label: 'Traguardi di competenza', value: uda.learningGoals, field: 'learningGoals', section: 'goals' as const },
          { label: 'Obiettivi di apprendimento', value: uda.knowledgeSkills, field: 'knowledgeSkills', section: 'knowledge' as const },
        ].map((s, i) => (
          <div key={s.field}>
            {i > 0 && <hr className="my-4 border-gray-100" />}
            <CurricularSection {...s} udaId={uda.id} udaTitle={uda.title} subjects={uda.subjects} classYear={uda.classYear} onUpdate={updateField} />
          </div>
        ))}
      </Section>

      {/* ── Sezione 2: Fasi di lavoro ── */}
      <Section title={`Fasi di lavoro (${uda.phases.length})`}>
        {uda.phases.length === 0 ? (
          <p className="text-sm text-gray-400 italic mt-4">Nessuna fase definita</p>
        ) : (
          <div className="space-y-4 mt-4">
            {uda.phases.map((phase, i) => (
              <div key={phase.id} className="border border-gray-200 rounded-xl p-4">
                {/* Intestazione fase */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#534AB7] bg-[#EEEDFE] px-2 py-0.5 rounded-full">{i + 1}</span>
                    <h3 className="text-sm font-semibold text-[#1A1A2E]">{phase.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={11} />{phase.hours}h</span>
                    {phase.methodology && <span className="px-2 py-0.5 bg-gray-100 rounded-full">{phase.methodology}</span>}
                    <button onClick={() => handleDeletePhase(phase.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                </div>

                {phase.description && <p className="text-sm text-gray-600 mb-3">{phase.description}</p>}

                {/* Lezioni collegate */}
                {phase.lessons.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {phase.lessons.map((pl) => (
                      <div key={pl.id} className="flex items-center justify-between gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] shrink-0" />
                          {pl.lesson ? (
                            <a href={`/lessons/${pl.lesson.id}`} className="hover:text-[#534AB7] hover:underline flex items-center gap-1 font-medium">
                              {pl.lesson.title} <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="font-medium">{pl.title}</span>
                          )}
                          {pl.notes && <span className="text-gray-400">— {pl.notes}</span>}
                        </div>
                        <button onClick={() => handleUnlinkLesson(phase.id, pl.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pulsante aggiungi lezione */}
                <button
                  onClick={() => setLinkPhaseId(phase.id)}
                  className="flex items-center gap-1.5 text-xs text-[#534AB7] hover:underline"
                >
                  <Plus size={12} />
                  Aggiungi lezione
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => router.push(`/udas/${uda.id}/edit`)} className="mt-4 flex items-center gap-1.5 text-sm text-[#534AB7] hover:underline">
          <Pencil size={13} />
          Modifica fasi
        </button>
      </Section>

      {/* ── Sezione 3: Valutazione ── */}
      <Section title="Valutazione">
        <div className="mt-4 space-y-4">
          {uda.evaluationCriteria && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Criteri di valutazione</h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">{uda.evaluationCriteria}</div>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Rubrica valutativa</h3>
              <button onClick={regenerateRubric} className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline">
                <Sparkles size={11} />Rigenera con IA
              </button>
            </div>
            {uda.evaluationRubric ? (
              <div className="overflow-x-auto text-sm" dangerouslySetInnerHTML={{ __html: uda.evaluationRubric }} />
            ) : (
              <p className="text-sm text-gray-400 italic">Rubrica non ancora generata</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Sezione 4: Prodotto finale ── */}
      {uda.finalProduct && (
        <Section title="Prodotto finale atteso">
          <p className="text-sm text-gray-700 mt-4">{uda.finalProduct}</p>
        </Section>
      )}

      {/* ── Modal esporter ── */}
      {showExporter && <UDAExporter uda={uda} onClose={() => setShowExporter(false)} />}

      {/* ── Modal collega lezione ── */}
      {linkPhaseId && linkPhase && (
        <LinkLessonModal
          phaseTitle={linkPhase.title}
          onLink={handleLinkLesson}
          onClose={() => setLinkPhaseId(null)}
        />
      )}
    </div>
  )
}
