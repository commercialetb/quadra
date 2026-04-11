import Link from 'next/link';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function FollowupGroup({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Array<{
    id: string;
    title: string;
    due_at: string;
    priority: string;
    status: string;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-neutral-950">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
            Nessun elemento.
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href="/followups"
              className="block rounded-xl border border-neutral-200 p-4 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-neutral-950">{item.title}</div>
                  <div className="mt-1 text-sm text-neutral-500">{formatDate(item.due_at)}</div>
                </div>
                <div className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-600">
                  {item.priority}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export function FollowupPanels({
  overdue,
  today,
  upcoming,
}: {
  overdue: Array<{ id: string; title: string; due_at: string; priority: string; status: string }>;
  today: Array<{ id: string; title: string; due_at: string; priority: string; status: string }>;
  upcoming: Array<{ id: string; title: string; due_at: string; priority: string; status: string }>;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <FollowupGroup title="Scaduti" subtitle="Da sistemare subito." items={overdue} />
      <FollowupGroup title="Oggi" subtitle="Le cose da chiudere in giornata." items={today} />
      <FollowupGroup title="In arrivo" subtitle="I prossimi follow-up pianificati." items={upcoming} />
    </div>
  );
}
