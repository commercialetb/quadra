import Link from 'next/link'
import type { ReactNode } from 'react'

export function DetailShell({
  title,
  subtitle,
  backHref,
  backLabel,
  children,
  actions,
  meta,
}: {
  title: string
  subtitle?: string | null
  backHref: string
  backLabel: string
  children: ReactNode
  actions?: ReactNode
  meta?: ReactNode
}) {
  return (
    <div className="page-stack detail-page">
      <div className="detail-back-row">
        <Link href={backHref} className="back-link">← {backLabel}</Link>
      </div>
      <section className="page-hero detail-hero-card">
        <div>
          <p className="page-eyebrow">Dettaglio</p>
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="page-hero-actions">{actions}</div> : null}
      </section>
      {meta ? <div className="detail-meta-strip">{meta}</div> : null}
      {children}
    </div>
  )
}
