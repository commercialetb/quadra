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
  const visible = items.slice(0, 4)

  return (
    <SectionCard title="Attività recenti" subtitle="Ultimi tocchi nel CRM.">
      <div className="recent-list compact-list">
        {visible.length === 0 ? (
          <div className="empty-inline">Nessuna attività recente.</div>
        ) : (
          visible.map((item) => (
            <div key={item.id} className="recent-row recent-activity-row">
              <div>
                <div className="recent-row-title">{item.subject || 'Attività senza oggetto'}</div>
                <div className="recent-row-meta">{item.kind} · {formatDate(item.happened_at)}</div>
                {item.content ? <p className="recent-row-copy">{item.content}</p> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}
