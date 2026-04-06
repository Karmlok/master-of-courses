import { NextRequest, NextResponse } from 'next/server'
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

// PUT /api/admin/users/[id] — cambia ruolo utente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    // Non permettere di cambiare il proprio ruolo
    if (admin.id === id) {
      return NextResponse.json(
        { success: false, message: 'Non puoi modificare il tuo stesso ruolo.' },
        { status: 400 }
      )
    }

    const { role } = await request.json()
    if (!['ADMIN', 'TEACHER'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Ruolo non valido.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('[PUT /api/admin/users/[id]]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] — elimina utente
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Accesso non autorizzato.' },
        { status: 403 }
      )
    }

    if (admin.id === id) {
      return NextResponse.json(
        { success: false, message: 'Non puoi eliminare il tuo account da qui.' },
        { status: 400 }
      )
    }

    // Elimina dal DB Prisma (cascade elimina anche corsi/lezioni)
    await prisma.user.delete({ where: { id } })

    // Elimina anche da Supabase Auth (usando service role)
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await adminSupabase.auth.admin.deleteUser(id)

    return NextResponse.json({ success: true, message: 'Utente eliminato.' })
  } catch (error) {
    console.error('[DELETE /api/admin/users/[id]]', error)
    return NextResponse.json(
      { success: false, message: 'Errore del server.' },
      { status: 500 }
    )
  }
}
