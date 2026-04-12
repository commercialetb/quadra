import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts, getOpportunities } from '@/lib/data'
import { OpportunitiesCrud } from '@/components/crm/opportunities-crud'

export default async function OpportunitiesPage() {
  const [opportunities, companies, contacts] = await Promise.all([getOpportunities(), getCompanies(), getContacts()])

  return (
    <div className="page-wrap">
      <PageHeader
        title="Opportunità"
        subtitle="Pipeline commerciale più utile: listato pulito, focus sulla fase e niente mini-form sempre aperte."
        eyebrow="CRM core"
        compact
      />
      <OpportunitiesCrud opportunities={opportunities} companies={companies} contacts={contacts} />
    </div>
  )
}
