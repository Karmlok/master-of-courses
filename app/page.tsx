import Link from 'next/link'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { MethodologyTabs } from '@/components/landing/MethodologyTabs'
import { CookieBanner } from '@/components/landing/CookieBanner'

// ─── Mockup dashboard ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
      {/* Barra browser */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 border-b border-gray-200">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-3 h-5 bg-white rounded border border-gray-200 flex items-center px-2">
          <span className="text-xs text-gray-400">master-of-courses.vercel.app/udas</span>
        </div>
      </div>
      <div className="flex h-56">
        {/* Sidebar */}
        <div className="w-32 bg-[#F8F7FF] border-r border-gray-100 p-2 space-y-1 shrink-0">
          <div className="h-5 bg-[#534AB7]/10 rounded mb-2" />
          {['Dashboard', 'Corsi', 'UDA', 'Libreria'].map((item, i) => (
            <div key={item} className={`h-6 rounded flex items-center px-2 gap-1.5 ${i === 2 ? 'bg-[#EEEDFE]' : ''}`}>
              <div className={`w-2 h-2 rounded-sm shrink-0 ${i === 2 ? 'bg-[#534AB7]' : 'bg-gray-300'}`} />
              <div className={`h-2 rounded flex-1 ${i === 2 ? 'bg-[#534AB7]/30' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>
        {/* Contenuto UDA */}
        <div className="flex-1 p-3 space-y-2 bg-white">
          <div className="flex items-center justify-between mb-1">
            <div className="h-4 w-24 bg-[#1A1A2E]/15 rounded" />
            <div className="h-5 w-16 bg-[#534AB7] rounded-md" />
          </div>
          {/* Card UDA */}
          {[
            { color: 'bg-blue-50', badge: 'Italiano · Storia', status: 'Pronta', statusC: 'bg-green-100 text-green-700' },
            { color: 'bg-[#EEEDFE]', badge: 'Matematica', status: 'Bozza', statusC: 'bg-gray-100 text-gray-500' },
          ].map((c, i) => (
            <div key={i} className={`${c.color} rounded-lg p-2.5 flex items-start justify-between`}>
              <div className="space-y-1 flex-1">
                <div className="h-2.5 w-32 bg-[#1A1A2E]/20 rounded" />
                <div className="flex gap-1 items-center">
                  <div className="h-3 px-1.5 bg-blue-200 rounded-full flex items-center">
                    <div className="h-1.5 w-8 bg-blue-400 rounded" />
                  </div>
                </div>
                <div className="h-2 w-20 bg-[#1A1A2E]/10 rounded" />
              </div>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${c.statusC}`}>{c.status}</span>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <div className="h-2 w-16 bg-gray-200 rounded" />
            <div className="h-2 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mockup wizard UDA ────────────────────────────────────────────────────────

function UDAWizardMockup() {
  const steps = [
    { n: 1, label: 'Dati generali', done: true },
    { n: 2, label: 'Curricolo', done: true },
    { n: 3, label: 'Fasi', done: true },
    { n: 4, label: 'Valutazione', done: true },
  ]
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-sm mx-auto">
      {/* Step indicator */}
      <div className="flex items-center mb-6">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[#1D9E75] flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <span className="text-[10px] font-medium text-[#1D9E75] hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-4 sm:w-6 mx-1 bg-[#1D9E75]" />}
          </div>
        ))}
      </div>
      {/* Contenuto simulato */}
      <div className="space-y-3">
        <div className="h-3 w-40 bg-[#1A1A2E]/15 rounded" />
        <div className="border border-gray-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[9px] font-bold text-[#534AB7]">1</div>
            <div className="h-2 w-24 bg-gray-200 rounded" />
            <div className="ml-auto h-3 w-10 bg-[#534AB7] rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[9px] font-bold text-[#534AB7]">2</div>
            <div className="h-2 w-20 bg-gray-200 rounded" />
            <div className="ml-auto h-3 w-10 bg-gray-100 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[9px] font-bold text-[#534AB7]">3</div>
            <div className="h-2 w-28 bg-gray-200 rounded" />
            <div className="ml-auto h-3 w-10 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="h-6 w-20 bg-[#1D9E75] rounded-lg" />
        </div>
      </div>
      <p className="text-[10px] text-center text-[#534AB7] font-medium mt-4">UDA creata in pochi minuti ✓</p>
    </div>
  )
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A2E]">
      <LandingHeader />

      {/* ── 1. HERO ── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#F8F7FF] to-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Testo */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#EEEDFE] text-[#534AB7] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <span>✦</span> Powered by Abramo&apos;s with Claude AI of Anthropic
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E] leading-tight mb-6">
                Crea lezioni e UDA straordinarie{' '}
                <span className="text-[#534AB7]">con l&apos;intelligenza artificiale</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed">
                La prima piattaforma italiana che affianca i docenti delle scuole superiori nella progettazione
                didattica. Lezioni, verifiche, esercizi e Unità di Apprendimento complete — generate dall&apos;AI in pochi minuti.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#534AB7]/25"
                >
                  Inizia gratis →
                </Link>
                <a
                  href="#come-funziona"
                  className="w-full sm:w-auto px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#534AB7] hover:text-[#534AB7] transition-colors text-center"
                >
                  Scopri come funziona
                </a>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                {['Gratuito per iniziare', 'Nessuna carta di credito', 'Pensato per la scuola italiana'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="text-[#1D9E75] font-bold">✓</span> {t}
                  </span>
                ))}
              </div>
            </div>
            {/* Mockup */}
            <div className="flex-1 w-full">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. NUMERI ── */}
      <section className="py-14 px-6 bg-[#534AB7]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
          {[
            { num: '6+', label: 'Tipi di contenuto generabili' },
            { num: '4', label: 'Metodologie didattiche supportate' },
            { num: '100%', label: 'Conforme alle Indicazioni Nazionali' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-5xl font-bold mb-2">{num}</p>
              <p className="text-[#EEEDFE] text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. COME FUNZIONA ── */}
      <section id="come-funziona" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">Come funziona</h2>
            <p className="text-gray-500">Tre passi per rivoluzionare la tua preparazione didattica.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Crea la tua lezione o UDA',
                desc: 'Scegli se creare una singola lezione o un\'Unità di Apprendimento completa. Inserisci materia, classe e argomento in pochi secondi.',
                color: 'bg-[#EEEDFE] text-[#534AB7]',
              },
              {
                num: '02',
                title: 'L\'AI genera i contenuti',
                desc: 'Claude AI produce spiegazioni, esercizi, verifiche, obiettivi curricolari, fasi di lavoro e rubriche valutative — calibrati sulla scuola italiana.',
                color: 'bg-green-50 text-[#1D9E75]',
              },
              {
                num: '03',
                title: 'Esporta e insegna',
                desc: 'Scarica in Word o PDF, condividi con i colleghi o pubblica nella libreria condivisa. Il materiale è pronto per la classe.',
                color: 'bg-[#F8F7FF] text-[#534AB7]',
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

      {/* ── 4. FUNZIONALITÀ ── */}
      <section className="py-20 px-6 bg-[#F8F7FF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">Tutto quello che ti serve per insegnare meglio</h2>
            <p className="text-gray-500">Progettato per i docenti italiani delle scuole superiori.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { emoji: '🎓', title: 'Lezioni complete', desc: 'Spiegazioni teoriche, esercizi graduati, verifiche formative e compiti per casa — generati in secondi con la metodologia che preferisci.' },
              { emoji: '📋', title: 'UDA con AI', desc: 'Unità di Apprendimento complete con competenze chiave europee, obiettivi curricolari, fasi di lavoro sequenziali e rubrica valutativa professionale.' },
              { emoji: '📐', title: '4 Metodologie didattiche', desc: 'Modello 5E, Laboratoriale, Standard e Flipped Classroom. La struttura del contenuto si adatta automaticamente alla metodologia scelta.' },
              { emoji: '🔢', title: 'Formule matematiche', desc: 'Rendering LaTeX integrato con KaTeX. Perfetto per matematica, fisica, chimica e tutte le discipline STEM.' },
              { emoji: '✦', title: 'AI calibrata sulla scuola italiana', desc: 'I contenuti rispettano le Indicazioni Nazionali, usano la terminologia ministeriale corretta e sono pronti per il consiglio di classe.' },
              { emoji: '📄', title: 'Export professionale', desc: 'Documenti Word e PDF pronti per essere consegnati, allegati al PTOF o condivisi con i colleghi — nel formato standard delle scuole italiane.' },
              { emoji: '🏛️', title: 'Libreria condivisa', desc: 'Scopri e importa lezioni create da altri docenti. Risparmia tempo partendo da materiali già pronti e personalizzali liberamente.' },
              { emoji: '🔒', title: 'I tuoi dati sono tuoi', desc: 'I materiali che crei rimangono di tua proprietà. Nessun uso dei tuoi contenuti per addestrare modelli AI.' },
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

      {/* ── 5. SEZIONE UDA ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#EEEDFE] text-[#534AB7] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Novità
            </div>
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">
              La prima piattaforma che crea UDA complete con l&apos;AI
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Progettare un&apos;Unità di Apprendimento richiede ore di lavoro. Con Master of Courses bastano pochi minuti.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Lista benefici */}
            <div className="flex-1 space-y-4">
              {[
                'Obiettivi curricolari allineati alle Indicazioni Nazionali',
                'Competenze chiave europee selezionate automaticamente',
                'Fasi di lavoro sequenziali generate dall\'AI',
                'Rubrica valutativa con 4 livelli (Avanzato / Intermedio / Base / In via di acquisizione)',
                'Documento Word pronto per il consiglio di classe',
                'Supporto per UDA mono e pluridisciplinari',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#1D9E75]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#1D9E75] text-xs font-bold">✓</span>
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
              <div className="pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#534AB7] hover:bg-[#3C3489] text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  Crea la tua prima UDA →
                </Link>
              </div>
            </div>
            {/* Mockup wizard */}
            <div className="flex-1 flex justify-center">
              <UDAWizardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. METODOLOGIE ── */}
      <section className="py-20 px-6 bg-[#F8F7FF]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">Scegli la metodologia, l&apos;AI fa il resto</h2>
            <p className="text-gray-500">La struttura del contenuto si adatta automaticamente alla tua scelta.</p>
          </div>
          <MethodologyTabs />
        </div>
      </section>

      {/* ── 7. TESTIMONIANZE ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">Cosa dicono i docenti</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                quote: 'Finalmente uno strumento che capisce le esigenze della scuola italiana. Le UDA generate sono già nel formato giusto per il consiglio di classe.',
                name: 'Prof.ssa M. Romano',
                role: 'Docente di Italiano',
                school: 'Liceo Classico',
                initials: 'MR',
                color: 'bg-[#EEEDFE] text-[#534AB7]',
              },
              {
                quote: 'Ho preparato una UDA interdisciplinare in 20 minuti. Prima mi ci voleva un pomeriggio intero.',
                name: 'Prof. A. Ferretti',
                role: 'Docente di Matematica',
                school: 'Istituto Tecnico',
                initials: 'AF',
                color: 'bg-green-100 text-[#1D9E75]',
              },
              {
                quote: 'La rubrica valutativa generata dall\'AI è sorprendentemente precisa e professionale.',
                name: 'Prof.ssa L. Conti',
                role: 'Docente di Scienze',
                school: 'Liceo Scientifico',
                initials: 'LC',
                color: 'bg-blue-100 text-blue-600',
              },
            ].map(({ quote, name, role, school, initials, color }) => (
              <div key={name} className="bg-[#F8F7FF] rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-gray-700 text-sm leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{name}</p>
                    <p className="text-xs text-gray-500">{role} · {school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">* Testimonianze illustrative</p>
        </div>
      </section>

      {/* ── 8. CTA FINALE ── */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #534AB7 0%, #3C3489 100%)' }}>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Pronto a trasformare il tuo modo di insegnare?
          </h2>
          <p className="text-[#EEEDFE] text-lg">
            Unisciti ai docenti che usano l&apos;AI per creare materiali didattici professionali in pochi minuti.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-[#534AB7] font-bold rounded-xl hover:bg-[#EEEDFE] transition-colors shadow-lg text-base"
          >
            Crea il tuo account gratuito →
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#EEEDFE]/80 pt-2">
            {['Gratuito per iniziare', 'Nessuna carta di credito', 'Cancella quando vuoi'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="font-bold">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FOOTER ── */}
      <footer className="py-12 px-6 bg-[#1A1A2E] text-gray-400">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[#534AB7] text-xl">✦</span>
              <span className="font-semibold text-white">Master of Courses</span>
            </div>
            <p className="text-sm">La piattaforma AI per i docenti italiani</p>
            <p className="text-sm">Fatto con ♥ per la scuola italiana</p>
          </div>
          {/* Link */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Navigazione</p>
            {[
              { href: '/', label: 'Home' },
              { href: '/login', label: 'Accedi' },
              { href: '/register', label: 'Registrati' },
            ].map(({ href, label }) => (
              <div key={label}>
                <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
              </div>
            ))}
          </div>
          {/* Legale */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Legale</p>
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Termini di servizio' },
            ].map(({ href, label }) => (
              <div key={label}>
                <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-sm">
          © 2026 Master of Courses of Abramo&apos;s — Tutti i diritti riservati
        </div>
      </footer>

      <CookieBanner />
    </div>
  )
}
