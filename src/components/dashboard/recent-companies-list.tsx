import Link from 'next/link'
import { SectionCard } from '@/components/section-card'
import { CompanyAvatar } from '@/components/ui/company-avatar'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function RecentCompaniesList({ items }: { items: Array<any> }) {
  const visible = items.slice(0, 4)

  return (
    <SectionCard title="Aziende recenti" subtitle="Le schede da riaprire al volo, senza occupare mezza pagina." utility={items.length ? `${items.length} totali` : undefined}>
      <div className="mini-entity-list">
        {visible.length === 0 ? (
          <div className="dashboard-empty">Nessuna azienda presente.</div>
        ) : (
          visible.map((item) => (
            <Link key={item.id} href={`/companies/${item.id}`} className="mini-entity-card">
              <div className="mini-entity-main">
                <CompanyAvatar name={item.name} website={item.website} size="sm" />
                <div>
                  <div className="mini-entity-title">{item.name}</div>
                  <div className="mini-entity-meta">{item.city || 'Citta non indicata'} · {item.status}</div>
                </div>
              </div>
              <div className="mini-entity-date">{formatDate(item.created_at)}</div>
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  )
}
