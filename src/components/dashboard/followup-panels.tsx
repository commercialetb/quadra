import Link from 'next/link'
import { SectionCard } from '@/components/section-card'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function toneFromPriority(priority?: string) {
  switch ((priority || '').toLowerCase()) {
    case 'urgent':
      return 'red'
    case 'high':
      return 'amber'
    case 'medium':
      return 'blue'
    default:
      return 'slate'
  }
}

function FollowupGroup({ title, subtitle, items, tone }: { title: string; subtitle: string; items: Array<any>; tone: string }) {
  return (
    <SectionCard title={title} subtitle={subtitle} tone={tone}>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 ? (
          <div className="empty-inline">Nessun elemento.</div>
        ) : (
          items.map((item) => (
            <Link key={item.id} href="/followups" prefetch className="page-card followup-item-card" data-tone={toneFromPriority(item.priority)}>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.title}</div>
                  <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 14 }}>{formatDate(item.due_at)}</div>
                </div>
                <div className="priority-pill" data-tone={toneFromPriority(item.priority)}>{item.priority}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  )
}

export function FollowupPanels({ overdue, today, upcoming }: { overdue: Array<any>; today: Array<any>; upcoming: Array<any> }) {
  return (
    <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
      <FollowupGroup title="Scaduti" subtitle="Da sistemare subito." items={overdue} tone="red" />
      <FollowupGroup title="Oggi" subtitle="Le cose da chiudere in giornata." items={today} tone="amber" />
      <FollowupGroup title="In arrivo" subtitle="I prossimi follow-up pianificati." items={upcoming} tone="blue" />
    </div>
  )
}
