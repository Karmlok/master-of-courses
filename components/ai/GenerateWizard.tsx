'use client'

import { useState } from 'react'
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Save,
  Loader2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ContentViewer } from './ContentViewer'

// ─── Costanti ────────────────────────────────────────────────────────────────

const METHODOLOGY_INFO: Record<string, { label: string; color: string }> = {
  FIVE_E: { label: 'Modello 5E', color: '#534AB7' },
  LAB: { label: 'Laboratoriale', color: '#1D9E75' },
  STANDARD: { label: 'Standard', color: '#185FA5' },
  FLIPPED: { label: 'Flipped Classroom', color: '#BA7517' },
}

const ACTIVITY_TYPES = [
  { key: 'PIANO', label: 'Piano di lezione', emoji: '📋' },
  { key: 'SPIEGAZIONE', label: 'Spiegazione teorica', emoji: '📖' },
  { key: 'ESERCIZI', label: 'Esercizi', emoji: '✏️' },
  { key: 'VERIFICA', label: 'Verifica formativa', emoji: '📝' },
  { key: 'SCHEDA', label: 'Scheda studente', emoji: '📄' },
  { key: 'DIAPOSITIVE', label: 'Scaletta diapositive', emoji: '🖥️' },
  { key: 'COMPITO', label: 'Compito per casa', emoji: '🏠' },
  { key: 'SIMULATION', label: 'Simulazione interattiva', emoji: '▶️' },
]

const TONES = [
  { key: 'accessibile', label: 'Accessibile', description: 'Chiaro e semplice, con esempi concreti' },
  { key: 'rigoroso', label: 'Rigoroso', description: 'Preciso, con terminologia disciplinare' },
  { key: 'narrativo', label: 'Narrativo', description: 'Coinvolgente, con aneddoti e storie' },
  { key: 'tecnico', label: 'Tecnico', description: 'Specialistico, per studenti avanzati' },
]

const ACTIVITY_SHORT_LABELS: Record<string, string> = {
  PIANO: 'Piano',
  SPIEGAZIONE: 'Spiegazione',
  ESERCIZI: 'Esercizi',
  VERIFICA: 'Verifica',
  SCHEDA: 'Scheda',
  DIAPOSITIVE: 'Diapositive',
  COMPITO: 'Compito',
  SIMULATION: 'Simulazione',
}

const STEPS = ['Riepilogo', 'Contenuti', 'Stile', 'Generazione']

// ─── Tipi ─────────────────────────────────────────────────────────────────────

interface GenerateWizardProps {
  lesson: {
    id: string
    title: string
    objectives: string | null
    prerequisites: string | null
    methodology: string
    durationHours: number
  }
  course: {
    subject: string
    classYear: number
    schoolType: string
    classSection: string
  }
  defaultTypes?: string[]
  onClose: () => void
  onSaved: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function GenerateWizard({ lesson, course, defaultTypes, onClose, onSaved }: GenerateWizardProps) {
  const [step, setStep] = useState(1)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    defaultTypes && defaultTypes.length > 0 ? defaultTypes : ['SPIEGAZIONE', 'ESERCIZI']
  )
  const [tone, setTone] = useState('accessibile')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [simulationDescription, setSimulationDescription] = useState('')

  const hasSimulation = selectedTypes.includes('SIMULATION')

  // Risultati per tipo: un record per ogni API call completata
  const [generationResults, setGenerationResults] = useState<Array<{ type: string; content: string }>>([])
  // Indice del tipo in corso di generazione (-1 = nessuno)
  const [currentIndex, setCurrentIndex] = useState(-1)
  // Contenuto in streaming per il tipo corrente
  const [currentStream, setCurrentStream] = useState('')

