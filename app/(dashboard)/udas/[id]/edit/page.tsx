import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { UDAEditClient } from './UDAEditClient'

export const metadata = { title: 'Modifica UDA | Master of Courses' }

export default async function UDAEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const uda = await prisma.uDA.findFirst({
    where: { id, userId: user.id },
    include: {
      phases: { orderBy: { position: 'asc' } },
    },
  })

  if (!uda) notFound()

  return <UDAEditClient uda={JSON.parse(JSON.stringify(uda))} />
}
