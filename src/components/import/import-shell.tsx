import type { PropsWithChildren } from 'react'

export function ImportShell({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Milestone 3.1</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Import dati da Excel</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Carica un file Excel o CSV, lascia che Quadra analizzi fogli e colonne, poi conferma il mapping prima
          di importare i dati nel CRM.
        </p>
      </div>
      {children}
    </div>
  )
}
