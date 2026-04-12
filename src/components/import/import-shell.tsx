import type { PropsWithChildren } from 'react'

export function ImportShell({ children }: PropsWithChildren) {
  return (
    <div className="import-shell">
      <section className="hero-card page-card">
        <p className="eyebrow">Milestone 3.1</p>
        <h1 className="hero-title">Import dati da Excel</h1>
        <p className="hero-copy">
          Carica un file Excel o CSV, lascia che Quadra analizzi fogli e colonne, poi conferma il mapping prima di importare i dati nel CRM.
        </p>
      </section>
      {children}
    </div>
  )
}
