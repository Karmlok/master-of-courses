'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Pencil, Trash2, FileDown, Sparkles, Loader2, ChevronDown, ChevronUp,
  Clock, BookOpen, Calendar, Plus, ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { UDAExporter } from '@/components/uda/UDAExporter'

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

const STATUS_CONFIG = {
  DRAFT:     { label: 'Bozza',      className: 'bg-gray-100 text-gray-600' },
  READY:     { label: 'Pronta',     className: 'bg-green-100 text-green-700' },
  PUBLISHED: { label: 'Pubblicata', className: 'bg-[#EEEDFE] text-[#534AB7]' },
}

const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
  'bg-emerald-100 text-emerald-700', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700', 'bg-cyan-100 text-cyan-700',
]

// ─── Sezione collassabile ──────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
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

// ─── Sotto-sezione curricolare ──────────────────────────────────────────────────

function CurricularSection({
  label, value, field, udaId, udaTitle, subjects, classYear,
  section, onUpdate,
}: {
  label: string
  value: string | null
  field: string
  udaId: string
  udaTitle: string
  subjects: string[]
  classYear: number
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
        body: JSON.stringify({
          activityTypes: ['UDA_CURRICULAR'],
          udaTitle, subjects, classYear, udaSection: section,
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let content = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          content += decoder.decode(value)
        }
      }
      setText(content)
      onUpdate(field, content)
      await fetch(`/api/udas/${udaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: content }),
      })
      toast.success('Sezione aggiornata')
    } catch {
      toast.error('Errore nella rigenerazione')
    } finally {
      setLoading(false)
    }
  }

  async function saveEdit() {
    await fetch(`/api/udas/${udaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: text }),
    })
    onUpdate(field, text)
    setEditing(false)
    toast.success('Salvato')
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <div className="flex gap-2">
          <button
            onClick={regenerate}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline disabled:opacity-50"
          >
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
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none font-mono"
          />
          <button onClick={saveEdit} className="px-4 py-1.5 bg-[#534AB7] text-white text-xs font-semibold rounded-lg">
            Salva
          </button>
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

  const status = STATUS_CONFIG[uda.status]

  function updateField(field: string, value: string) {
    setUda((prev) => ({ ...prev, [field]: value }))
  }

  async function handleDelete() {
    if (!confirm('Eliminare questa UDA? L\'operazione non può essere annullata.')) return
    const res = await fetch(`/api/udas/${uda.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('UDA eliminata')
      router.push('/udas')
    } else {
      toast.error('Errore durante l\'eliminazione')
    }
  }

  async function handleDeletePhase(phaseId: string) {
    if (!confirm('Eliminare questa fase?')) return
    const res = await fetch(`/api/udas/${uda.id}/phases/${phaseId}`, { method: 'DELETE' })
    if (res.ok) {
      setUda((prev) => ({ ...prev, phases: prev.phases.filter((p) => p.id !== phaseId) }))
      toast.success('Fase eliminata')
    } else {
      toast.error('Errore durante l\'eliminazione')
    }
  }

  async function regenerateRubric() {
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTypes: ['UDA_RUBRIC'],
          udaTitle: uda.title, subjects: uda.subjects,
          classYear: uda.classYear, finalProduct: uda.finalProduct,
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let content = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          content += decoder.decode(value)
        }
      }
      setUda((prev) => ({ ...prev, evaluationRubric: content }))
      await fetch(`/api/udas/${uda.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationRubric: content }),
      })
      toast.success('Rubrica rigenerata')
    } catch {
      toast.error('Errore nella rigenerazione')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#1A1A2E]">{uda.title}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
                {status.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {uda.subjects.map((s, i) => (
                <span key={s} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>
                  {s}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><BookOpen size={13} />{uda.classYear}ª {uda.classSection} — {uda.schoolType}</span>
              {uda.period && <span className="flex items-center gap-1.5"><Calendar size={13} />{uda.period}</span>}
              <span className="flex items-center gap-1.5"><Clock size={13} />{uda.totalHours}h totali</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowExporter(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg transition-colors"
            >
              <FileDown size={14} />
              Esporta Word
            </button>
            <button
              onClick={() => router.push(`/udas/${uda.id}/edit`)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg transition-colors"
            >
              <Pencil size={14} />
              Modifica
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Sezione 1: Riferimenti curricolari ── */}
      <Section title="Riferimenti curricolari">
        <CurricularSection
          label="Competenze chiave europee"
          value={uda.europeanCompetences}
          field="europeanCompetences"
          udaId={uda.id}
          udaTitle={uda.title}
          subjects={uda.subjects}
          classYear={uda.classYear}
          section="competences"
          onUpdate={updateField}
        />
        <hr className="my-4 border-gray-100" />
        <CurricularSection
          label="Traguardi di competenza"
          value={uda.learningGoals}
          field="learningGoals"
          udaId={uda.id}
          udaTitle={uda.title}
          subjects={uda.subjects}
          classYear={uda.classYear}
          section="goals"
          onUpdate={updateField}
        />
        <hr className="my-4 border-gray-100" />
        <CurricularSection
          label="Obiettivi di apprendimento"
          value={uda.knowledgeSkills}
          field="knowledgeSkills"
          udaId={uda.id}
          udaTitle={uda.title}
          subjects={uda.subjects}
          classYear={uda.classYear}
          section="knowledge"
          onUpdate={updateField}
        />
      </Section>

      {/* ── Sezione 2: Fasi di lavoro ── */}
      <Section title={`Fasi di lavoro (${uda.phases.length})`}>
        {uda.phases.length === 0 ? (
          <p className="text-sm text-gray-400 italic mt-4">Nessuna fase definita</p>
        ) : (
          <div className="space-y-4 mt-4">
            {uda.phases.map((phase, i) => (
              <div key={phase.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#534AB7] bg-[#EEEDFE] px-2 py-0.5 rounded-full">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-[#1A1A2E]">{phase.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={11} />{phase.hours}h</span>
                    {phase.methodology && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">{phase.methodology}</span>
                    )}
                    <button onClick={() => handleDeletePhase(phase.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {phase.description && (
                  <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                )}
                {phase.lessons.length > 0 && (
                  <div className="space-y-1">
                    {phase.lessons.map((pl) => (
                      <div key={pl.id} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] shrink-0" />
                        {pl.lesson ? (
                          <a href={`/lessons/${pl.lesson.id}`} className="hover:text-[#534AB7] hover:underline flex items-center gap-1">
                            {pl.lesson.title} <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span>{pl.title}</span>
                        )}
                        {pl.notes && <span className="text-gray-400">— {pl.notes}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => router.push(`/udas/${uda.id}/edit`)}
          className="mt-4 flex items-center gap-1.5 text-sm text-[#534AB7] hover:underline"
        >
          <Plus size={14} />
          Gestisci fasi
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
              <button
                onClick={regenerateRubric}
                className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline"
              >
                <Sparkles size={11} />
                Rigenera con IA
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

      {/* ── Exporter ── */}
      {showExporter && (
        <UDAExporter uda={uda} onClose={() => setShowExporter(false)} />
      )}
    </div>
  )
}
