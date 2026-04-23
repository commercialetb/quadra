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

function FollowupGroup({ title, subtitle, items }: { title: string; subtitle: string; items: Array<any> }) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="company-list-v2">
        {items.length === 0 ? (
          <div className="empty-copy">Nessun elemento.</div>
        ) : (
          items.map((item) => (
            <Link key={item.id} href="/followups" prefetch className="entity-card-v2">
              <div className="entity-title-row">
                <div>
                  <div className="entity-title">{item.title}</div>
                  <div className="entity-subtitle">{formatDate(item.due_at)}</div>
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
    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
      <FollowupGroup title="Scaduti" subtitle="Da sistemare subito." items={overdue} />
      <FollowupGroup title="Oggi" subtitle="Le cose da chiudere in giornata." items={today} />
      <FollowupGroup title="In arrivo" subtitle="I prossimi follow-up pianificati." items={upcoming} />
    </div>
  )
}
