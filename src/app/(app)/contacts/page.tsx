import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts } from '@/lib/data'
import { ContactsCrud } from '@/components/crm/contacts-crud'

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([getContacts(), getCompanies()])

  return (
    <div className="page-wrap">
      <PageHeader
        title="Contacts (Anagrafica & Cronologia)"
        subtitle="Un'evoluzione del tuo CRM con Voice UX di Siri+GPT-4."
        eyebrow="CRM core"
        mobileHidden
      />
      <ContactsCrud contacts={contacts} companies={companies} />
    </div>
  )
}
