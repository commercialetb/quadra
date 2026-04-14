import { SectionCard } from '@/components/section-card'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function RecentActivityList({ items }: { items: Array<any> }) {
  return (
    <SectionCard title="Attività recenti" subtitle="Lo storico essenziale, senza rumore.">
      <div className="timeline-stack">
        {items.length === 0 ? (
          <div className="empty-copy">Nessuna attività registrata.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="timeline-card">
              <div className="timeline-head">
                <div>
                  <div className="timeline-title">{item.subject || 'Attività senza oggetto'}</div>
                  <div className="timeline-date">{item.kind} · {formatDate(item.happened_at)}</div>
                </div>
              </div>
              {item.content ? <p className="timeline-copy">{item.content}</p> : null}
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}
