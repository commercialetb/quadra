import { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow = 'Quadra UI v3',
}: {
  title: string
  subtitle: string
  actions?: ReactNode
  eyebrow?: string
}) {
  return (
    <div className="hero-card page-card hero-card-v3">
      <p className="eyebrow">{eyebrow}</p>
      <div className="section-heading" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="hero-title">{title}</h1>
          <p className="hero-copy">{subtitle}</p>
        </div>
        {actions ? <div className="quick-actions">{actions}</div> : null}
      </div>
      <div className="hero-accent-row">
        <span className="status-pill status-pill-accent"><span className="status-dot" /> Responsive</span>
        <span className="status-pill"><span className="status-dot status-dot-warning" /> Priorita visive</span>
        <span className="status-pill"><span className="status-dot status-dot-blue" /> Navigazione piu rapida</span>
      </div>
    </div>
  )
}
