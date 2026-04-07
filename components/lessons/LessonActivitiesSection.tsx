'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Sparkles, Bot } from 'lucide-react'
import { GenerateWizard } from '@/components/ai/GenerateWizard'
import type { Activity } from '@prisma/client'

const ACTIVITY_LABELS: Record<string, string> = {
  SPIEGAZIONE: 'Spiegazione',
  ESERCIZI: 'Esercizi',
  VERIFICA: 'Verifica',
  SCHEDA: 'Scheda',
  DIAPOSITIVE: 'Diapositive',
  COMPITO: 'Compito',
}

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

export function LessonActivitiesSection({
  lesson,
  course,
  activities,
}: LessonActivitiesSectionProps) {
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questa attività? L\'operazione non può essere annullata.')) return
    setDeletingId(id)
    try {
      await fetch(`/api/activities/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  function handleWizardSaved() {
    // router.refresh() aggiorna i dati server senza ricaricare la pagina
    router.refresh()
  }

  return (
    <>
      {/* ── Intestazione sezione ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">
          Attività{' '}
          {activities.length > 0 && (
            <span className="text-sm font-normal text-gray-400">({activities.length})</span>
          )}
        </h2>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Sparkles size={15} />
          Genera con IA
        </button>
      </div>

      {/* ── Lista attività ── */}
      {activities.length === 0 ? (
        <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="text-3xl mb-3 text-[#534AB7]">✦</div>
          <p className="text-gray-500 text-sm mb-1 font-medium">Nessuna attività ancora</p>
          <p className="text-gray-400 text-xs mb-5">
            Usa il pulsante &ldquo;Genera con IA&rdquo; per creare i primi contenuti.
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="text-[#534AB7] hover:underline text-sm font-medium"
          >
            Genera ora →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Intestazione attività */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-[#1A1A2E]">{activity.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-[#EEEDFE] text-[#534AB7] rounded-full font-medium">
                    {ACTIVITY_LABELS[activity.type] ?? activity.type}
                  </span>
                  {activity.aiGenerated && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-full font-medium">
                      <Bot size={10} />
                      Generato con IA
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(activity.id)}
                  disabled={deletingId === activity.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 ml-2 shrink-0"
                  title="Elimina attività"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Contenuto HTML renderizzato */}
              {activity.content && (
                <div
                  className="ai-content px-5 py-4"
                  dangerouslySetInnerHTML={{ __html: activity.content }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Wizard modal ── */}
      {showWizard && (
        <GenerateWizard
          lesson={lesson}
          course={course}
          onClose={() => setShowWizard(false)}
          onSaved={handleWizardSaved}
        />
      )}
    </>
  )
}
