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
    <div className="page-stack detail-page">
      <div className="detail-back-row">
        <Link href={backHref} className="back-link">← {backLabel}</Link>
      </div>
      <section className="page-hero page-hero-compact detail-hero-card">
        <div>
          <p className="page-eyebrow">Dettaglio</p>
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
      </section>
      {children}
    </div>
  )
}
