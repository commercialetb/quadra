import type { ReactNode } from 'react'

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel-card info-card-v2">
      <div className="panel-head compact">
        <div>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="info-grid">{children}</div>
    </section>
  )
}

export function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="info-row-v2">
      <span>{label}</span>
      <strong>{value ?? '—'}</strong>
    </div>
  )
}
