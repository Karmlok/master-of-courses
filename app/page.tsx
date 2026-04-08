import Link from 'next/link'
import { MethodologyTabs } from '@/components/landing/MethodologyTabs'

// ─── Hero mockup ──────────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
      {/* Barra del browser */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 border-b border-gray-200">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-3 h-5 bg-white rounded border border-gray-200 flex items-center px-2">
          <span className="text-xs text-gray-400">master-of-courses.vercel.app</span>
        </div>
      </div>
      {/* Contenuto */}
      <div className="flex h-48">
        {/* Sidebar mini */}
        <div className="w-28 bg-[#F8F7FF] border-r border-gray-100 p-2 space-y-1.5 shrink-0">
          <div className="h-5 bg-[#534AB7]/10 rounded" />
          <div className="h-4 bg-[#EEEDFE] rounded flex items-center px-1.5">
            <div className="w-2 h-2 rounded bg-[#534AB7] mr-1" />
            <div className="h-2 w-10 bg-[#534AB7]/30 rounded" />
          </div>
          <div className="h-4 bg-transparent rounded flex items-center px-1.5">
            <div className="w-2 h-2 rounded bg-gray-300 mr-1" />
            <div className="h-2 w-12 bg-gray-200 rounded" />
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 p-3 space-y-2">
          <div className="h-5 w-32 bg-gray-100 rounded" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { color: 'bg-[#EEEDFE]', accent: 'bg-[#534AB7]' },
              { color: 'bg-green-50', accent: 'bg-[#1D9E75]' },
              { color: 'bg-blue-50', accent: 'bg-blue-400' },
              { color: 'bg-orange-50', accent: 'bg-orange-400' },
            ].map((c, i) => (
              <div key={i} className={`${c.color} rounded-lg p-2 space-y-1`}>
                <div className={`h-1.5 w-8 ${c.accent} rounded`} />
                <div className="h-2 w-full bg-white/60 rounded" />
                <div className="h-2 w-3/4 bg-white/60 rounded" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-[#534AB7] rounded-md" />
            <div className="h-6 w-16 bg-gray-100 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A2E]">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#534AB7] text-xl font-bold">✦</span>
            <span className="font-semibold text-[#1A1A2E]">Master of Courses</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-[#534AB7] transition-colors font-medium">
              Accedi
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-[#534AB7] hover:bg-[#3C3489] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Registrati
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#F8F7FF] to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#EEEDFE] text-[#534AB7] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span>✦</span> Powered by prof. Abramo with Claude AI of Anthropic
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E] leading-tight mb-6">
              Crea lezioni straordinarie<br />
              <span className="text-[#534AB7]">con l&apos;intelligenza artificiale</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              La piattaforma pensata per i docenti delle scuole superiori.<br />
              Genera contenuti didattici professionali in pochi minuti.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#534AB7]/25"
              >
                Inizia gratis →
              </Link>
              <a
                href="#come-funziona"
                className="w-full sm:w-auto px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#534AB7] hover:text-[#534AB7] transition-colors"
              >
                Scopri come funziona
              </a>
            </div>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* ── Come funziona ── */}
      <section id="come-funziona" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">Come funziona</h2>
            <p className="text-gray-500">Tre passi per rivoluzionare la tua preparazione delle lezioni.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Crea il tuo corso',
                desc: 'Inserisci disciplina, classe e metodologia didattica preferita tra le 4 disponibili.',
                color: 'bg-[#EEEDFE] text-[#534AB7]',
              },
              {
                num: '02',
                title: 'Genera con l\'IA',
                desc: 'Claude crea spiegazioni, esercizi, verifiche e molto altro in pochi secondi.',
                color: 'bg-green-50 text-[#1D9E75]',
              },
              {
                num: '03',
                title: 'Esporta e insegna',
                desc: 'Scarica in PDF, Word o Markdown e porta il materiale direttamente in classe.',
                color: 'bg-[#F8F7FF] text-[#185FA5]',
              },
            ].map(({ num, title, desc, color }) => (
              <div key={num} className="text-center space-y-4">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-lg font-bold mx-auto`}>
                  {num}
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A2E]">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funzionalità ── */}
      <section className="py-20 px-6 bg-[#F8F7FF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">Tutto quello che ti serve</h2>
            <p className="text-gray-500">Progettato per i docenti italiani delle scuole superiori.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { emoji: '✦', title: 'Generazione AI', desc: 'Contenuti creati da Claude, il modello AI più avanzato di Anthropic.' },
              { emoji: '📚', title: '4 metodologie', desc: 'Modello 5E, Laboratoriale, Standard, Flipped Classroom.' },
              { emoji: '🔢', title: 'Formule matematiche', desc: 'Rendering LaTeX integrato con KaTeX per lezioni STEM.' },
              { emoji: '📄', title: 'Export multiplo', desc: 'PDF, Word e Markdown con un solo click.' },
              { emoji: '🎯', title: 'Personalizzabile', desc: 'Tono, stile e istruzioni specifiche per ogni lezione.' },
              { emoji: '🔒', title: 'Sicuro e privato', desc: 'I tuoi materiali sono tuoi. Sempre.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-[#534AB7]/30 hover:shadow-sm transition-all">
                <div className="text-2xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-[#1A1A2E] mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metodologie ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">Le metodologie supportate</h2>
            <p className="text-gray-500">L&apos;IA adatta i contenuti alla metodologia che scegli.</p>
          </div>
          <MethodologyTabs />
        </div>
      </section>

      {/* ── CTA finale ── */}
      <section className="py-20 px-6 bg-[#534AB7]">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">
            Pronto a trasformare il tuo modo di insegnare?
          </h2>
          <p className="text-[#EEEDFE] text-lg">
            Unisciti ai docenti che usano l&apos;IA per creare materiali didattici straordinari.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-[#534AB7] font-bold rounded-xl hover:bg-[#EEEDFE] transition-colors shadow-lg"
          >
            Crea il tuo account gratuito →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 bg-[#1A1A2E] text-gray-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#534AB7] text-lg">✦</span>
            <span className="font-semibold text-white">Master of Courses</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/login" className="hover:text-white transition-colors">Accedi</Link>
            <Link href="/register" className="hover:text-white transition-colors">Registrati</Link>
          </div>
          <p className="text-sm">Fatto con ♥ per i docenti italiani</p>
        </div>
      </footer>

    </div>
  )
}
