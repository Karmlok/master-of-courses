import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string; phaseId: string }> }

// POST — collega una lezione a una fase
export async function POST(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id, phaseId } = await params
  const body = await request.json()
  const { lessonId, title, notes } = body

  // Verifica che l'UDA appartenga all'utente
  const uda = await prisma.uDA.findFirst({ where: { id, userId: user.id } })
  if (!uda) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  const count = await prisma.uDAPhaseLesson.count({ where: { phaseId } })

  const link = await prisma.uDAPhaseLesson.create({
    data: {
      phaseId,
      lessonId: lessonId ?? null,
      title: title ?? 'Lezione',
      notes: notes ?? null,
      position: count,
    },
    include: {
      lesson: { select: { id: true, title: true, status: true } },
    },
  })

  return NextResponse.json({ success: true, link })
}

// DELETE — rimuove il collegamento (passa phaseLessonId nel body)
export async function DELETE(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await params
  const { phaseLessonId } = await request.json()

  const uda = await prisma.uDA.findFirst({ where: { id, userId: user.id } })
  if (!uda) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  await prisma.uDAPhaseLesson.delete({ where: { id: phaseLessonId } })

  return NextResponse.json({ success: true })
}
