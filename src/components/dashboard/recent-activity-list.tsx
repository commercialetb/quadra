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
      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ border: '1px dashed var(--line-strong)', borderRadius: 18, padding: 16, color: 'var(--muted)' }}>Nessuna attività registrata.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="page-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.subject || 'Attività senza oggetto'}</div>
                  <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 14 }}>{item.kind} · {formatDate(item.happened_at)}</div>
                  {item.content ? <p style={{ margin: '10px 0 0', color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>{item.content}</p> : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}
