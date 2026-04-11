import type { ReactNode } from 'react'

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="info-card">
      <p className="card-kicker">{title}</p>
      <div>{children}</div>
    </section>
  )
}

export function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="info-row">
      <span className="info-row-label">{label}</span>
      <span className="info-row-value">{value ?? '—'}</span>
    </div>
  )
}
