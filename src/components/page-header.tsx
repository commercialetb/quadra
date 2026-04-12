import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow = 'CRM core',
}: {
  title: string
  subtitle: string
  actions?: ReactNode
  eyebrow?: string
}) {
  return (
    <section className="page-hero">
      <div>
        <p className="page-eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {actions ? <div className="page-hero-actions">{actions}</div> : null}
    </section>
  )
}
