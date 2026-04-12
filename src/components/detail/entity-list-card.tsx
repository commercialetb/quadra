import Link from 'next/link'

export function EntityListCard({
  title,
  empty,
  emptyAction,
  items,
}: {
  title: string
  empty: string
  emptyAction?: { label: string; href: string }
  items: Array<{ id: string; label: string; meta?: string | null; href?: string }>
}) {
  return (
    <section className="list-card">
      <p className="card-kicker">{title}</p>
      <div className="entity-list">
        {items.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-copy">{empty}</p>
            {emptyAction ? (
              <Link href={emptyAction.href} className="button-secondary button-tight">
                + {emptyAction.label}
              </Link>
            ) : null}
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
