'use client'

import { useMemo, useState, useTransition } from 'react'
import { AnalysisOverview } from './analysis-overview'
import { MappingEditor } from './mapping-editor'
import { PreviewTable } from './preview-table'
import { UploadDropzone } from './upload-dropzone'
import { buildWorkbookAnalysis, createPreviewResult, suggestMappings } from '@/lib/import/analyze'
import { parseImportFile } from '@/lib/import/csv'
import { IMPORT_TARGET_FIELDS } from '@/lib/import/field-catalog'
import type { ImportColumnMapping, ImportEntityType } from '@/types/import'
import { importMappedRows } from '@/app/(app)/actions'

type Step = 'upload' | 'analyzed' | 'ready' | 'done'

const ENTITY_LABELS: Record<ImportEntityType, string> = {
  companies: 'Aziende',
  contacts: 'Contatti',
  opportunities: 'Opportunita',
  followups: 'Follow-up',
  unknown: 'Da capire',
}

export function ImportWorkflow() {
  const [file, setFile] = useState<File | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('upload')
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0)
  const [analysis, setAnalysis] = useState<ReturnType<typeof buildWorkbookAnalysis> | null>(null)
  const [mappingsBySheet, setMappingsBySheet] = useState<Record<number, ImportColumnMapping[]>>({})
  const [entityTypeBySheet, setEntityTypeBySheet] = useState<Record<number, ImportEntityType>>({})
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedSheet = analysis?.sheets[selectedSheetIndex]
  const selectedEntityType = selectedSheet ? entityTypeBySheet[selectedSheetIndex] ?? selectedSheet.suggestedType : 'unknown'
  const selectedMappings = selectedSheet ? mappingsBySheet[selectedSheetIndex] ?? selectedSheet.mappings : []

  const previewResult = useMemo(() => {
    if (!selectedSheet) return null
    return createPreviewResult({
      ...selectedSheet,
      suggestedType: selectedEntityType,
      mappings: selectedMappings,
    })
  }, [selectedSheet, selectedEntityType, selectedMappings])

  const summary = previewResult
    ? {
        rows: previewResult.mappedRows.length,
        issues: previewResult.issues.length,
        errors: previewResult.issues.filter((issue) => issue.level === 'error').length,
      }
    : null

  const analyzeFile = () => {
    if (!file) return
    setAnalysisError(null)
    setImportError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const parsed = await parseImportFile(file)
        const nextAnalysis = buildWorkbookAnalysis(parsed.fileName, parsed.sheets)
        setAnalysis(nextAnalysis)
        setSelectedSheetIndex(0)
        const nextMappings: Record<number, ImportColumnMapping[]> = {}
        const nextEntityTypes: Record<number, ImportEntityType> = {}
        nextAnalysis.sheets.forEach((sheet, index) => {
          nextMappings[index] = sheet.mappings
          nextEntityTypes[index] = sheet.suggestedType
        })
        setMappingsBySheet(nextMappings)
        setEntityTypeBySheet(nextEntityTypes)
        setStep('analyzed')
      } catch (error: any) {
        setAnalysis(null)
        setStep('upload')
        setAnalysisError(error?.message || 'Impossibile leggere il file.')
      }
    })
  }

  const handleImport = () => {
    if (!previewResult || selectedEntityType === 'unknown') return
    setImportError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set('entityType', selectedEntityType)
        formData.set('rows', JSON.stringify(previewResult.mappedRows))
        const response = await importMappedRows(formData)
        setResult(response)
        setStep('done')
      } catch (error: any) {
        setImportError(error?.message || 'Import non riuscito.')
      }
    })
  }

  return (
    <div className="page-wrap">
      <div className="import-card">
        <div className="import-stepper">
          {[
            ['1', 'Carica'],
            ['2', 'Analizza'],
            ['3', 'Controlla'],
            ['4', 'Importa'],
          ].map(([n, label], index) => {
            const active = index === 0 || (index === 1 && step !== 'upload') || (index === 2 && ['ready', 'done', 'analyzed'].includes(step)) || (index === 3 && step === 'done')
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
        onFileSelected={(nextFile) => {
          setFile(nextFile)
          setAnalysis(null)
          setResult(null)
          setImportError(null)
          setAnalysisError(null)
          setStep('upload')
          setSelectedSheetIndex(0)
        }}
        onAnalyze={analyzeFile}
        fileName={file?.name ?? ''}
        isBusy={isPending}
      />

      {analysisError ? <div className="import-file-note" style={{ color: '#b42318' }}>{analysisError}</div> : null}

      {analysis ? (
        <>
          <AnalysisOverview analysis={analysis} selectedSheetIndex={selectedSheetIndex} onSelectSheet={setSelectedSheetIndex} />

          {selectedSheet ? (
            <div className="import-card" style={{ display: 'grid', gap: 16 }}>
              <div className="import-mapping-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <div className="entity-subtitle">Tipo di entita</div>
                  <select
                    value={selectedEntityType}
                    onChange={(event) => {
                      const nextType = event.target.value as ImportEntityType
                      setEntityTypeBySheet((current) => ({ ...current, [selectedSheetIndex]: nextType }))
                      setMappingsBySheet((current) => ({
                        ...current,
                        [selectedSheetIndex]: suggestMappings(nextType, selectedSheet.columns),
                      }))
                      setStep('ready')
                    }}
                    style={{ borderRadius: 16, height: 46, padding: '0 14px', marginTop: 8 }}
                  >
                    {(['companies', 'contacts', 'opportunities', 'followups', 'unknown'] as ImportEntityType[]).map((type) => (
                      <option key={type} value={type}>{ENTITY_LABELS[type]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="entity-subtitle">Campi disponibili</div>
                  <div className="import-chip-row" style={{ marginTop: 10 }}>
                    {(IMPORT_TARGET_FIELDS[selectedEntityType] ?? []).map((field) => (
                      <span key={field} className="import-chip">{field}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {selectedSheet ? (
            <div className="import-grid">
              <PreviewTable sheet={selectedSheet} />
              <MappingEditor
                sheet={{ ...selectedSheet, suggestedType: selectedEntityType, mappings: selectedMappings }}
                mappings={selectedMappings}
                onChange={(sourceColumn, targetField) => {
                  setMappingsBySheet((current) => ({
                    ...current,
                    [selectedSheetIndex]: (current[selectedSheetIndex] ?? selectedSheet.mappings).map((item) =>
                      item.sourceColumn === sourceColumn ? { ...item, targetField } : item,
                    ),
                  }))
                  setStep('ready')
                }}
              />
            </div>
          ) : null}

          <section className="import-summary">
            <div className="section-heading">
              <div>
                <h2>Import reale nel CRM</h2>
                <p>
                  Il file viene controllato, poi le righe mappate vengono inserite davvero nelle tabelle del CRM.
                  I duplicati piu evidenti vengono saltati automaticamente.
                </p>
              </div>
              <div className="import-actions">
                <button type="button" onClick={handleImport} className="button-primary" disabled={!previewResult || selectedEntityType === 'unknown' || isPending}>
                  {isPending ? 'Import in corso...' : 'Importa nel CRM'}
                </button>
              </div>
            </div>

            {summary ? (
              <div className="import-summary-grid">
                <div className="import-stat" data-tone="slate">
                  <div className="import-stat-label">Righe lette</div>
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

            {previewResult?.issues.length ? (
              <div className="import-panel" style={{ marginTop: 18 }}>
                <div className="section-heading"><div><h2>Controlli</h2><p>Prima di importare, guarda gli avvisi principali.</p></div></div>
                <div className="simple-list compact-list">
                  {previewResult.issues.map((issue, index) => (
                    <div key={`${issue.message}-${index}`} className="simple-row static">
                      <div>
                        <strong>{issue.level.toUpperCase()}</strong>
                        <span>{issue.message}{typeof issue.rowIndex === 'number' ? ` · riga ${issue.rowIndex + 2}` : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {importError ? <div className="import-file-note" style={{ color: '#b42318' }}>{importError}</div> : null}
            {result ? (
              <div className="import-file-note">
                Import completato. Inserite <strong>{result.imported}</strong> righe, saltate <strong>{result.skipped}</strong>.
                {result.errors.length ? ` Errori: ${result.errors.join(' · ')}` : ''}
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  )
}
