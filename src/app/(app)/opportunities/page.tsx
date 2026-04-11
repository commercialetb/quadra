import { PageHeader } from '@/components/page-header';
import { getCompanies, getContacts, getOpportunities } from '@/lib/data';
import { OpportunitiesCrud } from '@/components/crm/opportunities-crud';

export default async function OpportunitiesPage() {
  const [opportunities, companies, contacts] = await Promise.all([getOpportunities(), getCompanies(), getContacts()]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <PageHeader title="Opportunita" subtitle="Pipeline commerciale semplice da creare, aggiornare e ripulire." />
      <OpportunitiesCrud opportunities={opportunities} companies={companies} contacts={contacts} />
    </div>
  );
}
