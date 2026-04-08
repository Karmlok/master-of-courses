import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { prisma } from '@/lib/prisma'

// GET — statistiche account
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ success: false, message: 'Non autorizzato' }, { status: 401 })

    const [coursesCount, lessonsCount] = await Promise.all([
      prisma.course.count({ where: { userId: user.id } }),
      prisma.lesson.count({ where: { module: { course: { userId: user.id } } } }),
    ])

    return Response.json({ success: true, stats: { coursesCount, lessonsCount } })
  } catch {
    return Response.json({ success: false, message: 'Errore nel recupero statistiche' }, { status: 500 })
  }
}

// DELETE — elimina account (DB + Supabase Auth)
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ success: false, message: 'Non autorizzato' }, { status: 401 })

    // 1. Elimina da Prisma (cascade su corsi, moduli, lezioni, attività)
    await prisma.user.delete({ where: { id: user.id } })

    // 2. Elimina avatar da Storage (ignora errori se non esiste)
    await supabase.storage.from('avatars').remove([
      `${user.id}/avatar.jpg`,
      `${user.id}/avatar.png`,
      `${user.id}/avatar.webp`,
    ])

    // 3. Elimina da Supabase Auth (richiede service role key)
    await supabaseAdmin.auth.admin.deleteUser(user.id)

    return Response.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore eliminazione account'
    return Response.json({ success: false, message }, { status: 500 })
  }
}
