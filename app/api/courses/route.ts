import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/courses — lista corsi dell'utente autenticato
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non autenticato.' },
        { status: 401 }
      )
    }

    const courses = await prisma.course.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { modules: true } },
        modules: {
          include: { _count: { select: { lessons: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: courses })
  } catch (error) {
    console.error('[GET /api/courses]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}

// POST /api/courses — crea nuovo corso
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
    const { subject, classYear, classSection, schoolType, curriculumRef, description } = body

    if (!subject || !classYear || !classSection || !schoolType) {
      return NextResponse.json(
        { success: false, message: 'Campi obbligatori mancanti.' },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        userId: user.id,
        subject,
        classYear: Number(classYear),
        classSection,
        schoolType,
        curriculumRef: curriculumRef || null,
        description: description || null,
      },
    })

    return NextResponse.json({ success: true, data: course }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/courses]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}
