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

function priorityTone(value: FollowupPriority) {
  if (value === 'urgent') return 'danger'
  if (value === 'high') return 'warning'
  return ''
}

function signalTone(value: CompanyRow['signal']) {
  if (value === 'high') return 'danger'
  if (value === 'medium') return 'warning'
  return ''
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
    { label: 'Aziende', value: String(data.crmKpis.companies), helper: 'nel CRM' },
    { label: 'Opportunità', value: String(data.crmKpis.openOpportunities), helper: 'aperte' },
    { label: 'Follow-up', value: String(data.crmKpis.pendingFollowups), helper: 'attivi' },
    { label: 'Segnali', value: String(data.crmKpis.companiesWithSignals), helper: 'rilevati' },
  ]

  const orderMetrics: Metric[] = [
    { label: 'Valore ordini', value: formatCurrency(data.orderKpis.totalValue), helper: 'importato' },
    { label: 'Outstanding', value: formatCurrency(data.orderKpis.outstandingValue), helper: 'sospeso' },
    { label: 'Ticket medio', value: formatCurrency(data.orderKpis.averageOrderValue), helper: 'per ordine' },
    { label: 'Ordini', value: String(data.orderKpis.orderCount), helper: 'righe' },
  ]

  const topActions = data.actionPlan.slice(0, 5)
  const bestCompanies = [...data.companyRows]
    .sort((a, b) => (b.priorityScore + b.importedValue) - (a.priorityScore + a.importedValue))
    .slice(0, 6)
  const topSuggestions = data.suggestedFollowups.slice(0, 4)

  return (
    <div className="page-stack analysis-redesign-page">
      <section className="panel-card analysis-hero-redesign">
        <div>
          <p className="page-eyebrow">Insight</p>
          <h1 className="page-title">Analisi che porta all'azione</h1>
          <p className="page-subtitle">In alto vedi chi seguire, quali aziende stanno andando meglio e cosa fare subito. Trend e storico restano sotto.</p>
        </div>
        <div className="cluster-wrap">
          <a href="#analysis-import" className="primary-button">Importa CSV</a>
          <Link href="/companies" className="ghost-button">Apri aziende</Link>
        </div>
      </section>

      {!data.schemaReady ? (
        <section className="panel-card analysis-schema-warning">
          <strong>Import ordini non ancora attivo.</strong>
          <p>La lettura CRM funziona già. Per attivare ordini e storico, applica prima lo schema Supabase di Analisi.</p>
          {data.schemaError ? <span>{data.schemaError}</span> : null}
        </section>
      ) : null}

      <section className="analysis-top-grid-redesign">
        <div className="panel-card">
          <div className="dashboard-redesign-head"><h2>Stato rapido</h2></div>
          <div className="apple-kpi-grid two-rows">
            {crmMetrics.map((metric) => (
              <article key={metric.label} className="apple-kpi-card compact"><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.helper}</small></article>
            ))}
            {orderMetrics.map((metric) => (
              <article key={metric.label} className="apple-kpi-card compact"><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.helper}</small></article>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="dashboard-redesign-head"><h2>Cosa fare adesso</h2></div>
          <div className="apple-list-stack">
            {topActions.length ? topActions.map((item) => (
              <div key={`${item.companyId}-${item.title}`} className="apple-action-row">
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.companyName} · {item.detail}</span>
                </div>
                <div className="apple-action-side">
                  <span className={`dashboard-pill-badge ${priorityTone(item.priority)}`}>{item.priority}</span>
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
            )) : <div className="dashboard-widget-empty apple-empty">Nessuna azione prioritaria da mostrare per ora.</div>}
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="dashboard-redesign-head">
          <div>
            <p className="page-eyebrow">Report</p>
            <h2>Chi sta andando meglio</h2>
          </div>
        </div>
        <div className="analysis-company-table-wrap redesign-best-wrap">
          <table className="analysis-company-table redesign-best-table">
            <thead>
              <tr>
                <th>Azienda</th>
                <th>Settore</th>
                <th>Ordini</th>
                <th>Pipeline</th>
                <th>Score</th>
                <th>Insight</th>
              </tr>
            </thead>
            <tbody>
              {bestCompanies.map((row) => (
                <tr key={row.companyId}>
                  <td><Link href={`/companies/${row.companyId}`}>{row.companyName}</Link></td>
                  <td>{row.industry || '—'}</td>
                  <td>{formatCurrency(row.importedValue)}</td>
                  <td>{formatCurrency(row.pipelineValue)}</td>
                  <td><span className={`dashboard-pill-badge ${signalTone(row.signal)}`}>{row.priorityScore}/100</span></td>
                  <td>{row.insight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analysis-main-grid-redesign">
        <div className="panel-card">
          <div className="dashboard-redesign-head"><h2>Aziende prioritarie</h2></div>
          <div className="apple-list-stack">
            {data.companyRows.slice(0, 8).map((row) => (
              <Link key={row.companyId} href={`/companies/${row.companyId}`} className="apple-best-row">
                <div>
                  <strong>{row.companyName}</strong>
                  <span>{row.insight}</span>
                </div>
                <div className="apple-best-meta">
                  <span className={`dashboard-pill-badge ${signalTone(row.signal)}`}>{row.signal}</span>
                  <strong>{row.priorityScore}/100</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="dashboard-redesign-head"><h2>Follow-up suggeriti</h2></div>
          <div className="apple-list-stack">
            {topSuggestions.length ? topSuggestions.map((item) => (
              <div key={`${item.companyId}-${item.title}`} className="apple-action-row">
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.companyName} · {item.description}</span>
                </div>
                <CreateFollowupButton companyId={item.companyId} title={item.title} description={item.description} priority={item.priority} compact />
              </div>
            )) : <div className="dashboard-widget-empty apple-empty">Nessuna proposta automatica da mostrare.</div>}
          </div>
        </div>
      </section>

      <details className="analysis-details-block redesigned-details" open={false}>
        <summary>Apri trend, storico e import</summary>
        <div className="analysis-details-redesign-grid">
          <section className="panel-card" id="analysis-import">
            <div className="dashboard-redesign-head"><h2>Import ordini</h2></div>
            <AnalysisImportCard companies={data.companiesForImport} compact />
          </section>

          <section className="panel-card">
            <div className="dashboard-redesign-head"><h2>Ordini recenti</h2></div>
            <div className="apple-list-stack">
              {data.recentOrders.slice(0, 8).map((order) => (
                <div key={order.id ?? order.bega_order} className="apple-list-row static-row">
                  <div>
                    <strong>{order.account}</strong>
                    <span>{order.bega_order} · {formatDate(order.order_date)} · {order.status || order.source_type}</span>
                  </div>
                  <strong>{formatCurrency(order.total_eur)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </details>
    </div>
  )
}
