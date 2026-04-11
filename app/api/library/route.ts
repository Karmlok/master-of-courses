import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, message: 'Non autenticato.' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const subject = searchParams.get('subject') ?? ''
    const grade = searchParams.get('grade') ?? ''
    const sort = searchParams.get('sort') ?? 'recent'

    const lessons = await prisma.lesson.findMany({
      where: {
        isPublic: true,
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: {
        module: {
          include: {
            course: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
        activities: { select: { id: true, type: true } },
      },
      orderBy: sort === 'popular' ? { importCount: 'desc' } : { publishedAt: 'desc' },
    })

    // Filtra per materia e classe (sono sul Course, non sulla Lesson)
    const filtered = lessons.filter((l) => {
      const course = l.module.course
      if (subject && !course.subject.toLowerCase().includes(subject.toLowerCase())) return false
      if (grade && String(course.classYear) !== grade) return false
      return true
    })

    // Formatta per il client: abbrevia il nome per privacy
    const result = filtered.map((l) => {
      const course = l.module.course
      const authorName = l.module.course.user.name
      const parts = authorName.trim().split(' ')
      const abbreviated =
        parts.length >= 2
          ? `Prof. ${parts[0][0].toUpperCase()}. ${parts[parts.length - 1]}`
          : `Prof. ${authorName}`

      return {
        id: l.id,
        title: l.title,
        subject: course.subject,
        classYear: course.classYear,
        schoolType: course.schoolType,
        methodology: l.methodology,
        importCount: l.importCount,
        publishedAt: l.publishedAt,
        isOwn: course.user.id === user.id,
        author: abbreviated,
        activityCount: l.activities.length,
        activityTypes: [...new Set(l.activities.map((a) => a.type))],
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/library]', error)
    return NextResponse.json({ success: false, message: 'Errore del server.' }, { status: 500 })
  }
}
