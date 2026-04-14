export const runtime = 'edge'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Mappa enum Prisma → chiave per il prompt
const METHODOLOGY_MAP: Record<string, string> = {
  FIVE_E: '5e',
  LAB: 'lab',
  STANDARD: 'standard',
  FLIPPED: 'flipped',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ success: false, message: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const {
      lessonTitle,
      objectives,
      prerequisites,
      methodology,
      activityTypes,
      tone,
      additionalInstructions,
      simulationDescription,
      subject,
      classYear,
      schoolType,
    } = body

    // ── UDA: curricolo ───────────────────────────────────────────────────────
    if (activityTypes[0] === 'UDA_CURRICULAR') {
      const { udaTitle, udaSection, subjects: udaSubjects, schoolType: udaSchoolType } = body
      const sectionMap: Record<string, string> = {
        competences: 'Competenze chiave europee coinvolte (lista puntata, massimo 5)',
        goals: 'Traguardi di competenza disciplinari (lista puntata, riferiti alle Indicazioni Nazionali)',
        knowledge: 'Obiettivi di apprendimento: Conoscenze (lista) e Abilità (lista separata)',
      }
      const curricularPrompt = `Sei un esperto di didattica per le scuole superiori italiane.

Genera i seguenti riferimenti curricolari per questa UDA:

TITOLO UDA: ${udaTitle}
DISCIPLINE: ${(udaSubjects as string[]).join(', ')}
CLASSE: ${classYear}ª — ${udaSchoolType}

SEZIONE DA GENERARE: ${sectionMap[udaSection] ?? udaSection}

Rispondi SOLO con il contenuto richiesto, in italiano, formattato in HTML semplice con <ul> e <li>.
Sii preciso e coerente con le Indicazioni Nazionali italiane.`

      const currStream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: curricularPrompt }],
      })
      const currReadable = new ReadableStream({
        async start(controller) {
          for await (const chunk of currStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          controller.close()
        },
      })
      return new Response(currReadable, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
      })
    }

    // ── UDA: fasi ────────────────────────────────────────────────────────────
    if (activityTypes[0] === 'UDA_PHASES') {
      const { udaTitle, subjects: udaSubjects, totalHours, finalProduct } = body
      const phasesPrompt = `Sei un esperto di progettazione didattica per le scuole superiori italiane.

Progetta le fasi di lavoro per questa UDA:

TITOLO: ${udaTitle}
DISCIPLINE: ${(udaSubjects as string[]).join(', ')}
CLASSE: ${classYear}ª
ORE TOTALI: ${totalHours}
PRODOTTO FINALE: ${finalProduct}

Genera una sequenza di 4-6 fasi didattiche che sommino esattamente ${totalHours} ore.

Formato risposta JSON array (SOLO JSON, nessun testo aggiuntivo):
[
  {
    "title": "Fase 1 — Titolo",
    "hours": 2,
    "methodology": "Frontale",
    "description": "Descrizione attività..."
  }
]`

      const phasesStream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: phasesPrompt }],
      })
      const phasesReadable = new ReadableStream({
        async start(controller) {
          for await (const chunk of phasesStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          controller.close()
        },
      })
      return new Response(phasesReadable, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
      })
    }

    // ── UDA: rubrica ─────────────────────────────────────────────────────────
    if (activityTypes[0] === 'UDA_RUBRIC') {
      const { udaTitle, subjects: udaSubjects, finalProduct } = body
      const rubricPrompt = `Sei un esperto di valutazione didattica per le scuole superiori italiane.

Crea una rubrica valutativa completa per questa UDA:

TITOLO: ${udaTitle}
DISCIPLINE: ${(udaSubjects as string[]).join(', ')}
CLASSE: ${classYear}ª
PRODOTTO FINALE: ${finalProduct}

La rubrica deve avere:
- 4-5 criteri di valutazione pertinenti
- 4 livelli per ogni criterio: Avanzato (9-10) / Intermedio (7-8) / Base (6) / In via di acquisizione (4-5)
- Descrittori chiari e osservabili per ogni livello

Formatta la risposta come tabella HTML con:
- Prima colonna: criterio (sfondo #F8F7FF)
- Colonne 2-5: livelli (Avanzato, Intermedio, Base, In via di acquisizione)
- Header con sfondo #534AB7 e testo bianco
- Righe alternate bianco e #F8F7FF
- Bordi: border: 1px solid #e5e7eb
- Padding celle: padding: 8px 12px
- Font-size: 13px
Rispondi SOLO con la tabella HTML, senza tag html/head/body.`

      const rubricStream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        messages: [{ role: 'user', content: rubricPrompt }],
      })
      const rubricReadable = new ReadableStream({
        async start(controller) {
          for await (const chunk of rubricStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          controller.close()
        },
      })
      return new Response(rubricReadable, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
      })
    }

    // ── Simulazione: percorso separato ───────────────────────────────────────
    if (activityTypes[0] === 'SIMULATION') {
      const simSystemPrompt = `Sei un esperto di didattica e sviluppo web. Crei simulazioni interattive HTML/CSS/JavaScript compatte e autonome per le scuole superiori italiane.

REGOLE — RISPETTALE TUTTE:
1. Genera UNA pagina HTML completa (<!DOCTYPE html> … </html>) — massimo 300 righe totali
2. CSS inline nel <style>, JavaScript inline nel <script>
3. ZERO librerie esterne — solo vanilla HTML/CSS/JS
4. NIENTE Canvas API — usa solo SVG inline o elementi DOM posizionati con CSS
5. Interattività: massimo 2-3 slider o pulsanti, aggiornamento in tempo reale con JS
6. Visualizzazione: SVG semplice (linee, cerchi, rettangoli) o div colorati — niente animazioni complesse
7. Formule matematiche: testo Unicode (² ³ √ ∫ π Δ) — no LaTeX, no MathML
8. Design pulito: sfondo bianco, colori #534AB7 (viola) e #1D9E75 (verde), font system-ui
9. Una sola funzione JS principale che aggiorna tutto al cambio degli slider
10. Concludi SEMPRE con </script></body></html> — il file deve essere sintatticamente completo`

      const simUserPrompt = `Crea una simulazione interattiva HTML COMPATTA (max 300 righe) per:

MATERIA: ${subject}
CLASSE: ${classYear}ª — ${schoolType}
ARGOMENTO: ${lessonTitle}
COSA MOSTRARE: ${simulationDescription || 'Simulazione interattiva sull\'argomento indicato'}

La simulazione deve avere:
- Titolo e breve descrizione didattica (2 righe)
- 1-3 slider per modificare i parametri principali
- Visualizzazione SVG semplice che si aggiorna in tempo reale
- Valori numerici che cambiano sotto la visualizzazione
- Nessuna animazione automatica — solo risposta agli input utente

${additionalInstructions ? `ISTRUZIONI AGGIUNTIVE: ${additionalInstructions}` : ''}

IMPORTANTE: mantieni il codice conciso. Rispondi SOLO con il codice HTML completo, nient'altro.`

      const simStream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        system: simSystemPrompt,
        messages: [{ role: 'user', content: simUserPrompt }],
      })

      const simReadable = new ReadableStream({
        async start(controller) {
          for await (const chunk of simStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          controller.close()
        },
      })

      return new Response(simReadable, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
      })
    }

    // ── Contenuto didattico standard ─────────────────────────────────────────
    // Converte l'enum Prisma nella chiave usata dal prompt
    const methodologyKey = METHODOLOGY_MAP[methodology] ?? 'standard'
    const methodologyInstructions = getMethodologyInstructions(methodologyKey)

    const systemPrompt = `Sei un esperto di didattica per le scuole superiori di secondo grado italiane.
Crei contenuti didattici professionali, chiari e coinvolgenti per i docenti.
Rispondi sempre in italiano.
Struttura il contenuto in HTML semantico pulito usando: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>.
Non usare mai markdown, solo HTML.
Non includere tag <html>, <head>, <body> — solo il contenuto interno.

FORMULE MATEMATICHE E SCIENTIFICHE:
Quando la materia richiede notazione matematica, usa la sintassi LaTeX con delimitatori KaTeX:
- Formule inline (nel testo): $formula$ — es. $x^2 + 2x + 1 = 0$ oppure $E = mc^2$
- Formule in blocco (su riga separata): $$formula$$ — es. $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
Usa sempre questa notazione per: frazioni, radicali, integrali, sommatorie, vettori, simboli greci, apici e pedici complessi.
Esempi corretti: $\\vec{F} = m\\vec{a}$, $\\int_0^\\infty e^{-x^2}dx$, $\\sum_{i=1}^{n} x_i$, $H_2O$, $CO_2$.
REGOLA CRITICA: ogni formula deve apparire UNA SOLA VOLTA — solo in LaTeX. NON scrivere mai la stessa formula anche in testo semplice subito prima o dopo. Sbagliato: "$f(x) = x^3$f(x) = x³". Corretto: "$f(x) = x^3$".`

    const userPrompt = buildUserPrompt({
      lessonTitle,
      objectives,
      prerequisites,
      methodology: methodologyKey,
      methodologyInstructions,
      activityTypes,
      tone,
      additionalInstructions,
      subject,
      classYear,
      schoolType,
    })

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('AI generation error:', message)
    return Response.json(
      { success: false, message },
      { status: 500 }
    )
  }
}

