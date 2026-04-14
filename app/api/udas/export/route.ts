import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, Header, PageNumber,
} from 'docx'

// ─── Utility HTML ─────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .trim()
}

function htmlToTextLines(html: string): string[] {
  return html
    .replace(/<li>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]*>/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

/** Parsa una tabella HTML in { headers, rows } */
function parseHtmlTable(html: string): { headers: string[]; rows: string[][] } {
  const extractCells = (rowHtml: string): string[] => {
    const cells: string[] = []
    const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
    let m
    while ((m = cellRe.exec(rowHtml)) !== null) {
      cells.push(stripHtml(m[1]).trim())
    }
    return cells
  }

  const headers: string[] = []
  const headMatch = html.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i)
  if (headMatch) {
    const trMatch = headMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/i)
    if (trMatch) headers.push(...extractCells(trMatch[1]))
  }

  // Fallback: prima riga del body se non c'è thead
  const rows: string[][] = []
  const bodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)
  const source = bodyMatch ? bodyMatch[1] : html
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let trMatch
  while ((trMatch = trRe.exec(source)) !== null) {
    const cells = extractCells(trMatch[1])
    if (cells.length) rows.push(cells)
  }

  return { headers, rows }
}

// ─── Costanti stile ───────────────────────────────────────────────────────────

const PURPLE = '534AB7'
const LIGHT_GRAY = 'F8F7FF'
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' }
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }

function sectionHeader(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 24, font: 'Arial' })],
    shading: { fill: PURPLE, type: ShadingType.CLEAR },
    spacing: { before: 240, after: 80 },
    indent: { left: 120, right: 120 },
  })
}

function bodyPara(text: string, opts?: { bold?: boolean; italic?: boolean; indent?: boolean }) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts?.bold, italics: opts?.italic, size: 22, font: 'Arial' })],
    spacing: { before: 60, after: 60 },
    indent: opts?.indent ? { left: 360 } : undefined,
  })
}

// ─── Builder rubrica Word ─────────────────────────────────────────────────────

