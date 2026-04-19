import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getDashboardData } from '@/lib/dashboard-queries'
import { requireUser } from '@/lib/auth'

export default async function DashboardPage() {
  const [{ user }, data] = await Promise.all([requireUser(), getDashboardData()])
  const userName = String(user.user_metadata?.full_name || user.user_metadata?.name || user.email || '').trim()
  return <DashboardShell data={data} userName={userName} />
}
