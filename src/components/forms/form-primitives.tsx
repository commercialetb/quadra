import { ReactNode } from 'react';

export function FormCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section style={styles.card}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={styles.title}>{title}</h2>
        {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
      </div>
      <div style={{ display: 'grid', gap: 12 }}>{children}</div>
    </section>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div style={styles.grid}>{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

export function inputStyle() {
  return styles.input;
}

export function textareaStyle() {
  return styles.textarea;
}

export function selectStyle() {
  return styles.input;
}

export function ActionBar({ children }: { children: ReactNode }) {
  return <div style={styles.actions}>{children}</div>;
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return <button style={styles.primaryButton} type="submit">{children}</button>;
}

export function InlineDangerButton({ children }: { children: ReactNode }) {
  return <button style={styles.dangerButton} type="submit">{children}</button>;
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: 20 },
  title: { margin: 0, fontSize: 22, letterSpacing: '-0.02em' },
  subtitle: { margin: '6px 0 0', color: '#6b7280' },
  grid: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' },
  field: { display: 'grid', gap: 8 },
  label: { fontSize: 14, color: '#374151', fontWeight: 600 },
  input: { height: 44, borderRadius: 12, border: '1px solid #d1d5db', padding: '0 12px', background: '#fff' },
  textarea: { minHeight: 96, borderRadius: 12, border: '1px solid #d1d5db', padding: 12, resize: 'vertical' },
  actions: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  primaryButton: { height: 44, borderRadius: 12, border: 'none', background: '#111827', color: '#fff', padding: '0 16px', cursor: 'pointer' },
  dangerButton: { height: 36, borderRadius: 10, border: '1px solid #fecaca', background: '#fff5f5', color: '#b91c1c', padding: '0 12px', cursor: 'pointer' },
};
