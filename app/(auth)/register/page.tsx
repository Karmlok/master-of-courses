'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, MailCheck } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    school: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          school: form.school,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Errore durante la registrazione. Riprova.')
      setLoading(false)
      return
    }

    // Crea il record nel DB
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.user.id,
        email: form.email,
        name: form.name,
        school: form.school || null,
      }),
    })

    if (!res.ok) {
      const json = await res.json()
      setError(json.message || 'Errore durante la creazione del profilo.')
      setLoading(false)
      return
    }

    // Se la sessione è già attiva (conferma email disabilitata) vai alla dashboard
    if (data.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    // Altrimenti mostra il messaggio di conferma email
    setEmailSent(true)
    setLoading(false)
  }

  // Schermata di conferma email inviata
  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#534AB7]">master-of-courses</h1>
            <p className="text-sm text-gray-500 mt-1">Piattaforma per docenti</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-4">
              <MailCheck size={28} className="text-[#534AB7]" />
            </div>

            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">
              Controlla la tua email
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              Abbiamo inviato un link di conferma a:
            </p>
            <p className="font-medium text-[#534AB7] text-sm mb-6">
              {form.email}
            </p>

            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              Clicca sul link nell&apos;email per attivare il tuo account e accedere alla piattaforma.
              Controlla anche la cartella spam se non lo trovi.
            </p>

            <Link
              href="/login"
              className="inline-block px-5 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Vai al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#534AB7]">master-of-courses</h1>
          <p className="text-sm text-gray-500 mt-1">Piattaforma per docenti</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-[#1A1A2E] mb-6">Crea account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Mario Rossi"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="docente@scuola.it"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimo 6 caratteri"
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome scuola{' '}
                <span className="text-gray-400 font-normal">(opzionale)</span>
              </label>
              <input
                id="school"
                name="school"
                type="text"
                value={form.school}
                onChange={handleChange}
                placeholder="I.I.S. Galileo Galilei"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
              />
            </div>

            {/* Avviso email di conferma */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
              📧 Dopo la registrazione riceverai una email di conferma. Dovrai cliccare sul link per attivare il tuo account.
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Registrazione in corso...' : 'Crea account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Hai già un account?{' '}
            <Link href="/login" className="text-[#534AB7] hover:underline font-medium">
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
