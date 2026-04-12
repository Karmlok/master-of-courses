'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Qualcosa è andato storto
        </h2>
        <p className="text-gray-500 mb-8">
          Si è verificato un errore imprevisto. Riprova oppure torna alla dashboard.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">Codice: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#534AB7] text-white rounded-lg hover:bg-[#3C3489] transition-colors font-medium"
          >
            Riprova
          </button>
          <a
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
