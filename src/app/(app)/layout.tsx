import Shell from '@/components/shell'
import { requireUser } from '@/lib/auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protezione della rotta: reindirizza al login se l'utente non è autenticato
  await requireUser()

  return <Shell>{children}</Shell>
}
