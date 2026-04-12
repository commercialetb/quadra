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
    <div className="detail-shell">
      <Link href={backHref} className="back-link">← {backLabel}</Link>
      <section className="page-card detail-hero">
        <p className="eyebrow">Detail view</p>
        <h1 className="hero-title">{title}</h1>
        {subtitle ? <p className="hero-copy">{subtitle}</p> : null}
      </section>
      {children}
    </div>
  )
}
