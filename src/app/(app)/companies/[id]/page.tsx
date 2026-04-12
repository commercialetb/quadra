import { notFound } from 'next/navigation'
import { DetailShell } from '@/components/detail/detail-shell'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { DetailEditCard } from '@/components/detail/detail-edit-form'
import { updateCompanyDetail } from '@/app/(app)/actions'
import { getCompanyDetail, getTimelineForEntity } from '@/lib/detail-queries'
import { crmLabel } from '@/lib/crm-labels'

const companyStatuses = ['lead', 'prospect', 'client', 'partner', 'inactive']

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { company, contacts, opportunities, notes } = await getCompanyDetail(id)
  const timeline = await getTimelineForEntity({ companyId: id })

  if (!company) notFound()

  return (
    <DetailShell title={company.name} subtitle={company.legal_name} backHref="/companies" backLabel="Aziende">
      <div className="detail-grid">
        <div className="stack-lg">
          <DetailEditCard subtitle="Aggiorna i dati principali senza uscire dalla scheda." action={updateCompanyDetail} submitLabel="Salva azienda">
            <input type="hidden" name="id" value={company.id} />
            <label className="field-stack"><span>Nome azienda</span><input className="field-control" name="name" defaultValue={company.name ?? ''} required /></label>
            <label className="field-stack"><span>Ragione sociale</span><input className="field-control" name="legal_name" defaultValue={company.legal_name ?? ''} /></label>
            <label className="field-stack"><span>Sito web</span><input className="field-control" name="website" defaultValue={company.website ?? ''} /></label>
            <label className="field-stack"><span>Email</span><input className="field-control" name="email" type="email" defaultValue={company.email ?? ''} /></label>
            <label className="field-stack"><span>Telefono</span><input className="field-control" name="phone" defaultValue={company.phone ?? ''} /></label>
            <label className="field-stack"><span>Status</span><select className="field-control" name="status" defaultValue={company.status ?? 'lead'}>{companyStatuses.map((item) => <option key={item} value={item}>{crmLabel(item)}</option>)}</select></label>
            <label className="field-stack"><span>Indirizzo</span><input className="field-control" name="address_line1" defaultValue={company.address_line1 ?? ''} /></label>
            <label className="field-stack"><span>Città</span><input className="field-control" name="city" defaultValue={company.city ?? ''} /></label>
            <label className="field-stack"><span>Provincia</span><input className="field-control" name="province" defaultValue={company.province ?? ''} /></label>
            <label className="field-stack"><span>Settore</span><input className="field-control" name="industry" defaultValue={company.industry ?? ''} /></label>
            <label className="field-stack"><span>Fonte</span><input className="field-control" name="source" defaultValue={company.source ?? ''} /></label>
            <label className="field-stack" style={{ gridColumn: '1 / -1' }}><span>Note rapide</span><textarea className="field-control field-area" name="notes_summary" defaultValue={company.notes_summary ?? ''} /></label>
          </DetailEditCard>

          <InfoCard title="Panoramica azienda">
            <InfoRow label="Status" value={crmLabel(company.status)} />
            <InfoRow label="Sito web" value={company.website ? <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a> : '—'} />
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
              meta: [crmLabel(opportunity.stage), opportunity.value_estimate ? `€ ${Number(opportunity.value_estimate).toLocaleString('it-IT')}` : null].filter(Boolean).join(' · '),
              href: `/opportunities/${opportunity.id}`,
            }))}
          />
        </div>
      </div>
    </DetailShell>
  )
}
