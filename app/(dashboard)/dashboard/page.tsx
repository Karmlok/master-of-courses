import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CourseCard } from '@/components/courses/CourseCard'
import { Plus, BookOpen, FolderOpen } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [courses, udaCount] = await Promise.all([
    prisma.course.findMany({
      where: { userId: user.id },
      include: {
        modules: {
          include: { _count: { select: { lessons: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.uDA.count({ where: { userId: user.id } }),
  ])

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  })

  return (
    <div>
      {/* Metriche rapide */}
      {(courses.length > 0 || udaCount > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">Corsi attivi</p>
            <p className="text-2xl font-bold text-[#534AB7]">{courses.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 mb-1">UDA create</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-[#534AB7]">{udaCount}</p>
              <Link href="/udas" className="text-xs text-[#534AB7] hover:underline flex items-center gap-1">
                <FolderOpen size={12} /> Vedi
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">
            Ciao, {dbUser?.name?.split(' ')[0] ?? 'Docente'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {courses.length === 0
              ? 'Inizia creando il tuo primo corso'
              : `Hai ${courses.length} ${courses.length === 1 ? 'corso' : 'corsi'} attivi`}
          </p>
        </div>

        <Link
          href="/courses/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nuovo corso
        </Link>
      </div>

      {/* Griglia corsi */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        /* Stato vuoto */
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-[#EEEDFE] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-[#534AB7]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">
            Nessun corso ancora
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Crea il tuo primo corso per iniziare a organizzare le tue lezioni con
            l&apos;aiuto dell&apos;AI.
          </p>
          <Link
            href="/courses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            Crea il primo corso
          </Link>
        </div>
      )}
    </div>
  )
}
