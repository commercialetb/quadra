'use client'

import { useRef } from 'react'

type UploadDropzoneProps = {
  fileName: string
  onFileSelected: (fileName: string) => void
  onAnalyze: () => void
}

export function UploadDropzone({ fileName, onFileSelected, onAnalyze }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <section className="import-upload">
      <span className="pill">.xlsx .xls .csv</span>
      <div style={{ marginTop: 14 }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.04em' }}>Carica un file</h2>
        <p className="hero-copy" style={{ marginTop: 10 }}>
          Il sistema analizzerà i fogli, proporrà il tipo di entità e suggerirà il mapping delle colonne.
        </p>
      </div>

      <div className="import-upload-actions">
        <button type="button" onClick={() => inputRef.current?.click()} className="button-secondary">Seleziona file</button>
        <button type="button" onClick={onAnalyze} disabled={!fileName} className="button-primary">Analizza file</button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={(event) => onFileSelected(event.target.files?.[0]?.name ?? '')}
      />

      {fileName ? <div className="import-file-note">File selezionato: <strong>{fileName}</strong></div> : null}
    </section>
  )
}
