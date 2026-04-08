'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const METHODOLOGIES = [
  {
    key: 'five_e',
    label: 'Modello 5E',
    color: '#534AB7',
    bg: '#EEEDFE',
    phases: ['Engage', 'Explore', 'Explain', 'Elaborate', 'Evaluate'],
    desc: 'Il ciclo dell\'apprendimento in 5 fasi. Ogni lezione segue un percorso che parte dall\'aggancio emotivo, passa per l\'esplorazione autonoma e la spiegazione teorica, fino alla valutazione della comprensione.',
    ideal: 'Scienze, biologia, chimica, fisica',
  },
  {
    key: 'lab',
    label: 'Laboratoriale',
    color: '#1D9E75',
    bg: '#ecfdf5',
    phases: ['Attività pratica', 'Osservazione', 'Teorizzazione', 'Formalizzazione'],
    desc: 'Prima si fa, poi si capisce. Gli studenti partono da un\'esperienza concreta o un problema reale, osservano, raccolgono dati e arrivano alla teoria in modo induttivo.',
    ideal: 'STEM, laboratori di fisica e chimica',
  },
  {
    key: 'standard',
    label: 'Standard',
    color: '#185FA5',
    bg: '#eff6ff',
    phases: ['Introduzione', 'Sviluppo', 'Consolidamento', 'Verifica'],
    desc: 'La struttura classica della lezione scolastica italiana, ottimizzata e arricchita dall\'IA. Introduzione contestuale, sviluppo progressivo, esempi graduati e verifica finale.',
    ideal: 'Tutte le materie, ogni livello',
  },
  {
    key: 'flipped',
    label: 'Flipped Classroom',
    color: '#BA7517',
    bg: '#fffbeb',
    phases: ['Materiale pre-classe', 'Attività in classe', 'Riflessione'],
    desc: 'La teoria si studia a casa, il tempo in classe è dedicato a esercizi, discussioni e problem solving collaborativo. L\'IA genera sia il materiale da studiare che le attività per la classe.',
    ideal: 'Classi avanzate, lingue, storia',
  },
]

export function MethodologyTabs() {
  const [active, setActive] = useState('five_e')
  const current = METHODOLOGIES.find(m => m.key === active)!

  return (
    <div className="space-y-6">
      {/* Tab selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {METHODOLOGIES.map(m => (
          <button
            key={m.key}
            onClick={() => setActive(m.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all',
              active === m.key
                ? 'text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
            style={active === m.key ? { backgroundColor: m.color, borderColor: m.color } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Contenuto */}
      <div
        className="rounded-2xl p-7 border transition-all"
        style={{ backgroundColor: current.bg, borderColor: `${current.color}30` }}
      >
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold" style={{ color: current.color }}>
              {current.label}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">{current.desc}</p>
            <p className="text-xs text-gray-400">
              <span className="font-semibold">Ideale per:</span> {current.ideal}
            </p>
          </div>
          <div className="sm:w-52 shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Fasi</p>
            <div className="space-y-2">
              {current.phases.map((phase, i) => (
                <div key={phase} className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: current.color }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{phase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
