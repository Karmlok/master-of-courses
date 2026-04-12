import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pagina non trovata' }

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="text-8xl font-bold text-[#534AB7] mb-4">404</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Pagina non trovata
        </h2>
        <p className="text-gray-500 mb-8">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#534AB7] text-white rounded-lg hover:bg-[#3C3489] transition-colors font-medium inline-block"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  )
}
