'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BookOpen, BookMarked, LayoutDashboard, LogOut, Settings, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'I miei corsi', icon: BookOpen },
  { href: '/library', label: 'Libreria', icon: BookMarked },
]

interface SidebarProps {
  role: string
  name: string
  avatarUrl: string | null
}

export function Sidebar({ role, name, avatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-[#F8F7FF] border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-[#534AB7]">Master of Courses</h1>
        <p className="text-xs text-gray-500 mt-0.5">Piattaforma per docenti</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#EEEDFE] text-[#534AB7] font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}

        {role === 'ADMIN' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-orange-50 text-orange-600 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <ShieldCheck size={18} />
            Pannello Admin
          </Link>
        )}
      </nav>

      {/* Footer con avatar */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        {/* Utente */}
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-[#EEEDFE]'
              : 'hover:bg-gray-100'
          )}
        >
          <Avatar name={name || 'U'} avatarUrl={avatarUrl} size="sm" />
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium truncate',
              pathname.startsWith('/settings') ? 'text-[#534AB7]' : 'text-[#1A1A2E]'
            )}>
              {name || 'Utente'}
            </p>
            <p className={cn(
              'text-xs',
              pathname.startsWith('/settings') ? 'text-[#534AB7]/70' : 'text-gray-400'
            )}>
              Impostazioni
            </p>
          </div>
          <Settings size={14} className={pathname.startsWith('/settings') ? 'text-[#534AB7]' : 'text-gray-400'} />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={18} />
          Esci
        </button>
      </div>
    </aside>
  )
}
