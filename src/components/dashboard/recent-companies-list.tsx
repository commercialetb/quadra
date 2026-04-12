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
  const visible = items.slice(0, 5)

  return (
    <SectionCard title="Aziende recenti" subtitle="Le anagrafiche appena toccate, senza rubare tutta la schermata." utility={items.length > 5 ? <Link href="/companies">Vedi tutto</Link> : undefined}>
      <div className="recent-list compact-list">
        {visible.length === 0 ? (
          <div className="empty-inline">Nessuna azienda presente.</div>
        ) : (
          visible.map((item) => (
            <Link key={item.id} href={`/companies/${item.id}`} className="recent-row compact-row">
              <div className="recent-row-main">
                <CompanyAvatar name={item.name} website={item.website} size="sm" />
                <div>
                  <div className="recent-row-title">{item.name}</div>
                  <div className="recent-row-meta">{item.city || 'Città non indicata'} · {item.status}</div>
                </div>
              </div>
              <div className="recent-row-date">{formatDate(item.created_at)}</div>
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  )
}
