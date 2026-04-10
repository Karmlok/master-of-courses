'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Download, Maximize2, Minimize2, MonitorSmartphone } from 'lucide-react'

interface SimulationViewerProps {
  htmlContent: string
  title: string
}

const HEIGHTS = [300, 500, 700] as const
const HEIGHT_LABELS = ['Compatta', 'Normale', 'Grande']

function exportSimulation(html: string, title: string) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-simulazione.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function SimulationViewer({ htmlContent, title }: SimulationViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [heightIndex, setHeightIndex] = useState(1) // default: Normale (500px)

  useEffect(() => {
    if (!iframeRef.current || !htmlContent) return
    const iframe = iframeRef.current
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(htmlContent)
      doc.close()
    }
  }, [htmlContent])

  const currentHeight = HEIGHTS[heightIndex]

  return (
    <div className="w-full rounded-lg border border-gray-200 overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Play size={13} className="text-emerald-600 fill-emerald-600" />
          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{title}</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium shrink-0">
            Simulazione interattiva
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Selettore altezza */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 mr-1">
            {HEIGHT_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => setHeightIndex(i)}
                title={`${label} (${HEIGHTS[i]}px)`}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  heightIndex === i
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {i === 0 ? <Minimize2 size={12} /> : i === 2 ? <Maximize2 size={12} /> : <MonitorSmartphone size={12} />}
              </button>
            ))}
          </div>

          {/* Esporta HTML */}
          <button
            onClick={() => exportSimulation(htmlContent, title)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
            title="Scarica simulazione come file HTML autonomo"
          >
            <Download size={12} />
            Esporta HTML
          </button>
        </div>
      </div>

      {/* Iframe sandboxed */}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        className="w-full block transition-all duration-200"
        style={{ height: `${currentHeight}px`, border: 'none' }}
        title={title}
      />
    </div>
  )
}
