import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LessonForm } from '@/components/lessons/LessonForm'

interface NewLessonPageProps {
  searchParams: Promise<{ courseId?: string; moduleId?: string }>
}

export default async function NewLessonPage({ searchParams }: NewLessonPageProps) {
  const { courseId, moduleId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Carica i moduli del corso per permettere la selezione
  let modules: Array<{ id: string; title: string; courseId: string }> = []
  let courseName = ''

  if (courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { modules: { orderBy: { position: 'asc' } } },
    })

    if (course && course.userId === user.id) {
      modules = course.modules
      courseName = course.subject
    }
  }

  // Se non ci sono moduli, creane uno di default
  let defaultModuleId = moduleId ?? ''
  if (!defaultModuleId && courseId && modules.length === 0) {
    // Crea un modulo di default "Modulo 1"
    const newModule = await prisma.module.create({
      data: { courseId, title: 'Modulo 1', position: 0 },
    })
    defaultModuleId = newModule.id
    modules = [newModule]
  } else if (!defaultModuleId && modules.length > 0) {
    defaultModuleId = modules[0].id
  }

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/courses" className="hover:text-[#534AB7]">
          I miei corsi
        </Link>
        {courseId && courseName && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/courses/${courseId}`} className="hover:text-[#534AB7]">
              {courseName}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-800">Nuova lezione</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Nuova lezione</h1>
        <p className="text-gray-500 text-sm mt-1">
          Inserisci i dettagli della lezione
        </p>
      </div>

      <LessonForm mode="create" defaultModuleId={defaultModuleId} />
    </div>
  )
}
