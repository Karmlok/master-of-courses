'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteLessonButtonProps {
  lessonId: string
  courseId: string
}

export function DeleteLessonButton({ lessonId, courseId }: DeleteLessonButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
      return
    }

    setLoading(true)
    const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' })

    if (res.ok) {
      router.push(`/courses/${courseId}`)
      router.refresh()
    } else {
      setLoading(false)
      setConfirm(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
        confirm
          ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
          : 'border-red-200 text-red-600 hover:bg-red-50'
      }`}
    >
      <Trash2 size={15} />
      {loading ? 'Eliminazione...' : confirm ? 'Conferma' : 'Elimina'}
    </button>
  )
}
