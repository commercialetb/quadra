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

function FollowupGroup({ title, subtitle, items }: { title: string; subtitle: string; items: Array<any> }) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ border: '1px dashed var(--line-strong)', borderRadius: 18, padding: 16, color: 'var(--muted)' }}>Nessun elemento.</div>
        ) : (
          items.map((item) => (
            <Link key={item.id} href="/followups" className="page-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.title}</div>
                  <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 14 }}>{formatDate(item.due_at)}</div>
                </div>
                <div style={{ minHeight: 32, padding: '0 12px', borderRadius: 999, border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', color: 'var(--muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{item.priority}</div>
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
      <FollowupGroup title="Scaduti" subtitle="Da sistemare subito." items={overdue} />
      <FollowupGroup title="Oggi" subtitle="Le cose da chiudere in giornata." items={today} />
      <FollowupGroup title="In arrivo" subtitle="I prossimi follow-up pianificati." items={upcoming} />
    </div>
  )
}
