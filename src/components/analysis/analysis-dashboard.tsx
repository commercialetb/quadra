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

type FollowupPriority = 'medium' | 'high' | 'urgent'
type AnalysisLens = 'territorio' | 'canale' | 'tipo'

type CompanyRow = {
  companyId: string
  companyName: string
  city?: string | null
  province?: string | null
  industry?: string | null
  opportunities?: number
  pipelineValue?: number
  pendingFollowups?: number
  importedOrders?: number
  importedValue?: number
  priorityScore?: number
  insight?: string | null
}

type RankedRow = {
  rank: number
  label: string
  secondary?: string
  value: number
}

interface AnalysisDashboardProps {
  data: {
    crmKpis: { companies: number; openOpportunities: number; pendingFollowups: number; companiesWithSignals: number }
    orderKpis: { totalValue: number; orderCount: number; averageOrderValue: number; outstandingValue: number }
    companyRows: CompanyRow[]
    topCustomers: TopCustomerRow[]
    concentrationMetrics: ConcentrationMetrics
    regionSeries: RegionRevenueRow[]
    growthLeaders: CustomerMoverRow[]
    declineLeaders: CustomerMoverRow[]
    aiCustomerActions: AiCustomerAction[]
    actionPlan: Array<{ companyId: string; companyName: string; title: string; detail: string; priority: FollowupPriority }>
    companiesForImport: Array<{ id: string; name: string }>
    schemaReady: boolean
    imports?: AnalysisImportRecord[]
  }
}

function priorityTone(v: FollowupPriority) {
  if (v === 'urgent') return 'danger'
  if (v === 'high') return 'warning'
  return ''
}

function percentOf(value: number, total: number) {
  if (!total) return '0%'
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / total)
}

function shortLabel(value: string) {
  const cleaned = value.trim()
  if (cleaned.length <= 20) return cleaned
  return `${cleaned.slice(0, 17)}…`
}

function normalizeIndustry(value?: string | null) {
  const raw = (value || '').toLowerCase()
  if (!raw) return 'Altro'
  if (raw.includes('rivend')) return 'Rivenditori'
  if (raw.includes('architet')) return 'Architetti'
  if (raw.includes('agenz')) return 'Agenzie'
  if (raw.includes('contract')) return 'Contractor'
  if (raw.includes('lighting')) return 'Lighting designer'
  if (raw.includes('designer')) return 'Designer'
  if (raw.includes('studio')) return 'Studi'
  return value || 'Altro'
}

function InlineBars({ title, items, formatter = (value: number) => String(value) }: { title: string; items: Array<{ label: string; value: number }>; formatter?: (value: number) => string }) {
  const rows = items.slice(0, 6)
  const max = Math.max(...rows.map((item) => item.value), 1)
  return (
    <section className="panel-card analysis-chart-card">
      <div className="dashboard-redesign-head">
        <div>
          <p className="page-eyebrow">Distribuzione</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="analysis-mini-bars">
        {rows.length ? rows.map((item) => (
          <div key={item.label} className="analysis-mini-bar-row">
            <div className="analysis-mini-bar-head">
              <span>{item.label}</span>
              <strong>{formatter(item.value)}</strong>
            </div>
            <div className="analysis-mini-bar-track">
              <i style={{ width: `${Math.max(12, (item.value / max) * 100)}%` }} />
            </div>
          </div>
        )) : <div className="dashboard-widget-empty apple-empty">Nessun dato da mostrare.</div>}
      </div>
    </section>
  )
}

