import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== 'ADMIN') return null
  return dbUser
}

// GET /api/admin/users — lista tutti gli utenti
export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { courses: true } },
      },
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('[GET /api/admin/users]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}
