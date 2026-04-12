import { notFound } from 'next/navigation'
import { DetailShell } from '@/components/detail/detail-shell'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { InfoCard, InfoRow } from '@/components/detail/info-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { DetailEditCard } from '@/components/detail/detail-edit-form'
import { updateContactDetail } from '@/app/(app)/actions'
import { getContactDetail, getTimelineForEntity } from '@/lib/detail-queries'
import { createClient } from '@/lib/supabase/server'
import { crmLabel } from '@/lib/crm-labels'

const preferredMethods = ['email', 'phone', 'whatsapp']

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { contact, phones, opportunities, notes } = await getContactDetail(id)
  const timeline = await getTimelineForEntity({ contactId: id })
  const supabase = await createClient()
  const [{ data: companies }] = await Promise.all([
    supabase.from('companies').select('id, name').order('name'),
  ])

  if (!contact) notFound()

  return (
    <DetailShell title={contact.full_name} subtitle={contact.role} backHref="/contacts" backLabel="Contatti">
      <div className="detail-grid">
        <div className="stack-lg">
          <DetailEditCard subtitle="Modifica anagrafica e riferimenti del contatto da questa scheda." action={updateContactDetail} submitLabel="Salva contatto">
            <input type="hidden" name="id" value={contact.id} />
            <label className="field-stack"><span>Nome</span><input className="field-control" name="first_name" defaultValue={contact.first_name ?? ''} required /></label>
            <label className="field-stack"><span>Cognome</span><input className="field-control" name="last_name" defaultValue={contact.last_name ?? ''} required /></label>
            <label className="field-stack"><span>Azienda</span><select className="field-control" name="company_id" defaultValue={contact.company_id ?? ''}><option value="">Nessuna</option>{(companies ?? []).map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
            <label className="field-stack"><span>Ruolo</span><input className="field-control" name="role" defaultValue={contact.role ?? ''} /></label>
            <label className="field-stack"><span>Email</span><input className="field-control" name="email" type="email" defaultValue={contact.email ?? ''} /></label>
            <label className="field-stack"><span>Telefono principale</span><input className="field-control" name="phone" defaultValue={phones.find((item) => item.is_primary)?.phone_number ?? ''} /></label>
            <label className="field-stack"><span>WhatsApp</span><input className="field-control" name="whatsapp" defaultValue={contact.whatsapp ?? ''} /></label>
            <label className="field-stack"><span>Metodo preferito</span><select className="field-control" name="preferred_contact_method" defaultValue={contact.preferred_contact_method ?? ''}><option value="">Seleziona</option>{preferredMethods.map((item) => <option key={item} value={item}>{crmLabel(item)}</option>)}</select></label>
            <label className="field-stack" style={{ gridColumn: '1 / -1' }}><span>Note rapide</span><textarea className="field-control field-area" name="notes_summary" defaultValue={contact.notes_summary ?? ''} /></label>
          </DetailEditCard>

          <InfoCard title="Panoramica contatto">
            <InfoRow label="Email" value={contact.email} />
            <InfoRow label="WhatsApp" value={contact.whatsapp} />
            <InfoRow label="Metodo preferito" value={contact.preferred_contact_method ? crmLabel(contact.preferred_contact_method) : '—'} />
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
              meta: [crmLabel(opportunity.stage), opportunity.value_estimate ? `€ ${Number(opportunity.value_estimate).toLocaleString('it-IT')}` : null].filter(Boolean).join(' · '),
              href: `/opportunities/${opportunity.id}`,
            }))}
          />
        </div>
      </div>
    </DetailShell>
  )
}
