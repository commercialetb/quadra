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
  recentOrders: any[]
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
  priorityBuckets: any
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

function MiniMetricCard({ item }: { item: { label: string; value: string; helper: string } }) {
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
        <div><p className="page-eyebrow">Visuale</p><h2>{title}</h2></div>
      </div>
      <div className="analysis-mini-bars">
        {rows.map((item) => (
          <div key={item.label} className="analysis-mini-bar-row">
            <div className="analysis-mini-bar-head">
              <span>{item.label}</span>
              <div className="analysis-mini-bar-values">
                {item.meta ? <small>{item.meta}</small> : null}
                <strong>{formatter(item.value)}</strong>
              </div>
            </div>
            <div className="analysis-mini-bar-track">
              <i style={{ width: `${Math.max(5, (item.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TopCustomersCard({ rows, concentration }: { rows: TopCustomerRow[], concentration: ConcentrationMetrics }) {
  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head">
        <div><p className="page-eyebrow">Clienti</p><h2>Top clienti e concentrazione</h2></div>
        <div className="cluster-wrap">
          <span className="dashboard-pill-badge">Top 1: {concentration.top1Share}%</span>
          <span className="dashboard-pill-badge">Top 10: {concentration.top10Share}%</span>
        </div>
      </div>
      <div className="analysis-top-customers-list">
        {rows.map((row, index) => (
          <div key={row.companyId} className="analysis-top-customer-row">
            <div className="analysis-top-customer-rank">{index + 1}</div>
            <div className="analysis-top-customer-main">
              <div className="analysis-top-customer-head">
                <strong>{row.companyName}</strong>
                <span className={`dashboard-pill-badge ${trendTone(row.status)}`}>{fmtPct(row.trendPct)}</span>
              </div>
              <div className="analysis-top-customer-sub"><span>{row.region}</span><span>{row.sharePct}% del totale</span></div>
            </div>
            <div className="analysis-top-customer-value">{formatCurrency(row.revenue)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RegionTableCard({ rows }: { rows: RegionRevenueRow[] }) {
  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Geografia</p><h2>Fatturato per regione</h2></div></div>
      <div className="analysis-table-wrap">
        <table className="analysis-table">
          <thead><tr><th>Regione</th><th>Clienti</th><th>Ordini</th><th>Fatturato</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.region}>
                <td>{row.region}</td><td>{row.customers}</td><td>{row.orders}</td><td>{formatCurrency(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function MoversCard({ growth, decline }: { growth: CustomerMoverRow[], decline: CustomerMoverRow[] }) {
  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Trend</p><h2>Chi accelera e chi rallenta</h2></div></div>
      <div className="analysis-movers-grid">
        <div className="analysis-movers-col">
          <div className="analysis-movers-title"><h3>In crescita</h3></div>
          <div className="apple-list-stack">
            {growth.map((row) => (
              <div key={row.companyId} className="apple-best-row">
                <div><strong>{row.companyName}</strong><span>{formatCurrency(row.revenue)} · delta {fmtPct(row.deltaPct)}</span></div>
                <div className="apple-best-meta"><span className="dashboard-pill-badge success">{formatCurrency(row.deltaValue)}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="analysis-movers-col">
          <div className="analysis-movers-title"><h3>In calo</h3></div>
          <div className="apple-list-stack">
            {decline.map((row) => (
              <div key={row.companyId} className="apple-best-row">
                <div><strong>{row.companyName}</strong><span>{formatCurrency(row.revenue)} · delta {fmtPct(row.deltaPct)}</span></div>
                <div className="apple-best-meta"><span className="dashboard-pill-badge danger">{formatCurrency(row.deltaValue)}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function AnalysisDashboard({ data }: { data: AnalysisDashboardData }) {
  const [industryFilter, setIndustryFilter] = useState('all')

  const industryOptions = useMemo(
    () => Array.from(new Set(data.companyRows.map((row) => row.industry).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'it')),
    [data.companyRows]
  )

  const filteredRows = useMemo(() => {
    if (industryFilter === 'all') return data.companyRows
    return data.companyRows.filter((row) => row.industry === industryFilter)
  }, [data.companyRows, industryFilter])

  const quickMetrics = [
    { label: 'Fatturato totale', value: formatCurrency(data.orderKpis.totalValue), helper: 'ordini importati' },
    { label: 'Clienti attivi', value: String(data.crmKpis.companies), helper: 'nel CRM' },
    { label: 'Ordini', value: String(data.orderKpis.orderCount), helper: 'storico disponibile' },
    { label: 'Ticket medio', value: formatCurrency(data.orderKpis.averageOrderValue), helper: 'valore medio' },
    { label: 'Outstanding', value: formatCurrency(data.orderKpis.outstandingValue), helper: 'esposizione' },
    { label: 'Segnali attivi', value: String(data.crmKpis.companiesWithSignals), helper: 'da attenzionare' },
  ]

  return (
    <div className="page-stack analysis-v2-page">
      <section className="panel-card analysis-hero-v2">
        <div>
          <p className="page-eyebrow">Revenue intelligence</p>
          <h1 className="page-title">Analisi clienti e prossime azioni</h1>
          <p className="page-subtitle">Monitora l&apos;andamento commerciale e trasforma i dati in operazioni concrete.</p>
        </div>
        <div className="analysis-hero-side">
          <label className="analysis-industry-filter">
            <span>Settore</span>
            <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
              <option value="all">Tutti i settori</option>
              {industryOptions.map((item) => (<option key={item} value={item}>{item}</option>))}
            </select>
          </label>
        </div>
      </section>

      <section className="analysis-kpi-grid">
        {quickMetrics.map((item) => (<MiniMetricCard key={item.label} item={item} />))}
      </section>

      <section className="analysis-grid analysis-grid-top">
        <TopCustomersCard rows={data.topCustomers} concentration={data.concentrationMetrics} />
        <RevenueBars
          title="Fatturato per regione"
          items={data.regionSeries.map((row) => ({ label: row.region, value: row.revenue, meta: `${row.customers} cl.` }))}
          formatter={(v) => formatCurrency(v)}
        />
      </section>

      <section className="analysis-grid analysis-grid-middle">
        <RegionTableCard rows={data.regionSeries} />
        <MoversCard growth={data.growthLeaders} decline={data.declineLeaders} />
      </section>

      <section className="analysis-grid analysis-grid-bottom">
        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head">
            <div><p className="page-eyebrow">Oggi</p><h2>Azioni immediate</h2></div>
          </div>
          <div className="apple-list-stack">
            {data.actionPlan.slice(0, 5).map((item, i) => (
              <div key={i} className="apple-action-row">
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.companyName} • {item.detail}</span>
                </div>
                <div className="apple-action-side">
                  <span className={`dashboard-pill-badge ${priorityTone(item.priority)}`}>{item.priority}</span>
                  <CreateFollowupButton
                    companyId={item.companyId}
                    title={item.title}
                    description={item.detail}
                    priority={item.priority}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head">
            <div><p className="page-eyebrow">Monitoraggio</p><h2>Aziende da seguire</h2></div>
          </div>
          <div className="apple-list-stack">
            {filteredRows.slice(0, 5).map((row) => (
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
      </section>

      <section className="panel-card analysis-chart-card">
        <AnalysisImportCard
          companies={data.companiesForImport}
          title="Importa ordini"
          description="Carica i CSV ordini per arricchire l'analisi."
          submitLabel="Importa ordini"
          compact
        />
      </section>
    </div>
  )
}
