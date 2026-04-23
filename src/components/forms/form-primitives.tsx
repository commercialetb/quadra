import { ReactNode } from 'react'

export function FormCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="frost-card">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="crm-form-shell">{children}</div>
    </section>
  )
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid-auto">{children}</div>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  )
}

export function inputStyle(): React.CSSProperties {
  return { height: 50, borderRadius: 16, padding: '0 14px' }
}

export function textareaStyle(): React.CSSProperties {
  return { minHeight: 110, borderRadius: 18, padding: 14, resize: 'vertical' }
}

export function selectStyle(): React.CSSProperties {
  return { height: 50, borderRadius: 16, padding: '0 14px' }
}

export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="quick-actions" style={{ marginTop: 6 }}>{children}</div>
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return <button className="button-primary" type="submit">{children}</button>
}

export function SecondaryButton({ children }: { children: ReactNode }) {
  return <button className="button-secondary" type="button">{children}</button>
}

export function InlineDangerButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="button-ghost"
      style={{ color: 'var(--danger)', borderColor: 'rgba(185,28,28,0.16)', background: 'rgba(185,28,28,0.06)' }}
    >
      {children}
    </button>
  )
}
