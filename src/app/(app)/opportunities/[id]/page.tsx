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
  const nextStep = opportunity.next_action || 'Definisci il prossimo passo'
  const whenText = formatDateTime(opportunity.next_action_due_at)
  const whyText = typeof opportunity.probability === 'number'
    ? `${opportunity.probability}% probabilità · ${stageLabel(opportunity.stage)}`
    : stageLabel(opportunity.stage)

  return (
    <DetailShell title={opportunity.title} subtitle={opportunity.company?.name} backHref="/opportunities" backLabel="Opportunità" eyebrow="Deal">
      <section className="panel-card company-decision-board detail-decision-board opportunity-v7-hero opportunity-v8-hero">
        <div className="company-decision-board-head">
          <div>
            <p className="page-eyebrow">Deal</p>
            <h2>Come la fai avanzare</h2>
            <p className="page-subtitle compact">Una decisione sopra la piega: passo, timing e motivo per cui vale la pena muoverla adesso.</p>
          </div>
          <span className="dashboard-pill-badge">system of action</span>
        </div>
        <div className="company-decision-board-grid detail-decision-grid opportunity-v7-focus-grid">
          <article className="company-decision-focus-card opportunity-v7-focus-card">
            <span>Prossima mossa</span>
            <strong>{nextStep}</strong>
            <p>{opportunity.description || 'Rendi esplicita la prossima azione e chiudila nel minor numero di passaggi possibile.'}</p>
          </article>
          <article className="company-decision-metric">
            <span>Referente</span>
            <strong>{opportunity.primary_contact?.full_name || opportunity.company?.name || 'Da definire'}</strong>
            <small>{opportunity.company?.name || 'Azienda non indicata'}</small>
          </article>
          <article className="company-decision-metric">
            <span>Quando</span>
            <strong>{whenText}</strong>
            <small>{opportunity.expected_close_date ? `chiusura prevista ${new Date(opportunity.expected_close_date).toLocaleDateString('it-IT')}` : 'Senza data di chiusura'}</small>
          </article>
          <article className="company-decision-metric">
            <span>Motivo</span>
            <strong>{whyText}</strong>
            <small>{formatCurrency(opportunity.value_estimate)} stimati</small>
          </article>
        </div>
      </section>

      <section className="panel-card opportunity-v7-scoreboard opportunity-v8-scoreboard">
        <div className="dashboard-redesign-head compact">
          <h3>Essenziali</h3>
        </div>
        <div className="company-essentials-grid company-v7-essentials-grid">
          <div className="company-essential-item"><span>Fase</span><strong>{stageLabel(opportunity.stage)}</strong></div>
          <div className="company-essential-item"><span>Valore</span><strong>{formatCurrency(opportunity.value_estimate)}</strong></div>
          <div className="company-essential-item"><span>Probabilità</span><strong>{typeof opportunity.probability === 'number' ? `${opportunity.probability}%` : '—'}</strong></div>
          <div className="company-essential-item"><span>Referenteusura prevista</span><strong>{opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString('it-IT') : '—'}</strong></div>
        </div>
      </section>

      <div className="detail-grid opportunity-v7-grid opportunity-v8-grid">
        <div className="stack-lg">
          <details className="panel-card detail-collapse-card" open>
            <summary>Da fare</summary>
            <div className="stack-lg detail-inner-stack">
          <EntityListCard
            title="Azioni collegate"
            empty="Nessun follow-up collegato."
            items={relatedFollowups.map((item) => ({
              id: item.id,
              label: item.title,
              meta: `${formatDateTime(item.due_at)} · ${item.status}`,
            }))}
          />

          </div>
          </details>
        </div>

        <div className="stack-lg">
          <details className="panel-card detail-collapse-card">
            <summary>Apri dettagli</summary>
            <div className="stack-lg detail-inner-stack">
              <OpportunityAiCard opportunityId={id} />
              <TimelineCard items={timeline} />
              <OpportunityEditCard opportunity={opportunity} companies={companies} contacts={contacts} />
            </div>
          </details>
          <details className="panel-card detail-collapse-card" open>
            <summary>Apri dettagli</summary>
            <InfoCard title="Essenziali">
              <InfoRow label="Fase" value={stageLabel(opportunity.stage)} />
              <InfoRow label="Valore stimato" value={formatCurrency(opportunity.value_estimate)} />
              <InfoRow label="Probabilità" value={typeof opportunity.probability === 'number' ? `${opportunity.probability}%` : '—'} />
              <InfoRow label="Contatto principale" value={opportunity.primary_contact?.full_name} />
              <InfoRow label="Next action" value={opportunity.next_action} />
              <InfoRow label="Scadenza next action" value={formatDateTime(opportunity.next_action_due_at)} />
              <InfoRow label="Referenteusura prevista" value={opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString('it-IT') : '—'} />
              <InfoRow label="Descrizione" value={opportunity.description} />
            </InfoCard>
          </details>

          <details className="panel-card detail-collapse-card">
            <summary>Note</summary>
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
