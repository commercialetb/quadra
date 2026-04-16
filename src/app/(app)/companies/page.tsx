import { PageHeader } from '@/components/page-header'
import { getCompanies } from '@/lib/data'
import { CompaniesCrud } from '@/components/crm/companies-crud'

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div className="page-wrap">
      <PageHeader
        title="Aziende"
        subtitle="Anagrafiche snelle, rapide da scorrere e aggiornare."
        eyebrow="CRM core"
        compact
        mobileHidden
      />
      <CompaniesCrud companies={companies} />
    </div>
  )
}
