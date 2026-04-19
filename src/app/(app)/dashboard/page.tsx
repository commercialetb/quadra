import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getDashboardData } from '@/lib/dashboard-queries';

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardShell data={data} />;
}
