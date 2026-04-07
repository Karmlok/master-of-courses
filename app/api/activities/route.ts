import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { ActivityType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ success: false, message: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, type, title, content, aiGenerated } = body

    // Verifica che la lezione appartenga all'utente
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: { userId: user.id },
        },
      },
    })

    if (!lesson) {
      return Response.json({ success: false, message: 'Lezione non trovata' }, { status: 404 })
    }

    // Calcola la posizione (alla fine)
    const count = await prisma.activity.count({ where: { lessonId } })

    const activity = await prisma.activity.create({
      data: {
        lessonId,
        type: type as ActivityType,
        title,
        content,
        aiGenerated: aiGenerated ?? true,
        position: count,
      },
    })

    return Response.json({ success: true, data: activity })
  } catch (error) {
    console.error('Activity save error:', error)
    return Response.json(
      { success: false, message: 'Errore nel salvataggio' },
      { status: 500 }
    )
  }
}
