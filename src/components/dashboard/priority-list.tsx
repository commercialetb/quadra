import Link from 'next/link'
import { SectionCard } from '@/components/section-card'

function formatDate(value: string | null) {
  if (!value) return 'Nessuna scadenza'
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function PriorityList({ staleOpportunities }: { staleOpportunities: Array<any> }) {
  return (
    <SectionCard title="Priorità da sbloccare" subtitle="Le opportunità che meritano un colpo di telefono, una nota o una decisione oggi.">
      <div style={{ display: 'grid', gap: 12 }}>
        {staleOpportunities.length === 0 ? (
          <div style={{ border: '1px dashed var(--line-strong)', borderRadius: 18, padding: 16, color: 'var(--muted)' }}>
            Nessuna opportunità ferma. Ottimo segnale.
          </div>
        ) : (
          staleOpportunities.map((item) => (
            <Link key={item.id} href={`/opportunities/${item.id}`} className="page-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{item.title}</div>
                  <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 14 }}>
                    Fase: {item.stage} · Ultimo aggiornamento: {formatDate(item.updated_at)}
                  </div>
                  {item.next_action ? (
                    <div style={{ marginTop: 10, color: 'var(--text)', fontSize: 14 }}>
                      Prossima azione: <strong>{item.next_action}</strong>
                    </div>
                  ) : null}
                </div>
                <div style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 14 }}>
                  <div>{item.value_estimate ? `€ ${Number(item.value_estimate).toLocaleString('it-IT')}` : '—'}</div>
                  <div style={{ marginTop: 6 }}>{formatDate(item.next_action_due_at)}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  )
}
