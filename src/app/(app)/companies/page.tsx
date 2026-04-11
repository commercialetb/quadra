import { PageHeader } from '@/components/page-header';
import { getCompanies } from '@/lib/data';
import { CompaniesCrud } from '@/components/crm/companies-crud';

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <PageHeader title="Aziende" subtitle="Anagrafiche pulite con CRUD essenziale." />
      <CompaniesCrud companies={companies} />
    </div>
  );
}
