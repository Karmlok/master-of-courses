'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Trash2, FileDown, FileText, FileType2, Bot } from 'lucide-react'
import type { Activity } from '@prisma/client'

// ─── Costanti ─────────────────────────────────────────────────────────────────

const ACTIVITY_LABELS: Record<string, string> = {
  PIANO: 'Piano di lezione',
  SPIEGAZIONE: 'Spiegazione',
  ESERCIZI: 'Esercizi',
  VERIFICA: 'Verifica',
  SCHEDA: 'Scheda',
  DIAPOSITIVE: 'Diapositive',
  COMPITO: 'Compito',
}

// ─── Utility: inietta ID nelle h2 per il TOC ──────────────────────────────────

function parseAndInjectIds(html: string): {
  processedHtml: string
  sections: Array<{ id: string; label: string }>
} {
  const sections: Array<{ id: string; label: string }> = []
  let counter = 0
  const processedHtml = html.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (_, attrs: string, inner: string) => {
      const id = `toc-${counter++}`
      const label = inner.replace(/<[^>]+>/g, '').trim()
      sections.push({ id, label })
      return `<h2${attrs} id="${id}">${inner}</h2>`
    }
  )
  return { processedHtml, sections }
}

// ─── Utility: export PDF ──────────────────────────────────────────────────────

function exportPDF(title: string, content: string) {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Abilita i popup del browser per esportare il PDF.')
    return
  }
  win.document.write(`<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; max-width: 800px; margin: 2cm auto; color: #1a1a2e; font-size: 11pt; line-height: 1.65; }
    .doc-title { font-size: 18pt; font-weight: 700; color: #534AB7; border-bottom: 2px solid #534AB7; padding-bottom: 8px; margin-bottom: 24px; }
    h2 { font-size: 13pt; font-weight: 700; border-bottom: 1px solid #EEEDFE; padding-bottom: 4px; margin-top: 28px; margin-bottom: 10px; }
    h3 { font-size: 11.5pt; font-weight: 600; color: #534AB7; margin-top: 18px; margin-bottom: 6px; }
    p { margin-bottom: 10px; }
    ul, ol { margin-left: 22px; margin-bottom: 12px; }
    li { margin-bottom: 4px; }
    strong { font-weight: 700; }
    em { font-style: italic; color: #4B5563; }
    blockquote { border-left: 4px solid #534AB7; padding: 8px 16px; background: #F8F7FF; margin: 14px 0; font-style: italic; color: #4B5563; border-radius: 0 6px 6px 0; }
    .footer { margin-top: 48px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9pt; color: #999; text-align: right; }
    @media print { body { margin: 1.5cm; } h2 { page-break-after: avoid; } }
  </style>
</head>
<body>
  <p class="doc-title">${title}</p>
  ${content}
  <p class="footer">Master of Courses — ${new Date().toLocaleDateString('it-IT')}</p>
</body>
</html>`)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 300)
}

// ─── Utility: export Word (.doc) ─────────────────────────────────────────────

