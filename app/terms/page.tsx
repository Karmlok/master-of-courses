import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termini di Servizio',
  description: 'Termini di servizio di Master of Courses.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#534AB7] hover:underline mb-8"
        >
          ← Torna alla home
        </Link>

        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Termini di Servizio</h1>
        <p className="text-sm text-gray-500 mb-10">Master of Courses</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Accettazione dei termini</h2>
            <p>Utilizzando Master of Courses accetti i presenti termini di servizio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Descrizione del servizio</h2>
            <p>Master of Courses è una piattaforma web che consente ai docenti delle
            scuole superiori italiane di creare materiali didattici con l&apos;assistenza
            dell&apos;intelligenza artificiale.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Account utente</h2>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Sei responsabile della sicurezza del tuo account</li>
              <li>Devi fornire informazioni accurate durante la registrazione</li>
              <li>Non puoi cedere o condividere il tuo account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Utilizzo accettabile</h2>
            <p>La piattaforma può essere utilizzata esclusivamente per:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Creare materiali didattici per uso professionale</li>
              <li>Condividere risorse educative con altri docenti</li>
            </ul>
            <p className="mt-3">È vietato utilizzare la piattaforma per:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Generare contenuti non didattici o inappropriati</li>
              <li>Violare diritti di terzi</li>
              <li>Tentare di compromettere la sicurezza del servizio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Contenuti generati dall&apos;AI</h2>
            <p>I contenuti generati dall&apos;intelligenza artificiale sono forniti a
            titolo indicativo. Il docente è responsabile della verifica e
            dell&apos;adattamento dei contenuti prima dell&apos;uso in classe.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Disponibilità del servizio</h2>
            <p>Il servizio è fornito &ldquo;così com&apos;è&rdquo;. Non garantiamo disponibilità
            continua al 100%. Ci riserviamo il diritto di modificare o
            interrompere il servizio con ragionevole preavviso.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Proprietà intellettuale</h2>
            <p>I materiali didattici creati dall&apos;utente rimangono di proprietà
            dell&apos;utente. Master of Courses non rivendica diritti sui contenuti
            creati dagli utenti.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Modifiche ai termini</h2>
            <p>Ci riserviamo il diritto di modificare i presenti termini.
            Gli utenti verranno notificati via email in caso di modifiche
            sostanziali.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">Legge applicabile</h2>
            <p>I presenti termini sono regolati dalla legge italiana.</p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-400">
          Ultimo aggiornamento: Aprile 2026
        </div>
      </div>
    </div>
  )
}
