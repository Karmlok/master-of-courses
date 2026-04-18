import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { UDAListClient } from './UDAListClient'

export const metadata = { title: 'Le mie UDA | Master of Courses' }

export default async function UDAsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const udas = await prisma.uDA.findMany({
    where: { userId: user.id },
    include: { _count: { select: { phases: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Le mie UDA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Unità di Apprendimento per le tue classi
          </p>
        </div>
        <Link
          href="/udas/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nuova UDA
        </Link>
      </div>

      {/* Contenuto */}
      {udas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EEEDFE] flex items-center justify-center mb-4">
            <FolderOpen size={28} className="text-[#534AB7]" />
          </div>
          <h2 className="text-lg font-semibold text-[#1A1A2E] mb-2">
            Nessuna UDA ancora
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            Crea la tua prima Unità di Apprendimento con l&apos;aiuto dell&apos;IA: obiettivi curricolari,
            fasi di lavoro e rubrica valutativa in pochi minuti.
          </p>
          <Link
            href="/udas/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={15} />
            Crea la tua prima UDA
          </Link>
        </div>
      ) : (
        <UDAListClient udas={JSON.parse(JSON.stringify(udas))} />
      )}
    </div>
  )
}
