import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/udas — lista UDA dell'utente autenticato
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const udas = await prisma.uDA.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { phases: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, udas })
}

// POST /api/udas — crea nuova UDA
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const body = await request.json()
  const { title, subjects, classYear, classSection, schoolType, period, totalHours, finalProduct } = body

  if (!title || !subjects?.length || !classYear || !classSection || !schoolType) {
    return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 })
  }

  const uda = await prisma.uDA.create({
    data: {
      userId: user.id,
      title,
      subjects,
      classYear: Number(classYear),
      classSection,
      schoolType,
      period: period || null,
      totalHours: Number(totalHours) || 10,
      finalProduct: finalProduct || null,
    },
  })

  return NextResponse.json({ success: true, uda })
}
