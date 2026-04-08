'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import {
  User, Lock, Trash2, Camera, Loader2, Check, AlertTriangle, Eye, EyeOff,
} from 'lucide-react'

// ─── Tipi ─────────────────────────────────────────────────────────────────────

type Tab = 'profilo' | 'sicurezza' | 'account'

interface Props {
  initialName: string
  initialSchool: string | null
  initialAvatarUrl: string | null
  email: string
  createdAt: string
  coursesCount: number
  lessonsCount: number
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function SuccessMsg({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#1D9E75] bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
      <Check size={14} /> {text}
    </div>
  )
}

function ErrorMsg({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
      <AlertTriangle size={14} /> {text}
    </div>
  )
}

// ─── Sezione Profilo ──────────────────────────────────────────────────────────

function ProfiloSection({ initialName, initialSchool, initialAvatarUrl, email }: {
  initialName: string
  initialSchool: string | null
  initialAvatarUrl: string | null
  email: string
}) {
  const [name, setName] = useState(initialName)
  const [school, setSchool] = useState(initialSchool ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setAvatarUrl(json.avatarUrl)
      setSuccess('Foto aggiornata!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Il nome è obbligatorio'); return }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, school }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setSuccess('Profilo aggiornato con successo!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-1">Profilo</h2>
        <p className="text-sm text-gray-500">Gestisci la tua foto e le informazioni personali.</p>
      </div>

      {/* Avatar upload */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar name={name} avatarUrl={avatarUrl} size="lg" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#534AB7] hover:bg-[#3C3489] text-white rounded-full flex items-center justify-center shadow transition-colors disabled:opacity-50"
            title="Cambia foto"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-[#1A1A2E]">{name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{email}</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG o WebP · max 2MB</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
            placeholder="es. Maria Rossi"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Per cambiare email vai alla sezione Sicurezza.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome scuola <span className="text-gray-400 font-normal">(opzionale)</span>
          </label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
            placeholder="es. Liceo Scientifico G. Galilei"
          />
        </div>

        {success && <SuccessMsg text={success} />}
        {error && <ErrorMsg text={error} />}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? 'Salvataggio...' : 'Salva modifiche'}
        </button>
      </form>
    </div>
  )
}

// ─── Sezione Sicurezza ────────────────────────────────────────────────────────

function SicurezzaSection() {
  const supabase = createClient()

  // Password
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [pwdError, setPwdError] = useState('')

  // Email
  const [newEmail, setNewEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')
  const [emailError, setEmailError] = useState('')

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd.length < 8) { setPwdError('La password deve essere di almeno 8 caratteri'); return }
    if (newPwd !== confirmPwd) { setPwdError('Le password non coincidono'); return }
    setSavingPwd(true)
    setPwdError('')
    setPwdSuccess('')
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) { setPwdError(error.message) } else {
      setPwdSuccess('Password aggiornata con successo!')
      setNewPwd(''); setConfirmPwd('')
      setTimeout(() => setPwdSuccess(''), 4000)
    }
    setSavingPwd(false)
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.includes('@')) { setEmailError('Email non valida'); return }
    setSavingEmail(true)
    setEmailError('')
    setEmailSuccess('')
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) { setEmailError(error.message) } else {
      setEmailSuccess('Email di verifica inviata. Controlla la casella di entrambi gli indirizzi.')
      setNewEmail('')
      setTimeout(() => setEmailSuccess(''), 6000)
    }
    setSavingEmail(false)
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-1">Sicurezza</h2>
        <p className="text-sm text-gray-500">Aggiorna password ed email del tuo account.</p>
      </div>

      {/* Cambio password */}
      <div className="max-w-md space-y-4">
        <h3 className="text-sm font-semibold text-[#1A1A2E] uppercase tracking-wide">Cambia password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nuova password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                placeholder="Minimo 8 caratteri"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Conferma password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
              placeholder="Ripeti la nuova password"
            />
          </div>
          {pwdSuccess && <SuccessMsg text={pwdSuccess} />}
          {pwdError && <ErrorMsg text={pwdError} />}
          <button
            type="submit"
            disabled={savingPwd || !newPwd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {savingPwd ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            {savingPwd ? 'Aggiornamento...' : 'Aggiorna password'}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-100" />

      {/* Cambio email */}
      <div className="max-w-md space-y-4">
        <h3 className="text-sm font-semibold text-[#1A1A2E] uppercase tracking-wide">Cambia email</h3>
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nuova email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
              placeholder="nuova@email.com"
            />
          </div>
          {emailSuccess && <SuccessMsg text={emailSuccess} />}
          {emailError && <ErrorMsg text={emailError} />}
          <button
            type="submit"
            disabled={savingEmail || !newEmail}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {savingEmail ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {savingEmail ? 'Invio...' : 'Cambia email'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Sezione Account ──────────────────────────────────────────────────────────

function AccountSection({ email, createdAt, coursesCount, lessonsCount }: {
  email: string
  createdAt: string
  coursesCount: number
  lessonsCount: number
}) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const registeredOn = new Date(createdAt).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  async function handleDelete() {
    if (confirmEmail !== email) { setError('L\'email non corrisponde'); return }
    setDeleting(true)
    setError('')
    const res = await fetch('/api/account', { method: 'DELETE' })
    const json = await res.json()
    if (!json.success) {
      setError(json.message ?? 'Errore eliminazione')
      setDeleting(false)
      return
    }
    router.push('/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-1">Account</h2>
        <p className="text-sm text-gray-500">Riepilogo del tuo account e gestione avanzata.</p>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Iscritto dal', value: registeredOn },
          { label: 'Corsi creati', value: coursesCount },
          { label: 'Lezioni create', value: lessonsCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#F8F7FF] rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-lg font-semibold text-[#1A1A2E]">{value}</p>
          </div>
        ))}
      </div>

      {/* Zona pericolosa */}
      <div className="border border-red-200 rounded-xl p-5 space-y-3 bg-red-50/40">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-700">Zona pericolosa</h3>
        </div>
        <p className="text-sm text-red-600">
          Eliminare l&apos;account rimuove in modo permanente tutti i tuoi corsi, lezioni e materiali. Questa operazione è irreversibile.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
        >
          Elimina account
        </button>
      </div>

      {/* Modale conferma */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A2E]">Elimina account</h3>
                <p className="text-xs text-gray-500">Azione irreversibile</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Tutti i tuoi dati (corsi, moduli, lezioni, attività) verranno eliminati definitivamente.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Per confermare, digita la tua email: <span className="text-gray-400">{email}</span>
              </label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => { setConfirmEmail(e.target.value); setError('') }}
                placeholder={email}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            {error && <ErrorMsg text={error} />}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowModal(false); setConfirmEmail(''); setError('') }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmEmail !== email}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Eliminazione...' : 'Elimina definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Componente principale ────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profilo',   label: 'Profilo',   icon: User  },
  { key: 'sicurezza', label: 'Sicurezza', icon: Lock  },
  { key: 'account',  label: 'Account',   icon: User  },
]

export function SettingsClient({
  initialName, initialSchool, initialAvatarUrl,
  email, createdAt, coursesCount, lessonsCount,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('profilo')

  return (
    <div className="flex gap-8 min-h-[500px]">
      {/* Nav sinistra */}
      <nav className="w-44 shrink-0">
        <ul className="space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <li key={key}>
              <button
                onClick={() => setActiveTab(key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  activeTab === key
                    ? 'bg-[#EEEDFE] text-[#534AB7]'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Contenuto */}
      <div className="flex-1 min-w-0">
        {activeTab === 'profilo' && (
          <ProfiloSection
            initialName={initialName}
            initialSchool={initialSchool}
            initialAvatarUrl={initialAvatarUrl}
            email={email}
          />
        )}
        {activeTab === 'sicurezza' && <SicurezzaSection />}
        {activeTab === 'account' && (
          <AccountSection
            email={email}
            createdAt={createdAt}
            coursesCount={coursesCount}
            lessonsCount={lessonsCount}
          />
        )}
      </div>
    </div>
  )
}
