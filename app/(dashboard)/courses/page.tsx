import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CourseCard } from '@/components/courses/CourseCard'
import { Plus } from 'lucide-react'

export default async function CoursesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    include: {
      modules: {
        include: { _count: { select: { lessons: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">I miei corsi</h1>
          <p className="text-gray-500 text-sm mt-1">
            {courses.length} {courses.length === 1 ? 'corso' : 'corsi'} totali
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

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>Nessun corso trovato.</p>
          <Link href="/courses/new" className="text-[#534AB7] hover:underline mt-2 inline-block text-sm">
            Crea il primo corso →
          </Link>
        </div>
      )}
    </div>
  )
}
