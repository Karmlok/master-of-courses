'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function handleAccept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  function handleReject() {
    localStorage.setItem('cookie_consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#534AB7] shadow-lg p-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-600 flex-1">
          Utilizziamo cookie tecnici necessari al funzionamento della piattaforma.
          Non usiamo cookie di profilazione o tracciamento di terze parti.{' '}
          <Link href="/privacy" className="text-[#534AB7] underline hover:text-[#3C3489]">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Rifiuta
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-[#534AB7] text-white rounded-lg hover:bg-[#3C3489] transition-colors font-medium"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  )
}
