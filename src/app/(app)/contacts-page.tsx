import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts } from '@/lib/data'
import { ContactsCrud } from '@/components/crm/contacts-crud'

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([getContacts(), getCompanies()])

  return (
    <div className="page-stack">
      <PageHeader
        title="Contatti"
        subtitle="Una rubrica operativa: persona, ruolo e azienda leggibili in un attimo anche su iPhone."
      />
      <ContactsCrud contacts={contacts} companies={companies} />
    </div>
  )
}
