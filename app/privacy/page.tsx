import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Informativa sulla privacy di Master of Courses ai sensi del GDPR.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#534AB7] hover:underline mb-8"
        >
          ← Torna alla home
        </Link>

        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Informativa sulla Privacy</h1>
        <p className="text-sm text-gray-500 mb-10">ai sensi del Regolamento UE 2016/679 (GDPR)</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Titolare del trattamento</h2>
            <p>Carmelo Abramo<br />
            Email: <a href="mailto:teach.abramo@gmail.com" className="text-[#534AB7] hover:underline">teach.abramo@gmail.com</a><br />
            Sito web: <a href="https://master-of-courses.vercel.app" className="text-[#534AB7] hover:underline">https://master-of-courses.vercel.app</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Dati raccolti</h2>
            <p>Master of Courses raccoglie i seguenti dati personali:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Nome e cognome</li>
              <li>Indirizzo email</li>
              <li>Nome della scuola di appartenenza</li>
              <li>Foto profilo (opzionale, caricata volontariamente dall&apos;utente)</li>
              <li>Contenuti creati sulla piattaforma (lezioni, attività didattiche)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Finalità del trattamento</h2>
            <p>I dati vengono trattati per:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Fornire il servizio di creazione e gestione di materiali didattici</li>
              <li>Autenticazione e sicurezza dell&apos;account</li>
              <li>Comunicazioni relative al servizio (es. reset password)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Base giuridica</h2>
            <p>Il trattamento si basa sul consenso dell&apos;interessato (Art. 6.1.a GDPR)
            e sull&apos;esecuzione di un contratto (Art. 6.1.b GDPR).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Conservazione dei dati</h2>
            <p>I dati vengono conservati fino alla cancellazione dell&apos;account da parte
            dell&apos;utente. L&apos;utente può eliminare il proprio account e tutti i dati
            associati in qualsiasi momento dalla sezione <strong>Impostazioni → Account</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Servizi terzi</h2>
            <p>La piattaforma utilizza i seguenti servizi terzi:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong>Supabase</strong> (autenticazione e database) —{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#534AB7] hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <strong>Vercel</strong> (hosting) —{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#534AB7] hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <strong>Anthropic</strong> (generazione AI) —{' '}
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#534AB7] hover:underline">
                  Privacy Policy
                </a>
              </li>
            </ul>
            <p className="mt-3">I contenuti inseriti dall&apos;utente per la generazione AI vengono inviati
            ad Anthropic per l&apos;elaborazione. Non vengono utilizzati per addestrare
            modelli AI (come da termini Anthropic per uso API).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Diritti dell&apos;interessato</h2>
            <p>L&apos;utente ha diritto a: accesso, rettifica, cancellazione, portabilità
            dei propri dati. Per esercitare questi diritti:{' '}
            <a href="mailto:teach.abramo@gmail.com" className="text-[#534AB7] hover:underline">teach.abramo@gmail.com</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Cookie</h2>
            <p>La piattaforma utilizza esclusivamente cookie tecnici necessari al
            funzionamento. Non vengono utilizzati cookie di profilazione o
            tracciamento di terze parti.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Aggiornamenti</h2>
            <p>La presente informativa può essere aggiornata. La data dell&apos;ultimo
            aggiornamento è indicata in fondo alla pagina.</p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-400">
          Ultimo aggiornamento: Aprile 2026
        </div>
      </div>
    </div>
  )
}
