import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts, getOpportunities } from '@/lib/data'
import { OpportunitiesCrud } from '@/components/crm/opportunities-crud'

export default async function OpportunitiesPage() {
  const [opportunities, companies, contacts] = await Promise.all([getOpportunities(), getCompanies(), getContacts()])

  return (
    <div className="page-wrap">
      <PageHeader
        title="Pipeline Deals"
        subtitle="Trattative, stato pipeline e next step in stile voice-first."
        eyebrow="CRM core"
        mobileHidden
      />
      <OpportunitiesCrud opportunities={opportunities} companies={companies} contacts={contacts} />
    </div>
  )
}