function exportWord(title: string, content: string) {
  const htmlDoc = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 2cm; color: #1a1a2e; line-height: 1.5; }
    h1 { font-size: 18pt; color: #534AB7; margin-bottom: 12pt; }
    h2 { font-size: 14pt; color: #1a1a2e; border-bottom: 1pt solid #EEEDFE; margin-top: 18pt; margin-bottom: 6pt; }
    h3 { font-size: 12pt; color: #534AB7; margin-top: 12pt; margin-bottom: 4pt; }
    p { margin-bottom: 8pt; }
    ul, ol { margin-left: 18pt; margin-bottom: 10pt; }
    li { margin-bottom: 3pt; }
    strong { font-weight: 700; }
    em { font-style: italic; }
    blockquote { border-left: 3pt solid #534AB7; padding-left: 12pt; color: #4B5563; font-style: italic; margin: 10pt 0; }
    .footer { margin-top: 24pt; font-size: 9pt; color: #999; border-top: 1pt solid #ddd; padding-top: 6pt; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
  <p class="footer">Master of Courses — ${new Date().toLocaleDateString('it-IT')}</p>
</body>
</html>`
  const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').toLowerCase()}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Utility: export Markdown ─────────────────────────────────────────────────

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${t.replace(/<[^>]+>/g, '').trim()}\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${t.replace(/<[^>]+>/g, '').trim()}\n`)
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '_$1_')
    .replace(/<i>([\s\S]*?)<\/i>/gi, '_$1_')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) =>
      t.replace(/<[^>]+>/g, '').trim().split('\n')
        .map((l: string) => `> ${l.trim()}`).filter((l: string) => l !== '>').join('\n') + '\n\n'
    )
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${t.replace(/<[^>]+>/g, '').trim()}\n`)
    .replace(/<[ou]l[^>]*>/gi, '\n').replace(/<\/[ou]l>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `${t.replace(/<[^>]+>/g, '').trim()}\n\n`)
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function exportMarkdown(title: string, content: string) {
  const md = `# ${title}\n\n${htmlToMarkdown(content)}`
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').toLowerCase()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Tipi ─────────────────────────────────────────────────────────────────────

interface ActivityPanelProps {
  activity: Activity | null
  selectedTypeLabel: string
  onGenerate: () => void
  onDelete: (id: string) => void
  isDeleting: boolean
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ActivityPanel({
  activity,
  selectedTypeLabel,
  onGenerate,
  onDelete,
  isDeleting,
}: ActivityPanelProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const { processedHtml, sections } = parseAndInjectIds(activity?.content ?? '')
  const showTOC = sections.length >= 2

  // IntersectionObserver per scroll tracking del TOC
  useEffect(() => {
    if (!showTOC || !contentRef.current || !activity?.content) return

    const headings = Array.from(contentRef.current.querySelectorAll('h2[id]'))
    if (headings.length === 0) return

    setActiveSection(headings[0].id)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-5% 0px -75% 0px', threshold: 0 }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [showTOC, processedHtml, activity?.content])

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Stato vuoto ──────────────────────────────────────────────────────────────
  if (!activity) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
        <div className="w-14 h-14 rounded-full bg-[#F8F7FF] flex items-center justify-center text-2xl mb-5">
          ✦
        </div>
        <p className="text-[#1A1A2E] font-semibold mb-1">
          Nessun contenuto per &ldquo;{selectedTypeLabel}&rdquo;
        </p>
        <p className="text-gray-400 text-sm mb-6 max-w-xs">
          Genera questo contenuto con l&apos;IA: sarà pronto in pochi secondi.
        </p>
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Sparkles size={15} />
          Genera {selectedTypeLabel}
        </button>
      </div>
    )
  }

  // ── Contenuto presente ───────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-200 bg-gray-50/80">
        {/* Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-[#EEEDFE] text-[#534AB7] rounded-full font-medium">
            {ACTIVITY_LABELS[activity.type] ?? activity.type}
          </span>
          {activity.aiGenerated && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-full font-medium">
              <Bot size={10} />
              Generato con IA
            </span>
          )}
        </div>

        {/* Pulsanti export + elimina */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => exportPDF(activity.title, activity.content!)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-[#534AB7] hover:bg-[#EEEDFE] rounded-lg transition-colors font-medium"
            title="Esporta come PDF"
          >
            <FileDown size={13} />
            PDF
          </button>
          <button
            onClick={() => exportMarkdown(activity.title, activity.content!)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-[#534AB7] hover:bg-[#EEEDFE] rounded-lg transition-colors font-medium"
            title="Esporta come Markdown"
          >
            <FileText size={13} />
            MD
          </button>
          <button
            onClick={() => exportWord(activity.title, activity.content!)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-[#534AB7] hover:bg-[#EEEDFE] rounded-lg transition-colors font-medium"
            title="Esporta come Word"
          >
            <FileType2 size={13} />
            Word
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button
            onClick={() => onDelete(activity.id)}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
            title="Elimina attività"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body: TOC interno + contenuto */}
      <div className="flex flex-1 min-h-0">
        {/* TOC (solo se ≥ 2 sezioni h2) */}
        {showTOC && (
          <div className="w-44 shrink-0 border-r border-gray-100 bg-[#FAFAFA] py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 mb-2">
              Sezioni
            </p>
            <nav className="px-2 space-y-0.5">
              {sections.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  title={label}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors leading-snug ${
                    activeSection === id
                      ? 'bg-[#EEEDFE] text-[#534AB7] font-semibold'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {label.length > 42 ? label.slice(0, 40) + '…' : label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Contenuto HTML */}
        <div
          ref={contentRef}
          className="ai-content flex-1 px-6 py-5 min-w-0"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </div>
    </div>
  )
}
