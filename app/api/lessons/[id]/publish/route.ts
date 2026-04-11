import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, message: 'Non autenticato.' }, { status: 401 })

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    })
    if (!lesson) return NextResponse.json({ success: false, message: 'Lezione non trovata.' }, { status: 404 })
    if (lesson.module.course.userId !== user.id)
      return NextResponse.json({ success: false, message: 'Non autorizzato.' }, { status: 403 })

    const { isPublic } = await request.json()

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        isPublic: Boolean(isPublic),
        publishedAt: isPublic ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[PUT /api/lessons/[id]/publish]', error)
    return NextResponse.json({ success: false, message: 'Errore del server.' }, { status: 500 })
  }
}
