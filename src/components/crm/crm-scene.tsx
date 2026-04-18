import Link from 'next/link'
import type { ReactNode } from 'react'

type Stat = { label: string; value: string | number; note?: string }
type LinkItem = { href: string; label: string; tone?: 'primary' | 'ghost' }

export function CrmScene({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`crm-scene ${className}`.trim()}>
      <div className="crm-scene-orb crm-scene-orb-a" aria-hidden="true" />
      <div className="crm-scene-orb crm-scene-orb-b" aria-hidden="true" />
      <div className="crm-scene-shell">{children}</div>
    </div>
  )
}

export function CrmHero({
  eyebrow,
  title,
  description,
  stats,
  links = [],
  spotlight,
}: {
  eyebrow: string
  title: string
  description: string
  stats: Stat[]
  links?: LinkItem[]
  spotlight?: { kicker: string; value: string; note: string }
}) {
  return (
    <section className="crm-hero-card">
      <div className="crm-hero-noise" aria-hidden="true" />
      <div className="crm-hero-copy">
        <span className="crm-hero-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="crm-hero-actions">
          {links.map((item) => (
            <Link key={item.href + item.label} href={item.href} className={`quadra-pill-button ${item.tone === 'primary' ? 'primary' : 'ghost'}`}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      {spotlight ? (
        <div className="crm-hero-spotlight">
          <span>{spotlight.kicker}</span>
          <strong>{spotlight.value}</strong>
          <p>{spotlight.note}</p>
          <i aria-hidden="true" />
        </div>
      ) : null}
      <div className="crm-hero-stats" aria-label={`${title} metriche`}>
        {stats.map((stat) => (
          <article key={stat.label} className="crm-hero-stat">
            <i aria-hidden="true" />
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            {stat.note ? <small>{stat.note}</small> : null}
          </article>
        ))}
      </div>
    </section>
  )
}
