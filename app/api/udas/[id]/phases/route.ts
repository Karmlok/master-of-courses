import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/udas/[id]/phases
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await params

  const uda = await prisma.uDA.findFirst({ where: { id, userId: user.id } })
  if (!uda) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  const phases = await prisma.uDAPhase.findMany({
    where: { udaId: id },
    orderBy: { position: 'asc' },
    include: {
      lessons: {
        orderBy: { position: 'asc' },
        include: { lesson: { select: { id: true, title: true, status: true } } },
      },
    },
  })

  return NextResponse.json({ success: true, phases })
}

// POST /api/udas/[id]/phases — crea nuova fase
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const uda = await prisma.uDA.findFirst({ where: { id, userId: user.id } })
  if (!uda) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  const { title, hours, methodology, description, tools, position } = body

  if (!title) return NextResponse.json({ error: 'Titolo fase obbligatorio' }, { status: 400 })

  const phase = await prisma.uDAPhase.create({
    data: {
      udaId: id,
      title,
      hours: Number(hours) || 2,
      methodology: methodology || null,
      description: description || null,
      tools: tools || null,
      position: Number(position) ?? 0,
    },
  })

  return NextResponse.json({ success: true, phase })
}
