import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { KaTeXInit } from '@/components/KaTeXInit'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'master-of-courses',
  description: 'Piattaforma per docenti delle scuole superiori',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full antialiased text-[#1A1A2E]">
        {children}
        <KaTeXInit />
      </body>
    </html>
  )
}
