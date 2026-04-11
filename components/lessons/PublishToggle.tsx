'use client'

import { useState } from 'react'
import { Globe, Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PublishToggleProps {
  lessonId: string
  isPublic: boolean
}

export function PublishToggle({ lessonId, isPublic: initialPublic }: PublishToggleProps) {
  const [isPublic, setIsPublic] = useState(initialPublic)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  async function toggle(newValue: boolean) {
    setLoading(true)
    try {
      const res = await fetch(`/api/lessons/${lessonId}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: newValue }),
      })
      const json = await res.json()
      if (json.success) {
        setIsPublic(newValue)
        router.refresh()
      }
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => (isPublic ? toggle(false) : setShowConfirm(true))}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-60 ${
          isPublic
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        }`}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : isPublic ? (
          <Globe size={15} />
        ) : (
          <Lock size={15} />
        )}
        {isPublic ? 'Pubblica' : 'Privata'}
      </button>

      {/* Modale di conferma pubblicazione */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-[#1A1A2E] mb-2">
              Pubblica nella libreria?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Stai per condividere questa lezione con tutti i docenti di Master of Courses.
              Il tuo nome apparirà come autore. Vuoi continuare?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={() => toggle(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#534AB7] hover:bg-[#3C3489] rounded-lg"
              >
                Sì, pubblica
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
