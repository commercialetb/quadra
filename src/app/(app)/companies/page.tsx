import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { getCompanies } from '@/lib/data'
import { CompaniesCrud } from '@/components/crm/companies-crud'

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div className="page-wrap">
      <PageHeader
        title="Aziende"
        subtitle="Anagrafiche pulite, ricerca rapida e una scheda che sembra finalmente un prodotto premium."
        eyebrow="CRM core"
        actions={<Link className="button-primary" href="#new-company">+ Nuova azienda</Link>}
      />
      <CompaniesCrud companies={companies} />
    </div>
  )
}
