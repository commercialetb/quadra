import { createOpportunity, deleteOpportunity, updateOpportunityStage } from '@/app/(app)/actions';
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives';
import { formatCurrency, formatDate } from '@/lib/format';

const stages = ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export function OpportunitiesCrud({ opportunities, companies, contacts }: { opportunities: any[]; companies: any[]; contacts: any[] }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form action={createOpportunity}>
        <FormCard title="Nuova opportunita" subtitle="Pipeline commerciale semplice e chiara.">
          <FormGrid>
            <Field label="Titolo"><input name="title" required style={inputStyle()} /></Field>
            <Field label="Azienda">
              <select name="company_id" required style={selectStyle()} defaultValue="">
                <option value="" disabled>Seleziona</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </select>
            </Field>
            <Field label="Contatto principale">
              <select name="primary_contact_id" style={selectStyle()} defaultValue="">
                <option value="">Nessuno</option>
                {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}
              </select>
            </Field>
            <Field label="Fase">
              <select name="stage" defaultValue="new_lead" style={selectStyle()}>
                {stages.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Valore stimato"><input name="value_estimate" type="number" step="0.01" style={inputStyle()} /></Field>
            <Field label="Probabilita"><input name="probability" type="number" min="0" max="100" style={inputStyle()} /></Field>
            <Field label="Chiusura prevista"><input name="expected_close_date" type="date" style={inputStyle()} /></Field>
            <Field label="Fonte"><input name="source" style={inputStyle()} /></Field>
            <Field label="Prossima azione"><input name="next_action" style={inputStyle()} /></Field>
            <Field label="Scadenza prossima azione"><input name="next_action_due_at" type="datetime-local" style={inputStyle()} /></Field>
          </FormGrid>
          <Field label="Descrizione"><textarea name="description" style={textareaStyle()} /></Field>
          <ActionBar><PrimaryButton>Salva opportunita</PrimaryButton></ActionBar>
        </FormCard>
      </form>

      <FormCard title="Opportunita" subtitle="Aggiorna fase o elimina velocemente.">
        <div style={{ display: 'grid', gap: 14 }}>
          {opportunities.map((item) => (
            <div key={item.id} style={styles.row}>
              <div>
                <div style={styles.title}>{item.title}</div>
                <div style={styles.meta}>{item.companies?.name ?? '—'} · {formatCurrency(item.value_estimate)} · chiusura {formatDate(item.expected_close_date)}</div>
              </div>
              <div style={styles.right}>
                <form action={updateOpportunityStage} style={styles.inlineForm}>
                  <input type="hidden" name="id" value={item.id} />
                  <select name="stage" defaultValue={item.stage} style={selectStyle()}>
                    {stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                  </select>
                  <PrimaryButton>Aggiorna</PrimaryButton>
                </form>
                <form action={deleteOpportunity}>
                  <input type="hidden" name="id" value={item.id} />
                  <InlineDangerButton>Elimina</InlineDangerButton>
                </form>
              </div>
            </div>
          ))}
          {!opportunities.length ? <div style={styles.empty}>Nessuna opportunita ancora.</div> : null}
        </div>
      </FormCard>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', justifyContent: 'space-between', gap: 16, paddingBottom: 14, borderBottom: '1px solid #f3f4f6', alignItems: 'center', flexWrap: 'wrap' },
  title: { fontWeight: 700 },
  meta: { color: '#6b7280', marginTop: 4 },
  right: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  inlineForm: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  empty: { color: '#6b7280' },
};
