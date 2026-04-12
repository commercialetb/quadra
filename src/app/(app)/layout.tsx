import { Shell } from '@/components/shell';
import { requireUser } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <Shell>{children}</Shell>;
}
