import { updateOpportunityDetailsAction } from '@/app/(app)/actions'
import { EditToggleCard } from '@/components/detail/edit-toggle-card'
import { OPPORTUNITY_STAGE_OPTIONS } from '@/lib/crm-options'

export function OpportunityEditCard({ opportunity, companies, contacts }: { opportunity: any; companies: any[]; contacts: any[] }) {
  const availableContacts = contacts.filter((contact) => !opportunity.company_id || contact.company_id === opportunity.company_id)

  return (
    <EditToggleCard
      title="Modifica dati"
      description="Aggiorna fase, valore e prossime azioni solo quando serve."
      submitLabel="Salva opportunità"
      action={updateOpportunityDetailsAction}
    >
      <input type="hidden" name="id" value={opportunity.id} />
      <div className="form-grid two-col">
        <label className="field-stack"><span>Titolo</span><input className="field-control" name="title" defaultValue={opportunity.title ?? ''} required /></label>
        <label className="field-stack"><span>Azienda</span><select className="field-control" name="company_id" defaultValue={opportunity.company_id ?? ''} required>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
        <label className="field-stack"><span>Fase</span><select className="field-control" name="stage" defaultValue={opportunity.stage ?? 'new_lead'}>{OPPORTUNITY_STAGE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="field-stack"><span>Contatto principale</span><select className="field-control" name="primary_contact_id" defaultValue={opportunity.primary_contact_id ?? ''}><option value="">Nessuno</option>{availableContacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}</select></label>
        <label className="field-stack"><span>Valore stimato</span><input className="field-control" name="value_estimate" type="number" step="0.01" defaultValue={opportunity.value_estimate ?? ''} /></label>
        <label className="field-stack"><span>Probabilità %</span><input className="field-control" name="probability" type="number" min="0" max="100" defaultValue={opportunity.probability ?? ''} /></label>
        <label className="field-stack"><span>Fonte</span><input className="field-control" name="source" defaultValue={opportunity.source ?? ''} /></label>
        <label className="field-stack"><span>Next action</span><input className="field-control" name="next_action" defaultValue={opportunity.next_action ?? ''} /></label>
        <label className="field-stack"><span>Scadenza next action</span><input className="field-control" name="next_action_due_at" type="datetime-local" defaultValue={opportunity.next_action_due_at ? String(opportunity.next_action_due_at).slice(0,16) : ''} /></label>
        <label className="field-stack"><span>Chiusura prevista</span><input className="field-control" name="expected_close_date" type="date" defaultValue={opportunity.expected_close_date ?? ''} /></label>
      </div>
      <label className="field-stack"><span>Descrizione</span><textarea className="field-control field-area" name="description" defaultValue={opportunity.description ?? ''} /></label>
    </EditToggleCard>
  )
}
