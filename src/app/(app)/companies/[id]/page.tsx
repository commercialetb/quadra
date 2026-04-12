import { notFound } from 'next/navigation'
import { DetailShell } from '@/components/detail/detail-shell'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { getCompanyDetail, getTimelineForEntity } from '@/lib/detail-queries'

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { company, contacts, opportunities, projects, notes } = await getCompanyDetail(id)
  const timeline = await getTimelineForEntity({ companyId: id })

  if (!company) notFound()

  return (
    <DetailShell title={company.name} subtitle={company.legal_name} backHref="/companies" backLabel="Aziende">
      <div className="detail-grid">
        <div className="stack-lg">
          <InfoCard title="Panoramica azienda">
            <InfoRow label="Status" value={company.status} />
            <InfoRow label="Sito web" value={company.website ? <a href={company.website} target="_blank">{company.website}</a> : '—'} />
            <InfoRow label="Email" value={company.email} />
            <InfoRow label="Telefono" value={company.phone} />
            <InfoRow label="Indirizzo" value={[company.address_line1, company.city, company.province].filter(Boolean).join(', ')} />
            <InfoRow label="Settore" value={company.industry} />
            <InfoRow label="Fonte" value={company.source} />
          </InfoCard>

          <TimelineCard items={timeline} />

          <EntityListCard
            title="Note recenti"
            empty="Nessuna nota collegata."
            items={notes.map((note) => ({ id: note.id, label: note.title || 'Nota', meta: note.body }))}
          />
        </div>

        <div className="stack-lg">
          <EntityListCard
            title="Contatti"
            empty="Nessun contatto collegato."
            emptyAction={{ label: 'Aggiungi contatto', href: '/contacts#new-contact' }}
            items={contacts.map((contact) => ({
              id: contact.id,
              label: contact.full_name,
              meta: [contact.role, contact.email].filter(Boolean).join(' · '),
              href: `/contacts/${contact.id}`,
            }))}
          />

          <EntityListCard
            title="Opportunità"
            empty="Nessuna opportunità aperta."
            emptyAction={{ label: 'Aggiungi opportunità', href: '/opportunities#new-opportunity' }}
            items={opportunities.map((opportunity) => ({
              id: opportunity.id,
              label: opportunity.title,
              meta: [opportunity.stage, opportunity.value_estimate ? `€ ${Number(opportunity.value_estimate).toLocaleString('it-IT')}` : null].filter(Boolean).join(' · '),
              href: `/opportunities/${opportunity.id}`,
            }))}
          />

          <EntityListCard
            title="Progetti"
            empty="Nessun progetto collegato."
            emptyAction={{ label: 'Aggiungi progetto', href: '/projects' }}
            items={projects.map((project) => ({
              id: project.id,
              label: project.title,
              meta: [project.status, project.budget ? `€ ${Number(project.budget).toLocaleString('it-IT')}` : null].filter(Boolean).join(' · '),
              href: `/projects/${project.id}`,
            }))}
          />
        </div>
      </div>
    </DetailShell>
  )
}
