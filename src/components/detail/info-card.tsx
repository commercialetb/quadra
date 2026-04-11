import type { ReactNode } from 'react';

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-neutral-500">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-900 sm:max-w-[60%] sm:text-right">{value ?? '—'}</span>
    </div>
  );
}
