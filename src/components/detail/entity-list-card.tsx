import Link from 'next/link'

export function EntityListCard({
  title,
  empty,
  items,
  emptyActionLabel,
  emptyActionHref,
}: {
  title: string
  empty: string
  items: Array<{ id: string; label: string; meta?: string | null; href?: string }>
  emptyActionLabel?: string
  emptyActionHref?: string
}) {
  return (
    <section className="panel-card">
      <div className="panel-head compact"><div><h2>{title}</h2></div></div>
      <div className="simple-list">
        {items.length === 0 ? (
          <div className="empty-block empty-block-actionable">
            <span>{empty}</span>
            {emptyActionLabel && emptyActionHref ? (
              <Link href={emptyActionHref} className="ghost-button compact-ghost empty-action-button">
                {emptyActionLabel}
              </Link>
            ) : null}
          </div>
        ) : (
          items.map((item) => (
            item.href ? (
              <Link href={item.href} key={item.id} className="simple-row">
                <div>
                  <strong>{item.label}</strong>
                  {item.meta ? <span>{item.meta}</span> : null}
                </div>
              </Link>
            ) : (
              <div key={item.id} className="simple-row static">
                <div>
                  <strong>{item.label}</strong>
                  {item.meta ? <span>{item.meta}</span> : null}
                </div>
              </div>
            )
          ))
        )}
      </div>
    </section>
  )
}
