import type { PropsWithChildren } from 'react'

export function ImportShell({ children }: PropsWithChildren) {
  return (
    <div className="import-shell">
      <section className="hero-card page-card">
        <p className="eyebrow">Milestone 3.1</p>
        <h1 className="hero-title">Import dati nel CRM</h1>
        <p className="hero-copy">
          Sequenza import: carica il file, controlla il tipo di entità, sistema il mapping e conferma il salvataggio reale nel CRM.
        </p>
      </section>
      {children}
    </div>
  )
}
