import { PageHeader } from '@/components/page-header'
import { getCompanies } from '@/lib/data'
import { CompaniesCrud } from '@/components/crm/companies-crud'

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div className="page-wrap">
      <PageHeader
        title="Aziende"
        subtitle="Le aziende devono essere riconoscibili e rapide da scorrere. Niente form sparsi: crei solo quando premi Nuovo."
        eyebrow="CRM core"
        compact
      />
      <CompaniesCrud companies={companies} />
    </div>
  )
}
