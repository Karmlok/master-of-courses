import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase con service role key — bypassa le RLS.
 * Usato solo lato server per operazioni admin (es. delete user da Auth).
 * Richiede SUPABASE_SERVICE_ROLE_KEY in .env.local e Vercel env vars.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
