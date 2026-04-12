import { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow = 'Quadra CRM',
}: {
  title: string
  subtitle: string
  actions?: ReactNode
  eyebrow?: string
}) {
  return (
    <section className="page-header">
      <p className="page-eyebrow">{eyebrow}</p>
      <div className="page-header-grid">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>
    </section>
  )
}
