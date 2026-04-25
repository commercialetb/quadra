'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AnalysisImportCard } from '@/components/analysis/analysis-import-card'
import { CreateFollowupButton } from '@/components/analysis/create-followup-button'
import { formatCurrency } from '@/lib/format'
import type {
  AiCustomerAction,
  AnalysisImportRecord,
  ConcentrationMetrics,
  CustomerMoverRow,
  RegionRevenueRow,
  TopCustomerRow,
} from '@/lib/analysis/queries'

type SeriesItem = {
  label: string
  value: number
}

type FollowupPriority = 'medium' | 'high' | 'urgent'

type CompanyRow = {
  companyId: string
  companyName: string
  city: string | null
  province: string | null
  industry: string | null
  status: string | null
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
  source_type: string
  order_date: string
  customer_order: string
  bega_order: string
  status: string
  ship_date?: string | null
  positions?: number | null
  total_eur: number
}

type Metric = {
  label: string
  value: string
  helper: string
}

type AnalysisDashboardData = {
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
  topCustomers: TopCustomerRow[]
  concentrationMetrics: ConcentrationMetrics
  regionSeries: RegionRevenueRow[]
  growthLeaders: CustomerMoverRow[]
  declineLeaders: CustomerMoverRow[]
  aiCustomerActions: AiCustomerAction[]
  imports: AnalysisImportRecord[]
  recentOrders: OrderRow[]
  highlights: string[]
  companiesForImport: Array<{ id: string; name: string }>
  suggestedFollowups: Array<{
    companyId: string
    companyName: string
    title: string
    description: string
    priority: FollowupPriority
  }>
  actionPlan: Array<{
    companyId: string
    companyName: string
    title: string
    detail: string
    priority: FollowupPriority
    lane: 'agenda' | 'pipeline' | 'ordini' | 'copertura'
  }>
  priorityBuckets: {
    callNow: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>
    reactivate: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>
    monitor: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>
  }
  schemaReady: boolean
  schemaError: string | null
}

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

function aiStateTone(value: AiCustomerAction['aiState']) {
  if (value === 'recupera') return 'danger'
  if (value === 'proteggi') return 'warning'
  if (value === 'spingi') return 'success'
  return ''
}

function trendTone(value: TopCustomerRow['status']) {
  if (value === 'down') return 'danger'
  if (value === 'grow') return 'success'
  return ''
}

function fmtPct(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

function MiniMetricCard({ item }: { item: Metric }) {
  return (
    <article className="panel-card analysis-kpi-card">
      <span className="analysis-kpi-label">{item.label}</span>
      <strong className="analysis-kpi-value">{item.value}</strong>
      <small className="analysis-kpi-helper">{item.helper}</small>
    </article>
  )
}

function RevenueBars({
  title,
  items,
  formatter = (value: number) => String(value),
}: {
  title: string
  items: Array<{ label: string; value: number; meta?: string }>
  formatter?: (value: number) => string
}) {
  const rows = items.slice(0, 8)
  const max = Math.max(...rows.map((item) => item.value), 1)

  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head">
        <div>
          <p className="page-eyebrow">Visuale</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="analysis-mini-bars">
        {rows.length ? rows.map((item) => (
          <div key={item.label} className="analysis-mini-bar-row">
            <div className="analysis-mini-bar-head">
              <span>{item.label}</span>
              <div className="analysis-mini-bar-values">
                {item.meta ? <small>{item.meta}</small> : null}
                <strong>{formatter(item.value)}</strong>
              </div>
            </div>
            <div className="analysis-mini-bar-track">
              <i style={{ width: `${Math.max(10, (item.value / max) * 100)}%` }} />
            </div>
          </div>
        )) : (
          <div className="dashboard-widget-empty apple-empty">Nessun dato disponibile.</div>
        )}
      </div>
    </section>
  )
}

