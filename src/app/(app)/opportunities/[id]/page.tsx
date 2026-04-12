import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DetailShell } from '@/components/detail/detail-shell'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { getOpportunityDetail, getTimelineForEntity } from '@/lib/detail-queries'

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { opportunity, projects, contacts, notes } = await getOpportunityDetail(id)
  const timeline = await getTimelineForEntity({ opportunityId: id })

  if (!opportunity) notFound()

  return (
    <DetailShell 
      title={opportunity.title} 
      subtitle={opportunity.company?.name} 
      backHref="/opportunities" 
      backLabel="Opportunità"
    >
      <div className="detail-grid">
        <div className="stack-lg">
          <InfoCard title="Dettagli Opportunità">
            <InfoRow label="Stato" value={opportunity.stage} />
            <InfoRow 
              label="Valore Stimato" 
              value={opportunity.value_estimate ? `€ ${Number(opportunity.value_estimate).toLocaleString('it-IT')}` : '—'} 
            />
            <InfoRow label="Probabilità" value={opportunity.probability ? `${opportunity.probability}%` : '—'} />
            <InfoRow label="Chiusura Prevista" value={opportunity.expected_close_date || '—'} />
          </InfoCard>

          <TimelineCard items={timeline} />
          
          <EntityListCard
            title="Note"
            empty="Nessuna nota collegata."
            items={notes.map((note) => ({ 
              id: note.id, 
              label: note.title || 'Nota', 
              meta: note.body 
            }))}
          />
        </div>

        <div className="stack-lg">
          <EntityListCard
            title="Progetti collegati"
            empty="Nessun progetto collegato."
            /* emptyAction rimosso per risolvere l'errore TypeScript */
            items={projects.map((project) => ({
              id: project.id,
              label: project.title,
              meta: project.status,
              href: `/projects/${project.id}`,
            }))}
          />

          <EntityListCard
            title="Contatti referenti"
            empty="Nessun contatto collegato."
            items={contacts.map((contact) => ({
              id: contact.id,
              label: contact.full_name,
              meta: contact.role,
              href: `/contacts/${contact.id}`,
            }))}
          />
        </div>
      </div>
    </DetailShell>
  )
}
