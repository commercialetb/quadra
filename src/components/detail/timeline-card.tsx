import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { TimelineItem } from '@/lib/detail-queries'

function badge(item: TimelineItem) {
  if (item.item_type === 'followup') {
    return `${item.status ?? 'pending'} · ${item.priority ?? 'medium'}`
  }
  return item.kind
}

export function TimelineCard({ items }: { items: TimelineItem[] }) {
  return (
    <section className="timeline-card">
      <div className="section-heading">
        <div>
          <h2>Timeline</h2>
          <p>Attività e follow-up nello stesso flusso, con un linguaggio visivo finalmente coerente.</p>
        </div>
        <div className="section-utility">{items.length} elementi</div>
      </div>
      <div className="timeline-stack">
        {items.length === 0 ? (
          <p className="empty-copy">Nessun elemento in timeline.</p>
        ) : (
          items.map((item) => (
            <div key={`${item.item_type}-${item.id}`} className="timeline-item">
              <div className="timeline-head">
                <div>
                  <div className="timeline-title">{item.title || (item.item_type === 'activity' ? 'Attività' : 'Follow-up')}</div>
                  <div className="crm-tags" style={{ marginTop: 8 }}>
                    <span className={`badge ${item.item_type === 'followup' ? 'badge-warning' : 'badge-dark'}`}>{badge(item)}</span>
                  </div>
                </div>
                <div className="timeline-date">{format(new Date(item.occurred_at), 'dd MMM yyyy, HH:mm', { locale: it })}</div>
              </div>
              {item.content ? <p className="timeline-copy">{item.content}</p> : null}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