  const [isGenerating, setIsGenerating] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0) // quale tab è attiva nel viewer
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasResults = generationResults.length > 0
  const methodology = METHODOLOGY_INFO[lesson.methodology] ?? { label: lesson.methodology, color: '#534AB7' }

  function toggleType(key: string) {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    )
  }

  // Aggiorna il contenuto di un singolo risultato (per l'editor)
  function updateResultContent(index: number, newContent: string) {
    setGenerationResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, content: newContent } : r))
    )
  }

  // ── Genera: una chiamata per ogni tipo ───────────────────────────────────────

  async function handleGenerate() {
    setIsGenerating(true)
    setGenerationResults([])
    setCurrentStream('')
    setCurrentIndex(-1)
    setIsSaved(false)
    setError(null)
    setIsEditing(false)
    setPreviewIndex(0)

    try {
      for (let i = 0; i < selectedTypes.length; i++) {
        setCurrentIndex(i)
        setCurrentStream('')

        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonTitle: lesson.title,
            objectives: lesson.objectives,
            prerequisites: lesson.prerequisites,
            methodology: lesson.methodology,
            activityTypes: [selectedTypes[i]], // UNA sola tipo per chiamata
            tone,
            additionalInstructions,
            simulationDescription,
            subject: course.subject,
            classYear: course.classYear,
            schoolType: course.schoolType,
          }),
        })

        if (!response.ok) {
          let msg = 'Errore nella generazione'
          try { const err = await response.json(); msg = err.message || msg } catch { /* ignore */ }
          throw new Error(msg)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let typeContent = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            typeContent += chunk
            setCurrentStream((prev) => prev + chunk)
          }
        }

        setGenerationResults((prev) => [...prev, { type: selectedTypes[i], content: typeContent }])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Si è verificato un errore'
      setError(msg)
      toast.error('Generazione fallita: ' + msg)
    } finally {
      setIsGenerating(false)
      setCurrentIndex(-1)
    }
  }

  // ── Salva: un'attività per ogni risultato generato ────────────────────────────

  async function handleSave() {
    if (generationResults.length === 0) return
    setIsSaving(true)
    setError(null)

    try {
      for (const result of generationResults) {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: lesson.id,
            type: result.type,
            title: `${ACTIVITY_SHORT_LABELS[result.type] ?? result.type} — ${lesson.title}`,
            content: result.content,
            aiGenerated: true,
          }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.message)
      }
      setIsSaved(true)
      onSaved()
      toast.success(
        generationResults.length === 1
          ? 'Attività salvata con successo!'
          : `${generationResults.length} attività salvate con successo!`
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore nel salvataggio'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-[#534AB7] text-lg">✦</span>
            <h2 className="text-lg font-semibold text-[#1A1A2E]">Genera contenuti con IA</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          {STEPS.map((label, i) => {
            const stepNum = i + 1
            const isActive = step === stepNum
            const isDone = step > stepNum
            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                    isActive ? 'bg-[#534AB7] text-white' : isDone ? 'bg-[#1D9E75] text-white' : 'bg-gray-200 text-gray-500'
                  )}>
                    {isDone ? <Check size={12} /> : stepNum}
                  </div>
                  <span className={cn(
                    'text-xs font-medium hidden sm:block',
                    isActive ? 'text-[#534AB7]' : isDone ? 'text-[#1D9E75]' : 'text-gray-400'
                  )}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-px w-8 sm:w-14 mx-2', isDone ? 'bg-[#1D9E75]' : 'bg-gray-200')} />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Step 1 — Riepilogo lezione */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Verifica i dati della lezione prima di procedere.</p>
              <div className="bg-[#F8F7FF] rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Disciplina</p>
                  <p className="text-sm font-medium text-[#1A1A2E]">
                    {course.subject} — {course.classYear}ª {course.classSection} {course.schoolType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Titolo lezione</p>
                  <p className="text-sm font-medium text-[#1A1A2E]">{lesson.title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Metodologia</p>
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: methodology.color }}>
                    {methodology.label}
                  </span>
                </div>
                {lesson.objectives && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Obiettivi</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{lesson.objectives}</p>
                  </div>
                )}
                {lesson.prerequisites && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Prerequisiti</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{lesson.prerequisites}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2 — Cosa generare */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Seleziona uno o più tipi di contenuto da generare.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACTIVITY_TYPES.map((type) => {
                  const isSelected = selectedTypes.includes(type.key)
                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => toggleType(type.key)}
                      className={cn(
                        'flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left transition-all',
                        isSelected ? 'border-[#534AB7] bg-[#EEEDFE] text-[#534AB7]' : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                      )}
                    >
                      <span className="text-lg leading-none">{type.emoji}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  )
                })}
              </div>
              {selectedTypes.length === 0 && (
                <p className="text-xs text-red-500">Seleziona almeno un tipo di contenuto.</p>
              )}

              {/* Campo descrizione simulazione */}
              {hasSimulation && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <label className="block text-sm font-medium text-emerald-800 mb-1.5">
                    Descrivi la simulazione <span className="text-emerald-600 font-normal">(obbligatorio)</span>
                  </label>
                  <textarea
                    value={simulationDescription}
                    onChange={(e) => setSimulationDescription(e.target.value)}
                    rows={3}
                    placeholder='es. "Punto mobile su parabola y=x² con retta tangente in tempo reale e valore della derivata"'
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white"
                  />
                  <p className="text-xs text-emerald-600 mt-1">
                    Più dettagli fornisci, più precisa sarà la simulazione generata.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Stile e istruzioni */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-[#1A1A2E] mb-3">Tono e stile</p>
                <div className="grid grid-cols-2 gap-3">
                  {TONES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTone(t.key)}
                      className={cn(
                        'text-left px-4 py-3 rounded-xl border-2 transition-all',
                        tone === t.key ? 'border-[#534AB7] bg-[#EEEDFE]' : 'border-gray-200 hover:border-gray-300 bg-white'
                      )}
                    >
                      <p className={cn('font-medium text-sm', tone === t.key ? 'text-[#534AB7]' : 'text-gray-800')}>{t.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  Istruzioni aggiuntive per l&apos;IA{' '}
                  <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <textarea
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={4}
                  placeholder="es. Includi riferimenti al programma ministeriale. Usa esempi dalla vita quotidiana..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4 — Generazione e anteprima */}
          {step === 4 && (
            <div className="space-y-4">

              {/* Stato iniziale: pronto a generare */}
              {!hasResults && !isGenerating && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">✦</div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Pronto a generare il contenuto</p>
                  <p className="text-gray-400 text-xs">
                    {selectedTypes.map((t) => ACTIVITY_SHORT_LABELS[t] ?? t).join(', ')} · Tono: {tone}
                  </p>
                </div>
              )}

              {/* Streaming in corso */}
              {isGenerating && (
                <div className="space-y-3">
                  {/* Barra progresso tipi */}
                  <div className="flex items-center gap-3">
                    <Loader2 size={14} className="animate-spin text-[#534AB7] shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-[#534AB7] font-medium">
                        {currentIndex >= 0
                          ? `Generando ${currentIndex + 1} di ${selectedTypes.length}: ${ACTIVITY_SHORT_LABELS[selectedTypes[currentIndex]] ?? selectedTypes[currentIndex]}...`
                          : 'Avvio generazione...'}
                      </p>
                    </div>
                  </div>

                  {/* Pallini di avanzamento per tipo */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedTypes.map((t, i) => {
                      const done = i < currentIndex || (i === currentIndex && !isGenerating)
                      const active = i === currentIndex && isGenerating
                      return (
                        <span
                          key={t}
                          className={cn(
                            'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                            done ? 'bg-[#1D9E75] text-white' : active ? 'bg-[#534AB7] text-white' : 'bg-gray-100 text-gray-400'
                          )}
                        >
                          {done ? '✓ ' : ''}{ACTIVITY_SHORT_LABELS[t] ?? t}
                        </span>
                      )
                    })}
                  </div>

                  {/* Preview streaming */}
                  <div className={cn(
                    "bg-[#F8F7FF] rounded-lg p-4 min-h-40 text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border border-[#EEEDFE]",
                    isGenerating && "streaming-cursor"
                  )}>
                    {currentStream || '…'}
                  </div>
                </div>
              )}

              {/* Contenuto pronto — tabs per tipo */}
              {hasResults && !isGenerating && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#1A1A2E]">
                      {generationResults.length === 1 ? 'Contenuto generato' : `${generationResults.length} contenuti generati`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditing((e) => !e)}
                      className="text-xs text-[#534AB7] hover:underline"
                    >
                      {isEditing ? '← Mostra anteprima' : 'Modifica HTML →'}
                    </button>
                  </div>

                  {/* Tab selector (solo se più di 1 risultato) */}
                  {generationResults.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {generationResults.map((r, i) => (
                        <button
                          key={r.type}
                          type="button"
                          onClick={() => { setPreviewIndex(i); setIsEditing(false) }}
                          className={cn(
                            'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border',
                            previewIndex === i
                              ? 'bg-[#534AB7] text-white border-[#534AB7]'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#534AB7] hover:text-[#534AB7]'
                          )}
                        >
                          {ACTIVITY_SHORT_LABELS[r.type] ?? r.type}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="max-h-[380px] overflow-y-auto rounded-lg border border-gray-200">
                    <ContentViewer
                      content={generationResults[previewIndex]?.content ?? ''}
                      editable={isEditing}
                      onChange={(val) => updateResultContent(previewIndex, val)}
                    />
                  </div>

                  {isSaved && (
                    <div className="flex items-center gap-2 text-sm text-[#1D9E75] bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                      <Check size={14} />
                      <span>
                        {generationResults.length === 1
                          ? 'Attività salvata con successo!'
                          : `${generationResults.length} attività salvate con successo!`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Errore */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((s) => s - 1) : onClose())}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={15} />
            {step > 1 ? 'Indietro' : 'Annulla'}
          </button>

          <div className="flex items-center gap-2">
            {/* Step 4: azioni */}
            {step === 4 && (
              <>
                {/* Rigenera */}
                {(hasResults || error) && !isGenerating && (
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Rigenera
                  </button>
                )}

                {/* Genera (prima volta) */}
                {!hasResults && !isGenerating && !error && (
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="flex items-center gap-2 px-5 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Sparkles size={15} />
                    Genera con IA
                  </button>
                )}

                {/* Salva */}
                {hasResults && !isGenerating && !isSaved && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#1D9E75] hover:bg-[#178a63] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Salvataggio...' : `Salva ${generationResults.length > 1 ? `(${generationResults.length})` : 'attività'}`}
                  </button>
                )}

                {/* Chiudi dopo salvataggio */}
                {isSaved && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#1D9E75] text-white text-sm font-semibold rounded-lg"
                  >
                    <Check size={14} />
                    Chiudi
                  </button>
                )}
              </>
            )}

            {/* Step 1-3: avanti */}
            {step < 4 && (
              <button
                type="button"
                onClick={() => {
                  if (step === 2 && selectedTypes.length === 0) return
                  if (step === 2 && hasSimulation && !simulationDescription.trim()) return
                  setStep((s) => s + 1)
                }}
                disabled={
                  (step === 2 && selectedTypes.length === 0) ||
                  (step === 2 && hasSimulation && !simulationDescription.trim())
                }
                className="flex items-center gap-1.5 px-5 py-2 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {step === 3 ? (
                  <>
                    <Sparkles size={14} />
                    Avanti
                  </>
                ) : (
                  <>
                    Avanti
                    <ChevronRight size={15} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
