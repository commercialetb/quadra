import type { PropsWithChildren } from 'react'

export function ImportShell({ children }: PropsWithChildren) {
  return (
    <div className="page-wrap import-shell">
      <section className="page-hero page-hero-compact">
        <div>
          <p className="page-eyebrow">Import</p>
          <h1 className="page-title">Import dati da Excel</h1>
          <p className="page-subtitle">Carica un file Excel o CSV, controlla mapping e preview, poi conferma l'ingresso dei dati nel CRM.</p>
        </div>
      </section>
      {children}
    </div>
  )
}
