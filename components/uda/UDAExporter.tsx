'use client'

import { useState } from 'react'
import { Loader2, X, FileDown, Table2 } from 'lucide-react'
import { toast } from 'sonner'

interface Phase {
  id: string
  title: string
  description: string | null
  hours: number
  methodology: string | null
  tools: string | null
  position: number
}

interface UDA {
  id: string
  title: string
  subjects: string[]
  classYear: number
  classSection: string
  schoolType: string
  period: string | null
  totalHours: number
  finalProduct: string | null
  europeanCompetences: string | null
  learningGoals: string | null
  knowledgeSkills: string | null
  evaluationCriteria: string | null
  evaluationRubric: string | null
  status: string
  phases: Phase[]
}

interface UDAExporterProps {
  uda: UDA
  onClose: () => void
}

export function UDAExporter({ uda, onClose }: UDAExporterProps) {
  const [loadingFull, setLoadingFull] = useState(false)
  const [loadingRubric, setLoadingRubric] = useState(false)

  async function handleExport(type: 'full' | 'rubric') {
    if (type === 'full') setLoadingFull(true)
    else setLoadingRubric(true)

    try {
      const res = await fetch('/api/udas/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ udaId: uda.id, type }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Errore durante l\'export')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = type === 'rubric'
        ? `Rubrica_${uda.title.replace(/\s+/g, '_')}.docx`
        : `UDA_${uda.title.replace(/\s+/g, '_')}.docx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(type === 'rubric' ? 'Rubrica scaricata' : 'Documento UDA scaricato')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore export')
    } finally {
      setLoadingFull(false)
      setLoadingRubric(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1A1A2E]">Esporta UDA</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Riepilogo UDA */}
        <div className="bg-[#F8F7FF] rounded-xl p-4 mb-5 text-sm space-y-1">
          <p className="font-semibold text-[#1A1A2E]">{uda.title}</p>
          <p className="text-gray-500">{uda.subjects.join(', ')} — {uda.classYear}ª {uda.classSection} {uda.schoolType}</p>
          <p className="text-gray-500">{uda.phases.length} fasi · {uda.totalHours}h totali</p>
        </div>

        {/* Due opzioni di export */}
        <div className="space-y-3 mb-5">

          {/* Export completo */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1A1A2E] mb-1">Documento UDA completo</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Intestazione, riferimenti curricolari, tabella fasi, criteri di valutazione, prodotto finale.
                  La rubrica è esclusa (vedi sotto).
                </p>
              </div>
              <button
                onClick={() => handleExport('full')}
                disabled={loadingFull || loadingRubric}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#534AB7] hover:bg-[#3C3489] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {loadingFull ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                {loadingFull ? '...' : 'Word'}
              </button>
            </div>
          </div>

          {/* Export rubrica */}
          <div className={`border rounded-xl p-4 ${uda.evaluationRubric ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1A1A2E] mb-1">
                  Rubrica valutativa
                  {!uda.evaluationRubric && <span className="ml-2 text-xs font-normal text-gray-400">(non ancora generata)</span>}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Tabella Word in formato orizzontale con livelli Avanzato / Intermedio / Base / In via di acquisizione.
                </p>
              </div>
              <button
                onClick={() => handleExport('rubric')}
                disabled={!uda.evaluationRubric || loadingFull || loadingRubric}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#1D9E75] hover:bg-[#178a63] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {loadingRubric ? <Loader2 size={13} className="animate-spin" /> : <Table2 size={13} />}
                {loadingRubric ? '...' : 'Word'}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Chiudi
        </button>
      </div>
    </div>
  )
}
