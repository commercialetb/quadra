import { createFollowup, deleteFollowup, updateFollowupStatus } from '@/app/(app)/actions';
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives';
import { formatDateTime } from '@/lib/format';

const statuses = ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'];
const priorities = ['low', 'medium', 'high', 'urgent'];

export function FollowupsCrud({ followups, companies, contacts, opportunities }: { followups: any[]; companies: any[]; contacts: any[]; opportunities: any[] }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form action={createFollowup}>
        <FormCard title="Nuovo follow-up" subtitle="La tua agenda operativa deve stare qui, non nelle note.">
          <FormGrid>
            <Field label="Titolo"><input name="title" required style={inputStyle()} /></Field>
            <Field label="Scadenza"><input name="due_at" type="datetime-local" required style={inputStyle()} /></Field>
            <Field label="Priorita">
              <select name="priority" defaultValue="medium" style={selectStyle()}>
                {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Stato">
              <select name="status" defaultValue="pending" style={selectStyle()}>
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Azienda">
              <select name="company_id" style={selectStyle()} defaultValue="">
                <option value="">Nessuna</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </select>
            </Field>
            <Field label="Contatto">
              <select name="contact_id" style={selectStyle()} defaultValue="">
                <option value="">Nessuno</option>
                {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}
              </select>
            </Field>
            <Field label="Opportunita">
              <select name="opportunity_id" style={selectStyle()} defaultValue="">
                <option value="">Nessuna</option>
                {opportunities.map((opportunity) => <option key={opportunity.id} value={opportunity.id}>{opportunity.title}</option>)}
              </select>
            </Field>
          </FormGrid>
          <Field label="Descrizione"><textarea name="description" style={textareaStyle()} /></Field>
          <ActionBar><PrimaryButton>Salva follow-up</PrimaryButton></ActionBar>
        </FormCard>
      </form>

      <FormCard title="Follow-up" subtitle="Aggiorna stato o elimina.">
        <div style={{ display: 'grid', gap: 14 }}>
          {followups.map((item) => (
            <div key={item.id} style={styles.row}>
              <div>
                <div style={styles.title}>{item.title}</div>
                <div style={styles.meta}>{item.priority} · scade {formatDateTime(item.due_at)}</div>
              </div>
              <div style={styles.right}>
                <form action={updateFollowupStatus} style={styles.inlineForm}>
                  <input type="hidden" name="id" value={item.id} />
                  <select name="status" defaultValue={item.status} style={selectStyle()}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <PrimaryButton>Aggiorna</PrimaryButton>
                </form>
                <form action={deleteFollowup}>
                  <input type="hidden" name="id" value={item.id} />
                  <InlineDangerButton>Elimina</InlineDangerButton>
                </form>
              </div>
            </div>
          ))}
          {!followups.length ? <div style={styles.empty}>Nessun follow-up ancora.</div> : null}
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
