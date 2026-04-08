import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// GET — restituisce il profilo corrente
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ success: false, message: 'Non autorizzato' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, school: true, avatarUrl: true, createdAt: true },
    })

    return Response.json({ success: true, user: { ...dbUser, email: user.email } })
  } catch {
    return Response.json({ success: false, message: 'Errore nel recupero profilo' }, { status: 500 })
  }
}

// PUT — aggiorna nome, scuola e/o avatarUrl
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ success: false, message: 'Non autorizzato' }, { status: 401 })

    const { name, school, avatarUrl } = await request.json()

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(school !== undefined && { school: school?.trim() || null }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: { name: true, school: true, avatarUrl: true },
    })

    return Response.json({ success: true, user: updated })
  } catch {
    return Response.json({ success: false, message: 'Errore nel salvataggio' }, { status: 500 })
  }
}
