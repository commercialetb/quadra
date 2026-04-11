'use client'

import { useMemo, useState } from 'react'
import { AnalysisOverview } from './analysis-overview'
import { MappingEditor } from './mapping-editor'
import { PreviewTable } from './preview-table'
import { UploadDropzone } from './upload-dropzone'
import { buildWorkbookAnalysis, createPreviewResult } from '@/lib/import/analyze'

type Step = 'upload' | 'analyzed' | 'mapped' | 'ready'

function makeDemoAnalysis(fileName: string) {
  return buildWorkbookAnalysis(fileName, [
    {
      name: 'Companies',
      columns: ['ID', 'Name', 'URL', 'Address', 'Tipologia', 'Settore'],
      rows: [
        { ID: '1', Name: 'Edilnova', URL: 'https://edilnova.it', Address: 'Milano', Tipologia: 'Cliente', Settore: 'Edilizia' },
        { ID: '2', Name: 'ArchiLab', URL: 'https://archilab.it', Address: 'Roma', Tipologia: 'Partner', Settore: 'Architettura' },
      ],
    },
    {
      name: 'Contacts',
      columns: ['ID', 'First Name', 'Last Name', 'Email', 'Mobile Phone', 'Company'],
      rows: [
        { ID: '11', 'First Name': 'Mario', 'Last Name': 'Rossi', Email: 'mario@edilnova.it', 'Mobile Phone': '3331234567', Company: 'Edilnova' },
        { ID: '12', 'First Name': 'Laura', 'Last Name': 'Bianchi', Email: 'laura@archilab.it', 'Mobile Phone': '3337654321', Company: 'ArchiLab' },
      ],
    },
  ])
}

export function ImportWorkflow() {
  const [fileName, setFileName] = useState('')
  const [step, setStep] = useState<Step>('upload')
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0)

  const analysis = useMemo(() => (fileName ? makeDemoAnalysis(fileName) : null), [fileName])
  const selectedSheet = analysis?.sheets[selectedSheetIndex]
  const previewResult = selectedSheet ? createPreviewResult(selectedSheet) : null

  const summary = previewResult
    ? {
        rows: previewResult.mappedRows.length,
        issues: previewResult.issues.length,
        errors: previewResult.issues.filter((issue) => issue.level === 'error').length,
      }
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          {[
            ['1', 'Carica'],
            ['2', 'Analizza'],
            ['3', 'Mapping'],
            ['4', 'Importa'],
          ].map(([n, label], index) => {
            const active = index === 0 ? true : (index === 1 && step !== 'upload') || (index === 2 && (step === 'mapped' || step === 'ready')) || (index === 3 && step === 'ready')
            return (
              <div key={label} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${active ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <span className="text-xs font-semibold">{n}</span>
                <span className="text-xs font-medium">{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <UploadDropzone
        onFileSelected={(nextFileName) => {
          setFileName(nextFileName)
          setStep('upload')
          setSelectedSheetIndex(0)
        }}
        onAnalyze={() => {
          if (fileName) setStep('analyzed')
        }}
        fileName={fileName}
      />

      {analysis ? (
        <>
          <AnalysisOverview
            analysis={analysis}
            selectedSheetIndex={selectedSheetIndex}
            onSelectSheet={setSelectedSheetIndex}
          />

          {selectedSheet ? (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <PreviewTable sheet={selectedSheet} />
              <MappingEditor
                sheet={selectedSheet}
                onConfirm={() => setStep('mapped')}
              />
            </div>
          ) : null}

          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Pronto per importare</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Questo blocco salva in staging. L'import finale nel CRM live sarà il passo successivo.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep('mapped')}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Conferma mapping
                </button>
                <button
                  type="button"
                  onClick={() => setStep('ready')}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Importa in staging
                </button>
              </div>
            </div>

            {summary ? (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Righe mappate</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{summary.rows}</div>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-amber-700">Issue trovate</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{summary.issues}</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Errori bloccanti</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{summary.errors}</div>
                </div>
              </div>
            ) : null}

            {step === 'ready' ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Import demo completato in staging. Prossimo step: collegare upload reale e scrittura su Supabase.
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
