import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true, avatarUrl: true },
  })

  return (
    <DashboardShell
      role={dbUser?.role ?? 'TEACHER'}
      name={dbUser?.name ?? ''}
      avatarUrl={dbUser?.avatarUrl ?? null}
    >
      {children}
    </DashboardShell>
  )
}
