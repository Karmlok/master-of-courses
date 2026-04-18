'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNavbar } from '@/components/layout/MobileNavbar'
import { MobileDrawer } from '@/components/layout/MobileDrawer'

interface DashboardShellProps {
  children: React.ReactNode
  role: string
  name: string
  avatarUrl: string | null
}

export function DashboardShell({ children, role, name, avatarUrl }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-white">

      {/* Sidebar — visibile solo da md in su */}
      <div className="hidden md:flex">
        <Sidebar role={role} name={name} avatarUrl={avatarUrl} />
      </div>

      {/* Drawer mobile — slide-in su mobile */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        role={role}
        name={name}
        avatarUrl={avatarUrl}
      />

      {/* Overlay scuro quando drawer è aperto */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Contenuto principale */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Navbar mobile — visibile solo su mobile */}
        <MobileNavbar
          onMenuClick={() => setDrawerOpen(true)}
          name={name}
          avatarUrl={avatarUrl}
        />

        {/* Contenuto pagina */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
