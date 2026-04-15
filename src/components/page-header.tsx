import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow = 'CRM core',
  compact = false,
  mobileHidden = false,
}: {
  title: string
  subtitle: string
  actions?: ReactNode
  eyebrow?: string
  compact?: boolean
  mobileHidden?: boolean
}) {
  return (
    <section className={`page-hero page-hero-reference ${compact ? 'page-hero-compact' : ''} ${mobileHidden ? 'page-hero-mobile-hidden' : ''}`.trim()}>
      <div className="page-hero-copy">
        <p className="page-eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      <div className="page-hero-wave" aria-hidden="true" />
      {actions ? <div className="page-hero-actions page-hero-actions-reference">{actions}</div> : null}
    </section>
  )
}
