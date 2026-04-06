import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/courses/[id]
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

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: { orderBy: { position: 'asc' } },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Corso non trovato.' },
        { status: 404 }
      )
    }

    if (course.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    console.error('[GET /api/courses/[id]]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[id]
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

    const existing = await prisma.course.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Corso non trovato.' },
        { status: 404 }
      )
    }

    if (existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { subject, classYear, classSection, schoolType, curriculumRef, description, isActive } = body

    const course = await prisma.course.update({
      where: { id },
      data: {
        subject: subject ?? existing.subject,
        classYear: classYear ? Number(classYear) : existing.classYear,
        classSection: classSection ?? existing.classSection,
        schoolType: schoolType ?? existing.schoolType,
        curriculumRef: curriculumRef !== undefined ? curriculumRef : existing.curriculumRef,
        description: description !== undefined ? description : existing.description,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    })

    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    console.error('[PUT /api/courses/[id]]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id]
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

    const existing = await prisma.course.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Corso non trovato.' },
        { status: 404 }
      )
    }

    if (existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    await prisma.course.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Corso eliminato.' })
  } catch (error) {
    console.error('[DELETE /api/courses/[id]]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}
