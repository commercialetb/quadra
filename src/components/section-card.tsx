import { ReactNode } from 'react'

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="frost-card">
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.04em' }}>{title}</h2>
        {subtitle ? <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: 1.6 }}>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}
