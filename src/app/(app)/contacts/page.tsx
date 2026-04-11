import { PageHeader } from '@/components/page-header';
import { getCompanies, getContacts } from '@/lib/data';
import { ContactsCrud } from '@/components/crm/contacts-crud';

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([getContacts(), getCompanies()]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <PageHeader title="Contatti" subtitle="Persone collegate alle aziende con update rapido." />
      <ContactsCrud contacts={contacts} companies={companies} />
    </div>
  );
}
