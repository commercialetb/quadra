'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AnalysisImportCard } from '@/components/analysis/analysis-import-card'
import { CreateFollowupButton } from '@/components/analysis/create-followup-button'
import { formatCurrency, formatDate } from '@/lib/format'
import type { AnalysisImportRecord } from '@/lib/analysis/queries'

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

type Metric = { label: string; value: string; helper: string }

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

function InlineBars({ title, items, formatter = (value: number) => String(value) }: { title: string; items: SeriesItem[]; formatter?: (value: number) => string }) {
  const rows = items.slice(0, 6)
  const max = Math.max(...rows.map((item) => item.value), 1)
  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head"><h2>{title}</h2></div>
      <div className="analysis-mini-bars">
        {rows.length ? rows.map((item) => (
          <div key={item.label} className="analysis-mini-bar-row">
            <div className="analysis-mini-bar-head">
              <span>{item.label}</span>
              <strong>{formatter(item.value)}</strong>
            </div>
            <div className="analysis-mini-bar-track"><i style={{ width: `${Math.max(12, (item.value / max) * 100)}%` }} /></div>
          </div>
        )) : <div className="dashboard-widget-empty apple-empty">Nessun dato da mostrare.</div>}
      </div>
    </section>
  )
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
    { label: 'Aziende attive', value: String(data.crmKpis.companies), helper: 'nel CRM' },
    { label: 'Azioni aperte', value: String(data.crmKpis.pendingFollowups), helper: 'da seguire' },
    { label: 'Valore ordini', value: formatCurrency(data.orderKpis.totalValue), helper: 'importato' },
  ]

  const topActions = data.actionPlan.slice(0, 5)
  const topSuggestions = data.suggestedFollowups.slice(0, 4)
  const bestCompanies = [...filteredRows]
    .sort((a, b) => (b.priorityScore + b.importedValue) - (a.priorityScore + a.importedValue))
    .slice(0, 6)
  const monitorCompanies = filteredRows.slice(0, 5)
  const extraMonitorCompanies = filteredRows.slice(5, 12)
  const topHighlights = data.highlights.slice(0, 3)

  return (
    <div className="page-stack analysis-redesign-page simplified-analysis-page">
      <section className="panel-card analysis-hero-redesign">
        <div>
          <p className="page-eyebrow">Insight</p>
          <h1 className="page-title">Analisi che porta all'azione</h1>
          <p className="page-subtitle">
            Quadra qui deve battere la complessità, non aggiungerla: vedi cosa fare, con chi e perché. Tutto il resto resta annidato sotto.
          </p>
        </div>

      </section>

      {!data.schemaReady ? (
        <section className="panel-card analysis-schema-warning">
          <strong>Import ordini non ancora attivo.</strong>
          <p>La lettura CRM funziona già. Per attivare ordini e storico, applica prima lo schema Supabase di Analisi.</p>
          {data.schemaError ? <span>{data.schemaError}</span> : null}
        </section>
      ) : null}

      <section className="analysis-ops-grid">
        <div className="panel-card">
          <div className="dashboard-redesign-head">
            <div>
              <p className="page-eyebrow">Oggi</p>
              <h2>Cosa fare adesso</h2>
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

        <div className="panel-card analysis-filter-card">
          <div className="dashboard-redesign-head">
            <div>
              <p className="page-eyebrow">Filtro</p>
              <h2>Da monitorare</h2>
            </div>
          </div>
          <label className="analysis-industry-filter">
            <span>Settore</span>
            <select value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)}>
              <option value="all">Tutti i settori</option>
              {industryOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
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
          {extraMonitorCompanies.length ? (
            <details className="crm-more-details">
              <summary>Apri altre {extraMonitorCompanies.length} aziende</summary>
              <div className="apple-list-stack">
                {extraMonitorCompanies.map((row) => (
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
            </details>
          ) : null}
        </div>
      </section>

      <section className="panel-card">
        <div className="dashboard-redesign-head">
          <div>
            <p className="page-eyebrow">Report</p>
            <h2>Account da seguire</h2>
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
                <th>Perché</th>
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

      <section className="analysis-quick-strip">
        {quickMetrics.map((metric) => (
          <article key={metric.label} className="apple-kpi-card compact">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.helper}</small>
          </article>
        ))}
        {topHighlights.map((item) => (
          <article key={item} className="panel-card analysis-highlight-card">
            <span>Insight rapido</span>
            <strong>{item}</strong>
          </article>
        ))}
      </section>

      <section className="analysis-chart-grid">
        <InlineBars title="Ordini per stato" items={data.statusSeries} />
        <InlineBars title="Valore mensile" items={data.monthlySeries} formatter={formatCurrency} />
      </section>

      <details className="analysis-secondary-details analysis-details-block redesigned-details" open={false}>
        <summary>Apri follow-up suggeriti, ordini recenti e import</summary>
        <div className="analysis-details-redesign-grid">
          <section className="panel-card">
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

          <section className="panel-card" id="analysis-import">
            <div className="dashboard-redesign-head"><h2>Import ordini</h2></div>
            <AnalysisImportCard companies={data.companiesForImport} compact />
          </section>
        </div>
      </details>
    </div>
  )
}
