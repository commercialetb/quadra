import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow = 'CRM core',
  compact = false,
}: {
  title: string
  subtitle: string
  actions?: ReactNode
  eyebrow?: string
  compact?: boolean
}) {
  return (
    <section className={`page-hero ${compact ? 'page-hero-compact' : ''}`}>
      <div>
        <p className="page-eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {actions ? <div className="page-hero-actions">{actions}</div> : null}
    </section>
  )
}
