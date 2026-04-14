'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UDACard } from '@/components/uda/UDACard'

interface UDA {
  id: string
  title: string
  subjects: string[]
  classYear: number
  classSection: string
  schoolType: string
  period: string | null
  totalHours: number
  status: 'DRAFT' | 'READY' | 'PUBLISHED'
  createdAt: string
  _count: { phases: number }
}

export function UDAListClient({ udas: initial }: { udas: UDA[] }) {
  const router = useRouter()
  const [udas, setUdas] = useState(initial)

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questa UDA? L\'operazione non può essere annullata.')) return

    const res = await fetch(`/api/udas/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUdas((prev) => prev.filter((u) => u.id !== id))
      toast.success('UDA eliminata')
    } else {
      toast.error('Errore durante l\'eliminazione')
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {udas.map((uda) => (
        <UDACard key={uda.id} uda={uda} onDelete={handleDelete} />
      ))}
    </div>
  )
}
