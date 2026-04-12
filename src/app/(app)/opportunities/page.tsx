import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts, getOpportunities } from '@/lib/data'
import { OpportunitiesCrud } from '@/components/crm/opportunities-crud'

export default async function OpportunitiesPage() {
  const [opportunities, companies, contacts] = await Promise.all([getOpportunities(), getCompanies(), getContacts()])

  return (
    <div className="page-wrap">
      <PageHeader
        title="Opportunità"
        subtitle="Pipeline commerciale essenziale, leggibile e pronta a diventare davvero wow."
        eyebrow="CRM core"
        actions={<Link className="button-primary" href="#new-opportunity">+ Nuova opportunità</Link>}
      />
      <OpportunitiesCrud opportunities={opportunities} companies={companies} contacts={contacts} />
    </div>
  )
}
