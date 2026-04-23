import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { TimelineItem } from '@/lib/detail-queries'

function badge(item: TimelineItem) {
  if (item.item_type === 'followup') return `${item.status ?? 'pending'} · ${item.priority ?? 'medium'}`
  return item.kind
}

export function TimelineCard({ items }: { items: TimelineItem[] }) {
  return (
    <section className="panel-card">
      <div className="panel-head compact">
        <div>
          <h2>Timeline</h2>
          <p>Attivita e follow-up nello stesso flusso, con una gerarchia più pulita.</p>
        </div>
      </div>
      <div className="timeline-v2">
        {items.length === 0 ? (
          <div className="empty-block">Nessun elemento in timeline.</div>
        ) : (
          items.map((item) => (
            <article key={`${item.item_type}-${item.id}`} className="timeline-card-item">
              <div className="timeline-line" />
              <div className="timeline-content">
                <div className="timeline-head-row">
                  <div>
                    <strong>{item.title || (item.item_type === 'activity' ? 'Attivita' : 'Follow-up')}</strong>
                    <div className="timeline-meta">{badge(item)}</div>
                  </div>
                  <span className="timeline-date">{format(new Date(item.occurred_at), 'dd MMM yyyy, HH:mm', { locale: it })}</span>
                </div>
                {item.content ? <p className="timeline-copy">{item.content}</p> : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
