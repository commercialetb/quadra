import { ReactNode } from 'react'

export function SectionCard({
  title,
  subtitle,
  children,
  utility,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  utility?: ReactNode
}) {
  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {utility ? <div className="section-utility">{utility}</div> : null}
      </div>
      {children}
    </section>
  )
}
