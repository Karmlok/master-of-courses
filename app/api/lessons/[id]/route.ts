import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

async function getLessonWithAuth(id: string, userId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { module: { include: { course: true } } },
  })

  if (!lesson) return { lesson: null, authorized: false }
  const authorized = lesson.module.course.userId === userId
  return { lesson, authorized }
}

// GET /api/lessons/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non autenticato.' },
        { status: 401 }
      )
    }

    const { lesson, authorized } = await getLessonWithAuth(id, user.id)

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Lezione non trovata.' },
        { status: 404 }
      )
    }

    if (!authorized) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, data: lesson })
  } catch (error) {
    console.error('[GET /api/lessons/[id]]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}

// PUT /api/lessons/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non autenticato.' },
        { status: 401 }
      )
    }

    const { lesson: existing, authorized } = await getLessonWithAuth(id, user.id)

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Lezione non trovata.' },
        { status: 404 }
      )
    }

    if (!authorized) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, objectives, prerequisites, durationHours, methodology, status } = body

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        objectives: objectives !== undefined ? objectives : existing.objectives,
        prerequisites: prerequisites !== undefined ? prerequisites : existing.prerequisites,
        durationHours: durationHours ? Number(durationHours) : existing.durationHours,
        methodology: methodology ?? existing.methodology,
        status: status ?? existing.status,
      },
    })

    return NextResponse.json({ success: true, data: lesson })
  } catch (error) {
    console.error('[PUT /api/lessons/[id]]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}

// DELETE /api/lessons/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non autenticato.' },
        { status: 401 }
      )
    }

    const { lesson, authorized } = await getLessonWithAuth(id, user.id)

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Lezione non trovata.' },
        { status: 404 }
      )
    }

    if (!authorized) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    await prisma.lesson.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Lezione eliminata.' })
  } catch (error) {
    console.error('[DELETE /api/lessons/[id]]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}
