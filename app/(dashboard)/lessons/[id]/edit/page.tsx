import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { LessonForm } from '@/components/lessons/LessonForm'

interface EditLessonPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { module: { include: { course: true } } },
  })

  if (!lesson) notFound()
  if (lesson.module.course.userId !== user.id) redirect('/courses')

  const course = lesson.module.course

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/courses" className="hover:text-[#534AB7]">
          I miei corsi
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${course.id}`} className="hover:text-[#534AB7]">
          {course.subject}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/lessons/${id}`} className="hover:text-[#534AB7]">
          {lesson.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Modifica</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Modifica lezione</h1>
        <p className="text-gray-500 text-sm mt-1">{lesson.title}</p>
      </div>

      <LessonForm
        mode="edit"
        lessonId={id}
        initialData={{
          moduleId: lesson.moduleId,
          title: lesson.title,
          objectives: lesson.objectives ?? '',
          prerequisites: lesson.prerequisites ?? '',
          durationHours: String(lesson.durationHours),
          methodology: lesson.methodology,
        }}
      />
    </div>
  )
}
