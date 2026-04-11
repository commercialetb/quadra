import { createCompany, deleteCompany, updateCompanyStatus } from '@/app/(app)/actions';
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives';

const companyStatuses = ['lead', 'prospect', 'client', 'partner', 'inactive'];

export function CompaniesCrud({ companies }: { companies: any[] }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form action={createCompany}>
        <FormCard title="Nuova azienda" subtitle="Crea rapidamente una scheda azienda pulita.">
          <FormGrid>
            <Field label="Nome azienda"><input name="name" required style={inputStyle()} /></Field>
            <Field label="Sito web"><input name="website" placeholder="https://" style={inputStyle()} /></Field>
            <Field label="Email"><input name="email" type="email" style={inputStyle()} /></Field>
            <Field label="Telefono"><input name="phone" style={inputStyle()} /></Field>
            <Field label="Citta"><input name="city" style={inputStyle()} /></Field>
            <Field label="Provincia"><input name="province" style={inputStyle()} /></Field>
            <Field label="Stato">
              <select name="status" defaultValue="lead" style={selectStyle()}>
                {companyStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
          </FormGrid>
          <Field label="Note sintetiche"><textarea name="notes_summary" style={textareaStyle()} /></Field>
          <ActionBar><PrimaryButton>Salva azienda</PrimaryButton></ActionBar>
        </FormCard>
      </form>

      <FormCard title="Aziende" subtitle="Lista con update rapido di stato e cancellazione.">
        <div style={{ display: 'grid', gap: 14 }}>
          {companies.map((company) => (
            <div key={company.id} style={styles.row}>
              <div>
                <div style={styles.title}>{company.name}</div>
                <div style={styles.meta}>{company.city ?? '—'} · {company.website ?? '—'}</div>
              </div>
              <div style={styles.right}>
                <form action={updateCompanyStatus} style={styles.inlineForm}>
                  <input type="hidden" name="id" value={company.id} />
                  <select name="status" defaultValue={company.status} style={selectStyle()}>
                    {companyStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <PrimaryButton>Aggiorna</PrimaryButton>
                </form>
                <form action={deleteCompany}>
                  <input type="hidden" name="id" value={company.id} />
                  <InlineDangerButton>Elimina</InlineDangerButton>
                </form>
              </div>
            </div>
          ))}
          {!companies.length ? <div style={styles.empty}>Nessuna azienda ancora.</div> : null}
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
