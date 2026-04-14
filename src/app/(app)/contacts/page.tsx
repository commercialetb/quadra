import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts } from '@/lib/data'
import { ContactsCrud } from '@/components/crm/contacts-crud'

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([getContacts(), getCompanies()])

  return (
    <div className="page-wrap">
      <PageHeader
        title="Contatti"
        subtitle="Le persone devono essere subito leggibili: ruolo, azienda e canale principale, senza editing sempre aperto."
        eyebrow="CRM core"
        mobileHidden
      />
      <ContactsCrud contacts={contacts} companies={companies} />
    </div>
  )
}
