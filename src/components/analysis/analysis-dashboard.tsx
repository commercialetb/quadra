import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'
import type { AnalysisImportRecord } from '@/lib/analysis/queries'
import { AnalysisImportCard } from '@/components/analysis/analysis-import-card'
import { CreateFollowupButton } from '@/components/analysis/create-followup-button'

type Metric = { label: string; value: string; helper?: string }
type SeriesItem = { label: string; value: number }
type CompanyRow = {
  companyId: string
  companyName: string
  status: string
  city: string | null
  province: string | null
  industry: string | null
  opportunities: number
  pipelineValue: number
  pendingFollowups: number
  overdueFollowups: number
  importedOrders: number
  importedValue: number
  lastOrderDate: string | null
  signal: 'high' | 'medium' | 'low'
  insight: string
  potentialScore: number
  riskScore: number
  priorityScore: number
  priorityBand: 'alta' | 'media' | 'base'
}

type OrderRow = {
  id?: string
  account: string
  order_date: string
  bega_order: string
  status: string
  total_eur: number
  source_type: string
}

type FollowupPriority = 'medium' | 'high' | 'urgent'

export function AnalysisDashboard({
  data,
}: {
  data: {
    crmKpis: {
      companies: number
      openOpportunities: number
      pendingFollowups: number
      companiesWithSignals: number
    }
    orderKpis: {
      totalValue: number
      completedValue: number
      outstandingValue: number
      orderCount: number
      averageOrderValue: number
      deliveredCount: number
      cancelledCount: number
    }
    monthlySeries: SeriesItem[]
    accountSeries: SeriesItem[]
    statusSeries: SeriesItem[]
    companyRows: CompanyRow[]
    imports: AnalysisImportRecord[]
    recentOrders: OrderRow[]
    highlights: string[]
    companiesForImport: Array<{ id: string; name: string }>
    suggestedFollowups: Array<{ companyId: string; companyName: string; title: string; description: string; priority: FollowupPriority }>
    actionPlan: Array<{ companyId: string; companyName: string; title: string; detail: string; priority: FollowupPriority; lane: 'agenda' | 'pipeline' | 'ordini' | 'copertura' }>
    priorityBuckets: {
      callNow: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>
      reactivate: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>
      monitor: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>
    }
    schemaReady: boolean
    schemaError: string | null
  }
}) {
  const crmMetrics: Metric[] = [
    { label: 'Aziende', value: String(data.crmKpis.companies), helper: 'già leggibili dal CRM' },
    { label: 'Opportunità', value: String(data.crmKpis.openOpportunities), helper: 'pipeline aperta' },
    { label: 'Follow-up', value: String(data.crmKpis.pendingFollowups), helper: 'agenda attiva' },
    { label: 'Segnali', value: String(data.crmKpis.companiesWithSignals), helper: 'priorità rilevate' },
  ]

  const orderMetrics: Metric[] = [
    { label: 'Valore ordini', value: formatCurrency(data.orderKpis.totalValue), helper: 'base importata' },
    { label: 'Outstanding', value: formatCurrency(data.orderKpis.outstandingValue), helper: 'valore sospeso' },
    { label: 'Ticket medio', value: formatCurrency(data.orderKpis.averageOrderValue), helper: 'per ordine' },
    { label: 'Ordini', value: String(data.orderKpis.orderCount), helper: 'righe importate' },
  ]

  const topActions = data.actionPlan.slice(0, 4)
  const topCompanies = data.companyRows.slice(0, 8)
  const topSuggestions = data.suggestedFollowups.slice(0, 4)
  const callNow = data.priorityBuckets.callNow.slice(0, 3)
  const reactivate = data.priorityBuckets.reactivate.slice(0, 3)
  const monitor = data.priorityBuckets.monitor.slice(0, 3)

  return (
    <div className="page-stack analysis-page-stack analysis-page-v20">
      <section className="panel-card analysis-header-card analysis-header-card-v20">
        <div className="analysis-header-copy">
          <div>
            <p className="page-eyebrow">Analisi</p>
            <h1 className="page-title">Analisi operativa</h1>
            <p className="page-subtitle">
              Prima vedi priorità, azioni e aziende da aprire. Trend e storico restano sotto, senza appesantire la pagina.
            </p>
          </div>
          <div className="cluster-wrap analysis-header-actions">
            <a href="#analysis-import" className="primary-button">Importa CSV</a>
            <Link href="/companies" className="ghost-button">Apri aziende</Link>
          </div>
        </div>
        {data.highlights.length > 0 ? (
          <div className="analysis-highlight-list compact">
            {data.highlights.slice(0, 3).map((item) => (
              <div key={item} className="analysis-highlight-item">{item}</div>
            ))}
          </div>
        ) : null}
      </section>

      {!data.schemaReady ? (
        <section className="panel-card analysis-schema-warning">
          <strong>Import ordini non ancora attivo.</strong>
          <p>
            La lettura CRM funziona già. Per attivare import, storico ordini e stati, applica prima lo schema Supabase di Analisi.
          </p>
          {data.schemaError ? <span>{data.schemaError}</span> : null}
        </section>
      ) : null}

      <section className="analysis-metric-grid analysis-metric-grid-v20">
        <MetricPanel title="CRM" subtitle="Cosa puoi leggere subito" metrics={crmMetrics} />
        <MetricPanel title="Ordini" subtitle={data.schemaReady ? 'Cosa si aggiunge con i CSV' : 'Si attiva dopo lo schema'} metrics={orderMetrics} />
      </section>

      <section className="panel-card analysis-score-panel analysis-score-panel-v20">
        <div className="panel-head compact">
          <div>
            <p className="page-eyebrow">Priorità</p>
            <h2>Chi guardare adesso</h2>
          </div>
        </div>
        <div className="analysis-score-grid">
          <PriorityColumn title="Da chiamare" items={callNow} empty="Nessuna priorità alta da chiamare ora." />
          <PriorityColumn title="Da riattivare" items={reactivate} empty="Nessuna riattivazione urgente al momento." />
          <PriorityColumn title="Da presidiare" items={monitor} empty="Nessun presidio medio aperto." />
        </div>
      </section>

      <section className="analysis-main-grid analysis-main-grid-v20">
        <div className="analysis-main-column">
          <section className="panel-card analysis-action-panel analysis-action-panel-v20">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Azioni</p>
                <h2>Cosa fare adesso</h2>
              </div>
            </div>
            <div className="analysis-action-grid compact-grid">
              {topActions.length > 0 ? topActions.map((item) => (
                <div key={`${item.companyId}-${item.title}`} className="analysis-action-item compact-item">
                  <div>
                    <div className="analysis-action-meta">
                      <span className="dashboard-pill-badge">{item.lane}</span>
                      <span className={`dashboard-pill-badge ${item.priority === 'urgent' ? 'danger' : item.priority === 'high' ? 'warning' : ''}`}>{item.priority}</span>
                    </div>
                    <strong>{item.title}</strong>
                    <span>{item.companyName} · {item.detail}</span>
                  </div>
                  <div className="analysis-action-buttons compact-buttons">
                    <Link href={`/companies/${item.companyId}`} className="ghost-button">Apri</Link>
                    <CreateFollowupButton
                      companyId={item.companyId}
                      title={item.title}
                      description={item.detail}
                      priority={item.priority}
                      defaultDueInDays={item.priority === 'urgent' ? 1 : item.priority === 'high' ? 2 : 7}
                      compact
                    />
                  </div>
                </div>
              )) : <p className="analysis-empty-copy">Nessuna azione prioritaria da mostrare per ora.</p>}
            </div>
          </section>

          <section className="panel-card analysis-company-panel analysis-company-panel-v20">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Aziende</p>
                <h2>Aziende prioritarie</h2>
              </div>
            </div>
            <div className="analysis-company-list">
              {topCompanies.map((row) => (
                <Link key={row.companyId} href={`/companies/${row.companyId}`} className="analysis-company-list-item">
                  <div>
                    <strong>{row.companyName}</strong>
                    <span>{row.insight}</span>
                  </div>
                  <div className="analysis-company-list-meta">
                    <SignalPill level={row.signal} />
                    <ScorePill score={row.priorityScore} band={row.priorityBand} />
                  </div>
                </Link>
              ))}
            </div>
            <details className="analysis-details-block">
              <summary>Vedi tabella completa</summary>
              <div className="analysis-company-table-wrap">
                <table className="analysis-company-table">
                  <thead>
                    <tr>
                      <th>Azienda</th>
                      <th>Segnale</th>
                      <th>Score</th>
                      <th>Pipeline</th>
                      <th>Follow-up</th>
                      <th>Ordini</th>
                      <th>Insight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.companyRows.map((row) => (
                      <tr key={row.companyId}>
                        <td>
                          <div className="analysis-company-cell">
                            <strong>{row.companyName}</strong>
                            <span>{[row.city, row.province].filter(Boolean).join(' · ') || row.status}</span>
                          </div>
                        </td>
                        <td><SignalPill level={row.signal} /></td>
                        <td><ScorePill score={row.priorityScore} band={row.priorityBand} /></td>
                        <td>{row.opportunities} · {formatCurrency(row.pipelineValue)}</td>
                        <td>{row.pendingFollowups} attivi / {row.overdueFollowups} in ritardo</td>
                        <td>{row.importedOrders} · {formatCurrency(row.importedValue)}</td>
                        <td>{row.insight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
        </div>

        <div className="analysis-side-column">
          <section className="panel-card analysis-chart-panel analysis-chart-panel-v20">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Trend</p>
                <h2>Valore per mese</h2>
              </div>
            </div>
            <MiniBars data={data.monthlySeries} mode="currency" emptyLabel="Importa almeno un CSV per vedere il trend mensile." />
          </section>

          <section className="panel-card analysis-chart-panel analysis-chart-panel-v20">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Top account</p>
                <h2>Dove si concentra il valore</h2>
              </div>
            </div>
            <MiniBars data={data.accountSeries} mode="currency" emptyLabel="Appena importi, qui vedi gli account più pesanti." />
          </section>

          <section className="panel-card analysis-suggestions-panel analysis-suggestions-panel-v20">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Follow-up</p>
                <h2>Suggeriti da Analisi</h2>
              </div>
            </div>
            <div className="analysis-suggestion-list compact-list">
              {topSuggestions.length > 0 ? topSuggestions.map((item) => (
                <div key={`${item.companyId}-${item.title}`} className="analysis-suggestion-item compact-item">
                  <Link href={`/companies/${item.companyId}`} className="analysis-suggestion-link">
                    <strong>{item.title}</strong>
                    <span>{item.companyName} · {item.description}</span>
                  </Link>
                  <CreateFollowupButton
                    companyId={item.companyId}
                    title={item.title}
                    description={item.description}
                    priority={item.priority}
                    compact
                  />
                </div>
              )) : <p className="analysis-empty-copy">Nessun follow-up suggerito in questo momento.</p>}
            </div>
          </section>
        </div>
      </section>

      <section className="analysis-lower-grid analysis-lower-grid-v20">
        {data.schemaReady ? (
          <section id="analysis-import" className="panel-card analysis-import-panel-v20">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Import</p>
                <h2>Carica ordini CSV</h2>
              </div>
            </div>
            <AnalysisImportCard companies={data.companiesForImport} simplified />
          </section>
        ) : (
          <section id="analysis-import" className="panel-card analysis-import-panel-v20">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Import</p>
                <h2>Pronto, ma non ancora attivo</h2>
              </div>
            </div>
            <p className="settings-copy">Appena attivi le tabelle Analisi in Supabase, qui compare l’import guidato degli ordini.</p>
          </section>
        )}

        <details className="panel-card analysis-details-panel" open={false}>
          <summary>Apri trend, storico e ordini</summary>
          <div className="analysis-details-grid">
            <section className="analysis-chart-panel">
              <div className="panel-head compact">
                <div>
                  <p className="page-eyebrow">Stati ordine</p>
                  <h2>Lettura rapida stato base</h2>
                </div>
              </div>
              <MiniBars data={data.statusSeries} emptyLabel="Nessuno stato ordine disponibile per ora." />
            </section>

            <section className="analysis-import-history">
              <div className="panel-head compact">
                <div>
                  <p className="page-eyebrow">Imports</p>
                  <h2>Storico caricamenti</h2>
                </div>
              </div>
              {data.imports.length > 0 ? (
                <div className="analysis-import-list">
                  {data.imports.map((item) => (
                    <div key={item.id} className="analysis-import-item">
                      <div>
                        <strong>{item.filename}</strong>
                        <span>{item.company_name || 'Azienda non indicata'} · {item.source_type || 'CSV'} · {item.rows_imported} righe · {item.status}</span>
                        <span>create {item.created_count ?? 0} · update {item.updated_count ?? 0} · skip {item.skipped_count ?? 0} · warning {item.warning_count ?? 0}</span>
                      </div>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="analysis-empty-copy">Nessun import registrato ancora.</p>
              )}
            </section>

            <section className="analysis-orders-panel">
              <div className="panel-head compact">
                <div>
                  <p className="page-eyebrow">Ordini recenti</p>
                  <h2>Ultime righe importate</h2>
                </div>
              </div>
              {data.recentOrders.length > 0 ? (
                <div className="analysis-orders-table-wrap">
                  <table className="analysis-orders-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Account</th>
                        <th>BEGA</th>
                        <th>Stato</th>
                        <th>Fonte</th>
                        <th>Totale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentOrders.map((order) => (
                        <tr key={order.id ?? order.bega_order}>
                          <td>{formatDate(order.order_date)}</td>
                          <td>{order.account}</td>
                          <td>{order.bega_order}</td>
                          <td>{order.status || '—'}</td>
                          <td>{order.source_type}</td>
                          <td>{formatCurrency(order.total_eur)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="analysis-empty-copy">Nessun ordine importato ancora.</p>
              )}
            </section>
          </div>
        </details>
      </section>
    </div>
  )
}

function MetricPanel({ title, subtitle, metrics }: { title: string; subtitle: string; metrics: Metric[] }) {
  return (
    <section className="panel-card analysis-metric-panel">
      <div className="panel-head compact">
        <div>
          <p className="page-eyebrow">{title}</p>
          <h2>{subtitle}</h2>
        </div>
      </div>
      <div className="analysis-kpi-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="analysis-kpi-card">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {metric.helper ? <small>{metric.helper}</small> : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function PriorityColumn({ title, items, empty }: { title: string; items: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>; empty: string }) {
  return (
    <div className="analysis-score-block">
      <h3>{title}</h3>
      <div className="analysis-priority-list">
        {items.length > 0 ? items.map((item) => (
          <Link key={`${item.companyId}-${title}`} href={`/companies/${item.companyId}`} className="analysis-priority-item">
            <div>
              <strong>{item.companyName}</strong>
              <span>{item.reason}</span>
            </div>
            <ScorePill score={item.score} band={item.band} />
          </Link>
        )) : <p className="analysis-empty-copy">{empty}</p>}
      </div>
    </div>
  )
}

function MiniBars({ data, emptyLabel, mode = 'count' }: { data: SeriesItem[]; emptyLabel: string; mode?: 'count' | 'currency' }) {
  if (data.length === 0) {
    return <p className="analysis-empty-copy">{emptyLabel}</p>
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1)
  return (
    <div className="analysis-bars">
      {data.slice(0, 6).map((item) => (
        <div key={item.label} className="analysis-bar-row">
          <div className="analysis-bar-labels">
            <strong>{item.label}</strong>
            <span>{mode === 'currency' ? formatCurrency(item.value) : item.value}</span>
          </div>
          <div className="analysis-bar-track">
            <div className="analysis-bar-fill" style={{ width: `${Math.max((item.value / maxValue) * 100, 6)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function SignalPill({ level }: { level: 'high' | 'medium' | 'low' }) {
  const labels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Bassa',
  }
  return <span className={`analysis-signal-pill is-${level}`}>{labels[level]}</span>
}

function ScorePill({ score, band }: { score: number; band: 'alta' | 'media' | 'base' }) {
  return <span className={`dashboard-pill-badge ${band === 'alta' ? 'danger' : band === 'media' ? 'warning' : ''}`}>{score}/100</span>
}
