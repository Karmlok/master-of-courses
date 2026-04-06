# master-of-courses — Fase 1

Piattaforma per docenti delle scuole superiori di secondo grado.
Stack: **Next.js 15 · Supabase · Prisma · Tailwind CSS v4 · TypeScript**

---

## Setup iniziale (da fare una volta)

### 1. Installa le dipendenze

Prima di tutto, elimina la cartella `node_modules` (parzialmente installata) e reinstalla:

```bash
cd master-of-courses
rm -rf node_modules
npm install
```

### 2. Configura le variabili d'ambiente

Apri `.env.local` e inserisci i tuoi valori Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxx:password@aws-0-xx.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Dove trovare le credenziali in Supabase:
> - URL e chiavi API: **Project Settings → API**
> - Connection strings: **Project Settings → Database → Connection string**
>   - `DATABASE_URL` → usa la stringa **Transaction** (porta 6543, con `?pgbouncer=true`)
>   - `DIRECT_URL` → usa la stringa **Session** (porta 5432)

### 3. Sincronizza il database

```bash
npm run db:push      # Crea le tabelle in Supabase
npm run db:generate  # Genera il client Prisma
```

### 4. Configura i componenti shadcn/ui (opzionale ma consigliato)

```bash
npx shadcn@latest init
npx shadcn@latest add button input label card badge separator avatar dropdown-menu
```

### 5. Avvia il server di sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) — verrai reindirizzato a `/login`.

---

## Struttura del progetto

```
master-of-courses/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           ← Pagina di login
│   │   └── register/page.tsx        ← Pagina di registrazione
│   ├── (dashboard)/
│   │   ├── layout.tsx               ← Layout con sidebar
│   │   ├── dashboard/page.tsx       ← Dashboard principale
│   │   ├── courses/                 ← CRUD corsi
│   │   └── lessons/                 ← CRUD lezioni
│   └── api/
│       ├── auth/register/route.ts   ← Crea profilo utente nel DB
│       ├── courses/route.ts         ← GET + POST corsi
│       ├── courses/[id]/route.ts    ← GET + PUT + DELETE corso
│       ├── lessons/route.ts         ← GET + POST lezioni
│       └── lessons/[id]/route.ts    ← GET + PUT + DELETE lezione
├── components/
│   ├── courses/                     ← CourseCard, CourseForm, DeleteCourseButton
│   ├── layout/                      ← Sidebar
│   └── lessons/                     ← LessonForm, DeleteLessonButton
├── lib/
│   ├── prisma.ts                    ← Client Prisma singleton
│   ├── supabase/client.ts           ← Client Supabase (browser)
│   ├── supabase/server.ts           ← Client Supabase (server)
│   └── utils.ts                     ← cn() helper
├── prisma/schema.prisma             ← Schema database
├── types/index.ts                   ← Tipi TypeScript globali
└── middleware.ts                    ← Protezione route autenticate
```

---

## Deploy su Vercel

1. Push su GitHub:
```bash
git init
git add .
git commit -m "feat: fase 1 - fondamenta master-of-courses"
git branch -M main
git remote add origin https://github.com/tuousername/master-of-courses.git
git push -u origin main
```

2. Su [Vercel](https://vercel.com): importa il repository e aggiungi tutte le variabili d'ambiente di `.env.local`.

3. Imposta `NEXT_PUBLIC_APP_URL` all'URL Vercel generato (es. `https://master-of-courses.vercel.app`).

---

## Note tecnici importanti

- **Next.js 15** usa `cookies()` asincrono: il client Supabase server usa `await cookies()`
- **Tailwind v4** usa configurazione CSS-first (`@import "tailwindcss"` in globals.css)
- I **params** nelle pagine dinamiche sono Promise in Next.js 15: usare `await params`
- Il middleware protegge tutte le route (redirect a `/login` se non autenticati)
- La **conferma eliminazione** usa un doppio click (prima clic = conferma, entro 3 secondi)

---

## Checklist Fase 1

- [ ] `npm run db:push` esegue senza errori
- [ ] La registrazione crea utente in Supabase Auth e record in tabella User
- [ ] Il login reindirizza alla dashboard
- [ ] La dashboard mostra i corsi del docente autenticato
- [ ] Un utente non autenticato viene reindirizzato a `/login`
- [ ] CRUD corsi funzionante (crea, leggi, modifica, elimina)
- [ ] CRUD lezioni funzionante con selezione metodologia a card
- [ ] Un docente non può accedere ai corsi di un altro
- [ ] Sidebar con navigazione funzionante
- [ ] Deploy su Vercel completato e funzionante
