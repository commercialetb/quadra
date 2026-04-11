import Link from 'next/link';
import type { ReactNode } from 'react';

export function DetailShell({
  title,
  subtitle,
  backHref,
  backLabel,
  children,
}: {
  title: string;
  subtitle?: string | null;
  backHref: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href={backHref} className="text-sm text-neutral-500 hover:text-neutral-900">
          ← {backLabel}
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
