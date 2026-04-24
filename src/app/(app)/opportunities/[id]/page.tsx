import { notFound } from 'next/navigation'
import { DetailShell } from '@/components/detail/detail-shell'
import { OpportunityEditCard } from '@/components/detail/opportunity-edit-card'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { OpportunityAiCard } from '@/components/ai/opportunity-ai-card'
import { getOpportunityDetail, getTimelineForEntity } from '@/lib/detail-queries'
import { getCompanies, getContacts, getFollowups } from '@/lib/data'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { stageLabel } from '@/lib/crm-labels'

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ opportunity, notes }, companies, contacts, timeline, followups] = await Promise.all([
    getOpportunityDetail(id),
    getCompanies(),
    getContacts(),
    getTimelineForEntity({ opportunityId: id }),
    getFollowups(),
  ])

  if (!opportunity) notFound()

  const relatedFollowups = followups.filter((item) => item.opportunity_id === id).slice(0, 6)

  return (
    <DetailShell title={opportunity.title} subtitle={opportunity.company?.name} backHref="/opportunities" backLabel="Opportunità" eyebrow="Opportunità">
      <section className="panel-card company-decision-board detail-decision-board">
        <div className="company-decision-board-head">
          <div>
            <p className="page-eyebrow">A colpo d'occhio</p>
            <h2>Scheda opportunità</h2>
          </div>
          <span className="dashboard-pill-badge">system of action</span>
        </div>
        <div className="company-decision-board-grid detail-decision-grid">
          <article className="company-decision-focus-card">
            <span>Fase</span>
            <strong>{stageLabel(opportunity.stage)}</strong>
            <p>{opportunity.company?.name || 'Azienda non indicata'}</p>
          </article>
          <article className="company-decision-focus-card">
            <span>Valore</span>
            <strong>{formatCurrency(opportunity.value_estimate)}</strong>
            <p>{typeof opportunity.probability === 'number' ? `${opportunity.probability}% probabilità` : 'Probabilità non indicata'}</p>
          </article>
          <article className="company-decision-focus-card">
            <span>Prossimo passo</span>
            <strong>{opportunity.next_action || 'Da definire'}</strong>
            <p>{formatDateTime(opportunity.next_action_due_at)}</p>
          </article>
          <article className="company-decision-focus-card">
            <span>Chiusura prevista</span>
            <strong>{opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString('it-IT') : 'Senza data'}</strong>
            <p>{opportunity.primary_contact?.full_name || 'Nessun contatto principale'}</p>
          </article>
        </div>
      </section>

      <OpportunityEditCard opportunity={opportunity} companies={companies} contacts={contacts} />

      <details className="panel-card detail-collapse-card" open>
        <summary>Panoramica opportunità</summary>
        <InfoCard title="Dettagli essenziali">
          <InfoRow label="Fase" value={stageLabel(opportunity.stage)} />
          <InfoRow label="Valore stimato" value={formatCurrency(opportunity.value_estimate)} />
          <InfoRow label="Probabilità" value={typeof opportunity.probability === 'number' ? `${opportunity.probability}%` : '—'} />
          <InfoRow label="Contatto principale" value={opportunity.primary_contact?.full_name} />
          <InfoRow label="Next action" value={opportunity.next_action} />
          <InfoRow label="Scadenza next action" value={formatDateTime(opportunity.next_action_due_at)} />
          <InfoRow label="Chiusura prevista" value={opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString('it-IT') : '—'} />
          <InfoRow label="Descrizione" value={opportunity.description} />
        </InfoCard>
      </details>

      <div className="detail-grid">
        <div className="stack-lg">
          <details className="panel-card detail-collapse-card" open>
            <summary>Azioni collegate</summary>
            <div className="stack-lg detail-inner-stack">
              <OpportunityAiCard opportunityId={id} />
              <EntityListCard
                title="Follow-up collegati"
                empty="Nessun follow-up collegato."
                items={relatedFollowups.map((item) => ({
                  id: item.id,
                  label: item.title,
                  meta: `${formatDateTime(item.due_at)} · ${item.status}`,
                }))}
              />
            </div>
          </details>

          <details className="panel-card detail-collapse-card">
            <summary>Timeline</summary>
            <TimelineCard items={timeline} />
          </details>
        </div>

        <div className="stack-lg">
          <details className="panel-card detail-collapse-card" open>
            <summary>Note recenti</summary>
            <EntityListCard
              title="Appunti collegati"
              empty="Nessuna nota collegata."
              items={notes.map((note) => ({ id: note.id, label: note.title || 'Nota', meta: note.body }))}
            />
          </details>
        </div>
      </div>
    </DetailShell>
  )
}
