import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts } from '@/lib/data'
import { ContactsCrud } from '@/components/crm/contacts-crud'

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([getContacts(), getCompanies()])

  return (
    <div className="page-wrap">
      <PageHeader
        title="Contacts"
        subtitle="Anagrafica e cronologia in un unico flusso più visivo."
        eyebrow="CRM core"
        compact
        mobileHidden
      />
      <ContactsCrud contacts={contacts} companies={companies} />
    </div>
  )
}
