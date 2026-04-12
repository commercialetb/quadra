import { notFound } from 'next/navigation'
import { DetailShell } from '@/components/detail/detail-shell'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { DetailEditCard } from '@/components/detail/detail-edit-form'
import { updateOpportunityDetail } from '@/app/(app)/actions'
import { getOpportunityDetail, getTimelineForEntity } from '@/lib/detail-queries'
import { createClient } from '@/lib/supabase/server'
import { crmLabel } from '@/lib/crm-labels'

const stages = ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

function datetimeLocalValue(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function dateValue(value?: string | null) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { opportunity, notes } = await getOpportunityDetail(id)
  const timeline = await getTimelineForEntity({ opportunityId: id })

  if (!opportunity) notFound()

  const supabase = await createClient()
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, full_name')
    .eq('company_id', opportunity.company_id)
    .order('full_name')

  return (
    <DetailShell title={opportunity.title} subtitle={opportunity.company?.name} backHref="/opportunities" backLabel="Opportunità">
      <div className="detail-grid">
        <div className="stack-lg">
          <DetailEditCard subtitle="Aggiorna fase, valore e next action direttamente nella scheda deal." action={updateOpportunityDetail} submitLabel="Salva opportunità">
            <input type="hidden" name="id" value={opportunity.id} />
            <label className="field-stack"><span>Titolo</span><input className="field-control" name="title" defaultValue={opportunity.title ?? ''} required /></label>
            <label className="field-stack"><span>Fase</span><select className="field-control" name="stage" defaultValue={opportunity.stage ?? 'new_lead'}>{stages.map((stage) => <option key={stage} value={stage}>{crmLabel(stage)}</option>)}</select></label>
            <label className="field-stack"><span>Valore stimato</span><input className="field-control" name="value_estimate" type="number" step="0.01" defaultValue={opportunity.value_estimate ?? ''} /></label>
            <label className="field-stack"><span>Probabilità %</span><input className="field-control" name="probability" type="number" min="0" max="100" defaultValue={opportunity.probability ?? ''} /></label>
            <label className="field-stack"><span>Contatto principale</span><select className="field-control" name="primary_contact_id" defaultValue={opportunity.primary_contact_id ?? ''}><option value="">Nessuno</option>{(contacts ?? []).map((contact) => <option key={contact.id} value={contact.id}>{contact.full_name}</option>)}</select></label>
            <label className="field-stack"><span>Fonte</span><input className="field-control" name="source" defaultValue={opportunity.source ?? ''} /></label>
            <label className="field-stack"><span>Next action</span><input className="field-control" name="next_action" defaultValue={opportunity.next_action ?? ''} /></label>
            <label className="field-stack"><span>Scadenza next action</span><input className="field-control" name="next_action_due_at" type="datetime-local" defaultValue={datetimeLocalValue(opportunity.next_action_due_at)} /></label>
            <label className="field-stack"><span>Chiusura prevista</span><input className="field-control" name="expected_close_date" type="date" defaultValue={dateValue(opportunity.expected_close_date)} /></label>
            <label className="field-stack" style={{ gridColumn: '1 / -1' }}><span>Descrizione</span><textarea className="field-control field-area" name="description" defaultValue={opportunity.description ?? ''} /></label>
          </DetailEditCard>

          <InfoCard title="Panoramica opportunità">
            <InfoRow label="Fase" value={crmLabel(opportunity.stage)} />
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
