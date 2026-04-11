import { createContact, deleteContact, updateContact } from '@/app/(app)/actions';
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives';

export function ContactsCrud({ contacts, companies }: { contacts: any[]; companies: any[] }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form action={createContact}>
        <FormCard title="Nuovo contatto" subtitle="Collega il contatto a una azienda e salva i dati base.">
          <FormGrid>
            <Field label="Nome"><input name="first_name" required style={inputStyle()} /></Field>
            <Field label="Cognome"><input name="last_name" required style={inputStyle()} /></Field>
            <Field label="Azienda">
              <select name="company_id" style={selectStyle()} defaultValue="">
                <option value="">Nessuna</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </select>
            </Field>
            <Field label="Ruolo"><input name="role" style={inputStyle()} /></Field>
            <Field label="Email"><input name="email" type="email" style={inputStyle()} /></Field>
            <Field label="Telefono principale"><input name="phone" style={inputStyle()} /></Field>
            <Field label="WhatsApp"><input name="whatsapp" style={inputStyle()} /></Field>
            <Field label="Contatto preferito"><input name="preferred_contact_method" placeholder="phone / email / whatsapp" style={inputStyle()} /></Field>
          </FormGrid>
          <Field label="Note sintetiche"><textarea name="notes_summary" style={textareaStyle()} /></Field>
          <ActionBar><PrimaryButton>Salva contatto</PrimaryButton></ActionBar>
        </FormCard>
      </form>

      <FormCard title="Contatti" subtitle="Update rapido di ruolo, azienda e dati principali.">
        <div style={{ display: 'grid', gap: 14 }}>
          {contacts.map((contact) => (
            <div key={contact.id} style={styles.row}>
              <div style={{ minWidth: 220 }}>
                <div style={styles.title}>{contact.first_name} {contact.last_name}</div>
                <div style={styles.meta}>{contact.companies?.name ?? 'Nessuna azienda'} · {contact.email ?? '—'}</div>
              </div>
              <form action={updateContact} style={styles.inlineGrid}>
                <input type="hidden" name="id" value={contact.id} />
                <select name="company_id" defaultValue={contact.company_id ?? ''} style={selectStyle()}>
                  <option value="">Nessuna</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
                <input name="role" defaultValue={contact.role ?? ''} placeholder="Ruolo" style={inputStyle()} />
                <input name="email" defaultValue={contact.email ?? ''} placeholder="Email" style={inputStyle()} />
                <input name="whatsapp" defaultValue={contact.whatsapp ?? ''} placeholder="WhatsApp" style={inputStyle()} />
                <PrimaryButton>Aggiorna</PrimaryButton>
              </form>
              <form action={deleteContact}>
                <input type="hidden" name="id" value={contact.id} />
                <InlineDangerButton>Elimina</InlineDangerButton>
              </form>
            </div>
          ))}
          {!contacts.length ? <div style={styles.empty}>Nessun contatto ancora.</div> : null}
        </div>
      </FormCard>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'grid', gap: 12, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' },
  inlineGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, alignItems: 'center' },
  title: { fontWeight: 700 },
  meta: { color: '#6b7280', marginTop: 4 },
  empty: { color: '#6b7280' },
};
