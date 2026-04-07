import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ success: false, message: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content } = body

    // Verifica ownership tramite la catena activity → lesson → module → course
    const existing = await prisma.activity.findFirst({
      where: {
        id,
        lesson: {
          module: {
            course: { userId: user.id },
          },
        },
      },
    })

    if (!existing) {
      return Response.json({ success: false, message: 'Attività non trovata' }, { status: 404 })
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: { title, content },
    })

    return Response.json({ success: true, data: updated })
  } catch (error) {
    console.error('Activity update error:', error)
    return Response.json(
      { success: false, message: "Errore nell'aggiornamento" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ success: false, message: 'Non autorizzato' }, { status: 401 })
    }

    // Verifica ownership
    const existing = await prisma.activity.findFirst({
      where: {
        id,
        lesson: {
          module: {
            course: { userId: user.id },
          },
        },
      },
    })

    if (!existing) {
      return Response.json({ success: false, message: 'Attività non trovata' }, { status: 404 })
    }

    await prisma.activity.delete({ where: { id } })

    return Response.json({ success: true, message: 'Attività eliminata' })
  } catch (error) {
    console.error('Activity delete error:', error)
    return Response.json(
      { success: false, message: "Errore nell'eliminazione" },
      { status: 500 }
    )
  }
}
