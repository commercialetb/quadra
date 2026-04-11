import Link from 'next/link';

export function EntityListCard({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string; label: string; meta?: string | null; href?: string }>;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-neutral-500">{title}</h2>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-neutral-100 p-3">
              {item.href ? (
                <Link href={item.href} className="font-medium text-neutral-900 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <div className="font-medium text-neutral-900">{item.label}</div>
              )}
              {item.meta ? <div className="mt-1 text-sm text-neutral-500">{item.meta}</div> : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
