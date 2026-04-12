import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { KaTeXInit } from '@/components/KaTeXInit'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://master-of-courses.vercel.app'),
  title: {
    default: "Master of Courses — Crea lezioni con l'IA",
    template: '%s | Master of Courses',
  },
  description: 'La piattaforma AI per docenti delle scuole superiori italiane. Genera lezioni, verifiche, esercizi e simulazioni interattive con Claude AI.',
  keywords: ['didattica', 'intelligenza artificiale', 'docenti', 'scuola superiore', 'lezioni', 'AI', 'materiali didattici', 'Italia'],
  authors: [{ name: 'Master of Courses' }],
  creator: 'Master of Courses',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://master-of-courses.vercel.app',
    siteName: 'Master of Courses',
    title: "Master of Courses — Crea lezioni con l'IA",
    description: 'La piattaforma AI per docenti delle scuole superiori italiane.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Master of Courses' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Master of Courses — Crea lezioni con l'IA",
    description: 'La piattaforma AI per docenti delle scuole superiori italiane.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
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
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
