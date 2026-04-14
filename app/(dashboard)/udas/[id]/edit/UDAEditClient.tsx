'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, Check, ChevronLeft, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Phase {
  id: string
  title: string
  description: string | null
  hours: number
  methodology: string | null
  tools: string | null
  position: number
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
  phases: Phase[]
}

const METHODOLOGIES = [
  'Frontale', 'Laboratoriale', 'Cooperativa', 'Flipped', 'Problem solving',
  'Brainstorming', 'Ricerca', 'Peer learning', 'Project work',
]

const TABS = ['Dati generali', 'Fasi di lavoro'] as const
type Tab = typeof TABS[number]

export function UDAEditClient({ uda: initial }: { uda: UDA }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('Dati generali')
  const [saving, setSaving] = useState(false)

  // Dati generali
  const [title, setTitle] = useState(initial.title)
  const [subjects, setSubjects] = useState<string[]>(initial.subjects)
  const [subjectInput, setSubjectInput] = useState('')
  const [classYear, setClassYear] = useState(String(initial.classYear))
  const [classSection, setClassSection] = useState(initial.classSection)
  const [schoolType, setSchoolType] = useState(initial.schoolType)
  const [period, setPeriod] = useState(initial.period ?? '')
  const [totalHours, setTotalHours] = useState(String(initial.totalHours))
  const [finalProduct, setFinalProduct] = useState(initial.finalProduct ?? '')

  // Fasi
  const [phases, setPhases] = useState<Phase[]>(initial.phases)
  const [savingPhase, setSavingPhase] = useState<string | null>(null)
  const [deletingPhase, setDeletingPhase] = useState<string | null>(null)

  // ── Soggetti ────────────────────────────────────────────────────────────────

  function addSubject() {
    const s = subjectInput.trim()
    if (s && !subjects.includes(s)) {
      setSubjects((p) => [...p, s])
      setSubjectInput('')
    }
  }

  // ── Salva dati generali ──────────────────────────────────────────────────────

  async function saveGeneral() {
    setSaving(true)
    try {
      const res = await fetch(`/api/udas/${initial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, subjects,
          classYear: Number(classYear),
          classSection, schoolType,
          period: period || null,
          totalHours: Number(totalHours),
          finalProduct: finalProduct || null,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success('Modifiche salvate')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore nel salvataggio')
    } finally {
      setSaving(false)
    }
  }

  // ── Fasi: aggiorna campo ────────────────────────────────────────────────────

  function updatePhaseField(id: string, field: keyof Phase, value: string | number) {
    setPhases((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p))
  }

  // ── Fasi: salva singola fase ────────────────────────────────────────────────

  async function savePhase(phase: Phase) {
    setSavingPhase(phase.id)
    try {
      // Fase nuova (id non ancora nel DB) vs esistente
      const isNew = phase.id.startsWith('local-')
      if (isNew) {
        const res = await fetch(`/api/udas/${initial.id}/phases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: phase.title, hours: phase.hours,
            methodology: phase.methodology, description: phase.description,
            tools: phase.tools, position: phase.position,
          }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
        // Rimpiazza id locale con id DB
        setPhases((prev) => prev.map((p) => p.id === phase.id ? { ...p, id: json.phase.id } : p))
      } else {
        const res = await fetch(`/api/udas/${initial.id}/phases/${phase.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: phase.title, hours: phase.hours,
            methodology: phase.methodology, description: phase.description,
            tools: phase.tools, position: phase.position,
          }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
      }
      toast.success('Fase salvata')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore nel salvataggio fase')
    } finally {
      setSavingPhase(null)
    }
  }

  // ── Fasi: elimina ───────────────────────────────────────────────────────────

  async function deletePhase(phase: Phase) {
    if (!confirm('Eliminare questa fase?')) return
    if (phase.id.startsWith('local-')) {
      setPhases((prev) => prev.filter((p) => p.id !== phase.id))
      return
    }
    setDeletingPhase(phase.id)
    try {
      const res = await fetch(`/api/udas/${initial.id}/phases/${phase.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Errore eliminazione')
      setPhases((prev) => prev.filter((p) => p.id !== phase.id))
      toast.success('Fase eliminata')
    } catch {
      toast.error('Errore durante l\'eliminazione')
    } finally {
      setDeletingPhase(null)
    }
  }

  // ── Aggiungi fase ────────────────────────────────────────────────────────────

  function addPhase() {
    const n = phases.length + 1
    setPhases((prev) => [...prev, {
      id: `local-${Date.now()}`,
      title: `Fase ${n}`,
      hours: 2,
      methodology: 'Frontale',
      description: '',
      tools: null,
      position: n - 1,
    }])
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/udas/${initial.id}`)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Modifica UDA</h1>
          <p className="text-sm text-gray-500 truncate max-w-md">{title}</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab
                ? 'border-[#534AB7] text-[#534AB7]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Dati generali ── */}
      {activeTab === 'Dati generali' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Titolo UDA <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Discipline</label>
            <div className="flex gap-2 mb-2">
              <input
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                placeholder="Aggiungi disciplina..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
              />
              <button type="button" onClick={addSubject} className="px-4 py-2.5 bg-[#534AB7] text-white rounded-lg hover:bg-[#3C3489] transition-colors">
                <Plus size={15} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-[#EEEDFE] text-[#534AB7] text-sm font-medium rounded-full">
                  {s}
                  <button type="button" onClick={() => setSubjects((p) => p.filter((x) => x !== s))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Anno</label>
              <select value={classYear} onChange={(e) => setClassYear(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]">
                {[1,2,3,4,5].map((y) => <option key={y} value={y}>{y}ª</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Sezione</label>
              <input value={classSection} onChange={(e) => setClassSection(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Indirizzo</label>
              <input value={schoolType} onChange={(e) => setSchoolType(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Periodo</label>
              <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="es. Gennaio-Febbraio 2026" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Ore totali</label>
              <input type="number" min={1} value={totalHours} onChange={(e) => setTotalHours(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Prodotto finale atteso</label>
            <textarea value={finalProduct} onChange={(e) => setFinalProduct(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none" />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={saveGeneral}
              disabled={saving || !title || subjects.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Fasi di lavoro ── */}
      {activeTab === 'Fasi di lavoro' && (
        <div className="space-y-4">
          {phases.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              Nessuna fase — aggiungine una
            </div>
          )}

          {phases.map((phase, i) => (
            <div key={phase.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              {/* Intestazione fase */}
              <div className="flex items-center gap-3">
                <GripVertical size={15} className="text-gray-300 shrink-0" />
                <span className="text-xs font-bold text-[#534AB7] bg-[#EEEDFE] px-2 py-0.5 rounded-full shrink-0">{i + 1}</span>
                <input
                  value={phase.title}
                  onChange={(e) => updatePhaseField(phase.id, 'title', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
                <button
                  onClick={() => deletePhase(phase)}
                  disabled={deletingPhase === phase.id}
                  className="text-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  {deletingPhase === phase.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>

              {/* Campi fase */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ore</label>
                  <input
                    type="number" min={1}
                    value={phase.hours}
                    onChange={(e) => updatePhaseField(phase.id, 'hours', Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Metodologia</label>
                  <select
                    value={phase.methodology ?? 'Frontale'}
                    onChange={(e) => updatePhaseField(phase.id, 'methodology', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                  >
                    {METHODOLOGIES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Descrizione attività</label>
                <textarea
                  value={phase.description ?? ''}
                  onChange={(e) => updatePhaseField(phase.id, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Strumenti e risorse</label>
                <input
                  value={phase.tools ?? ''}
                  onChange={(e) => updatePhaseField(phase.id, 'tools', e.target.value)}
                  placeholder="es. Libro di testo, LIM, schede..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>

              {/* Salva singola fase */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => savePhase(phase)}
                  disabled={savingPhase === phase.id}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {savingPhase === phase.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {savingPhase === phase.id ? 'Salvo...' : 'Salva fase'}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addPhase}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[#534AB7] text-[#534AB7] text-sm font-medium rounded-xl hover:bg-[#EEEDFE] transition-colors"
          >
            <Plus size={15} />
            Aggiungi fase
          </button>

          {phases.length > 0 && (
            <p className="text-xs text-gray-400 text-right">
              Totale ore fasi: <strong>{phases.reduce((s, p) => s + p.hours, 0)}h</strong> / {totalHours}h previste
            </p>
          )}
        </div>
      )}
    </div>
  )
}