function getMethodologyInstructions(methodology: string): string {
  const instructions: Record<string, string> = {
    '5e': `Segui rigorosamente il modello 5E:
- ENGAGE: aggancia l'attenzione con una domanda provocatoria o situazione reale
- EXPLORE: attività di esplorazione guidata
- EXPLAIN: spiegazione teorica chiara e precisa
- ELABORATE: approfondimento e applicazione in contesti nuovi
- EVALUATE: verifica della comprensione`,
    lab: `Segui l'approccio laboratoriale:
- Inizia con un'attività pratica o problema concreto
- Guida l'osservazione e la raccolta dati
- Porta alla teorizzazione partendo dall'esperienza
- Consolida con la formalizzazione teorica`,
    standard: `Segui la struttura standard:
- INTRODUZIONE: contestualizza e presenta l'argomento
- SVILUPPO: spiega in modo progressivo e dettagliato
- CONSOLIDAMENTO: esempi ed esercizi graduati
- VERIFICA: controllo della comprensione`,
    flipped: `Segui l'approccio flipped classroom:
- MATERIALE PRE-CLASSE: contenuto teorico da studiare a casa (video, testo, risorse)
- ATTIVITÀ IN CLASSE: esercizi, discussione, problem solving collaborativo
- RIFLESSIONE: sintesi e metacognizione`,
  }
  return instructions[methodology] ?? instructions['standard']
}

