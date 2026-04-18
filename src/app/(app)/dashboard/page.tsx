import { DashboardResponsive } from '@/components/dashboard/dashboard-responsive'
import { getDashboardData } from '@/lib/dashboard-queries'

export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardResponsive data={data} />
}
