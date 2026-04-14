import { updateContactDetailsAction } from '@/app/(app)/actions'
import { EditToggleCard } from '@/components/detail/edit-toggle-card'
import { CONTACT_METHOD_OPTIONS } from '@/lib/crm-options'

export function ContactEditCard({ contact, companies, primaryPhone }: { contact: any; companies: any[]; primaryPhone?: string | null }) {
  return (
    <EditToggleCard
      title="Modifica dati"
      description="Modifica il contatto senza tenere il form sempre aperto."
      submitLabel="Salva contatto"
      action={updateContactDetailsAction}
    >
      <input type="hidden" name="id" value={contact.id} />
      <div className="form-grid two-col">
        <label className="field-stack"><span>Nome</span><input className="field-control" name="first_name" defaultValue={contact.first_name ?? ''} required /></label>
        <label className="field-stack"><span>Cognome</span><input className="field-control" name="last_name" defaultValue={contact.last_name ?? ''} required /></label>
        <label className="field-stack"><span>Azienda</span><select className="field-control" name="company_id" defaultValue={contact.company_id ?? ''}><option value="">Nessuna</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
        <label className="field-stack"><span>Ruolo</span><input className="field-control" name="role" defaultValue={contact.role ?? ''} /></label>
        <label className="field-stack"><span>Email</span><input className="field-control" name="email" type="email" defaultValue={contact.email ?? ''} /></label>
        <label className="field-stack"><span>Telefono</span><input className="field-control" name="phone" defaultValue={primaryPhone ?? ''} /></label>
        <label className="field-stack"><span>WhatsApp</span><input className="field-control" name="whatsapp" defaultValue={contact.whatsapp ?? ''} /></label>
        <label className="field-stack"><span>Metodo preferito</span><select className="field-control" name="preferred_contact_method" defaultValue={contact.preferred_contact_method ?? ''}><option value="">Seleziona</option>{CONTACT_METHOD_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <label className="field-stack"><span>Note</span><textarea className="field-control field-area" name="notes_summary" defaultValue={contact.notes_summary ?? ''} /></label>
    </EditToggleCard>
  )
}
