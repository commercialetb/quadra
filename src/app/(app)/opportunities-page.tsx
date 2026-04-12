import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts, getOpportunities } from '@/lib/data'
import { OpportunitiesCrud } from '@/components/crm/opportunities-crud'

export default async function OpportunitiesPage() {
  const [opportunities, companies, contacts] = await Promise.all([getOpportunities(), getCompanies(), getContacts()])

  return (
    <div className="page-stack">
      <PageHeader
        title="Opportunita"
        subtitle="Trattative pulite, prossima azione in vista e niente caos da gestionale vecchio stile."
      />
      <OpportunitiesCrud opportunities={opportunities} companies={companies} contacts={contacts} />
    </div>
  )
}
