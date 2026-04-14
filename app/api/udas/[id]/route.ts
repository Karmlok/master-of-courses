import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/udas/[id] — UDA completa con fasi e lezioni
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await params

  const uda = await prisma.uDA.findFirst({
    where: { id, userId: user.id },
    include: {
      phases: {
        orderBy: { position: 'asc' },
        include: {
          lessons: {
            orderBy: { position: 'asc' },
            include: { lesson: { select: { id: true, title: true, status: true } } },
          },
        },
      },
    },
  })

  if (!uda) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  return NextResponse.json({ success: true, uda })
}

// PUT /api/udas/[id] — aggiorna UDA
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.uDA.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  const uda = await prisma.uDA.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.subjects !== undefined && { subjects: body.subjects }),
      ...(body.classYear !== undefined && { classYear: Number(body.classYear) }),
      ...(body.classSection !== undefined && { classSection: body.classSection }),
      ...(body.schoolType !== undefined && { schoolType: body.schoolType }),
      ...(body.period !== undefined && { period: body.period }),
      ...(body.totalHours !== undefined && { totalHours: Number(body.totalHours) }),
      ...(body.finalProduct !== undefined && { finalProduct: body.finalProduct }),
      ...(body.europeanCompetences !== undefined && { europeanCompetences: body.europeanCompetences }),
      ...(body.learningGoals !== undefined && { learningGoals: body.learningGoals }),
      ...(body.knowledgeSkills !== undefined && { knowledgeSkills: body.knowledgeSkills }),
      ...(body.evaluationCriteria !== undefined && { evaluationCriteria: body.evaluationCriteria }),
      ...(body.evaluationRubric !== undefined && { evaluationRubric: body.evaluationRubric }),
      ...(body.status !== undefined && { status: body.status }),
    },
  })

  return NextResponse.json({ success: true, uda })
}

// DELETE /api/udas/[id] — elimina UDA (cascade su fasi)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.uDA.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  await prisma.uDA.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
