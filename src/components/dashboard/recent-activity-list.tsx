function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function RecentActivityList({
  items,
}: {
  items: Array<{
    id: string;
    kind: string;
    subject: string | null;
    content: string | null;
    happened_at: string;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-950">Attività recenti</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
            Nessuna attività registrata.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-neutral-950">{item.subject || 'Attività senza oggetto'}</div>
                  <div className="mt-1 text-sm text-neutral-500">{item.kind} · {formatDate(item.happened_at)}</div>
                  {item.content ? (
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-700">{item.content}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
