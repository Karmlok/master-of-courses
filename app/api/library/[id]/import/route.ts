import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, message: 'Non autenticato.' }, { status: 401 })

    // Carica la lezione originale con le attività
    const original = await prisma.lesson.findUnique({
      where: { id, isPublic: true },
      include: {
        activities: true,
        module: { include: { course: true } },
      },
    })
    if (!original) return NextResponse.json({ success: false, message: 'Lezione non trovata.' }, { status: 404 })

    // Trova (o crea) il modulo "Importate" nell'unico corso dell'utente
    let targetModule = await prisma.module.findFirst({
      where: { course: { userId: user.id } },
      orderBy: { createdAt: 'asc' },
    })

    if (!targetModule) {
      const newCourse = await prisma.course.create({
        data: {
          userId: user.id,
          subject: original.module.course.subject,
          classYear: original.module.course.classYear,
          classSection: 'A',
          schoolType: original.module.course.schoolType,
        },
      })
      targetModule = await prisma.module.create({
        data: { courseId: newCourse.id, title: 'Lezioni importate', position: 0 },
      })
    }

    // Crea la copia della lezione
    const copy = await prisma.lesson.create({
      data: {
        moduleId: targetModule.id,
        title: `${original.title} (importata)`,
        objectives: original.objectives,
        prerequisites: original.prerequisites,
        durationHours: original.durationHours,
        methodology: original.methodology,
        status: 'DRAFT',
        isPublic: false,
        position: 999,
      },
    })

    // Copia tutte le attività
    if (original.activities.length > 0) {
      await prisma.activity.createMany({
        data: original.activities.map((a) => ({
          lessonId: copy.id,
          type: a.type,
          title: a.title,
          content: a.content,
          aiGenerated: a.aiGenerated,
          position: a.position,
        })),
      })
    }

    // Incrementa importCount sull'originale
    await prisma.lesson.update({
      where: { id },
      data: { importCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true, data: { id: copy.id, moduleId: targetModule.id } })
  } catch (error) {
    console.error('[POST /api/library/[id]/import]', error)
    return NextResponse.json({ success: false, message: 'Errore del server.' }, { status: 500 })
  }
}
