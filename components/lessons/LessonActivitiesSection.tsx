'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { GenerateWizard } from '@/components/ai/GenerateWizard'
import { ActivityPanel } from '@/components/lessons/ActivityPanel'
import type { Activity } from '@prisma/client'

// ─── Tipi di attività disponibili (ordine del pannello sinistro) ──────────────

const ALL_ACTIVITY_TYPES = [
  { key: 'PIANO', label: 'Piano di lezione', emoji: '📋' },
  { key: 'SPIEGAZIONE', label: 'Spiegazione', emoji: '📖' },
  { key: 'ESERCIZI', label: 'Esercizi', emoji: '✏️' },
  { key: 'VERIFICA', label: 'Verifica', emoji: '📝' },
  { key: 'SCHEDA', label: 'Scheda studente', emoji: '📄' },
  { key: 'DIAPOSITIVE', label: 'Scaletta slide', emoji: '🖥️' },
  { key: 'COMPITO', label: 'Compito per casa', emoji: '🏠' },
  { key: 'SIMULATION', label: 'Simulazione', emoji: '▶️', comingSoon: true },
]

// ─── Tipi ─────────────────────────────────────────────────────────────────────

interface LessonForWizard {
  id: string
  title: string
  objectives: string | null
  prerequisites: string | null
  methodology: string
  durationHours: number
}

interface CourseForWizard {
  subject: string
  classYear: number
  schoolType: string
  classSection: string
}

interface LessonActivitiesSectionProps {
  lesson: LessonForWizard
  course: CourseForWizard
  activities: Activity[]
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function LessonActivitiesSection({
  lesson,
  course,
  activities,
}: LessonActivitiesSectionProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState(ALL_ACTIVITY_TYPES[0].key)
  const [showWizard, setShowWizard] = useState(false)
  const [wizardDefaultTypes, setWizardDefaultTypes] = useState<string[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Raggruppa per tipo: se ci sono più attività dello stesso tipo, prende l'ultima
  const activitiesByType = useMemo(() => {
    const map: Record<string, Activity> = {}
    for (const a of activities) {
      map[a.type] = a
    }
    return map
  }, [activities])

  const generatedCount = Object.keys(activitiesByType).length
  const activeActivity = activitiesByType[selectedType] ?? null
  const selectedTypeInfo = ALL_ACTIVITY_TYPES.find((t) => t.key === selectedType)

  // Elimina attività
  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa attività? L'operazione non può essere annullata.")) return
    setDeletingId(id)
    try {
      await fetch(`/api/activities/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  // Apre il wizard per un tipo specifico
  function openWizardForType(typeKey: string) {
    setWizardDefaultTypes([typeKey])
    setShowWizard(true)
  }

  // Apre il wizard generico (senza pre-selezione)
  function openWizardGeneral() {
    setWizardDefaultTypes([])
    setShowWizard(true)
  }

  return (
    <>
      {/* ── Intestazione sezione ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">
          Attività{' '}
          {generatedCount > 0 && (
            <span className="text-sm font-normal text-gray-400">
              ({generatedCount} su {ALL_ACTIVITY_TYPES.length} generati)
            </span>
          )}
        </h2>
        <button
          onClick={openWizardGeneral}
          className="flex items-center gap-2 px-4 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Sparkles size={15} />
          Genera con IA
        </button>
      </div>

      {/* ── Split panel ── */}
      <div className="flex border border-gray-200 rounded-xl overflow-hidden min-h-96">
        {/* Pannello sinistro — navigazione tipi */}
        <div className="w-48 shrink-0 border-r border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">
            Contenuti
          </p>
          <nav className="pb-3">
            {ALL_ACTIVITY_TYPES.map((type) => {
              const hasContent = !!activitiesByType[type.key]
              const isActive = selectedType === type.key

              if (type.comingSoon) {
                return (
                  <div
                    key={type.key}
                    className="w-full flex items-center justify-between px-4 py-2.5 border-r-2 border-transparent bg-amber-50 cursor-not-allowed"
                    title="Funzione in arrivo"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <span className="text-base leading-none grayscale">{type.emoji}</span>
                      {type.label}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-white leading-none whitespace-nowrap">
                      In arrivo
                    </span>
                  </div>
                )
              }

              return (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-[#EEEDFE] border-r-2 border-[#534AB7]'
                      : 'hover:bg-gray-100 border-r-2 border-transparent'
                  }`}
                >
                  <span
                    className={`flex items-center gap-2 text-sm font-medium ${
                      isActive ? 'text-[#534AB7]' : 'text-gray-600'
                    }`}
                  >
                    <span className="text-base leading-none">{type.emoji}</span>
                    {type.label}
                  </span>
                  {/* Indicatore: verde = generato, grigio = non ancora */}
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      hasContent ? 'bg-[#1D9E75]' : 'bg-gray-300'
                    }`}
                    title={hasContent ? 'Contenuto presente' : 'Non ancora generato'}
                  />
                </button>
              )
            })}
          </nav>
        </div>

        {/* Pannello destro — contenuto del tipo selezionato */}
        <ActivityPanel
          key={activeActivity?.id ?? `empty-${selectedType}`}
          activity={activeActivity}
          selectedTypeLabel={selectedTypeInfo?.label ?? selectedType}
          onGenerate={() => openWizardForType(selectedType)}
          onDelete={handleDelete}
          isDeleting={deletingId === activeActivity?.id}
        />
      </div>

      {/* ── Wizard modal ── */}
      {showWizard && (
        <GenerateWizard
          lesson={lesson}
          course={course}
          defaultTypes={wizardDefaultTypes}
          onClose={() => setShowWizard(false)}
          onSaved={() => router.refresh()}
        />
      )}
    </>
  )
}
