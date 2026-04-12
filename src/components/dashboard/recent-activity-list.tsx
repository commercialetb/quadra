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
    <SectionCard title="Attivita recenti" subtitle="Le ultime interazioni davvero utili da rileggere.">
      <div className="mini-activity-list">
        {visible.length === 0 ? (
          <div className="dashboard-empty">Nessuna attivita registrata.</div>
        ) : (
          visible.map((item) => (
            <div key={item.id} className="mini-activity-card">
              <div className="mini-activity-top">
                <div>
                  <div className="mini-entity-title">{item.subject || 'Attivita senza oggetto'}</div>
                  <div className="mini-entity-meta">{item.kind} · {formatDate(item.happened_at)}</div>
                </div>
              </div>
              {item.content ? <p className="mini-activity-copy">{item.content}</p> : null}
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}
