import { PageHeader } from '@/components/page-header'
import { getCompanies, getContacts, getFollowups, getOpportunities } from '@/lib/data'
import { FollowupsCrud } from '@/components/crm/followups-crud'

export default async function FollowupsPage() {
  const [followups, companies, contacts, opportunities] = await Promise.all([
    getFollowups(),
    getCompanies(),
    getContacts(),
    getOpportunities(),
  ])

  return (
    <div className="page-stack">
      <PageHeader
        title="Follow-up"
        subtitle="La tua agenda operativa: chiara, priorizzata e abbastanza leggera da funzionare bene su mobile."
      />
      <FollowupsCrud followups={followups} companies={companies} contacts={contacts} opportunities={opportunities} />
    </div>
  )
}
