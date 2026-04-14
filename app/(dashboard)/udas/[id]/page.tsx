import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { UDADetailClient } from './UDADetailClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const uda = await prisma.uDA.findUnique({ where: { id }, select: { title: true } })
  return { title: uda ? `${uda.title} | Master of Courses` : 'UDA | Master of Courses' }
}

export default async function UDADetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const uda = await prisma.uDA.findFirst({
    where: { id, userId: user.id },
    include: {
      phases: {
        orderBy: { position: 'asc' },
        include: {
          lessons: {
            orderBy: { position: 'asc' },
            include: { lesson: { select: { id: true, title: true, status: true } } },
          },
        },
      },
    },
  })

  if (!uda) notFound()

  return <UDADetailClient uda={JSON.parse(JSON.stringify(uda))} />
}
