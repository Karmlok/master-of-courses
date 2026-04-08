import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Script from 'next/script'
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
        {/* KaTeX — rendering formule matematiche */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
