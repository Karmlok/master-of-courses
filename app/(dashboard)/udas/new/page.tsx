import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UDAWizard } from '@/components/uda/UDAWizard'

export const metadata = { title: 'Nuova UDA | Master of Courses' }

export default async function NewUDAPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <UDAWizard />
}
