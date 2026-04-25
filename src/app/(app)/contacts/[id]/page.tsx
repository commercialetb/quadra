import { notFound } from 'next/navigation'
import { ContactEditCard } from '@/components/detail/contact-edit-card'
import { DetailShell } from '@/components/detail/detail-shell'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { getContactDetail, getTimelineForEntity } from '@/lib/detail-queries'
import { getCompanies } from '@/lib/data'

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString('it-IT') : '—'
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ contact, phones, opportunities, notes }, companies, timeline] = await Promise.all([
    getContactDetail(id),
    getCompanies(),
    getTimelineForEntity({ contactId: id }),
  ])

  if (!contact) notFound()

  const primaryPhone = phones.find((item) => item.is_primary)?.phone_number ?? phones[0]?.phone_number ?? ''

  return (
    <DetailShell title={contact.full_name} subtitle={contact.role} backHref="/contacts" backLabel="Contatti" eyebrow="Contatto">
      <section className="panel-card company-decision-board detail-decision-board">
        <div className="company-decision-board-head">
          <div>
            <p className="page-eyebrow">A colpo d'occhio</p>
            <h2>Scheda contatto</h2>
          </div>
          <span className="dashboard-pill-badge">decisione rapida</span>
        </div>
        <div className="company-decision-board-grid detail-decision-grid">
          <article className="company-decision-focus-card">
            <span>Referente</span>
            <strong>{contact.full_name}</strong>
            <p>{contact.role || 'Ruolo non indicato'}</p>
          </article>
          <article className="company-decision-focus-card">
            <span>Azienda</span>
            <strong>{contact.company?.name || 'Nessuna azienda'}</strong>
            <p>{contact.email || 'Email non indicata'}</p>
          </article>
          <article className="company-decision-focus-card">
            <span>Canale migliore</span>
            <strong>{contact.preferred_contact_method || (contact.whatsapp ? 'WhatsApp' : 'Email')}</strong>
            <p>{contact.whatsapp || primaryPhone || 'Nessun canale diretto indicato'}</p>
          </article>
          <article className="company-decision-focus-card">
            <span>Quando sentirlo</span>
            <strong>{contact.next_followup_at ? new Date(contact.next_followup_at).toLocaleDateString('it-IT') : 'Da pianificare'}</strong>
            <p>{contact.last_contact_at ? `Ultimo contatto ${new Date(contact.last_contact_at).toLocaleDateString('it-IT')}` : 'Nessuna ultima interazione registrata'}</p>
          </article>
        </div>
      </section>

      <ContactEditCard contact={contact} companies={companies} primaryPhone={primaryPhone} />

      <details className="panel-card detail-collapse-card" open>
        <summary>Contesto</summary>
        <InfoCard title="Essenziali">
          <InfoRow label="Email" value={contact.email} />
          <InfoRow label="WhatsApp" value={contact.whatsapp} />
          <InfoRow label="Metodo preferito" value={contact.preferred_contact_method} />
          <InfoRow label="Ultimo contatto" value={formatDateTime(contact.last_contact_at)} />
          <InfoRow label="Prossimo follow-up" value={formatDateTime(contact.next_followup_at)} />
          <InfoRow label="Azienda" value={contact.company?.name} />
        </InfoCard>
      </details>

      <div className="detail-grid">
        <div className="stack-lg">
          <details className="panel-card detail-collapse-card" open>
            <summary>Contatti utili</summary>
            <div className="stack-lg detail-inner-stack">
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
          </details>

          <details className="panel-card detail-collapse-card">
            <summary>Timeline</summary>
            <TimelineCard items={timeline} />
          </details>
        </div>

        <div className="stack-lg">
          <details className="panel-card detail-collapse-card" open>
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
