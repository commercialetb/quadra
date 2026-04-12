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
    <DetailShell
      title={company.name}
      subtitle={company.legal_name}
      backHref="/companies"
      backLabel="Aziende"
      actions={<><a href={company.website || '#'} className="secondary-button" target="_blank" rel="noreferrer">Sito</a><a href={company.email ? `mailto:${company.email}` : '#'} className="ghost-button">Email</a></>}
      meta={<><span>{company.status || 'Lead'}</span><span>{contacts.length} contatti</span><span>{opportunities.length} opportunità</span></>}
    >
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
            ctaLabel="+ Aggiungi contatto"
            ctaHref="/contacts"
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
            ctaLabel="+ Aggiungi opportunità"
            ctaHref="/opportunities"
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
            ctaLabel="+ Aggiungi progetto"
            ctaHref="/projects"
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
