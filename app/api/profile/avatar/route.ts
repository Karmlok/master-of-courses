import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * POST — carica l'avatar su Supabase Storage e aggiorna avatarUrl nel DB.
 *
 * Prerequisiti Supabase:
 *  1. Crea bucket "avatars" (public) in Storage > Buckets
 *  2. Aggiungi policy INSERT: (auth.uid())::text = (storage.foldername(name))[1]
 *  3. Aggiungi policy UPDATE: stessa condizione
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ success: false, message: 'Non autorizzato' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return Response.json({ success: false, message: 'Nessun file ricevuto' }, { status: 400 })
    if (file.size > MAX_SIZE) return Response.json({ success: false, message: 'Il file supera i 2MB' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ success: false, message: 'Formato non supportato (usa JPG, PNG o WebP)' }, { status: 400 })

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
    const path = `${user.id}/avatar.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    // Aggiunge un timestamp per evitare cache del browser
    const avatarUrl = `${publicUrl}?t=${Date.now()}`

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    })

    return Response.json({ success: true, avatarUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore upload'
    return Response.json({ success: false, message }, { status: 500 })
  }
}
