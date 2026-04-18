'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X, LayoutDashboard, BookOpen, FolderOpen, BookMarked, Settings, LogOut, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'I miei corsi', icon: BookOpen },
  { href: '/udas', label: 'UDA', icon: FolderOpen },
  { href: '/library', label: 'Libreria', icon: BookMarked },
]

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  role: string
  name: string
  avatarUrl: string | null
}

export function MobileDrawer({ open, onClose, role, name, avatarUrl }: MobileDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Chiudi il drawer quando cambia pagina
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Blocca lo scroll del body quando drawer è aperto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 h-full w-72 bg-[#F8F7FF] z-40 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header drawer */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-[#534AB7] text-lg font-bold">✦</span>
          <span className="text-base font-semibold text-[#534AB7]">
            Master of Courses
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Chiudi menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#EEEDFE] text-[#534AB7] font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          )
        })}

        {role === 'ADMIN' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-orange-50 text-orange-600 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <ShieldCheck size={20} />
            Pannello Admin
          </Link>
        )}
      </nav>

      {/* Footer drawer — avatar + impostazioni + esci */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-[#EEEDFE] text-[#534AB7]'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <Avatar name={name || 'U'} avatarUrl={avatarUrl} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name || 'Utente'}</p>
            <p className="text-xs text-gray-400">Impostazioni</p>
          </div>
          <Settings size={14} className="text-gray-400 shrink-0" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} />
          Esci
        </button>
        <div className="flex items-center gap-3 px-3 pt-1">
          <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Privacy
          </Link>
          <span className="text-gray-300 text-xs">·</span>
          <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Termini
          </Link>
        </div>
      </div>
    </div>
  )
}