function buildUserPrompt(params: {
  lessonTitle: string
  objectives?: string
  prerequisites?: string
  methodology: string
  methodologyInstructions: string
  activityTypes: string[]
  tone: string
  additionalInstructions?: string
  subject: string
  classYear: number
  schoolType: string
}): string {
  const toneMap: Record<string, string> = {
    accessibile: 'linguaggio chiaro, semplice e accessibile, con esempi concreti',
    rigoroso: 'linguaggio preciso e rigoroso, con terminologia disciplinare corretta',
    narrativo: 'stile narrativo e coinvolgente, con aneddoti e storie',
    tecnico: 'linguaggio tecnico-specialistico, adatto a studenti avanzati',
  }

  const activityLabels: Record<string, string> = {
    PIANO: 'Piano di lezione completo (obiettivi, fasi temporizzate, materiali, metodologia dettagliata)',
    SPIEGAZIONE: 'Spiegazione teorica completa',
    ESERCIZI: 'Serie di esercizi graduati (almeno 5)',
    VERIFICA: 'Verifica formativa (domande aperte e/o a scelta multipla)',
    SCHEDA: 'Scheda di lavoro per lo studente',
    DIAPOSITIVE: 'Scaletta per presentazione (titoli e punti chiave per ogni slide)',
    COMPITO: 'Compito per casa strutturato',
  }

  const requestedActivities = params.activityTypes
    .map((t) => activityLabels[t] ?? t)
    .join('\n- ')

  return `Crea materiale didattico per la seguente lezione:

DISCIPLINA: ${params.subject}
CLASSE: ${params.classYear}ª — ${params.schoolType}
TITOLO LEZIONE: ${params.lessonTitle}
${params.objectives ? `OBIETTIVI: ${params.objectives}` : ''}
${params.prerequisites ? `PREREQUISITI: ${params.prerequisites}` : ''}

METODOLOGIA: ${params.methodology.toUpperCase()}
${params.methodologyInstructions}

TONO E STILE: ${toneMap[params.tone] ?? toneMap['accessibile']}

CONTENUTI DA GENERARE (SOLO QUESTI, NIENT'ALTRO):
- ${requestedActivities}

REGOLA IMPORTANTE: genera ESCLUSIVAMENTE i contenuti elencati sopra. Non aggiungere sezioni, esercizi, verifiche o altri materiali non richiesti esplicitamente.

${params.additionalInstructions ? `ISTRUZIONI AGGIUNTIVE: ${params.additionalInstructions}` : ''}

Genera contenuti completi, pronti per essere usati in classe, ben strutturati in HTML.
Ogni sezione deve avere un titolo <h2> chiaro che identifichi il tipo di attività.`
}
