'use client'

import Script from 'next/script'

/**
 * Carica KaTeX da CDN e dispatcha 'katex-ready' quando auto-render è pronto.
 * Usato nel root layout come client component.
 */
export function KaTeXInit() {
  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.dispatchEvent(new Event('katex-ready'))
        }}
      />
    </>
  )
}
