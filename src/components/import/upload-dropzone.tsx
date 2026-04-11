'use client'

import { useRef, useState } from 'react'

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState<string>('')

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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Seleziona file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
        />
        {fileName ? <p className="text-sm text-slate-600">File selezionato: {fileName}</p> : null}
      </div>
    </div>
  )
}
