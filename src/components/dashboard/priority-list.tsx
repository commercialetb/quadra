import Link from 'next/link';

function formatDate(value: string | null) {
  if (!value) return 'Nessuna scadenza';
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function PriorityList({
  staleOpportunities,
}: {
  staleOpportunities: Array<{
    id: string;
    title: string;
    stage: string;
    updated_at: string;
    next_action: string | null;
    next_action_due_at: string | null;
    value_estimate: number | null;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950">Priorità da sbloccare</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Opportunità ferme da più di 7 giorni e da riattivare.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {staleOpportunities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
            Nessuna opportunità ferma. Ottimo segnale.
          </div>
        ) : (
          staleOpportunities.map((item) => (
            <Link
              key={item.id}
              href={`/opportunities/${item.id}`}
              className="block rounded-xl border border-neutral-200 p-4 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-neutral-950">{item.title}</div>
                  <div className="mt-1 text-sm text-neutral-500">
                    Fase: {item.stage} · Ultimo aggiornamento: {formatDate(item.updated_at)}
                  </div>
                  {item.next_action ? (
                    <div className="mt-2 text-sm text-neutral-700">
                      Prossima azione: <span className="font-medium">{item.next_action}</span>
                    </div>
                  ) : null}
                </div>
                <div className="text-right text-sm text-neutral-500">
                  <div>{item.value_estimate ? `€ ${Number(item.value_estimate).toLocaleString('it-IT')}` : '—'}</div>
                  <div className="mt-1">{formatDate(item.next_action_due_at)}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
