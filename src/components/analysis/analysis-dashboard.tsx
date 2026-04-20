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
    suggestedFollowups: Array<{ companyId: string; companyName: string; title: string; description: string; priority: 'medium' | 'high' | 'urgent' }>
    actionPlan: Array<{ companyId: string; companyName: string; title: string; detail: string; priority: 'medium' | 'high' | 'urgent'; lane: 'agenda' | 'pipeline' | 'ordini' | 'copertura' }>
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
    { label: 'Aziende', value: String(data.crmKpis.companies), helper: 'base CRM già analizzabile' },
    { label: 'Opportunità aperte', value: String(data.crmKpis.openOpportunities), helper: 'pipeline attiva' },
    { label: 'Follow-up attivi', value: String(data.crmKpis.pendingFollowups), helper: 'agenda in corso' },
    { label: 'Aziende con segnali', value: String(data.crmKpis.companiesWithSignals), helper: 'priorità da leggere' },
  ]

  const orderMetrics: Metric[] = [
    { label: 'Valore ordini', value: formatCurrency(data.orderKpis.totalValue), helper: 'base importata' },
    { label: 'Outstanding', value: formatCurrency(data.orderKpis.outstandingValue), helper: 'valore sospeso' },
    { label: 'Ticket medio', value: formatCurrency(data.orderKpis.averageOrderValue), helper: 'per ordine' },
    { label: 'Ordini', value: String(data.orderKpis.orderCount), helper: 'righe importate' },
  ]

  return (
    <div className="page-stack analysis-page-stack">
      <section className="panel-card analysis-header-card">
        <div className="analysis-header-copy">
          <div>
            <p className="page-eyebrow">Analisi</p>
            <h1 className="page-title">Analisi CRM + mercato</h1>
            <p className="page-subtitle">
              Leggi aziende, ordini, follow-up e pipeline nello stesso spazio. Il CSV arricchisce il CRM, ma la sezione resta utile anche senza import.
            </p>
          </div>
          <div className="cluster-wrap analysis-header-actions">
            <a href="#analysis-import" className="primary-button">Importa CSV</a>
            <Link href="/companies" className="ghost-button">Apri aziende</Link>
          </div>
        </div>
        {data.highlights.length > 0 ? (
          <div className="analysis-highlight-list">
            {data.highlights.map((item) => (
              <div key={item} className="analysis-highlight-item">{item}</div>
            ))}
          </div>
        ) : null}
      </section>

      {!data.schemaReady ? (
        <section className="panel-card analysis-schema-warning">
          <strong>Schema analisi non ancora attivo.</strong>
          <p>
            La pagina mostra già la parte CRM. Per completare import e ordini serve applicare l’aggiornamento Supabase delle nuove tabelle Analisi.
          </p>
          {data.schemaError ? <span>{data.schemaError}</span> : null}
        </section>
      ) : null}

      <section className="analysis-metric-grid">
        <MetricPanel title="Copertura CRM" subtitle="Funziona già per tutte le aziende" metrics={crmMetrics} />
        <MetricPanel title="Base ordini" subtitle="Si attiva appena importi i CSV" metrics={orderMetrics} />
      </section>

      <section className="analysis-main-grid">
        <div className="analysis-main-column">
          <section className="panel-card analysis-chart-panel">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Trend</p>
                <h2>Valore per mese</h2>
              </div>
            </div>
            <MiniBars data={data.monthlySeries} mode="currency" emptyLabel="Importa almeno un CSV per vedere il trend mensile." />
          </section>

          <section className="panel-card analysis-chart-panel">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Top account</p>
                <h2>Dove si concentra il valore</h2>
              </div>
            </div>
            <MiniBars data={data.accountSeries} mode="currency" emptyLabel="Appena importi, qui vedi gli account più pesanti." />
          </section>
        </div>

        <div className="analysis-side-column">
          <div id="analysis-import">
            <AnalysisImportCard companies={data.companiesForImport} />
          </div>

          <section className="panel-card analysis-chart-panel">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Stati ordine</p>
                <h2>Lettura rapida stato base</h2>
              </div>
            </div>
            <MiniBars data={data.statusSeries} emptyLabel="Nessuno stato ordine disponibile per ora." />
          </section>

          <section className="panel-card analysis-import-history">
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
        </div>
      </section>

      <section className="panel-card analysis-score-panel">
        <div className="panel-head compact">
          <div>
            <p className="page-eyebrow">Score</p>
            <h2>Priorità automatiche</h2>
          </div>
        </div>
        <div className="analysis-score-grid">
          <div className="analysis-score-block">
            <h3>Da chiamare</h3>
            <div className="analysis-priority-list">
              {data.priorityBuckets.callNow.length > 0 ? data.priorityBuckets.callNow.map((item) => (
                <Link key={`${item.companyId}-call`} href={`/companies/${item.companyId}`} className="analysis-priority-item">
                  <div>
                    <strong>{item.companyName}</strong>
                    <span>{item.reason}</span>
                  </div>
                  <ScorePill score={item.score} band={item.band} />
                </Link>
              )) : <p className="analysis-empty-copy">Nessuna azienda ad alta priorità da chiamare ora.</p>}
            </div>
          </div>
          <div className="analysis-score-block">
            <h3>Da riattivare</h3>
            <div className="analysis-priority-list">
              {data.priorityBuckets.reactivate.length > 0 ? data.priorityBuckets.reactivate.map((item) => (
                <Link key={`${item.companyId}-reactivate`} href={`/companies/${item.companyId}`} className="analysis-priority-item">
                  <div>
                    <strong>{item.companyName}</strong>
                    <span>{item.reason}</span>
                  </div>
                  <ScorePill score={item.score} band={item.band} />
                </Link>
              )) : <p className="analysis-empty-copy">Nessuna riattivazione urgente al momento.</p>}
            </div>
          </div>
          <div className="analysis-score-block">
            <h3>Da presidiare</h3>
            <div className="analysis-priority-list">
              {data.priorityBuckets.monitor.length > 0 ? data.priorityBuckets.monitor.map((item) => (
                <Link key={`${item.companyId}-monitor`} href={`/companies/${item.companyId}`} className="analysis-priority-item">
                  <div>
                    <strong>{item.companyName}</strong>
                    <span>{item.reason}</span>
                  </div>
                  <ScorePill score={item.score} band={item.band} />
                </Link>
              )) : <p className="analysis-empty-copy">Nessun presidio medio aperto.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="panel-card analysis-action-panel">
        <div className="panel-head compact">
          <div>
            <p className="page-eyebrow">Cosa fare adesso</p>
            <h2>Azioni consigliate da Analisi</h2>
          </div>
        </div>
        <div className="analysis-action-grid">
          {data.actionPlan.length > 0 ? data.actionPlan.map((item) => (
            <div key={`${item.companyId}-${item.title}`} className="analysis-action-item">
              <div>
                <div className="analysis-action-meta">
                  <span className="dashboard-pill-badge">{item.lane}</span>
                  <span className={`dashboard-pill-badge ${item.priority === 'urgent' ? 'danger' : item.priority === 'high' ? 'warning' : ''}`}>{item.priority}</span>
                </div>
                <strong>{item.title}</strong>
                <span>{item.companyName} · {item.detail}</span>
              </div>
              <div className="analysis-action-buttons">
                <Link href={`/companies/${item.companyId}`} className="ghost-button">Apri azienda</Link>
                <CreateFollowupButton
                  companyId={item.companyId}
                  title={item.title}
                  description={item.detail}
                  priority={item.priority}
                  defaultDueInDays={item.priority === 'urgent' ? 1 : item.priority === 'high' ? 2 : 5}
                  compact
                />
              </div>
            </div>
          )) : <p className="analysis-empty-copy">Nessuna azione prioritaria da mostrare per ora.</p>}
        </div>
      </section>

      <section className="panel-card analysis-company-panel">
        <div className="panel-head compact">
          <div>
            <p className="page-eyebrow">Priorità aziende</p>
            <h2>Analisi trasversale CRM</h2>
          </div>
        </div>
        <p className="settings-copy">
          Qui la lettura parte dal CRM: anche senza CSV vedi opportunità, follow-up e contesto. Quando importi, aggiungi anche storico ordini e valore.
        </p>
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
      </section>

      <section className="panel-card analysis-suggestions-panel">
        <div className="panel-head compact">
          <div>
            <p className="page-eyebrow">Fase 2</p>
            <h2>Follow-up suggeriti da Analisi</h2>
          </div>
        </div>
        <div className="analysis-suggestion-list">
          {data.suggestedFollowups.length > 0 ? data.suggestedFollowups.map((item) => (
            <div key={`${item.companyId}-${item.title}`} className="analysis-suggestion-item">
              <Link href={`/companies/${item.companyId}`} className="analysis-suggestion-link">
                <strong>{item.title}</strong>
                <span>{item.companyName} · {item.description}</span>
              </Link>
              <div className="analysis-suggestion-actions">
                <span className={`dashboard-pill-badge ${item.priority === 'urgent' ? 'danger' : item.priority === 'high' ? 'warning' : ''}`}>{item.priority}</span>
                <CreateFollowupButton
                  companyId={item.companyId}
                  title={item.title}
                  description={item.description}
                  priority={item.priority}
                  compact
                />
              </div>
            </div>
          )) : <p className="analysis-empty-copy">Nessun follow-up suggerito in questo momento.</p>}
        </div>
      </section>

      <section className="analysis-lower-grid">
        <section className="panel-card analysis-orders-panel">
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

        <section className="panel-card analysis-next-panel">
          <div className="panel-head compact">
            <div>
              <p className="page-eyebrow">Fase 2 già impostata</p>
              <h2>Come usarla nel CRM</h2>
            </div>
          </div>
          <ul className="analysis-next-list">
            <li>Collega gli ordini alle aziende già nel CRM durante l’import.</li>
            <li>Leggi prima il CRM: opportunità, follow-up e stato restano disponibili anche senza CSV.</li>
            <li>Usa le aziende con segnale medio/alto come backlog per chiamate, riattivazioni e nuovi brief.</li>
            <li>Nel prossimo step puoi portare questi segnali dentro Dashboard, Aziende e Follow-up suggeriti.</li>
          </ul>
        </section>
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

function MiniBars({ data, emptyLabel, mode = 'count' }: { data: SeriesItem[]; emptyLabel: string; mode?: 'count' | 'currency' }) {
  if (data.length === 0) {
    return <p className="analysis-empty-copy">{emptyLabel}</p>
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1)
  return (
    <div className="analysis-bars">
      {data.map((item) => (
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
