import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts, getOpportunities } from '@/lib/data'
import { OpportunitiesCrud } from '@/components/crm/opportunities-crud'

export default async function OpportunitiesPage() {
  const [opportunities, companies, contacts] = await Promise.all([getOpportunities(), getCompanies(), getContacts()])

  return (
    <div className="page-wrap">
      <PageHeader
        title="Pipeline"
        subtitle="Trattative e next step in una board più visiva e voice-first."
        eyebrow="CRM core"
        compact
        mobileHidden
      />
      <OpportunitiesCrud opportunities={opportunities} companies={companies} contacts={contacts} />
    </div>
  )
}
