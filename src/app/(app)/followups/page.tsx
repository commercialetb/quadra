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
    <div className="page-wrap">
      <PageHeader
        title="Agenda"
        subtitle="Appuntamenti e task in una vista operativa più fluida."
        eyebrow="CRM core"
        compact
        mobileHidden
      />
      <FollowupsCrud followups={followups} companies={companies} contacts={contacts} opportunities={opportunities} />
    </div>
  )
}
