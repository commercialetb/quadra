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
      <div className="company-list-v2">
        {staleOpportunities.length === 0 ? (
          <div className="empty-copy">Nessuna opportunità ferma. Ottimo segnale.</div>
        ) : (
          staleOpportunities.map((item) => (
            <Link key={item.id} href={`/opportunities/${item.id}`} className="entity-card-v2">
              <div className="entity-title-row">
                <div className="entity-title-block">
                  <div className="entity-title">{item.title}</div>
                  <div className="entity-subtitle">Fase: {item.stage} · Ultimo aggiornamento: {formatDate(item.updated_at)}</div>
                </div>
                <span className="badge badge-warning">attenzione</span>
              </div>
              {item.next_action ? <div className="entity-meta-row"><span className="entity-chip">Prossima azione: {item.next_action}</span></div> : null}
              <div className="entity-bottom-row" style={{ marginTop: 12 }}>
                <span className="entity-muted">{item.value_estimate ? `€ ${Number(item.value_estimate).toLocaleString('it-IT')}` : '—'}</span>
                <span className="entity-muted">{formatDate(item.next_action_due_at)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  )
}
