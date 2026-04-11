import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { DeleteLessonButton } from '@/components/lessons/DeleteLessonButton'
import { LessonActivitiesSection } from '@/components/lessons/LessonActivitiesSection'
import { PublishToggle } from '@/components/lessons/PublishToggle'

const METHODOLOGY_INFO: Record<string, { label: string; color: string }> = {
  FIVE_E: { label: 'Modello 5E', color: '#534AB7' },
  LAB: { label: 'Laboratoriale', color: '#1D9E75' },
  STANDARD: { label: 'Standard', color: '#185FA5' },
  FLIPPED: { label: 'Flipped Classroom', color: '#BA7517' },
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
  const methodology =
    METHODOLOGY_INFO[lesson.methodology] ?? { label: lesson.methodology, color: '#534AB7' }
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
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {/* Badge metodologia con colore */}
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: methodology.color }}
            >
              {methodology.label}
            </span>
            <span>·</span>
            <span>
              {lesson.durationHours === 4
                ? 'Più lezioni'
                : `${lesson.durationHours} ${lesson.durationHours === 1 ? 'ora' : 'ore'}`}
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <PublishToggle lessonId={id} isPublic={lesson.isPublic} />
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

      {/* Dettagli (obiettivi e prerequisiti) */}
      {(lesson.objectives || lesson.prerequisites) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
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
      )}

      {/* Sezione attività — componente client con wizard AI integrato */}
      <LessonActivitiesSection
        lesson={{
          id: lesson.id,
          title: lesson.title,
          objectives: lesson.objectives,
          prerequisites: lesson.prerequisites,
          methodology: lesson.methodology,
          durationHours: lesson.durationHours,
        }}
        course={{
          subject: course.subject,
          classYear: course.classYear,
          schoolType: course.schoolType,
          classSection: course.classSection,
        }}
        activities={lesson.activities}
      />
    </div>
  )
}
