'use client'

import { useRef, useEffect } from 'react'

declare global {
  interface Window {
    renderMathInElement?: (el: HTMLElement, options?: object) => void
  }
}

const KATEX_OPTIONS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
  ],
  throwOnError: false,
}

interface ContentViewerProps {
  content: string
  editable?: boolean
  onChange?: (value: string) => void
}

export function ContentViewer({ content, editable, onChange }: ContentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editable || !containerRef.current) return
    const el = containerRef.current

    const render = () => {
      if (window.renderMathInElement) {
        window.renderMathInElement(el, KATEX_OPTIONS)
      }
    }

    // Prova subito (KaTeX potrebbe essere già caricato)
    render()

    // Ascolta l'evento nel caso KaTeX non fosse ancora pronto
    window.addEventListener('katex-ready', render)
    return () => window.removeEventListener('katex-ready', render)
  }, [content, editable])

  if (editable) {
    return (
      <textarea
        className="w-full min-h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-y leading-relaxed"
        value={content}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Modifica il contenuto HTML qui..."
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className="ai-content p-6 bg-white rounded-lg min-h-16"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
