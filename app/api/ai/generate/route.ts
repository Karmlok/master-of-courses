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

    // ── Simulazione: percorso separato ───────────────────────────────────────
    if (activityTypes[0] === 'SIMULATION') {
      const simSystemPrompt = `Sei un esperto di didattica e sviluppo web. Crei simulazioni interattive HTML/CSS/JavaScript complete e autonome per la didattica delle scuole superiori italiane.

REGOLE FONDAMENTALI:
1. Genera SEMPRE una pagina HTML completa e autonoma (con <!DOCTYPE html>, <head>, <body>)
2. Tutto il CSS deve essere inline nel <style> interno
3. Tutto il JavaScript deve essere inline nel <script> interno
4. NON usare librerie esterne CDN — solo vanilla HTML/CSS/JS
5. La pagina deve funzionare offline, senza connessione internet
6. Usa Canvas API o SVG per le visualizzazioni grafiche
7. Rendi tutto responsive e utilizzabile su tablet
8. Aggiungi commenti nel codice JavaScript per spiegare la logica
9. Includi una breve guida d'uso per lo studente nella pagina
10. Usa colori vivaci e un design moderno e accattivante
11. Per le formule matematiche usa testo Unicode (es. ² √ ∫ π) — no LaTeX`

      const simUserPrompt = `Crea una simulazione interattiva HTML completa per:

MATERIA: ${subject}
CLASSE: ${classYear}ª — ${schoolType}
ARGOMENTO: ${lessonTitle}
DESCRIZIONE SIMULAZIONE: ${simulationDescription || 'Simulazione interattiva sull\'argomento indicato'}

La simulazione deve:
- Essere visivamente accattivante e moderna
- Avere controlli interattivi (slider, pulsanti, input) per esplorare il concetto
- Mostrare feedback visivo immediato alle interazioni
- Includere etichette e spiegazioni direttamente nella visualizzazione
- Avere un titolo chiaro e una breve descrizione dell'obiettivo didattico
- Funzionare perfettamente su desktop e tablet

${additionalInstructions ? `ISTRUZIONI AGGIUNTIVE: ${additionalInstructions}` : ''}

Genera il codice HTML completo e autonomo. Rispondi SOLO con il codice HTML, nient'altro.`

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
