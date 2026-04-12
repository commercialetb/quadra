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
  return (
    <SectionCard title="Aziende recenti" subtitle="Le anagrafiche nuove o appena toccate, per rientrare subito nel contesto.">
      <div className="company-list-v2">
        {items.length === 0 ? (
          <div className="empty-copy">Nessuna azienda presente.</div>
        ) : (
          items.map((item) => (
            <Link key={item.id} href={`/companies/${item.id}`} className="entity-card-v2">
              <div className="entity-main-row">
                <div className="entity-identity">
                  <CompanyAvatar name={item.name} website={item.website} size="sm" />
                  <div className="entity-copy">
                    <div className="entity-title">{item.name}</div>
                    <div className="entity-subtitle">{item.city || 'Città non indicata'} · {item.status}</div>
                  </div>
                </div>
                <div className="entity-muted">{formatDate(item.created_at)}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  )
}