function TopCustomersCard({
  rows,
  concentration,
}: {
  rows: TopCustomerRow[]
  concentration: ConcentrationMetrics
}) {
  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head">
        <div>
          <p className="page-eyebrow">Clienti</p>
          <h2>Top clienti e concentrazione</h2>
        </div>
        <div className="cluster-wrap">
          <span className="dashboard-pill-badge">Top 1: {concentration.top1Share}%</span>
          <span className="dashboard-pill-badge">Top 3: {concentration.top3Share}%</span>
          <span className="dashboard-pill-badge">Top 10: {concentration.top10Share}%</span>
        </div>
      </div>

      <div className="analysis-top-customers-list">
        {rows.length ? rows.map((row, index) => (
          <div key={row.companyId} className="analysis-top-customer-row">
            <div className="analysis-top-customer-rank">{index + 1}</div>
            <div className="analysis-top-customer-main">
              <div className="analysis-top-customer-head">
                <strong>{row.companyName}</strong>
                <span className={`dashboard-pill-badge ${trendTone(row.status)}`}>{fmtPct(row.trendPct)}</span>
              </div>
              <div className="analysis-top-customer-sub">
                <span>{row.region}</span>
                <span>{row.orders} ordini</span>
                <span>{row.sharePct}% del totale</span>
              </div>
              <div className="analysis-inline-progress">
                <i style={{ width: `${Math.max(8, row.sharePct)}%` }} />
              </div>
            </div>
            <div className="analysis-top-customer-value">{formatCurrency(row.revenue)}</div>
          </div>
        )) : <div className="dashboard-widget-empty apple-empty">Nessun cliente con fatturato disponibile.</div>}
      </div>
    </section>
  )
}

function RegionTableCard({ rows }: { rows: RegionRevenueRow[] }) {
  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head">
        <div>
          <p className="page-eyebrow">Geografia</p>
          <h2>Fatturato per regione</h2>
        </div>
      </div>

      <div className="analysis-table-wrap">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Regione</th>
              <th>Clienti</th>
              <th>Ordini</th>
              <th>Fatturato</th>
              <th>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row) => (
              <tr key={row.region}>
                <td>{row.region}</td>
                <td>{row.customers}</td>
                <td>{row.orders}</td>
                <td>{formatCurrency(row.revenue)}</td>
                <td>{formatCurrency(row.outstanding)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5}>Nessun dato geografico disponibile.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function MoversCard({
  growth,
  decline,
}: {
  growth: CustomerMoverRow[]
  decline: CustomerMoverRow[]
}) {
  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head">
        <div>
          <p className="page-eyebrow">Trend</p>
          <h2>Chi accelera e chi rallenta</h2>
        </div>
      </div>

      <div className="analysis-movers-grid">
        <div className="analysis-movers-col">
          <div className="analysis-movers-title">
            <h3>In crescita</h3>
          </div>
          <div className="apple-list-stack">
            {growth.length ? growth.map((row) => (
              <div key={row.companyId} className="apple-best-row">
                <div>
                  <strong>{row.companyName}</strong>
                  <span>{formatCurrency(row.revenue)} · delta {fmtPct(row.deltaPct)}</span>
                </div>
                <div className="apple-best-meta">
                  <span className="dashboard-pill-badge success">{formatCurrency(row.deltaValue)}</span>
                </div>
              </div>
            )) : <div className="dashboard-widget-empty apple-empty">Nessun cliente in crescita.</div>}
          </div>
        </div>

        <div className="analysis-movers-col">
          <div className="analysis-movers-title">
            <h3>In calo</h3>
          </div>
          <div className="apple-list-stack">
            {decline.length ? decline.map((row) => (
              <div key={row.companyId} className="apple-best-row">
                <div>
                  <strong>{row.companyName}</strong>
                  <span>{formatCurrency(row.revenue)} · delta {fmtPct(row.deltaPct)}</span>
                </div>
                <div className="apple-best-meta">
                  <span className="dashboard-pill-badge danger">{formatCurrency(row.deltaValue)}</span>
                </div>
              </div>
            )) : <div className="dashboard-widget-empty apple-empty">Nessun cliente in calo.</div>}
          </div>
        </div>
      </div>
    </section>
  )
}

