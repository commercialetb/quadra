'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

type CompanyOption = { id: string; name: string }

type PreviewRow = {
  reference: string
  bega_order: string
  status: string
  total_eur: number
  action: 'create' | 'update' | 'skip'
  warning?: string
  matchedOpportunity?: string
  existingOrder?: boolean
}

type PreviewPayload = {
  preview: PreviewRow[]
  totalRows: number
  createCount: number
  updateCount: number
  skipCount: number
  warningCount: number
  companyName: string
  sourceType: string
}

type AnalysisImportCardProps = {
  companies: CompanyOption[]
  presetCompanyId?: string
  presetCompanyName?: string
  compact?: boolean
  simplified?: boolean
  title?: string
  eyebrow?: string
  description?: string
  submitLabel?: string
}

export function AnalysisImportCard({
  companies,
  presetCompanyId,
  presetCompanyName,
  compact = false,
  simplified = false,
  title = 'Importa CSV ordini',
  eyebrow = 'Data intake',
  description = 'Selezioni l’azienda dal menu a discesa, poi ogni riga usa Il suo ordine come riferimento opportunità: se esiste la aggiorna, se manca la crea.',
  submitLabel = 'Carica CSV',
}: AnalysisImportCardProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<PreviewPayload | null>(null)

  async function submitWithMode(mode: 'preview' | 'import') {
    const form = formRef.current
    if (!form) return

    setLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const formData = new FormData(form)
      formData.set('mode', mode)
      const response = await fetch('/api/analysis/imports', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json()) as PreviewPayload & {
        imported?: number
        createdOpportunities?: number
        updatedOpportunities?: number
        skippedRows?: number
        warningRows?: number
        error?: string
      }

      if (!response.ok) {
        setIsError(true)
        setMessage(payload.error || 'Import non riuscito.')
        return
      }

      if (mode === 'preview') {
        setPreview(payload)
        setMessage(`Anteprima pronta: ${payload.totalRows} righe · ${payload.createCount} create · ${payload.updateCount} update · ${payload.skipCount} skip.`)
        return
      }

      const created = payload.createdOpportunities ? ` · ${payload.createdOpportunities} opportunità create` : ''
      const updated = payload.updatedOpportunities ? ` · ${payload.updatedOpportunities} opportunità aggiornate` : ''
      const skipped = payload.skippedRows ? ` · ${payload.skippedRows} righe saltate` : ''
      const warnings = payload.warningRows ? ` · ${payload.warningRows} warning` : ''
      setMessage(`Importate ${payload.imported ?? 0} righe${created}${updated}${skipped}${warnings}.`)
      setPreview(null)
      form.reset()
      router.refresh()
    } catch {
      setIsError(true)
      setMessage('Errore di rete durante l’import.')
    } finally {
      setLoading(false)
    }
  }

  const companyLabel = presetCompanyName || companies.find((company) => company.id === presetCompanyId)?.name || ''
  const showAdvanced = !simplified && !compact

  return (
    <section className={`analysis-import-card-shell ${simplified ? 'is-simplified' : ''}`}>
      <div className="panel-head compact">
        <div>
          <p className="page-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <p className="settings-copy analysis-import-copy">
        {description.includes('Il suo ordine') ? (
          <>
            {description.split('Il suo ordine')[0]}<strong>Il suo ordine</strong>{description.split('Il suo ordine').slice(1).join('Il suo ordine')}
          </>
        ) : (
          description
        )}
      </p>

      <form ref={formRef} className="analysis-upload-form" onSubmit={(event) => event.preventDefault()}>
        <div className={`analysis-upload-grid ${compact ? 'is-compact' : ''}`}>
          <label className="analysis-field analysis-field-file">
            <span>File CSV</span>
            <input name="file" type="file" accept=".csv,text/csv" required />
          </label>

          {presetCompanyId ? (
            <label className="analysis-field analysis-field-readonly">
              <span>Azienda</span>
              <input value={companyLabel} readOnly />
              <input type="hidden" name="company_id" value={presetCompanyId} />
            </label>
          ) : (
            <label className="analysis-field">
              <span>Azienda</span>
              <select name="company_id" defaultValue="" required>
                <option value="" disabled>Seleziona azienda</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </label>
          )}

          <label className="analysis-field">
            <span>Tipo sorgente</span>
            <select name="source_type" defaultValue="Completed">
              <option value="Completed">Completed</option>
              <option value="Outstanding">Outstanding</option>
              <option value="Forecast">Forecast</option>
            </select>
          </label>
        </div>

        {showAdvanced ? (
          <div className={`analysis-upload-grid ${compact ? 'is-compact' : ''}`}>
            <label className="analysis-check">
              <input type="checkbox" name="update_existing" defaultChecked />
              <span>Aggiorna opportunità esistenti</span>
            </label>
            <label className="analysis-check">
              <input type="checkbox" name="create_missing" defaultChecked />
              <span>Crea opportunità mancanti</span>
            </label>
            <label className="analysis-check analysis-check-wide">
              <input type="checkbox" name="apply_imported_only" value="true" defaultChecked />
              <span>Sovrascrivi solo i campi importati, non note e gestione manuale</span>
            </label>
          </div>
        ) : (
          <details className="analysis-options-compact">
            <summary>Opzioni import</summary>
            <div className="analysis-options-compact-body">
              <label className="analysis-check">
                <input type="checkbox" name="update_existing" defaultChecked />
                <span>Aggiorna opportunità esistenti</span>
              </label>
              <label className="analysis-check">
                <input type="checkbox" name="create_missing" defaultChecked />
                <span>Crea opportunità mancanti</span>
              </label>
              <label className="analysis-check">
                <input type="checkbox" name="apply_imported_only" value="true" defaultChecked />
                <span>Sovrascrivi solo i campi importati</span>
              </label>
            </div>
          </details>
        )}

        <div className="analysis-actions-row cluster-wrap">
          <button type="button" className="secondary-button" disabled={loading || companies.length === 0} onClick={() => submitWithMode('preview')}>
            {loading ? 'Analisi in corso...' : 'Anteprima import'}
          </button>
          <button type="button" className="primary-button" disabled={loading || companies.length === 0 || !preview} onClick={() => submitWithMode('import')}>
            {loading ? 'Import in corso...' : submitLabel}
          </button>
        </div>

        {preview ? (
          <div className="analysis-preview-card">
            <div className="analysis-preview-summary">
              <div>
                <strong>{preview.companyName}</strong>
                <span>{preview.totalRows} righe · {preview.createCount} create · {preview.updateCount} update · {preview.skipCount} skip · {preview.warningCount} warning</span>
              </div>
              <span className="analysis-preview-note">Prime {preview.preview.length} righe mostrate.</span>
            </div>
            <div className="analysis-preview-list">
              {preview.preview.map((row) => (
                <div key={`${row.bega_order}-${row.reference}`} className="analysis-preview-list-item">
                  <div>
                    <strong>{row.reference}</strong>
                    <span>{row.bega_order} · {row.status || '—'} · {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(row.total_eur || 0)}</span>
                    <small>
                      {row.matchedOpportunity ? `Match: ${row.matchedOpportunity}` : row.warning || 'Match pulito'}
                      {row.warning && row.matchedOpportunity ? ` · ${row.warning}` : ''}
                      {row.existingOrder ? ' · Ordine già presente' : ''}
                    </small>
                  </div>
                  <span className={`analysis-action-pill is-${row.action}`}>{row.action}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {companies.length === 0 ? <p className="analysis-upload-message is-error">Serve almeno un’azienda in Quadra per usare questo import guidato.</p> : null}
        {message ? <p className={`analysis-upload-message ${isError ? 'is-error' : 'is-success'}`}>{message}</p> : null}
      </form>
    </section>
  )
}
