'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const METHODOLOGIES = [
  {
    key: 'STANDARD',
    label: 'Standard',
    description: 'Introduzione → Sviluppo → Consolidamento → Verifica',
  },
  {
    key: 'FIVE_E',
    label: 'Modello 5E',
    description: 'Engage → Explore → Explain → Elaborate → Evaluate',
  },
  {
    key: 'LAB',
    label: 'Laboratoriale',
    description: 'Attività pratica prima della teoria',
  },
  {
    key: 'FLIPPED',
    label: 'Flipped Classroom',
    description: 'Teoria a casa, attività in classe',
  },
]

const DURATIONS = [
  { value: '1', label: '1 ora' },
  { value: '2', label: '2 ore' },
  { value: '3', label: '3 ore' },
  { value: '4', label: 'Più lezioni' },
]

interface LessonFormData {
  moduleId: string
  title: string
  objectives: string
  prerequisites: string
  durationHours: string
  methodology: string
}

interface LessonFormProps {
  initialData?: Partial<LessonFormData>
  lessonId?: string
  mode: 'create' | 'edit'
  defaultModuleId?: string
}

export function LessonForm({ initialData, lessonId, mode, defaultModuleId }: LessonFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<LessonFormData>({
    moduleId: initialData?.moduleId ?? defaultModuleId ?? '',
    title: initialData?.title ?? '',
    objectives: initialData?.objectives ?? '',
    prerequisites: initialData?.prerequisites ?? '',
    durationHours: initialData?.durationHours ?? '1',
    methodology: initialData?.methodology ?? 'STANDARD',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = mode === 'create' ? '/api/lessons' : `/api/lessons/${lessonId}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          durationHours: Number(form.durationHours),
        }),
      })

      const json = await res.json()

      if (!json.success) {
        setError(json.message || 'Si è verificato un errore.')
        return
      }

      router.push(`/lessons/${json.data.id}`)
      router.refresh()
    } catch {
      setError('Errore di rete. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Titolo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Titolo della lezione <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          placeholder="es. Le equazioni di secondo grado"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
        />
      </div>

      {/* Obiettivi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Obiettivi di apprendimento{' '}
          <span className="text-gray-400 font-normal">(opzionale)</span>
        </label>
        <textarea
          name="objectives"
          value={form.objectives}
          onChange={handleChange}
          rows={3}
          placeholder="Cosa sapranno fare gli studenti al termine della lezione..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent resize-none"
        />
      </div>

      {/* Prerequisiti */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Prerequisiti{' '}
          <span className="text-gray-400 font-normal">(opzionale)</span>
        </label>
        <input
          name="prerequisites"
          type="text"
          value={form.prerequisites}
          onChange={handleChange}
          placeholder="es. Equazioni di primo grado, concetto di funzione..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
        />
      </div>

      {/* Durata */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Durata <span className="text-red-500">*</span>
        </label>
        <select
          name="durationHours"
          value={form.durationHours}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
        >
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Metodologia — card cliccabili */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Metodologia <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {METHODOLOGIES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, methodology: m.key }))}
              className={cn(
                'text-left px-4 py-3 rounded-xl border-2 transition-all',
                form.methodology === m.key
                  ? 'border-[#534AB7] bg-[#EEEDFE]'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <p
                className={cn(
                  'font-medium text-sm',
                  form.methodology === m.key ? 'text-[#534AB7]' : 'text-gray-800'
                )}
              >
                {m.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {m.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-60 text-white text-sm font-medium transition-colors"
        >
          {loading
            ? 'Salvataggio...'
            : mode === 'create'
              ? 'Crea lezione'
              : 'Salva modifiche'}
        </button>
      </div>
    </form>
  )
}
