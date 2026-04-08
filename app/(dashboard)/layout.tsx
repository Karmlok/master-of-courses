import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/Sidebar'
import { redirect } from 'next/navigation'

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
    <div className="flex min-h-screen bg-white">
      <Sidebar
        role={dbUser?.role ?? 'TEACHER'}
        name={dbUser?.name ?? ''}
        avatarUrl={dbUser?.avatarUrl ?? null}
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
