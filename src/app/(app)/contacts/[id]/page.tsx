import { notFound } from 'next/navigation'
import { DetailShell } from '@/components/detail/detail-shell'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { getContactDetail, getTimelineForEntity } from '@/lib/detail-queries'

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { contact, phones, opportunities, notes } = await getContactDetail(id)
  const timeline = await getTimelineForEntity({ contactId: id })

  if (!contact) notFound()

  return (
    <DetailShell
      title={contact.full_name}
      subtitle={contact.role}
      backHref="/contacts"
      backLabel="Contatti"
      actions={<><a href={contact.email ? `mailto:${contact.email}` : '#'} className="secondary-button">Email</a>{contact.whatsapp ? <a href={`https://wa.me/${String(contact.whatsapp).replace(/[^\d]/g, '')}`} className="ghost-button" target="_blank" rel="noreferrer">WhatsApp</a> : null}</>}
      meta={<><span>{contact.company?.name || 'Nessuna azienda'}</span><span>{phones.length} numeri</span><span>{opportunities.length} opportunità</span></>}
    >
      <div className="detail-grid">
        <div className="stack-lg">
          <InfoCard title="Panoramica contatto">
            <InfoRow label="Email" value={contact.email} />
            <InfoRow label="WhatsApp" value={contact.whatsapp} />
            <InfoRow label="Metodo preferito" value={contact.preferred_contact_method} />
            <InfoRow label="Ultimo contatto" value={contact.last_contact_at ? new Date(contact.last_contact_at).toLocaleString('it-IT') : '—'} />
            <InfoRow label="Prossimo follow-up" value={contact.next_followup_at ? new Date(contact.next_followup_at).toLocaleString('it-IT') : '—'} />
            <InfoRow label="Azienda" value={contact.company?.name} />
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
            title="Telefoni"
            empty="Nessun numero inserito."
            items={phones.map((phone) => ({ id: phone.id, label: phone.phone_number, meta: [phone.label, phone.is_primary ? 'principale' : null].filter(Boolean).join(' · ') }))}
          />

          <EntityListCard
            title="Opportunità"
            empty="Nessuna opportunità collegata."
            items={opportunities.map((opportunity) => ({
              id: opportunity.id,
              label: opportunity.title,
              meta: [opportunity.stage, opportunity.value_estimate ? `€ ${Number(opportunity.value_estimate).toLocaleString('it-IT')}` : null].filter(Boolean).join(' · '),
              href: `/opportunities/${opportunity.id}`,
            }))}
          />
        </div>
      </div>
    </DetailShell>
  )
}
