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

type SeriesItem = { label: string; value: number }
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
    highlights: string[]
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
              {industryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="analysis-kpi-grid">
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Fatturato totale</span>
          <strong className="analysis-kpi-value">{formatCurrency(data.orderKpis.totalValue)}</strong>
          <small className="analysis-kpi-helper">Ordini importati</small>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Clienti CRM</span>
          <strong className="analysis-kpi-value">{data.crmKpis.companies}</strong>
          <small className="analysis-kpi-helper">Anagrafiche attive</small>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Ticket Medio</span>
          <strong className="analysis-kpi-value">{formatCurrency(data.orderKpis.averageOrderValue)}</strong>
          <small className="analysis-kpi-helper">Valore medio ordine</small>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Outstanding</span>
          <strong className="analysis-kpi-value">{formatCurrency(data.orderKpis.outstandingValue)}</strong>
          <small className="analysis-kpi-helper">Esposizione aperta</small>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Ordini</span>
          <strong className="analysis-kpi-value">{data.orderKpis.orderCount}</strong>
          <small className="analysis-kpi-helper">Storico totale</small>
        </article>
        <article className="panel-card analysis-kpi-card">
          <span className="analysis-kpi-label">Segnali AI</span>
          <strong className="analysis-kpi-value">{data.crmKpis.companiesWithSignals}</strong>
          <small className="analysis-kpi-helper">Aziende da attenzionare</small>
        </article>
      </section>

      <section className="analysis-grid analysis-grid-top">
        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Clienti</p><h2>Top clienti</h2></div></div>
          <div className="analysis-top-customers-list">
            {data.topCustomers.map((row, i) => (
              <div key={row.companyId} className="analysis-top-customer-row">
                <div className="analysis-top-customer-rank">{i + 1}</div>
                <div className="analysis-top-customer-main">
                  <div className="analysis-top-customer-head"><strong>{row.companyName}</strong></div>
                  <div className="analysis-top-customer-sub"><span>{row.region}</span><span>{row.sharePct}% del totale</span></div>
                </div>
                <div className="analysis-top-customer-value">{formatCurrency(row.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Visuale</p><h2>Fatturato per regione</h2></div></div>
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

      <section className="analysis-grid analysis-grid-middle">
        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Geografia</p><h2>Dettaglio regioni</h2></div></div>
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
          <div className="dashboard-redesign-head"><div><p className="page-eyebrow">Trend</p><h2>Variazioni</h2></div></div>
          <div className="analysis-movers-grid">
            <div>
              <p style={{fontSize:'.8rem', fontWeight:700, marginBottom:'10px', color:'var(--muted)'}}>IN CRESCITA</p>
              <div className="apple-list-stack">
                {data.growthLeaders.slice(0,3).map(g => (
                  <div key={g.companyId} className="apple-best-row">
                    <div><strong>{g.companyName}</strong><span>{formatCurrency(g.revenue)}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{fontSize:'.8rem', fontWeight:700, marginBottom:'10px', color:'var(--muted)'}}>IN CALO</p>
              <div className="apple-list-stack">
                {data.declineLeaders.slice(0,3).map(d => (
                  <div key={d.companyId} className="apple-best-row">
                    <div><strong>{d.companyName}</strong><span>{formatCurrency(d.revenue)}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="analysis-grid analysis-grid-bottom">
        <div className="panel-card analysis-chart-card">
          <div className="dashboard-redesign-head">
            <div><p className="page-eyebrow">Priorità</p><h2>Azioni immediate</h2></div>
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
                  <span>{row.insight || 'Nessun segnale particolare'}</span>
                </div>
                <div className="apple-best-meta">
                  <strong>{row.priorityScore || 0}/100</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="panel-card analysis-chart-card">
        <AnalysisImportCard
          companies={data.companiesForImport}
          title="Importa nuovi ordini"
          description="Carica i CSV per aggiornare i trend e i suggerimenti AI."
          submitLabel="Avvia Import"
        />
      </section>
    </div>
  )
}
