'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CourseFormData {
  subject: string
  classYear: string
  classSection: string
  schoolType: string
  curriculumRef: string
  description: string
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>
  courseId?: string
  mode: 'create' | 'edit'
}

const SCHOOL_TYPES = [
  'Liceo Scientifico',
  'Liceo Classico',
  'Liceo Linguistico',
  'Liceo Artistico',
  'Liceo delle Scienze Umane',
  'Istituto Tecnico',
  'Istituto Professionale',
  'Altro',
]

export function CourseForm({ initialData, courseId, mode }: CourseFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<CourseFormData>({
    subject: initialData?.subject ?? '',
    classYear: initialData?.classYear ?? '1',
    classSection: initialData?.classSection ?? '',
    schoolType: initialData?.schoolType ?? '',
    curriculumRef: initialData?.curriculumRef ?? '',
    description: initialData?.description ?? '',
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
      const url = mode === 'create' ? '/api/courses' : `/api/courses/${courseId}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          classYear: Number(form.classYear),
        }),
      })

      const json = await res.json()

      if (!json.success) {
        setError(json.message || 'Si è verificato un errore.')
        return
      }

      router.push(mode === 'create' ? `/courses/${json.data.id}` : `/courses/${courseId}`)
      router.refresh()
    } catch {
      setError('Errore di rete. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Disciplina */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Disciplina <span className="text-red-500">*</span>
        </label>
        <input
          name="subject"
          type="text"
          required
          value={form.subject}
          onChange={handleChange}
          placeholder="es. Matematica, Fisica, Storia..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
        />
      </div>

      {/* Anno e Sezione */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Anno di corso <span className="text-red-500">*</span>
          </label>
          <select
            name="classYear"
            value={form.classYear}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
          >
            {[1, 2, 3, 4, 5].map((y) => (
              <option key={y} value={y}>
                {y}ª anno
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Sezione <span className="text-red-500">*</span>
          </label>
          <input
            name="classSection"
            type="text"
            required
            value={form.classSection}
            onChange={handleChange}
            placeholder="es. A, B, C..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
          />
        </div>
      </div>

      {/* Tipo scuola */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tipo di scuola <span className="text-red-500">*</span>
        </label>
        <select
          name="schoolType"
          value={form.schoolType}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
        >
          <option value="">Seleziona tipo di scuola...</option>
          {SCHOOL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Riferimento curricolare */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Riferimento curricolare{' '}
          <span className="text-gray-400 font-normal">(opzionale)</span>
        </label>
        <input
          name="curriculumRef"
          type="text"
          value={form.curriculumRef}
          onChange={handleChange}
          placeholder="es. Indicazioni nazionali 2010, Piano di studi..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
        />
      </div>

      {/* Descrizione */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Descrizione{' '}
          <span className="text-gray-400 font-normal">(opzionale)</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Breve descrizione del corso..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent resize-none"
        />
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
              ? 'Crea corso'
              : 'Salva modifiche'}
        </button>
      </div>
    </form>
  )
}
