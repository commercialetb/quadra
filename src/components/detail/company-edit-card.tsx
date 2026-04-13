import { updateCompanyDetailsAction } from '@/app/(app)/actions'
import { EditToggleCard } from '@/components/detail/edit-toggle-card'
import { COMPANY_INDUSTRY_OPTIONS, COMPANY_STATUS_OPTIONS } from '@/lib/crm-options'

export function CompanyEditCard({ company }: { company: any }) {
  return (
    <EditToggleCard
      title="Modifica dati"
      description="La scheda resta pulita: apri la modifica solo quando ti serve."
      submitLabel="Salva azienda"
      action={updateCompanyDetailsAction}
    >
      <input type="hidden" name="id" value={company.id} />
      <div className="form-grid two-col">
        <label className="field-stack"><span>Nome azienda</span><input className="field-control" name="name" defaultValue={company.name ?? ''} required /></label>
        <label className="field-stack"><span>Ragione sociale</span><input className="field-control" name="legal_name" defaultValue={company.legal_name ?? ''} /></label>
        <label className="field-stack"><span>Sito web</span><input className="field-control" name="website" defaultValue={company.website ?? ''} /></label>
        <label className="field-stack"><span>Email</span><input className="field-control" name="email" type="email" defaultValue={company.email ?? ''} /></label>
        <label className="field-stack"><span>Telefono</span><input className="field-control" name="phone" defaultValue={company.phone ?? ''} /></label>
        <label className="field-stack"><span>Indirizzo</span><input className="field-control" name="address_line1" defaultValue={company.address_line1 ?? ''} /></label>
        <label className="field-stack"><span>Città</span><input className="field-control" name="city" defaultValue={company.city ?? ''} /></label>
        <label className="field-stack"><span>Provincia</span><input className="field-control" name="province" defaultValue={company.province ?? ''} /></label>
        <label className="field-stack"><span>Settore</span><select className="field-control" name="industry" defaultValue={company.industry ?? ''}><option value="">Seleziona</option>{COMPANY_INDUSTRY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="field-stack"><span>Fonte</span><input className="field-control" name="source" defaultValue={company.source ?? ''} /></label>
        <label className="field-stack"><span>Stato</span><select className="field-control" name="status" defaultValue={company.status ?? 'lead'}>{COMPANY_STATUS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <label className="field-stack"><span>Note rapide</span><textarea className="field-control field-area" name="notes_summary" defaultValue={company.notes_summary ?? ''} /></label>
    </EditToggleCard>
  )
}
