'use client'

import { Menu } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

interface MobileNavbarProps {
  onMenuClick: () => void
  name: string
  avatarUrl: string | null
}

export function MobileNavbar({ onMenuClick, name, avatarUrl }: MobileNavbarProps) {
  return (
    <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-20">

      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Apri menu"
      >
        <Menu size={22} />
      </button>

      {/* Logo centro */}
      <span className="text-base font-semibold text-[#534AB7]">
        Master of Courses
      </span>

      {/* Avatar destra */}
      <div className="w-8 h-8">
        <Avatar name={name || 'U'} avatarUrl={avatarUrl} size="sm" />
      </div>

    </header>
  )
}
