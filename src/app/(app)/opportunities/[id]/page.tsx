import { notFound } from 'next/navigation'
import { DetailShell } from '@/components/detail/detail-shell'
import { OpportunityEditCard } from '@/components/detail/opportunity-edit-card'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { getOpportunityDetail, getTimelineForEntity } from '@/lib/detail-queries'
import { getCompanies, getContacts } from '@/lib/data'

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ opportunity, notes }, companies, contacts, timeline] = await Promise.all([
    getOpportunityDetail(id),
    getCompanies(),
    getContacts(),
    getTimelineForEntity({ opportunityId: id }),
  ])

  if (!opportunity) notFound()

  return (
    <DetailShell title={opportunity.title} subtitle={opportunity.company?.name} backHref="/opportunities" backLabel="Opportunità">
      <OpportunityEditCard opportunity={opportunity} companies={companies} contacts={contacts} />
      <div className="detail-grid">
        <div className="stack-lg">
          <InfoCard title="Panoramica opportunità">
            <InfoRow label="Fase" value={opportunity.stage} />
            <InfoRow label="Valore stimato" value={opportunity.value_estimate ? `€ ${Number(opportunity.value_estimate).toLocaleString('it-IT')}` : '—'} />
            <InfoRow label="Probabilità" value={typeof opportunity.probability === 'number' ? `${opportunity.probability}%` : '—'} />
            <InfoRow label="Contatto principale" value={opportunity.primary_contact?.full_name} />
            <InfoRow label="Next action" value={opportunity.next_action} />
            <InfoRow label="Scadenza next action" value={opportunity.next_action_due_at ? new Date(opportunity.next_action_due_at).toLocaleString('it-IT') : '—'} />
            <InfoRow label="Chiusa prevista" value={opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString('it-IT') : '—'} />
            <InfoRow label="Descrizione" value={opportunity.description} />
          </InfoCard>

          <TimelineCard items={timeline} />

          <EntityListCard
            title="Note recenti"
            empty="Nessuna nota collegata."
            items={notes.map((note) => ({ id: note.id, label: note.title || 'Nota', meta: note.body }))}
          />
        </div>

      </div>
    </DetailShell>
  )
}
