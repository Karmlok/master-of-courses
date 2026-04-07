'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { GenerateWizard } from '@/components/ai/GenerateWizard'
import { ActivityCard } from '@/components/lessons/ActivityCard'
import type { Activity } from '@prisma/client'

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
            <ActivityCard
              key={activity.id}
              activity={activity}
              onDelete={handleDelete}
              isDeleting={deletingId === activity.id}
            />
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
