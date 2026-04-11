import Link from 'next/link';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

export function RecentCompaniesList({
  items,
}: {
  items: Array<{
    id: string;
    name: string;
    city: string | null;
    status: string;
    created_at: string;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-950">Aziende recenti</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
            Nessuna azienda presente.
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/companies/${item.id}`}
              className="block rounded-xl border border-neutral-200 p-4 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-neutral-950">{item.name}</div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {item.city || 'Città non indicata'} · {item.status}
                  </div>
                </div>
                <div className="text-sm text-neutral-500">{formatDate(item.created_at)}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
