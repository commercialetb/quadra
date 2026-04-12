import { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow = 'Quadra',
}: {
  title: string
  subtitle: string
  actions?: ReactNode
  eyebrow?: string
}) {
  return (
    <section className="hero-card page-card">
      <p className="eyebrow">{eyebrow}</p>
      <div className="section-heading" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="hero-title">{title}</h1>
          <p className="hero-copy">{subtitle}</p>
        </div>
        {actions ? <div className="quick-actions">{actions}</div> : null}
      </div>
    </section>
  )
}
