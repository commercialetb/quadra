import { PageHeader } from '@/components/page-header';
import { getCompanies, getContacts, getFollowups, getOpportunities } from '@/lib/data';
import { FollowupsCrud } from '@/components/crm/followups-crud';

export default async function FollowupsPage() {
  const [followups, companies, contacts, opportunities] = await Promise.all([
    getFollowups(),
    getCompanies(),
    getContacts(),
    getOpportunities(),
  ]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <PageHeader title="Follow-up" subtitle="Task con scadenza, priorita e update immediato." />
      <FollowupsCrud followups={followups} companies={companies} contacts={contacts} opportunities={opportunities} />
    </div>
  );
}
