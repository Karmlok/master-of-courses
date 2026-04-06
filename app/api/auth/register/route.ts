import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { id, email, name, school } = await request.json()

    if (!id || !email || !name) {
      return NextResponse.json(
        { success: false, message: 'Campi obbligatori mancanti.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        school: school || null,
        role: 'TEACHER',
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('[API /auth/register]', error)
    return NextResponse.json(
      { success: false, message: 'Errore durante la creazione del profilo.' },
      { status: 500 }
    )
  }
}
