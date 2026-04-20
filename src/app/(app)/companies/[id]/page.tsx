import { notFound } from 'next/navigation'
import { CompanyEditCard } from '@/components/detail/company-edit-card'
import { DetailShell } from '@/components/detail/detail-shell'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { getCompanyDetail, getTimelineForEntity } from '@/lib/detail-queries'
import { getCompanyAnalysis } from '@/lib/analysis/queries'
import { CompanyAnalysisCard } from '@/components/analysis/company-analysis-card'
import { AnalysisImportCard } from '@/components/analysis/analysis-import-card'

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { company, contacts, opportunities, notes } = await getCompanyDetail(id)
  const [timeline, analysis] = await Promise.all([
    getTimelineForEntity({ companyId: id }),
    getCompanyAnalysis(id),
  ])

  if (!company) notFound()

  return (
    <DetailShell title={company.name} subtitle={company.legal_name} backHref="/companies" backLabel="Aziende">
      <CompanyEditCard company={company} />

      <div className="company-detail-grid-v21">
        <div className="stack-lg company-detail-main-col">
          <InfoCard title="Panoramica azienda">
            <InfoRow label="Status" value={company.status} />
            <InfoRow label="Sito web" value={company.website ? <a href={company.website} target="_blank">{company.website}</a> : '—'} />
            <InfoRow label="Email" value={company.email} />
            <InfoRow label="Telefono" value={company.phone} />
            <InfoRow label="Indirizzo" value={[company.address_line1, company.city, company.province].filter(Boolean).join(', ')} />
            <InfoRow label="Settore" value={company.industry} />
            <InfoRow label="Fonte" value={company.source} />
          </InfoCard>

          <CompanyAnalysisCard data={analysis} />
        </div>

        <aside className="stack-lg company-detail-side-col">
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
        </aside>
      </div>

      <details className="company-detail-drawer-v21" open>
        <summary>Import e attività</summary>
        <div className="company-detail-drawer-body-v21">
          <div className="company-detail-secondary-grid-v21">
            <AnalysisImportCard
              companies={[{ id: company.id, name: company.name }]}
              presetCompanyId={company.id}
              presetCompanyName={company.name}
              compact
              showAdvanced={false}
              eyebrow="Import"
              title="Importa ordini per questa azienda"
              description="Carichi il CSV dalla scheda azienda: prima fai anteprima, poi importi solo se il match opportunità è corretto."
              submitLabel="Importa in questa azienda"
            />

            <TimelineCard items={timeline} />
          </div>
        </div>
      </details>

      <details className="company-detail-drawer-v21">
        <summary>Note e contenuti secondari</summary>
        <div className="company-detail-drawer-body-v21">
          <div className="company-detail-secondary-grid-v21 single-column">
            <EntityListCard
              title="Note recenti"
              empty="Nessuna nota collegata."
              items={notes.map((note) => ({ id: note.id, label: note.title || 'Nota', meta: note.body }))}
            />
          </div>
        </div>
      </details>
    </DetailShell>
  )
}
