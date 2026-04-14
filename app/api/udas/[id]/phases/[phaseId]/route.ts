import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// PUT /api/udas/[id]/phases/[phaseId]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id, phaseId } = await params
  const body = await request.json()

  const uda = await prisma.uDA.findFirst({ where: { id, userId: user.id } })
  if (!uda) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  const phase = await prisma.uDAPhase.update({
    where: { id: phaseId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.hours !== undefined && { hours: Number(body.hours) }),
      ...(body.methodology !== undefined && { methodology: body.methodology }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.tools !== undefined && { tools: body.tools }),
      ...(body.position !== undefined && { position: Number(body.position) }),
    },
  })

  return NextResponse.json({ success: true, phase })
}

// DELETE /api/udas/[id]/phases/[phaseId]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id, phaseId } = await params

  const uda = await prisma.uDA.findFirst({ where: { id, userId: user.id } })
  if (!uda) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  await prisma.uDAPhase.delete({ where: { id: phaseId } })

  return NextResponse.json({ success: true })
}
