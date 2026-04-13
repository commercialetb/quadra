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
    <div className="page-wrap">
      <div className="import-card">
        <div className="import-stepper">
          {[
            ['1', 'Carica'],
            ['2', 'Analizza'],
            ['3', 'Mapping'],
            ['4', 'Importa'],
          ].map(([n, label], index) => {
            const active = index === 0 ? true : (index === 1 && step !== 'upload') || (index === 2 && (step === 'mapped' || step === 'ready')) || (index === 3 && step === 'ready')
            return (
              <div key={label} className="import-step" data-active={active}>
                <span>{n}</span>
                <span>{label}</span>
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
          <AnalysisOverview analysis={analysis} selectedSheetIndex={selectedSheetIndex} onSelectSheet={setSelectedSheetIndex} />

          {selectedSheet ? (
            <div className="import-grid">
              <PreviewTable sheet={selectedSheet} />
              <MappingEditor sheet={selectedSheet} onConfirm={() => setStep('mapped')} />
            </div>
          ) : null}

          <section className="import-summary">
            <div className="section-heading">
              <div>
                <h2>Pronto per importare</h2>
                <p>Questo blocco salva in staging. L'import finale nel CRM live sarà il passo successivo.</p>
              </div>
              <div className="import-actions">
                <button type="button" onClick={() => setStep('mapped')} className="button-secondary">Conferma mapping</button>
                <button type="button" onClick={() => setStep('ready')} className="button-primary">Importa in staging</button>
              </div>
            </div>

            {summary ? (
              <div className="import-summary-grid">
                <div className="import-stat" data-tone="slate">
                  <div className="import-stat-label">Righe mappate</div>
                  <div className="import-stat-value">{summary.rows}</div>
                </div>
                <div className="import-stat" data-tone="amber">
                  <div className="import-stat-label">Issue trovate</div>
                  <div className="import-stat-value">{summary.issues}</div>
                </div>
                <div className="import-stat" data-tone="green">
                  <div className="import-stat-label">Errori bloccanti</div>
                  <div className="import-stat-value">{summary.errors}</div>
                </div>
              </div>
            ) : null}

            {step === 'ready' ? (
              <div className="import-file-note">Import demo completato in staging. Prossimo step: collegare upload reale e scrittura su Supabase.</div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  )
}
