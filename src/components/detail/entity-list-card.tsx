import Link from 'next/link'
import type { ReactNode } from 'react'

export function EntityListCard({
  title,
  empty,
  items,
  emptyAction,
}: {
  title: string
  empty: string
  items: Array<{ id: string; label: string; meta?: string | null; href?: string }>
  emptyAction?: ReactNode
}) {
  return (
    <section className="list-card">
      <p className="card-kicker">{title}</p>
      <div className="entity-list">
        {items.length === 0 ? (
          <div className="empty-block">
            <p className="empty-copy">{empty}</p>
            {emptyAction ? <div className="empty-action">{emptyAction}</div> : null}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="entity-row">
              {item.href ? (
                <Link href={item.href} className="entity-row-title">{item.label}</Link>
              ) : (
                <div className="entity-row-title">{item.label}</div>
              )}
              {item.meta ? <div className="entity-row-meta">{item.meta}</div> : null}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
