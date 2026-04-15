'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#534AB7] text-xl font-bold">✦</span>
          <span className="font-semibold text-[#1A1A2E]">Master of Courses</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-[#534AB7] transition-colors font-medium">
            Accedi
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Registrati gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <div className="w-5 space-y-1">
            <span className={`block h-0.5 bg-gray-600 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-gray-600 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-gray-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-[#534AB7]">
            Accedi
          </Link>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="block w-full text-center px-4 py-2.5 bg-[#534AB7] text-white text-sm font-semibold rounded-lg"
          >
            Registrati gratis
          </Link>
        </div>
      )}
    </header>
  )
}
