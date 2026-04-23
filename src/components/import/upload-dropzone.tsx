'use client'

import { useRef } from 'react'

type UploadDropzoneProps = {
  fileName: string
  onFileSelected: (file: File | null) => void
  onAnalyze: () => void
  isBusy?: boolean
}

export function UploadDropzone({ fileName, onFileSelected, onAnalyze, isBusy }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <section className="import-upload">
      <span className="pill">CSV reale · Excel via esportazione CSV</span>
      <div style={{ marginTop: 14 }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.04em' }}>Carica un file</h2>
        <p className="hero-copy" style={{ marginTop: 10 }}>
          Carica un CSV, controlla il tipo di entità, conferma il mapping e importa davvero nel CRM.
        </p>
      </div>

      <div className="import-upload-actions">
        <button type="button" onClick={() => inputRef.current?.click()} className="button-secondary" disabled={isBusy}>Seleziona file</button>
        <button type="button" onClick={onAnalyze} disabled={!fileName || isBusy} className="button-primary">Analizza file</button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,text/csv"
        style={{ display: 'none' }}
        onChange={(event) => onFileSelected(event.target.files?.[0] ?? null)}
      />

      {fileName ? <div className="import-file-note">File selezionato: <strong>{fileName}</strong></div> : null}
      <div className="entity-subtitle" style={{ marginTop: 8 }}>
        Formato consigliato: CSV UTF-8 con intestazioni in prima riga. Per file Excel, esporta prima in CSV.
      </div>
    </section>
  )
}
