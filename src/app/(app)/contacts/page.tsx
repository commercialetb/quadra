import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts } from '@/lib/data'
import { ContactsCrud } from '@/components/crm/contacts-crud'

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([getContacts(), getCompanies()])

  return (
    <div className="page-wrap">
      <PageHeader
        title="Contatti"
        subtitle="Referenti chiari, collegati alle aziende giuste e leggibili anche da iPhone in un colpo d’occhio."
        eyebrow="CRM core"
        actions={<Link className="button-primary" href="#new-contact">+ Nuovo contatto</Link>}
      />
      <ContactsCrud contacts={contacts} companies={companies} />
    </div>
  )
}
