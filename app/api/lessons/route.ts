import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/lessons?courseId=xxx
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non autenticato.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const moduleId = searchParams.get('moduleId')

    const lessons = await prisma.lesson.findMany({
      where: {
        ...(moduleId ? { moduleId } : {}),
        ...(courseId
          ? { module: { courseId } }
          : {}),
        module: {
          course: { userId: user.id },
        },
      },
      include: {
        module: {
          include: { course: { select: { userId: true, subject: true } } },
        },
        _count: { select: { activities: true } },
      },
      orderBy: { position: 'asc' },
    })

    return NextResponse.json({ success: true, data: lessons })
  } catch (error) {
    console.error('[GET /api/lessons]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}

// POST /api/lessons
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non autenticato.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { moduleId, title, objectives, prerequisites, durationHours, methodology } = body

    if (!moduleId || !title) {
      return NextResponse.json(
        { success: false, message: 'Campi obbligatori mancanti.' },
        { status: 400 }
      )
    }

    // Verifica che il modulo appartenga all'utente
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    })

    if (!module || module.course.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        objectives: objectives || null,
        prerequisites: prerequisites || null,
        durationHours: durationHours ? Number(durationHours) : 1.0,
        methodology: methodology || 'STANDARD',
      },
    })

    return NextResponse.json({ success: true, data: lesson }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/lessons]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}
