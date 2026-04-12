import Link from 'next/link'

export function EntityListCard({
  title,
  empty,
  items,
  ctaLabel,
  ctaHref,
}: {
  title: string
  empty: string
  items: Array<{ id: string; label: string; meta?: string | null; href?: string }>
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <section className="panel-card">
      <div className="panel-head compact"><div><h2>{title}</h2></div></div>
      <div className="simple-list">
        {items.length === 0 ? (
          <div className="empty-block empty-block-with-action">
            <span>{empty}</span>
            {ctaLabel && ctaHref ? (
              <Link href={ctaHref} className="ghost-button empty-cta-button">
                {ctaLabel}
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
