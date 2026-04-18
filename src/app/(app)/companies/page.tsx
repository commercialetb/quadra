import { getCompanies } from '@/lib/data'
import { CompaniesCrud } from '@/components/crm/companies-crud'

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div className="page-wrap">
      <CompaniesCrud companies={companies} />
    </div>
  )
}
