import Link from 'next/link'
import { SectionCard } from '@/components/section-card'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function RecentCompaniesList({ items }: { items: Array<any> }) {
  return (
    <SectionCard title="Aziende recenti" subtitle="Le anagrafiche nuove o appena toccate, per rientrare subito nel contesto.">
      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ border: '1px dashed var(--line-strong)', borderRadius: 18, padding: 16, color: 'var(--muted)' }}>Nessuna azienda presente.</div>
        ) : (
          items.map((item) => (
            <Link key={item.id} href={`/companies/${item.id}`} className="page-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 14 }}>{item.city || 'Città non indicata'} · {item.status}</div>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 14 }}>{formatDate(item.created_at)}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  )
}