function RankedBarsCard({
  title,
  subtitle,
  items,
  formatter = formatCurrency,
}: {
  title: string
  subtitle?: string
  items: RankedRow[]
  formatter?: (value: number) => string
}) {
  const rows = items.slice(0, 8)
  const max = Math.max(...rows.map((item) => item.value), 1)
  const total = rows.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="panel-card analysis-visual-card">
      <div className="analysis-visual-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="analysis-visual-note">{subtitle}</p> : null}
        </div>
      </div>

      {rows.length ? (
        <>
          <div className="analysis-vertical-bars" role="img" aria-label={title}>
            {rows.map((item, index) => (
              <div key={`${item.label}-${index}`} className="analysis-vertical-bar-item">
                <div className="analysis-vertical-bar-value">{formatter(item.value)}</div>
                <div className="analysis-vertical-bar-track">
                  <i className="analysis-vertical-bar-fill" style={{ height: `${Math.max(14, (item.value / max) * 100)}%` }} />
                </div>
                <div className="analysis-vertical-bar-label">{shortLabel(item.label)}</div>
              </div>
            ))}
          </div>

          <div className="analysis-summary-table-wrap">
            <table className="analysis-summary-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Voce</th>
                  <th>Valore</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={`table-${item.rank}-${item.label}`}>
                    <td><span className="analysis-rank-dot">{item.rank}</span></td>
                    <td>
                      <div className="analysis-summary-label-cell">
                        <strong>{item.label}</strong>
                        {item.secondary ? <span>{item.secondary}</span> : null}
                      </div>
                    </td>
                    <td>{formatter(item.value)}</td>
                    <td>{percentOf(item.value, total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <div className="dashboard-widget-empty apple-empty">Nessun dato da mostrare.</div>}
    </section>
  )
}

function InsightTableCard({
  title,
  subtitle,
  rows,
}: {
  title: string
  subtitle?: string
  rows: Array<{ label: string; meta?: string; value: string; helper?: string }>
}) {
  return (
    <section className="panel-card analysis-visual-card">
      <div className="analysis-visual-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="analysis-visual-note">{subtitle}</p> : null}
        </div>
      </div>

      <div className="analysis-summary-table-wrap">
        <table className="analysis-summary-table analysis-summary-table-compact">
          <thead>
            <tr>
              <th>Voce</th>
              <th>Dettaglio</th>
              <th>Valore</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row) => (
              <tr key={`${row.label}-${row.value}`}>
                <td>
                  <div className="analysis-summary-label-cell">
                    <strong>{row.label}</strong>
                    {row.meta ? <span>{row.meta}</span> : null}
                  </div>
                </td>
                <td>{row.helper || '—'}</td>
                <td>{row.value}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3}>Nessun dato da mostrare.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function AnalysisDashboard({ data }: AnalysisDashboardProps) {
  const [industryFilter, setIndustryFilter] = useState('all')
  const [activeLens, setActiveLens] = useState<AnalysisLens>('territorio')

  const industryOptions = useMemo(
    () => Array.from(new Set(data.companyRows.map((r) => r.industry).filter(Boolean) as string[])).sort(),
    [data.companyRows],
  )

  const filteredRows = useMemo(
    () => industryFilter === 'all' ? data.companyRows : data.companyRows.filter((r) => r.industry === industryFilter),
    [data.companyRows, industryFilter],
  )

  const topClientRows = useMemo<RankedRow[]>(
    () => data.topCustomers.slice(0, 8).map((item, index) => ({
      rank: index + 1,
      label: item.companyName,
      secondary: `${item.region} · ${item.sharePct}% share`,
      value: item.revenue,
    })),
    [data.topCustomers],
  )

  const territoryRows = useMemo<RankedRow[]>(
    () => data.regionSeries.slice(0, 8).map((item, index) => ({
      rank: index + 1,
      label: item.region,
      secondary: `${item.customers} clienti`,
      value: item.revenue,
    })),
    [data.regionSeries],
  )

  const groupedIndustryRows = useMemo<RankedRow[]>(() => {
    const map = new Map<string, { value: number; clients: number; orders: number }>()
    for (const row of filteredRows) {
      const key = normalizeIndustry(row.industry)
      const bucket = map.get(key) ?? { value: 0, clients: 0, orders: 0 }
      bucket.value += Number(row.importedValue || 0)
      bucket.clients += 1
      bucket.orders += Number(row.importedOrders || 0)
      map.set(key, bucket)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 8)
      .map(([label, bucket], index) => ({
        rank: index + 1,
        label,
        secondary: `${bucket.clients} clienti · ${bucket.orders} ordini`,
        value: bucket.value,
      }))
  }, [filteredRows])

  const channelRows = useMemo<RankedRow[]>(() => {
    const preferred = ['Rivenditori', 'Architetti', 'Agenzie', 'Contractor', 'Lighting designer', 'Designer', 'Studi', 'Altro']
    const map = new Map<string, { value: number; clients: number }>()
    for (const row of filteredRows) {
      const key = normalizeIndustry(row.industry)
      const bucket = map.get(key) ?? { value: 0, clients: 0 }
      bucket.value += Number(row.importedValue || 0)
      bucket.clients += 1
      map.set(key, bucket)
    }
    return preferred
      .filter((label) => map.has(label))
      .map((label, index) => ({
        rank: index + 1,
        label,
        secondary: `${map.get(label)!.clients} clienti`,
        value: map.get(label)!.value,
      }))
      .slice(0, 8)
  }, [filteredRows])

  const outstandingRows = useMemo(
    () => [...filteredRows]
      .filter((row) => (row.pipelineValue || 0) > 0 || (row.pendingFollowups || 0) > 0)
      .sort((a, b) => ((b.pipelineValue || 0) + (b.pendingFollowups || 0) * 1000) - ((a.pipelineValue || 0) + (a.pendingFollowups || 0) * 1000))
      .slice(0, 8)
      .map((row) => ({
        label: row.companyName,
        meta: row.industry || row.city || 'Senza dettaglio',
        helper: `${row.pendingFollowups || 0} follow-up · ${row.opportunities || 0} opportunità`,
        value: formatCurrency(row.pipelineValue || 0),
      })),
    [filteredRows],
  )

  const orderSnapshotRows = useMemo(
    () => [
      { label: 'Fatturato', meta: 'totale importato', helper: 'Ordini', value: formatCurrency(data.orderKpis.totalValue) },
      { label: 'Outstanding', meta: 'valore ancora aperto', helper: 'Da presidiare', value: formatCurrency(data.orderKpis.outstandingValue) },
      { label: 'Ticket medio', meta: 'media per ordine', helper: 'Base ordini', value: formatCurrency(data.orderKpis.averageOrderValue) },
      { label: 'Ordini', meta: 'volume ordini', helper: 'Totale righe', value: String(data.orderKpis.orderCount) },
    ],
    [data.orderKpis],
  )

  const statusSeries = useMemo(
    () => [
      { label: 'Clienti con segnali', value: data.crmKpis.companiesWithSignals },
      { label: 'Aziende attive', value: data.crmKpis.companies },
      { label: 'Opportunità aperte', value: data.crmKpis.openOpportunities },
      { label: 'Follow-up aperti', value: data.crmKpis.pendingFollowups },
    ],
    [data.crmKpis],
  )

  const valueSeries = useMemo(
    () => [
      { label: 'Fatturato', value: data.orderKpis.totalValue },
      { label: 'Outstanding', value: data.orderKpis.outstandingValue },
      { label: 'Ticket medio', value: data.orderKpis.averageOrderValue },
    ],
    [data.orderKpis],
  )

  const lensTitle = activeLens === 'territorio' ? 'Fatturato per regione' : activeLens === 'canale' ? 'Fatturato per canale' : 'Fatturato per tipo cliente'
  const lensSubtitle = activeLens === 'territorio'
    ? 'Lettura territoriale per capire dove si concentra il valore.'
    : activeLens === 'canale'
      ? 'Confronto tra rivenditori, architetti, agenzie e altri canali.'
      : 'Vista business per capire quali tipologie cliente generano più valore.'
  const lensRows = activeLens === 'territorio' ? territoryRows : activeLens === 'canale' ? channelRows : groupedIndustryRows

  const monitorRows = filteredRows.slice(0, 5)
  const extraMonitorRows = filteredRows.slice(5, 12)

  return (
    <div className="page-stack analysis-v2-page">
      <section className="panel-card analysis-hero-v2">
        <div>
          <p className="page-eyebrow">Revenue intelligence</p>
          <h1 className="page-title">Analisi clienti e azioni AI</h1>
          <p className="page-subtitle">Trasforma i dati degli ordini in suggerimenti concreti per il team commerciale.</p>
        </div>
        <div className="analysis-hero-side">
          <label className="analysis-industry-filter">
            <span>Settore</span>
            <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
              <option value="all">Tutti i settori</option>
              {industryOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
        </div>
      </section>

      {!data.schemaReady ? (
        <section className="panel-card analysis-schema-warning">
          <strong>Import ordini non ancora attivo.</strong>
          <p>La lettura CRM funziona già. Per attivare ordini e storico, completa prima lo schema Supabase di Analisi.</p>
        </section>
      ) : null}

      <section className="analysis-kpi-grid">
        <article className="panel-card analysis-kpi-card"><span className="analysis-kpi-label">Fatturato</span><strong className="analysis-kpi-value">{formatCurrency(data.orderKpis.totalValue)}</strong></article>
        <article className="panel-card analysis-kpi-card"><span className="analysis-kpi-label">Clienti</span><strong className="analysis-kpi-value">{data.crmKpis.companies}</strong></article>
        <article className="panel-card analysis-kpi-card"><span className="analysis-kpi-label">Ticket Medio</span><strong className="analysis-kpi-value">{formatCurrency(data.orderKpis.averageOrderValue)}</strong></article>
        <article className="panel-card analysis-kpi-card"><span className="analysis-kpi-label">Outstanding</span><strong className="analysis-kpi-value">{formatCurrency(data.orderKpis.outstandingValue)}</strong></article>
        <article className="panel-card analysis-kpi-card"><span className="analysis-kpi-label">Ordini</span><strong className="analysis-kpi-value">{data.orderKpis.orderCount}</strong></article>
        <article className="panel-card analysis-kpi-card"><span className="analysis-kpi-label">Alert AI</span><strong className="analysis-kpi-value">{data.crmKpis.companiesWithSignals}</strong></article>
      </section>

      <section className="analysis-chart-grid">
        <InlineBars title="Distribuzione KPI" items={statusSeries} formatter={(v) => String(v)} />
        <InlineBars title="Valori chiave" items={valueSeries} formatter={formatCurrency} />
      </section>

      <section className="panel-card analysis-lens-card">
        <div className="analysis-lens-head">
          <div>
            <p className="page-eyebrow">Business view</p>
            <h2>Regione, canale o tipo cliente</h2>
          </div>
        </div>
        <div className="analysis-lens-tabs" role="tablist" aria-label="Vista analisi">
          <button type="button" className={`analysis-lens-tab ${activeLens === 'territorio' ? 'is-active' : ''}`} onClick={() => setActiveLens('territorio')}>Territorio</button>
          <button type="button" className={`analysis-lens-tab ${activeLens === 'canale' ? 'is-active' : ''}`} onClick={() => setActiveLens('canale')}>Canale</button>
          <button type="button" className={`analysis-lens-tab ${activeLens === 'tipo' ? 'is-active' : ''}`} onClick={() => setActiveLens('tipo')}>Tipo cliente</button>
        </div>
      </section>

      <section className="analysis-chart-grid analysis-chart-grid-rich">
        <RankedBarsCard
          title="Fatturato clienti"
          subtitle="Top account per valore importato, con ranking + grafico."
          items={topClientRows}
        />
        <RankedBarsCard
          title={lensTitle}
          subtitle={lensSubtitle}
          items={lensRows}
        />
      </section>

      <section className="analysis-chart-grid analysis-chart-grid-rich">
        <InsightTableCard
          title="Outstanding / pipeline"
          subtitle="I clienti con più valore aperto o azioni da presidiare."
          rows={outstandingRows}
        />
        <InsightTableCard
          title={activeLens === 'territorio' ? 'Dettaglio regione' : activeLens === 'canale' ? 'Dettaglio canale' : 'Dettaglio tipo cliente'}
          subtitle="Tabella di supporto alla vista attiva."
          rows={lensRows.map((row) => ({
            label: row.label,
            meta: row.secondary,
            helper: `${percentOf(row.value, lensRows.reduce((sum, item) => sum + item.value, 0))} del totale`,
            value: formatCurrency(row.value),
          }))}
        />
      </section>

      <section className="analysis-grid analysis-grid-bottom">
        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head">
            <div><p className="page-eyebrow">Priorità</p><h2>Azioni immediate</h2></div>
          </div>
          <div className="apple-list-stack">
            {data.actionPlan.length ? data.actionPlan.slice(0, 5).map((item, i) => (
              <div key={i} className="apple-action-row">
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.companyName} • <span style={{fontWeight:600}}>{item.detail}</span></span>
                </div>
                <div className="apple-action-side">
                  <span className={`dashboard-pill-badge ${priorityTone(item.priority)}`}>{item.priority}</span>
                  <CreateFollowupButton companyId={item.companyId} title={item.title} description={item.detail} priority={item.priority} compact />
                </div>
              </div>
            )) : <div className="dashboard-widget-empty apple-empty">Nessuna azione immediata.</div>}
          </div>
        </div>

        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head">
            <div><p className="page-eyebrow">Intelligence</p><h2>Aziende da seguire</h2></div>
          </div>
          <div className="apple-list-stack">
            {monitorRows.map((row) => (
              <Link key={row.companyId} href={`/companies/${row.companyId}`} className="apple-best-row">
                <div>
                  <strong>{row.companyName}</strong>
                  <span>{row.insight || 'Analisi in corso...'}</span>
                </div>
                <div className="apple-best-meta">
                  <strong>{row.priorityScore || 0}/100</strong>
                </div>
              </Link>
            ))}
          </div>
          {extraMonitorRows.length ? (
            <details className="crm-more-details">
              <summary>Apri altre {extraMonitorRows.length} aziende</summary>
              <div className="apple-list-stack">
                {extraMonitorRows.map((row) => (
                  <Link key={row.companyId} href={`/companies/${row.companyId}`} className="apple-best-row">
                    <div>
                      <strong>{row.companyName}</strong>
                      <span>{row.insight || 'Analisi in corso...'}</span>
                    </div>
                    <div className="apple-best-meta">
                      <strong>{row.priorityScore || 0}/100</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </section>

      <details className="analysis-secondary-details analysis-details-block redesigned-details" open={false}>
        <summary>Apri movers, AI e import</summary>
        <div className="analysis-details-redesign-grid">
          <section className="panel-card analysis-chart-card">
            <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Trend</p><h2>Movers</h2></div></div>
            <div className="analysis-movers-grid">
              <div>
                <p style={{fontSize:'.75rem', fontWeight:800, color:'var(--muted)', marginBottom:'12px'}}>GROWTH</p>
                <div className="apple-list-stack">
                  {data.growthLeaders.slice(0,3).map((g) => (
                    <div key={g.companyId} className="apple-best-row" style={{minHeight:'60px', padding:'10px 14px'}}>
                      <strong>{g.companyName}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p style={{fontSize:'.75rem', fontWeight:800, color:'var(--muted)', marginBottom:'12px'}}>DECLINE</p>
                <div className="apple-list-stack">
                  {data.declineLeaders.slice(0,3).map((d) => (
                    <div key={d.companyId} className="apple-best-row" style={{minHeight:'60px', padding:'10px 14px'}}>
                      <strong>{d.companyName}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="panel-card analysis-chart-card">
            <div className="dashboard-redesign-head"><div><p className="page-eyebrow">AI</p><h2>Azioni suggerite</h2></div></div>
            <div className="apple-list-stack">
              {data.aiCustomerActions.length ? data.aiCustomerActions.slice(0, 5).map((item, index) => (
                <div key={`${item.companyId}-${index}`} className="apple-action-row">
                  <div>
                    <strong>{item.nextAction}</strong>
                    <span>{item.companyName} · {item.reason}</span>
                  </div>
                  <div className="apple-action-side">
                    <span className="dashboard-pill-badge">{item.priority}</span>
                  </div>
                </div>
              )) : <div className="dashboard-widget-empty apple-empty">Nessuna azione AI disponibile.</div>}
            </div>
          </section>

          <section className="panel-card analysis-chart-card">
            <AnalysisImportCard
              companies={data.companiesForImport}
              title="Importa nuovi ordini"
              description="Aggiorna il database per ricalcolare i suggerimenti AI."
              submitLabel="Esegui Import"
            />
          </section>
        </div>
      </details>
    </div>
  )
}
