import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SettingsClient } from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [dbUser, coursesCount, lessonsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, school: true, avatarUrl: true, createdAt: true },
    }),
    prisma.course.count({ where: { userId: user.id } }),
    prisma.lesson.count({ where: { module: { course: { userId: user.id } } } }),
  ])

  if (!dbUser) redirect('/login')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Impostazioni</h1>
        <p className="text-gray-500 mt-1">Gestisci il tuo profilo e le preferenze dell&apos;account.</p>
      </div>

      <SettingsClient
        initialName={dbUser.name}
        initialSchool={dbUser.school}
        initialAvatarUrl={dbUser.avatarUrl}
        email={user.email ?? ''}
        createdAt={dbUser.createdAt.toISOString()}
        coursesCount={coursesCount}
        lessonsCount={lessonsCount}
      />
    </div>
  )
}
