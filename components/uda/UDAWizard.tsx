'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Sparkles, ChevronLeft, ChevronRight, Loader2, Check, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Tipi ────────────────────────────────────────────────────────────────────

interface Phase {
  id: string // locale (non DB)
  title: string
  hours: number
  methodology: string
  description: string
}

const STEPS = ['Dati generali', 'Curricolo', 'Fasi', 'Valutazione']

const METHODOLOGIES = [
  'Frontale', 'Laboratoriale', 'Cooperativa', 'Flipped', 'Problem solving',
  'Brainstorming', 'Ricerca', 'Peer learning', 'Project work',
]

// ─── Componente ───────────────────────────────────────────────────────────────

export function UDAWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1
  const [title, setTitle] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState('')
  const [classYear, setClassYear] = useState('3')
  const [classSection, setClassSection] = useState('')
  const [schoolType, setSchoolType] = useState('Liceo Scientifico')
  const [period, setPeriod] = useState('')
  const [totalHours, setTotalHours] = useState('10')
  const [finalProduct, setFinalProduct] = useState('')

  // Step 2 — curricolo
  const [europeanCompetences, setEuropeanCompetences] = useState('')
  const [learningGoals, setLearningGoals] = useState('')
  const [knowledgeSkills, setKnowledgeSkills] = useState('')
  const [loadingSection, setLoadingSection] = useState<string | null>(null)

  // Step 3 — fasi
  const [phases, setPhases] = useState<Phase[]>([])
  const [loadingPhases, setLoadingPhases] = useState(false)

  // Step 4 — valutazione
  const [evaluationCriteria, setEvaluationCriteria] = useState('')
  const [evaluationRubric, setEvaluationRubric] = useState('')
  const [loadingRubric, setLoadingRubric] = useState(false)

  // ── Helper soggetti ──────────────────────────────────────────────────────

  function addSubject() {
    const s = subjectInput.trim()
    if (s && !subjects.includes(s)) {
      setSubjects((prev) => [...prev, s])
      setSubjectInput('')
    }
  }

  function removeSubject(s: string) {
    setSubjects((prev) => prev.filter((x) => x !== s))
  }

  // ── Helper fasi ──────────────────────────────────────────────────────────

  function addPhase() {
    const n = phases.length + 1
    setPhases((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: `Fase ${n}`, hours: 2, methodology: 'Frontale', description: '' },
    ])
  }

  function updatePhase(id: string, field: keyof Phase, value: string | number) {
    setPhases((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p))
  }

  function removePhase(id: string) {
    setPhases((prev) => prev.filter((p) => p.id !== id))
  }

  // ── Generazione AI ───────────────────────────────────────────────────────

  async function generateSection(section: 'competences' | 'goals' | 'knowledge') {
    setLoadingSection(section)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTypes: ['UDA_CURRICULAR'],
          udaTitle: title,
          subjects,
          classYear: Number(classYear),
          schoolType,
          udaSection: section,
        }),
      })
      if (!res.ok) throw new Error('Errore generazione')
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
      if (section === 'competences') setEuropeanCompetences(content)
      else if (section === 'goals') setLearningGoals(content)
      else setKnowledgeSkills(content)
    } catch {
      toast.error('Errore nella generazione')
    } finally {
      setLoadingSection(null)
    }
  }

  async function generatePhases() {
    setLoadingPhases(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTypes: ['UDA_PHASES'],
          udaTitle: title,
          subjects,
          classYear: Number(classYear),
          totalHours: Number(totalHours),
          finalProduct,
        }),
      })
      if (!res.ok) throw new Error('Errore generazione fasi')
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
      // Estrai solo il JSON array, anche se l'AI aggiunge markdown code fences
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Formato risposta non valido')
      const parsed: { title: string; hours: number; methodology: string; description: string }[] = JSON.parse(jsonMatch[0])
      setPhases(parsed.map((p) => ({ ...p, id: crypto.randomUUID() })))
      toast.success(`${parsed.length} fasi generate`)
    } catch {
      toast.error('Errore nel parsing delle fasi. Riprova.')
    } finally {
      setLoadingPhases(false)
    }
  }

  async function generateRubric() {
    setLoadingRubric(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTypes: ['UDA_RUBRIC'],
          udaTitle: title,
          subjects,
          classYear: Number(classYear),
          finalProduct,
        }),
      })
      if (!res.ok) throw new Error('Errore generazione rubrica')
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
      setEvaluationRubric(content)
      toast.success('Rubrica generata')
    } catch {
      toast.error('Errore nella generazione della rubrica')
    } finally {
      setLoadingRubric(false)
    }
  }

  // ── Salvataggio finale ───────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    try {
      // 1. Crea UDA
      const udaRes = await fetch('/api/udas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subjects, classYear, classSection, schoolType, period, totalHours, finalProduct }),
      })
      const udaJson = await udaRes.json()
      if (!udaJson.success) throw new Error(udaJson.error)
      const udaId = udaJson.uda.id

      // 2. Salva sezioni curricolari
      await fetch(`/api/udas/${udaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ europeanCompetences, learningGoals, knowledgeSkills, evaluationCriteria, evaluationRubric }),
      })

      // 3. Crea fasi
      for (let i = 0; i < phases.length; i++) {
        const p = phases[i]
        await fetch(`/api/udas/${udaId}/phases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...p, position: i }),
        })
      }

      toast.success('UDA creata con successo!')
      router.push(`/udas/${udaId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore nel salvataggio')
    } finally {
      setSaving(false)
    }
  }

  // ── Validazione step ─────────────────────────────────────────────────────

  const canAdvance =
    step === 1 ? !!(title && subjects.length > 0 && classSection && schoolType) :
    step === 2 ? true :
    step === 3 ? true :
    true

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Titolo */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Nuova UDA</h1>
        <p className="text-sm text-gray-500 mt-1">Unità di Apprendimento guidata dall&apos;IA</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => {
          const n = i + 1
          const isActive = step === n
          const isDone = step > n
          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  isActive ? 'bg-[#534AB7] text-white' : isDone ? 'bg-[#1D9E75] text-white' : 'bg-gray-200 text-gray-500'
                )}>
                  {isDone ? <Check size={13} /> : n}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:block',
                  isActive ? 'text-[#534AB7]' : isDone ? 'text-[#1D9E75]' : 'text-gray-400'
                )}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-px w-8 sm:w-12 mx-3', isDone ? 'bg-[#1D9E75]' : 'bg-gray-200')} />
              )}
            </div>
          )
        })}
      </div>

      {/* Card contenuto */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">

        {/* ── STEP 1 — Dati generali ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                Titolo UDA <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="es. Il Rinascimento italiano"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                Discipline <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                  placeholder="es. Italiano, Storia, Arte..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
                <button
                  type="button"
                  onClick={addSubject}
                  className="px-4 py-2.5 bg-[#534AB7] text-white rounded-lg text-sm font-medium hover:bg-[#3C3489] transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-[#EEEDFE] text-[#534AB7] text-sm font-medium rounded-full">
                    {s}
                    <button type="button" onClick={() => removeSubject(s)} className="hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Anno <span className="text-red-500">*</span></label>
                <select
                  value={classYear}
                  onChange={(e) => setClassYear(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                >
                  {[1,2,3,4,5].map((y) => <option key={y} value={y}>{y}ª</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Sezione <span className="text-red-500">*</span></label>
                <input
                  value={classSection}
                  onChange={(e) => setClassSection(e.target.value)}
                  placeholder="es. A"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Indirizzo <span className="text-red-500">*</span></label>
                <input
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value)}
                  placeholder="es. Liceo Scientifico"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Periodo</label>
                <input
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="es. Gennaio-Febbraio 2026"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Ore totali</label>
                <input
                  type="number"
                  min={1}
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Prodotto finale atteso</label>
              <textarea
                value={finalProduct}
                onChange={(e) => setFinalProduct(e.target.value)}
                rows={3}
                placeholder="es. Presentazione multimediale realizzata in gruppi di 3-4 studenti"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2 — Riferimenti curricolari ── */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Genera o scrivi i riferimenti curricolari per l&apos;UDA <strong className="text-[#1A1A2E]">&ldquo;{title}&rdquo;</strong>.
            </p>

            {[
              { key: 'competences', label: 'Competenze chiave europee', value: europeanCompetences, setter: setEuropeanCompetences },
              { key: 'goals', label: 'Traguardi di competenza', value: learningGoals, setter: setLearningGoals },
              { key: 'knowledge', label: 'Obiettivi di apprendimento', value: knowledgeSkills, setter: setKnowledgeSkills },
            ].map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#1A1A2E]">{s.label}</label>
                  <button
                    type="button"
                    onClick={() => generateSection(s.key as 'competences' | 'goals' | 'knowledge')}
                    disabled={!!loadingSection}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#534AB7] bg-[#EEEDFE] hover:bg-[#DDD9FC] rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingSection === s.key ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Genera con IA
                  </button>
                </div>
                <textarea
                  value={s.value}
                  onChange={(e) => s.setter(e.target.value)}
                  rows={5}
                  placeholder={`Genera con l'IA o scrivi manualmente...`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none font-mono"
                />
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 3 — Fasi di lavoro ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Costruisci la sequenza di fasi didattiche ({totalHours}h totali).
              </p>
              <button
                type="button"
                onClick={generatePhases}
                disabled={loadingPhases}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#534AB7] bg-[#EEEDFE] hover:bg-[#DDD9FC] rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingPhases ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Suggerisci fasi con IA
              </button>
            </div>

            {phases.length === 0 && !loadingPhases && (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                Nessuna fase ancora — aggiungila manualmente o genera con l&apos;IA
              </div>
            )}

            <div className="space-y-3">
              {phases.map((phase, i) => (
                <div key={phase.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <GripVertical size={15} className="text-gray-300 shrink-0" />
                    <span className="text-xs font-bold text-[#534AB7] bg-[#EEEDFE] px-2 py-0.5 rounded-full shrink-0">
                      {i + 1}
                    </span>
                    <input
                      value={phase.title}
                      onChange={(e) => updatePhase(phase.id, 'title', e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#534AB7] bg-white"
                    />
                    <button type="button" onClick={() => removePhase(phase.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ore</label>
                      <input
                        type="number"
                        min={1}
                        value={phase.hours}
                        onChange={(e) => updatePhase(phase.id, 'hours', Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Metodologia</label>
                      <select
                        value={phase.methodology}
                        onChange={(e) => updatePhase(phase.id, 'methodology', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] bg-white"
                      >
                        {METHODOLOGIES.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <textarea
                    value={phase.description}
                    onChange={(e) => updatePhase(phase.id, 'description', e.target.value)}
                    rows={2}
                    placeholder="Descrizione attività..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none bg-white"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
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

        {/* ── STEP 4 — Valutazione ── */}
        {step === 4 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Definisci i criteri di valutazione e genera la rubrica.
            </p>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-2">Criteri di valutazione</label>
              <textarea
                value={evaluationCriteria}
                onChange={(e) => setEvaluationCriteria(e.target.value)}
                rows={4}
                placeholder="es.&#10;- Correttezza dei contenuti (30%)&#10;- Capacità espositiva (25%)&#10;- Lavoro di gruppo (25%)&#10;- Creatività (20%)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#1A1A2E]">Rubrica valutativa</label>
                <button
                  type="button"
                  onClick={generateRubric}
                  disabled={loadingRubric}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#534AB7] bg-[#EEEDFE] hover:bg-[#DDD9FC] rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingRubric ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Genera rubrica con IA
                </button>
              </div>

              {evaluationRubric ? (
                <div
                  className="border border-gray-200 rounded-lg p-3 text-sm overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: evaluationRubric }}
                />
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                  {loadingRubric ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-[#534AB7]" />
                      <span className="text-[#534AB7]">Generazione rubrica in corso...</span>
                    </div>
                  ) : (
                    'Genera la rubrica con l\'IA o aggiungi i dati manualmente'
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer navigazione */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => step > 1 ? setStep((s) => s - 1) : router.push('/udas')}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={15} />
          {step > 1 ? 'Indietro' : 'Annulla'}
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Avanti
            <ChevronRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1D9E75] hover:bg-[#178a63] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? 'Salvataggio...' : 'Crea UDA'}
          </button>
        )}
      </div>
    </div>
  )
}
