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

interface AnalysisDashboardProps {
  data: {
    crmKpis: { companies: number; openOpportunities: number; pendingFollowups: number; companiesWithSignals: number }
    orderKpis: { totalValue: number; orderCount: number; averageOrderValue: number; outstandingValue: number }
    companyRows: any[]
    topCustomers: TopCustomerRow[]
    concentrationMetrics: ConcentrationMetrics
    regionSeries: RegionRevenueRow[]
    growthLeaders: CustomerMoverRow[]
    declineLeaders: CustomerMoverRow[]
    aiCustomerActions: AiCustomerAction[]
    actionPlan: Array<{ companyId: string; companyName: string; title: string; detail: string; priority: FollowupPriority }>
    companiesForImport: Array<{ id: string; name: string }>
    schemaReady: boolean
  }
}

function priorityTone(v: FollowupPriority) {
  if (v === 'urgent') return 'danger'
  if (v === 'high') return 'warning'
  return ''
}

export function AnalysisDashboard({ data }: AnalysisDashboardProps) {
  const [industryFilter, setIndustryFilter] = useState('all')

  const industryOptions = useMemo(() => 
    Array.from(new Set(data.companyRows.map(r => r.industry).filter(Boolean))).sort(), 
    [data.companyRows]
  )

  const filteredRows = useMemo(() => 
    industryFilter === 'all' ? data.companyRows : data.companyRows.filter(r => r.industry === industryFilter),
    [data.companyRows, industryFilter]
  )

  return (
    <div className="page-stack analysis-v2-page">
      {/* HERO SECTION */}
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
              {industryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
        </div>
      </section>

      {/* KPI GRID */}
      <section className="analysis-kpi-grid">
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Fatturato</span>
          <strong className="analysis-kpi-value">{formatCurrency(data.orderKpis.totalValue)}</strong>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Clienti</span>
          <strong className="analysis-kpi-value">{data.crmKpis.companies}</strong>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Ticket Medio</span>
          <strong className="analysis-kpi-value">{formatCurrency(data.orderKpis.averageOrderValue)}</strong>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Outstanding</span>
          <strong className="analysis-kpi-value">{formatCurrency(data.orderKpis.outstandingValue)}</strong>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Ordini</span>
          <strong className="analysis-kpi-value">{data.orderKpis.orderCount}</strong>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Alert AI</span>
          <strong className="analysis-kpi-value">{data.crmKpis.companiesWithSignals}</strong>
        </article>
      </section>

      {/* TOP CHARTS */}
      <section className="analysis-grid analysis-grid-top">
        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Classifica</p><h2>Top clienti</h2></div></div>
          <div className="analysis-top-customers-list">
            {data.topCustomers.map((row, i) => (
              <div key={row.companyId} className="analysis-top-customer-row">
                <div style={{width: '24px', fontWeight: 800, color: 'var(--muted)'}}>{i + 1}</div>
                <div className="analysis-top-customer-main">
                  <strong>{row.companyName}</strong>
                  <div className="analysis-top-customer-sub"><span>{row.region}</span><span>{row.sharePct}% share</span></div>
                </div>
                <strong style={{fontSize: '1rem'}}>{formatCurrency(row.revenue)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Market share</p><h2>Regioni</h2></div></div>
          <div className="analysis-mini-bars">
            {data.regionSeries.slice(0, 6).map(reg => (
              <div key={reg.region} className="analysis-mini-bar-row">
                <div className="analysis-mini-bar-head"><span>{reg.region}</span><strong>{formatCurrency(reg.revenue)}</strong></div>
                <div className="analysis-mini-bar-track"><i style={{ width: `${(reg.revenue / data.orderKpis.totalValue) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOVERS & TABLES */}
      <section className="analysis-grid analysis-grid-middle">
        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Dati</p><h2>Dettaglio regionale</h2></div></div>
          <div className="analysis-table-wrap">
            <table className="analysis-table">
              <thead><tr><th>Regione</th><th>Clienti</th><th>Fatturato</th></tr></thead>
              <tbody>
                {data.regionSeries.map(r => (
                  <tr key={r.region}><td>{r.region}</td><td>{r.customers}</td><td>{formatCurrency(r.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Trend</p><h2>Movers</h2></div></div>
          <div className="analysis-movers-grid">
            <div>
              <p style={{fontSize:'.75rem', fontWeight:800, color:'var(--muted)', marginBottom:'12px'}}>GROWTH</p>
              <div className="apple-list-stack">
                {data.growthLeaders.slice(0,3).map(g => (
                  <div key={g.companyId} className="apple-best-row" style={{minHeight:'60px', padding:'10px 14px'}}>
                    <strong>{g.companyName}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{fontSize:'.75rem', fontWeight:800, color:'var(--muted)', marginBottom:'12px'}}>DECLINE</p>
              <div className="apple-list-stack">
                {data.declineLeaders.slice(0,3).map(d => (
                  <div key={d.companyId} className="apple-best-row" style={{minHeight:'60px', padding:'10px 14px'}}>
                    <strong>{d.companyName}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AZIONI IMMEDIATE & MONITORAGGIO */}
      <section className="analysis-grid analysis-grid-bottom">
        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head">
            <div><p className="page-eyebrow">Priorità</p><h2>Azioni immediate</h2></div>
          </div>
          <div className="apple-list-stack">
            {data.actionPlan.slice(0, 5).map((item, i) => (
              <div key={i} className="apple-action-row">
                <div>
                  {/* TITOLO SOPRA */}
                  <strong>{item.title}</strong>
                  {/* AZIENDA E SCADENZA SOTTO */}
                  <span>{item.companyName} • <span style={{fontWeight:600}}>{item.detail}</span></span>
                </div>
                <div className="apple-action-side">
                  <span className={`dashboard-pill-badge ${priorityTone(item.priority)}`}>{item.priority}</span>
                  <CreateFollowupButton companyId={item.companyId} title={item.title} description={item.detail} priority={item.priority} compact />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head">
            <div><p className="page-eyebrow">Intelligence</p><h2>Aziende da seguire</h2></div>
          </div>
          <div className="apple-list-stack">
            {filteredRows.slice(0, 5).map((row) => (
              <Link key={row.companyId} href={`/companies/${row.companyId}`} className="apple-best-row">
                <div>
                  <strong>{row.companyName}</strong>
                  <span>{row.insight || 'Analisi in corso...'}</span>
                </div>
                <div className="apple-best-meta">
                  <strong>{row.priorityScore}/100</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* IMPORT SECTION */}
      <section className="panel-card analysis-chart-card">
        <AnalysisImportCard
          companies={data.companiesForImport}
          title="Importa nuovi ordini"
          description="Aggiorna il database per ricalcolare i suggerimenti AI."
          submitLabel="Esegui Import"
        />
      </section>
    </div>
  )
}
