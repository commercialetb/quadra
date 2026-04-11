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
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">.xlsx .xls .csv</div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Carica un file</h2>
          <p className="mt-2 text-sm text-slate-600">
            Il sistema analizzerà i fogli, proporrà il tipo di entità e suggerirà il mapping delle colonne.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Seleziona file
          </button>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={!fileName}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Analizza file
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(event) => onFileSelected(event.target.files?.[0]?.name ?? '')}
        />

        {fileName ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            File selezionato: <span className="font-medium text-slate-950">{fileName}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
