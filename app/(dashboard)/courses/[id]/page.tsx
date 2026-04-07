import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { DeleteCourseButton } from '@/components/courses/DeleteCourseButton'

interface CourseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { position: 'asc' },
        include: {
          lessons: { orderBy: { position: 'asc' } },
        },
      },
    },
  })

  if (!course) notFound()
  if (course.userId !== user.id) redirect('/courses')

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  )

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/courses" className="hover:text-[#534AB7]">
          I miei corsi
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{course.subject}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">{course.subject}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {course.classYear}ª {course.classSection} — {course.schoolType}
          </p>
          {course.description && (
            <p className="text-gray-600 text-sm mt-2 max-w-xl">{course.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/courses/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Pencil size={15} />
            Modifica
          </Link>
          <DeleteCourseButton courseId={id} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#F8F7FF] rounded-xl p-4">
          <p className="text-2xl font-bold text-[#534AB7]">{course.modules.length}</p>
          <p className="text-sm text-gray-600 mt-0.5">Moduli</p>
        </div>
        <div className="bg-[#F8F7FF] rounded-xl p-4">
          <p className="text-2xl font-bold text-[#534AB7]">{totalLessons}</p>
          <p className="text-sm text-gray-600 mt-0.5">Lezioni</p>
        </div>
        <div className="bg-[#F8F7FF] rounded-xl p-4">
          <p className="text-2xl font-bold text-[#534AB7]">
            {course.isActive ? '✓' : '—'}
          </p>
          <p className="text-sm text-gray-600 mt-0.5">
            {course.isActive ? 'Attivo' : 'Archiviato'}
          </p>
        </div>
      </div>

      {/* Moduli e lezioni */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Lezioni</h2>
        <Link
          href={`/lessons/new?courseId=${id}`}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} />
          Nuova lezione
        </Link>
      </div>

      {course.modules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm mb-3">Nessuna lezione ancora</p>
          <Link
            href={`/lessons/new?courseId=${id}`}
            className="text-[#534AB7] hover:underline text-sm font-medium"
          >
            Aggiungi la prima lezione →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {course.modules.map((module) => (
            <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-800 text-sm">{module.title}</h3>
              </div>
              {module.lessons.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm text-gray-800">{lesson.title}</span>
                        <div className="flex items-center gap-2">
                          {/* Badge metodologia con colore */}
                          {(() => {
                            const colors: Record<string, string> = {
                              FIVE_E: '#534AB7',
                              LAB: '#1D9E75',
                              STANDARD: '#185FA5',
                              FLIPPED: '#BA7517',
                            }
                            const labels: Record<string, string> = {
                              FIVE_E: '5E',
                              LAB: 'Lab',
                              STANDARD: 'Standard',
                              FLIPPED: 'Flipped',
                            }
                            const color = colors[lesson.methodology] ?? '#534AB7'
                            const label = labels[lesson.methodology] ?? lesson.methodology
                            return (
                              <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: color }}
                              >
                                {label}
                              </span>
                            )
                          })()}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              lesson.status === 'PUBLISHED'
                                ? 'bg-green-50 text-green-700'
                                : lesson.status === 'READY'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {lesson.status === 'PUBLISHED'
                              ? 'Pubblicata'
                              : lesson.status === 'READY'
                                ? 'Pronta'
                                : 'Bozza'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-4 text-sm text-gray-400">Nessuna lezione in questo modulo.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