function AiOperationsBoard({
  rows,
}: {
  rows: AiCustomerAction[]
}) {
  const groups = {
    proteggi: rows.filter((row) => row.aiState === 'proteggi').slice(0, 4),
    spingi: rows.filter((row) => row.aiState === 'spingi').slice(0, 4),
    recupera: rows.filter((row) => row.aiState === 'recupera').slice(0, 4),
    monitora: rows.filter((row) => row.aiState === 'monitora').slice(0, 4),
  }

  const titles: Record<AiCustomerAction['aiState'], string> = {
    proteggi: 'Proteggi',
    spingi: 'Spingi',
    recupera: 'Recupera',
    monitora: 'Monitora',
  }

  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head">
        <div>
          <p className="page-eyebrow">AI</p>
          <h2>Operazioni consigliate</h2>
        </div>
      </div>

      <div className="analysis-ai-board">
        {(Object.keys(groups) as AiCustomerAction['aiState'][]).map((state) => (
          <div key={state} className="analysis-ai-lane">
            <div className="analysis-ai-lane-head">
              <h3>{titles[state]}</h3>
              <span>{groups[state].length}</span>
            </div>

            <div className="apple-list-stack">
              {groups[state].length ? groups[state].map((row) => (
                <div key={`${state}-${row.companyId}`} className="analysis-ai-row">
                  <div>
                    <div className="analysis-ai-row-head">
                      <strong>{row.companyName}</strong>
                      <span className={`dashboard-pill-badge ${aiStateTone(row.aiState)}`}>{row.aiState}</span>
                    </div>
                    <span>{row.reason}</span>
                    <small>{row.region} · {formatCurrency(row.revenue)} · {row.trendLabel}</small>
                  </div>
                  <div className="analysis-ai-side">
                    <span className={`dashboard-pill-badge ${priorityTone(row.priority)}`}>{row.priority}</span>
                    <CreateFollowupButton
                      companyId={row.companyId}
                      title={row.nextAction}
                      description={row.reason}
                      priority={row.priority}
                      defaultDueInDays={row.priority === 'urgent' ? 1 : row.priority === 'high' ? 3 : 7}
                      compact
                    />
                  </div>
                </div>
              )) : <div className="dashboard-widget-empty apple-empty">Nessuna azienda in questa corsia.</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CustomerActionTable({
  rows,
}: {
  rows: AiCustomerAction[]
}) {
  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head">
        <div>
          <p className="page-eyebrow">Execution</p>
          <h2>Clienti e prossima mossa</h2>
        </div>
      </div>

      <div className="analysis-table-wrap">
        <table className="analysis-table analysis-table-actions">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Regione</th>
              <th>Fatturato</th>
              <th>Stato AI</th>
              <th>Trend</th>
              <th>Operazione consigliata</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row) => (
              <tr key={row.companyId}>
                <td>
                  <Link href={`/companies/${row.companyId}`} className="analysis-table-link">
                    {row.companyName}
                  </Link>
                </td>
                <td>{row.region}</td>
                <td>{formatCurrency(row.revenue)}</td>
                <td>
                  <span className={`dashboard-pill-badge ${aiStateTone(row.aiState)}`}>{row.aiState}</span>
                </td>
                <td>{row.trendLabel}</td>
                <td>{row.nextAction}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6}>Nessuna azione AI disponibile.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function AnalysisDashboard({ data }: { data: AnalysisDashboardData }) {
  const [industryFilter, setIndustryFilter] = useState<string>('all')

  const industryOptions = useMemo(
    () => Array.from(new Set(data.companyRows.map((row) => row.industry).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'it')),
    [data.companyRows],
  )

  const filteredRows = useMemo(() => {
    if (industryFilter === 'all') return data.companyRows
    return data.companyRows.filter((row) => row.industry === industryFilter)
  }, [data.companyRows, industryFilter])

  const quickMetrics: Metric[] = [
    { label: 'Fatturato totale', value: formatCurrency(data.orderKpis.totalValue), helper: 'ordini importati' },
    { label: 'Clienti attivi', value: String(data.crmKpis.companies), helper: 'nel CRM' },
    { label: 'Ordini', value: String(data.orderKpis.orderCount), helper: 'storico disponibile' },
    { label: 'Ticket medio', value: formatCurrency(data.orderKpis.averageOrderValue), helper: 'valore medio ordine' },
    { label: 'Outstanding', value: formatCurrency(data.orderKpis.outstandingValue), helper: 'esposizione aperta' },
    { label: 'Segnali attivi', value: String(data.crmKpis.companiesWithSignals), helper: 'aziende da attenzionare' },
  ]

  const topHighlights = data.highlights.slice(0, 3)
  const topActions = data.actionPlan.slice(0, 4)
  const monitorCompanies = filteredRows.slice(0, 5)
  const topSuggestions = data.suggestedFollowups.slice(0, 4)

  return (
    <div className="page-stack analysis-redesign-page analysis-v2-page">
      <section className="panel-card analysis-hero-redesign analysis-hero-v2">
        <div>
          <p className="page-eyebrow">Revenue intelligence</p>
          <h1 className="page-title">Analisi clienti e prossime azioni</h1>
          <p className="page-subtitle">
            Leggi il fatturato, individua chi accelera o rallenta e usa l&apos;AI per trasformare i segnali in operazioni concrete.
          </p>
        </div>

        <div className="analysis-hero-side">
          <label className="analysis-industry-filter">
            <span>Settore</span>
            <select value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)}>
              <option value="all">Tutti i settori</option>
              {industryOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {!data.schemaReady ? (
        <section className="panel-card analysis-schema-warning">
          <strong>Import ordini non ancora attivo.</strong>
          <p>La lettura CRM funziona già. Per attivare ordini e storico, applica prima lo schema Supabase di Analisi.</p>
          {data.schemaError ? <span>{data.schemaError}</span> : null}
        </section>
      ) : null}

      <section className="analysis-kpi-grid">
        {quickMetrics.map((item) => (
          <MiniMetricCard key={item.label} item={item} />
        ))}
      </section>

      {topHighlights.length ? (
        <section className="analysis-highlight-strip">
          {topHighlights.map((item) => (
            <article key={item} className="panel-card analysis-highlight-card">
              <span>{item}</span>
            </article>
          ))}
        </section>
      ) : null}

      <section className="analysis-grid analysis-grid-top">
        <TopCustomersCard rows={data.topCustomers} concentration={data.concentrationMetrics} />
        <RevenueBars
          title="Fatturato per regione"
          items={data.regionSeries.map((row) => ({
            label: row.region,
            value: row.revenue,
            meta: `${row.customers} clienti · ${row.orders} ordini`,
          }))}
          formatter={(value) => formatCurrency(value)}
        />
      </section>

      <section className="analysis-grid analysis-grid-middle">
        <RegionTableCard rows={data.regionSeries} />
        <MoversCard growth={data.growthLeaders} decline={data.declineLeaders} />
      </section>

      <AiOperationsBoard rows={data.aiCustomerActions} />

      <section className="analysis-grid analysis-grid-bottom">
        <div className="panel-card">
          <div className="dashboard-redesign-head">
            <div>
              <p className="page-eyebrow">Oggi</p>
              <h2>Azioni immediate</h2>
            </div>
          </div>

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

        <div className="panel-card">
          <div className="dashboard-redesign-head">
            <div>
              <p className="page-eyebrow">Monitoraggio</p>
              <h2>Aziende da seguire</h2>
            </div>
          </div>

          <div className="apple-list-stack">
            {monitorCompanies.length ? monitorCompanies.map((row) => (
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
            )) : <div className="dashboard-widget-empty apple-empty">Nessuna azienda per questo filtro.</div>}
          </div>
        </div>
      </section>

      <CustomerActionTable rows={data.aiCustomerActions} />

      <section className="analysis-grid analysis-grid-bottom">
        <RevenueBars
          title="Fatturato per account"
          items={data.accountSeries.map((row) => ({ label: row.label, value: row.value }))}
          formatter={(value) => formatCurrency(value)}
        />

        <RevenueBars
          title="Stato ordini"
          items={data.statusSeries.map((row) => ({ label: row.label, value: row.value }))}
          formatter={(value) => String(value)}
        />
      </section>

      {topSuggestions.length ? (
        <section className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head">
            <div>
              <p className="page-eyebrow">AI follow-up</p>
              <h2>Suggerimenti rapidi</h2>
            </div>
          </div>

          <div className="apple-list-stack">
            {topSuggestions.map((item) => (
              <div key={`${item.companyId}-${item.title}`} className="apple-action-row">
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.companyName} · {item.description}</span>
                </div>
                <div className="apple-action-side">
                  <span className={`dashboard-pill-badge ${priorityTone(item.priority)}`}>{item.priority}</span>
                  <CreateFollowupButton
                    companyId={item.companyId}
                    title={item.title}
                    description={item.description}
                    priority={item.priority}
                    defaultDueInDays={item.priority === 'urgent' ? 1 : item.priority === 'high' ? 2 : 7}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {data.imports.length ? (
        <section className="analysis-imports-grid">
          {data.imports.slice(0, 2).map((item) => (
            <AnalysisImportCard
              key={item.id}
              importRecord={item}
              companies={data.companiesForImport}
            />
          ))}
        </section>
      ) : null}
    </div>
  )
}
