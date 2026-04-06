import { redirect } from 'next/navigation'

// La root "/" viene gestita dal middleware che fa redirect a /login o /dashboard
export default function HomePage() {
  redirect('/dashboard')
}
