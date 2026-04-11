import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { TimelineItem } from '@/lib/detail-queries';

function badge(item: TimelineItem) {
  if (item.item_type === 'followup') {
    return `${item.status ?? 'pending'} · ${item.priority ?? 'medium'}`;
  }
  return item.kind;
}

export function TimelineCard({ items }: { items: TimelineItem[] }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">Timeline</h2>
        <span className="text-xs text-neutral-400">Attività + follow-up</span>
      </div>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">Nessun elemento in timeline.</p>
        ) : (
          items.map((item) => (
            <div key={`${item.item_type}-${item.id}`} className="rounded-xl border border-neutral-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-neutral-900">{item.title || (item.item_type === 'activity' ? 'Attività' : 'Follow-up')}</div>
                <div className="text-xs text-neutral-500">
                  {format(new Date(item.occurred_at), 'dd MMM yyyy, HH:mm', { locale: it })}
                </div>
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-neutral-400">{badge(item)}</div>
              {item.content ? <p className="mt-3 text-sm leading-6 text-neutral-700">{item.content}</p> : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
