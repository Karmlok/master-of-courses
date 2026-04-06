import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { CourseForm } from '@/components/courses/CourseForm'

interface EditCoursePageProps {
  params: Promise<{ id: string }>
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const course = await prisma.course.findUnique({ where: { id } })

  if (!course) notFound()
  if (course.userId !== user.id) redirect('/courses')

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/courses" className="hover:text-[#534AB7]">
          I miei corsi
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${id}`} className="hover:text-[#534AB7]">
          {course.subject}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Modifica</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Modifica corso</h1>
        <p className="text-gray-500 text-sm mt-1">{course.subject}</p>
      </div>

      <CourseForm
        mode="edit"
        courseId={id}
        initialData={{
          subject: course.subject,
          classYear: String(course.classYear),
          classSection: course.classSection,
          schoolType: course.schoolType,
          curriculumRef: course.curriculumRef ?? '',
          description: course.description ?? '',
        }}
      />
    </div>
  )
}
