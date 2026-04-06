import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'
import { Users, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== 'ADMIN') redirect('/dashboard')

  // Statistiche globali
  const [totalUsers, totalCourses, totalLessons, totalAdmins, users] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { courses: true } } },
    }),
  ])

  const stats = [
    { label: 'Docenti registrati', value: totalUsers, icon: Users, color: 'text-[#534AB7]' },
    { label: 'Corsi totali', value: totalCourses, icon: BookOpen, color: 'text-[#1D9E75]' },
    { label: 'Lezioni totali', value: totalLessons, icon: GraduationCap, color: 'text-blue-600' },
    { label: 'Amministratori', value: totalAdmins, icon: ShieldCheck, color: 'text-orange-500' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Pannello Admin</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestione utenti e statistiche della piattaforma
        </p>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <Icon size={18} className={stat.color} />
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Tabella utenti */}
      <div>
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Utenti registrati</h2>
        <AdminUsersTable users={users} currentUserId={dbUser.id} />
      </div>
    </div>
  )
}
