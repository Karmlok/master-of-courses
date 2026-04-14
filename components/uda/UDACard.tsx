'use client'

import { useRouter } from 'next/navigation'
import { FolderOpen, Pencil, Trash2, FileDown, Clock, BookOpen, Calendar } from 'lucide-react'

interface UDACardProps {
  uda: {
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
  onDelete: (id: string) => void
}

const STATUS_CONFIG = {
  DRAFT:     { label: 'Bozza',      className: 'bg-gray-100 text-gray-600' },
  READY:     { label: 'Pronta',     className: 'bg-green-100 text-green-700' },
  PUBLISHED: { label: 'Pubblicata', className: 'bg-[#EEEDFE] text-[#534AB7]' },
}

const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
]

export function UDACard({ uda, onDelete }: UDACardProps) {
  const router = useRouter()
  const status = STATUS_CONFIG[uda.status]

  const formattedDate = new Date(uda.createdAt).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-[#1A1A2E] leading-snug line-clamp-2 flex-1">
          {uda.title}
        </h3>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Discipline */}
      <div className="flex flex-wrap gap-1.5">
        {uda.subjects.map((s, i) => (
          <span
            key={s}
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <BookOpen size={13} className="shrink-0" />
          <span>{uda.classYear}ª {uda.classSection} — {uda.schoolType}</span>
        </div>
        {uda.period && (
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="shrink-0" />
            <span>{uda.period}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="shrink-0" />
            {uda.totalHours}h totali
          </span>
          <span className="flex items-center gap-1.5">
            <FolderOpen size={13} className="shrink-0" />
            {uda._count.phases} {uda._count.phases === 1 ? 'fase' : 'fasi'}
          </span>
        </div>
        <span className="text-gray-400">Creata il {formattedDate}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={() => router.push(`/udas/${uda.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <FolderOpen size={13} />
          Apri
        </button>
        <button
          onClick={() => router.push(`/udas/${uda.id}/edit`)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg transition-colors"
        >
          <Pencil size={13} />
          Modifica
        </button>
        <button
          onClick={() => onDelete(uda.id)}
          className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors"
        >
          <Trash2 size={13} />
        </button>
        <button
          title="Esporta Word"
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium rounded-lg transition-colors"
          onClick={() => router.push(`/udas/${uda.id}?export=word`)}
        >
          <FileDown size={13} />
        </button>
      </div>
    </div>
  )
}
