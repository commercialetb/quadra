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
        title="Agenda (Appuntamenti & Task)"
        subtitle="Un'evoluzione del tuo CRM con Voice UX di Siri+GPT-4."
        eyebrow="CRM core"
        mobileHidden
      />
      <FollowupsCrud followups={followups} companies={companies} contacts={contacts} opportunities={opportunities} />
    </div>
  )
}
