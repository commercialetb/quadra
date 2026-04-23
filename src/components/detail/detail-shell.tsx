import Link from 'next/link'
import type { ReactNode } from 'react'

export function DetailShell({
  title,
  subtitle,
  backHref,
  backLabel,
  children,
}: {
  title: string
  subtitle?: string | null
  backHref: string
  backLabel: string
  children: ReactNode
}) {
  return (
    <div className="page-stack detail-page redesign-detail-page">
      <div className="detail-back-row redesign-back-row">
        <Link href={backHref} className="back-link">← {backLabel}</Link>
      </div>
      <section className="page-hero detail-hero-card redesign-detail-hero">
        <div>
          <p className="page-eyebrow">Scheda azienda</p>
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
      </section>
      {children}
    </div>
  )
}
