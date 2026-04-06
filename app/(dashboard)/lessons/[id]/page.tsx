import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { DeleteLessonButton } from '@/components/lessons/DeleteLessonButton'

const METHODOLOGY_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  FIVE_E: 'Modello 5E',
  LAB: 'Laboratoriale',
  FLIPPED: 'Flipped Classroom',
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Bozza', className: 'bg-gray-100 text-gray-600' },
  READY: { label: 'Pronta', className: 'bg-blue-50 text-blue-700' },
  PUBLISHED: { label: 'Pubblicata', className: 'bg-green-50 text-green-700' },
}

interface LessonDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function LessonDetailPage({ params }: LessonDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        include: { course: true },
      },
      activities: { orderBy: { position: 'asc' } },
    },
  })

  if (!lesson) notFound()
  if (lesson.module.course.userId !== user.id) redirect('/courses')

  const course = lesson.module.course
  const status = STATUS_LABELS[lesson.status] ?? STATUS_LABELS.DRAFT

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/courses" className="hover:text-[#534AB7]">
          I miei corsi
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${course.id}`} className="hover:text-[#534AB7]">
          {course.subject}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{lesson.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{lesson.title}</h1>
            <span className={`text-xs px-2 py-1 rounded-full ${status.className}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {METHODOLOGY_LABELS[lesson.methodology]} ·{' '}
            {lesson.durationHours === 4
              ? 'Più lezioni'
              : `${lesson.durationHours} ${lesson.durationHours === 1 ? 'ora' : 'ore'}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/lessons/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Pencil size={15} />
            Modifica
          </Link>
          <DeleteLessonButton lessonId={id} courseId={course.id} />
        </div>
      </div>

      {/* Dettagli */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {lesson.objectives && (
          <div className="bg-[#F8F7FF] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#534AB7] mb-2">
              Obiettivi di apprendimento
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{lesson.objectives}</p>
          </div>
        )}

        {lesson.prerequisites && (
          <div className="bg-[#F8F7FF] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#534AB7] mb-2">Prerequisiti</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{lesson.prerequisites}</p>
          </div>
        )}
      </div>

      {/* Attività (placeholder per Fase 2) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1A1A2E]">Attività</h2>
          <span className="text-xs text-gray-400 italic">
            Generazione con AI disponibile nella Fase 2
          </span>
        </div>

        {lesson.activities.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-400 text-sm">
              Le attività verranno generate con l&apos;AI nella Fase 2.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {lesson.activities.map((activity) => (
              <li
                key={activity.id}
                className="border border-gray-200 rounded-xl p-4 text-sm"
              >
                <p className="font-medium text-gray-800">{activity.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{activity.type}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
