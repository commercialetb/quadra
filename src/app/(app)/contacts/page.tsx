import { getCompanies, getContacts } from '@/lib/data'
import { ContactsCrud } from '@/components/crm/contacts-crud'

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([getContacts(), getCompanies()])

  return (
    <div className="page-wrap">
      <ContactsCrud contacts={contacts} companies={companies} />
    </div>
  )
}
