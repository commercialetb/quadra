import { ReactNode } from 'react'

export function SectionCard({
  title,
  subtitle,
  children,
  utility,
  tone = 'slate',
}: {
  title: string
  subtitle?: string
  children: ReactNode
  utility?: ReactNode
  tone?: 'slate' | 'blue' | 'amber' | 'red' | 'green' | 'violet' | string
}) {
  return (
    <section className="frost-card" data-tone={tone}>
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
