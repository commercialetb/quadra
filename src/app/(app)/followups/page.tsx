import Link from 'next/link'
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
        title="Follow-up"
        subtitle="La tua agenda operativa, finalmente chiara, priorizzata e comoda da toccare su mobile."
        eyebrow="CRM core"
        actions={<Link className="button-primary" href="#new-followup">+ Nuovo follow-up</Link>}
      />
      <FollowupsCrud followups={followups} companies={companies} contacts={contacts} opportunities={opportunities} />
    </div>
  )
}