function buildRubricTable(rubricHtml: string): Table | null {
  const { headers, rows } = parseHtmlTable(rubricHtml)
  if (!rows.length && !headers.length) return null

  const colCount = Math.max(headers.length, ...rows.map((r) => r.length))
  if (colCount === 0) return null

  // Larghezze colonne: prima colonna più larga (criteri), le altre uguali
  const TOTAL = 9026
  const firstColW = Math.round(TOTAL * 0.22)
  const restW = Math.round((TOTAL - firstColW) / Math.max(colCount - 1, 1))
  const colWidths = [firstColW, ...Array(Math.max(colCount - 1, 0)).fill(restW)]

  const makeCell = (text: string, colIdx: number, isHeader: boolean, rowIdx: number) =>
    new TableCell({
      borders: BORDERS,
      width: { size: colWidths[colIdx] ?? restW, type: WidthType.DXA },
      shading: {
        fill: isHeader ? PURPLE : rowIdx % 2 === 0 ? 'FFFFFF' : LIGHT_GRAY,
        type: ShadingType.CLEAR,
      },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({
          text,
          bold: isHeader,
          color: isHeader ? 'FFFFFF' : '1A1A2E',
          size: isHeader ? 20 : 18,
          font: 'Arial',
        })],
      })],
    })

  const tableRows: TableRow[] = []

  if (headers.length) {
    tableRows.push(new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => makeCell(h, i, true, 0)),
    }))
  }

  rows.forEach((row, ri) => {
    tableRows.push(new TableRow({
      children: row.map((cell, ci) => makeCell(cell, ci, false, ri)),
    }))
  })

  return new Table({
    width: { size: TOTAL, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: tableRows,
  })
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { udaId, type = 'full' } = await request.json()

  const uda = await prisma.uDA.findFirst({
    where: { id: udaId, userId: user.id },
    include: {
      phases: { orderBy: { position: 'asc' } },
      user: { select: { name: true } },
    },
  })

  if (!uda) return NextResponse.json({ error: 'UDA non trovata' }, { status: 404 })

  // ── EXPORT RUBRICA ────────────────────────────────────────────────────────
  if (type === 'rubric') {
    if (!uda.evaluationRubric) {
      return NextResponse.json({ error: 'Nessuna rubrica da esportare' }, { status: 400 })
    }

    const rubricTable = buildRubricTable(uda.evaluationRubric)
    const children: (Paragraph | Table)[] = [
      new Paragraph({
        children: [new TextRun({ text: 'RUBRICA VALUTATIVA', bold: true, size: 32, font: 'Arial', color: PURPLE })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: uda.title, bold: true, size: 26, font: 'Arial' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: `${uda.subjects.join(', ')} — ${uda.classYear}ª ${uda.classSection} ${uda.schoolType}`,
          size: 22, font: 'Arial', color: '666666',
        })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 360 },
      }),
    ]

    if (rubricTable) {
      children.push(rubricTable)
    } else {
      children.push(bodyPara('Impossibile leggere la rubrica. Verifica che sia stata generata correttamente.', { italic: true }))
    }

    const doc = new Document({
      styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
      sections: [{
        properties: {
          page: {
            size: { width: 16838, height: 11906 }, // A4 orizzontale (landscape)
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children,
      }],
    })

    const buffer = await Packer.toBuffer(doc)
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Rubrica_${uda.title.replace(/\s+/g, '_')}.docx"`,
      },
    })
  }

  // ── EXPORT COMPLETO (senza rubrica) ───────────────────────────────────────
  const yearLabel = new Date().getFullYear()
  const annoScolastico = `${yearLabel - 1}/${yearLabel}`
  const children: (Paragraph | Table)[] = []

  // Intestazione
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'UNITÀ DI APPRENDIMENTO', bold: true, size: 32, font: 'Arial', color: PURPLE })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: uda.title, bold: true, size: 40, font: 'Arial' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
    }),
  )

  // Tabella dati generali
  const COL_WIDTHS = [1806, 2256, 1356, 1356, 702, 1550]
  const TOTAL_W = COL_WIDTHS.reduce((a, b) => a + b, 0)
  const metaLabels = ['Discipline', 'Classe', 'Anno scolastico', 'Periodo', 'Ore', 'Docente']
  const metaValues = [
    uda.subjects.join(', '),
    `${uda.classYear}ª ${uda.classSection} — ${uda.schoolType}`,
    annoScolastico,
    uda.period ?? '—',
    `${uda.totalHours}h`,
    uda.user.name,
  ]

  children.push(
    new Table({
      width: { size: TOTAL_W, type: WidthType.DXA },
      columnWidths: COL_WIDTHS,
      rows: [
        new TableRow({
          tableHeader: true,
          children: metaLabels.map((label, i) => new TableCell({
            borders: BORDERS,
            width: { size: COL_WIDTHS[i], type: WidthType.DXA },
            shading: { fill: PURPLE, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: 'FFFFFF', size: 18, font: 'Arial' })] })],
          })),
        }),
        new TableRow({
          children: metaValues.map((val, i) => new TableCell({
            borders: BORDERS,
            width: { size: COL_WIDTHS[i], type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: val, size: 20, font: 'Arial' })] })],
          })),
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 240, after: 0 } }),
  )

  // Sezione 1 — Riferimenti curricolari
  children.push(sectionHeader('SEZIONE 1 — RIFERIMENTI CURRICOLARI'))
  for (const s of [
    { label: 'Competenze chiave europee', value: uda.europeanCompetences },
    { label: 'Traguardi di competenza', value: uda.learningGoals },
    { label: 'Obiettivi di apprendimento', value: uda.knowledgeSkills },
  ]) {
    children.push(new Paragraph({
      children: [new TextRun({ text: s.label, bold: true, size: 22, font: 'Arial', color: PURPLE })],
      spacing: { before: 160, after: 60 },
    }))
    if (s.value) {
      for (const line of htmlToTextLines(s.value)) {
        children.push(bodyPara(line, { indent: line.startsWith('•') }))
      }
    } else {
      children.push(bodyPara('—', { italic: true }))
    }
  }

  // Sezione 2 — Fasi
  children.push(new Paragraph({ spacing: { before: 240 } }), sectionHeader("SEZIONE 2 — ARTICOLAZIONE DELL'UDA"))

  if (uda.phases.length > 0) {
    const PHASE_COLS = [452, 2256, 452, 1356, 2756, 1754]
    const PHASE_TOTAL = PHASE_COLS.reduce((a, b) => a + b, 0)
    children.push(
      new Table({
        width: { size: PHASE_TOTAL, type: WidthType.DXA },
        columnWidths: PHASE_COLS,
        rows: [
          new TableRow({
            tableHeader: true,
            children: ['N.', 'Titolo fase', 'Ore', 'Metodologia', 'Attività', 'Strumenti'].map((label, i) =>
              new TableCell({
                borders: BORDERS,
                width: { size: PHASE_COLS[i], type: WidthType.DXA },
                shading: { fill: PURPLE, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: 'FFFFFF', size: 18, font: 'Arial' })] })],
              })
            ),
          }),
          ...uda.phases.map((phase, i) => new TableRow({
            children: [
              `${i + 1}`, phase.title, `${phase.hours}h`,
              phase.methodology ?? '—', phase.description ?? '—', phase.tools ?? '—',
            ].map((val, ci) => new TableCell({
              borders: BORDERS,
              width: { size: PHASE_COLS[ci], type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? 'FFFFFF' : LIGHT_GRAY, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              children: [new Paragraph({ children: [new TextRun({ text: val, bold: ci === 1, size: 20, font: 'Arial' })] })],
            })),
          })),
        ],
      })
    )
  } else {
    children.push(bodyPara('Nessuna fase definita.', { italic: true }))
  }

  // Sezione 3 — Valutazione (solo criteri, NON rubrica)
  children.push(new Paragraph({ spacing: { before: 240 } }), sectionHeader('SEZIONE 3 — VALUTAZIONE'))
  if (uda.evaluationCriteria) {
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Criteri di valutazione', bold: true, size: 22, font: 'Arial', color: PURPLE })],
      spacing: { before: 120, after: 60 },
    }))
    for (const line of uda.evaluationCriteria.split('\n').filter(Boolean)) {
      children.push(bodyPara(line.trim()))
    }
  } else {
    children.push(bodyPara('—', { italic: true }))
  }
  children.push(
    new Paragraph({ spacing: { before: 120 } }),
    bodyPara('→ La rubrica valutativa è disponibile come documento separato ("Esporta Rubrica").', { italic: true })
  )

  // Sezione 4 — Prodotto finale
  if (uda.finalProduct) {
    children.push(
      new Paragraph({ spacing: { before: 240 } }),
      sectionHeader('SEZIONE 4 — PRODOTTO FINALE ATTESO'),
      bodyPara(uda.finalProduct),
    )
  }

  // Documento finale
  const doc = new Document({
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      }],
    },
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4 verticale
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: `UDA — ${uda.title}`, size: 18, font: 'Arial', color: '888888' }),
              new TextRun({ text: '\t', size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Arial', color: '888888' }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB', space: 1 } },
          })],
        }),
      },
      children,
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="UDA_${uda.title.replace(/\s+/g, '_')}.docx"`,
    },
  })
}
