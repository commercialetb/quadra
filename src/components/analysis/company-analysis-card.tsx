import Link from 'next/link'
import { CreateFollowupButton } from '@/components/analysis/create-followup-button'
import { formatCurrency, formatDate } from '@/lib/format'

type Priority = 'medium' | 'high' | 'urgent'

type CompanyAnalysisData = {
  companyRow: {
    companyId: string
    companyName: string
    signal: 'high' | 'medium' | 'low'
    insight: string
    opportunities: number
    pipelineValue: number
    pendingFollowups: number
    overdueFollowups: number
    importedOrders: number
    importedValue: number
    lastOrderDate: string | null
    potentialScore: number
    riskScore: number
    priorityScore: number
    priorityBand: 'alta' | 'media' | 'base'
  }
  orderKpis: {
    totalValue: number
    outstandingValue: number
    averageOrderValue: number
    orderCount: number
  }
  monthlySeries: Array<{ label: string; value: number }>
  recentOrders: Array<{ id?: string; order_date: string; bega_order: string; status: string; total_eur: number }>
  openOpportunities: Array<{ id: string; title?: string | null; stage: string; value_estimate: number | null }>
  activeFollowups: Array<{ id: string; title?: string | null; status: string; due_at: string }>
  suggestions: Array<{ title: string; description: string; priority: Priority }>
  actionPlan: Array<{ title: string; detail: string; priority: Priority; lane: string }>
  priorityBuckets: { callNow: Array<any>; reactivate: Array<any>; monitor: Array<any> }
  signals: Array<{ id: string; title: string; description: string | null; severity: string; status: string }>
  schemaReady: boolean
}

function SignalPill({ level }: { level: 'high' | 'medium' | 'low' }) {
  return <span className={`analysis-signal-pill is-${level}`}>{level === 'high' ? 'Alta' : level === 'medium' ? 'Media' : 'Bassa'}</span>
}

function PriorityBadge({ value }: { value: Priority }) {
  return <span className={`dashboard-pill-badge ${value === 'urgent' ? 'danger' : value === 'high' ? 'warning' : ''}`}>{value}</span>
}

function ScoreBadge({ score, band }: { score: number; band: 'alta' | 'media' | 'base' }) {
  return <span className={`dashboard-pill-badge ${band === 'alta' ? 'danger' : band === 'media' ? 'warning' : ''}`}>{score}/100</span>
}

export function CompanyAnalysisCard({ data }: { data: CompanyAnalysisData | null }) {
  if (!data) return null

  const latestMonth = data.monthlySeries.at(-1)
  const topAction = data.actionPlan[0] ?? null
  const pressureItems = [
    { label: 'Agenda', value: data.companyRow.overdueFollowups > 0 ? 'Da chiudere' : data.companyRow.pendingFollowups > 0 ? 'Presidiata' : 'Scoperta' },
    { label: 'Pipeline', value: data.companyRow.opportunities > 0 ? `${data.companyRow.opportunities} attive` : 'Assente' },
    { label: 'Ordini', value: data.companyRow.importedOrders > 0 ? `${data.companyRow.importedOrders} importati` : 'Nessun dato' },
  ]

  const summaryItems = [
    { label: 'Priorità', value: `${data.companyRow.priorityScore}/100` },
    { label: 'Pipeline', value: formatCurrency(data.companyRow.pipelineValue) },
    { label: 'Follow-up', value: data.companyRow.pendingFollowups > 0 ? `${data.companyRow.pendingFollowups} attivi` : 'Nessuno' },
    { label: 'Ultimo ordine', value: data.companyRow.lastOrderDate ? formatDate(data.companyRow.lastOrderDate) : 'Nessun dato' },
  ]

  return (
    <section className="panel-card company-analysis-card company-analysis-card-v21">
      <div className="panel-head compact company-analysis-topbar">
        <div>
          <p className="page-eyebrow">Analisi</p>
          <h2>Sintesi azienda</h2>
        </div>
        <div className="cluster-wrap company-analysis-top-actions">
          <SignalPill level={data.companyRow.signal} />
          <ScoreBadge score={data.companyRow.priorityScore} band={data.companyRow.priorityBand} />
          <Link href="/analysis" className="ghost-button">Apri Analisi</Link>
        </div>
      </div>

      <div className="company-analysis-mini-strip">
        {pressureItems.map((item) => (
          <div key={item.label} className="company-analysis-mini-pill">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <p className="settings-copy company-analysis-lead company-analysis-lead-v23">{data.companyRow.insight}</p>

      <div className="company-analysis-summary-grid">
        {summaryItems.map((item) => (
          <div key={item.label} className="company-analysis-summary-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="company-analysis-primary-grid">
        <div className="company-analysis-block company-analysis-priority-block">
          <div className="company-analysis-block-head">
            <h3>Priorità consigliata</h3>
            {topAction ? <PriorityBadge value={topAction.priority} /> : null}
          </div>
          {topAction ? (
            <div className="company-analysis-priority-row">
              <div>
                <strong>{topAction.title}</strong>
                <span>{topAction.detail}</span>
              </div>
              <CreateFollowupButton
                companyId={data.companyRow.companyId}
                title={topAction.title}
                description={topAction.detail}
                priority={topAction.priority}
                defaultDueInDays={topAction.priority === 'urgent' ? 1 : topAction.priority === 'high' ? 2 : 7}
                compact
              />
            </div>
          ) : (
            <div className="simple-row static"><div><strong>Situazione ordinata</strong><span>Nessuna priorità critica: mantieni il presidio attuale.</span></div></div>
          )}
        </div>
      </div>

      <details className="analysis-details-block company-analysis-drawer">
        <summary>Approfondisci analisi</summary>
        <div className="company-analysis-drawer-body">
          <div className="company-analysis-grid">
            <div className="company-analysis-block">
              <h3>Azioni consigliate</h3>
              <div className="simple-list compact-list">
                {data.suggestions.length > 0 ? data.suggestions.slice(0, 2).map((item) => (
                  <div key={item.title} className="simple-row static company-analysis-suggestion-row">
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </div>
                    <CreateFollowupButton
                      companyId={data.companyRow.companyId}
                      title={item.title}
                      description={item.description}
                      priority={item.priority}
                      compact
                    />
                  </div>
                )) : (
                  <div className="simple-row static"><div><strong>Nessuna azione critica</strong><span>La situazione appare sotto controllo.</span></div></div>
                )}
              </div>
            </div>

            <div className="company-analysis-block">
              <h3>Pipeline e agenda</h3>
              <div className="simple-list compact-list">
                {data.openOpportunities.length > 0 ? data.openOpportunities.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/opportunities/${item.id}`} className="simple-row">
                    <div>
                      <strong>{item.title || 'Opportunità'}</strong>
                      <span>{item.stage} · {formatCurrency(item.value_estimate ?? 0)}</span>
                    </div>
                  </Link>
                )) : null}
                {data.activeFollowups.length > 0 ? data.activeFollowups.slice(0, 3).map((item) => (
                  <div key={item.id} className="simple-row static">
                    <div>
                      <strong>{item.title || 'Follow-up'}</strong>
                      <span>{item.status} · {formatDate(item.due_at)}</span>
                    </div>
                  </div>
                )) : null}
                {data.openOpportunities.length === 0 && data.activeFollowups.length === 0 ? (
                  <div className="simple-row static"><div><strong>Nessun presidio attivo</strong><span>Conviene aprire una prossima azione da Follow-up.</span></div></div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="company-analysis-grid">
            <div className="company-analysis-block">
              <h3>Dati chiave</h3>
              <div className="company-analysis-context-grid company-analysis-context-grid-v23">
                <div className="company-analysis-context-card"><span>Ultimo ordine</span><strong>{formatDate(data.companyRow.lastOrderDate)}</strong></div>
                <div className="company-analysis-context-card"><span>Outstanding</span><strong>{formatCurrency(data.orderKpis.outstandingValue)}</strong></div>
                <div className="company-analysis-context-card"><span>Ticket medio</span><strong>{formatCurrency(data.orderKpis.averageOrderValue)}</strong></div>
                <div className="company-analysis-context-card"><span>Ultimo mese</span><strong>{latestMonth ? `${latestMonth.label} · ${formatCurrency(latestMonth.value)}` : 'Nessun dato'}</strong></div>
              </div>
            </div>
          </div>

          <div className="company-analysis-grid">
            <div className="company-analysis-block">
              <h3>Ordini e alert</h3>
              <div className="simple-list compact-list">
                {data.recentOrders.length > 0 ? data.recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id ?? order.bega_order} className="simple-row static">
                    <div>
                      <strong>{order.bega_order}</strong>
                      <span>{formatDate(order.order_date)} · {order.status || '—'} · {formatCurrency(order.total_eur)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="simple-row static"><div><strong>Nessun ordine collegato</strong><span>La scheda resta leggibile anche senza import.</span></div></div>
                )}
                {data.signals.slice(0, 2).map((signal) => (
                  <div key={signal.id} className="simple-row static company-analysis-suggestion-row">
                    <div>
                      <strong>{signal.title}</strong>
                      <span>{signal.description || `${signal.severity} · ${signal.status}`}</span>
                    </div>
                    <CreateFollowupButton
                      companyId={data.companyRow.companyId}
                      title={`Presidio: ${signal.title}`}
                      description={signal.description || `${signal.severity} · ${signal.status}`}
                      priority={signal.severity === 'high' ? 'urgent' : signal.severity === 'medium' ? 'high' : 'medium'}
                      createLabel="Presidia"
                      defaultDueInDays={signal.severity === 'high' ? 1 : 3}
                      compact
                    />
                  </div>
                ))}
              </div>
              {!data.schemaReady ? <p className="analysis-inline-warning">La parte ordini si completa appena attivi lo schema Analisi in Supabase.</p> : null}
            </div>

            <div className="company-analysis-block">
              <h3>Dati chiave</h3>
              <div className="simple-list compact-list">
                <div className="simple-row static"><div><strong>Priorità attuale</strong><span>{data.companyRow.priorityBand === 'alta' ? 'Alta' : data.companyRow.priorityBand === 'media' ? 'Media' : 'Base'}</span></div></div>
                <div className="simple-row static"><div><strong>Pipeline + ordini</strong><span>{formatCurrency(data.companyRow.pipelineValue + data.companyRow.importedValue)}</span></div></div>
                <div className="simple-row static"><div><strong>Copertura agenda</strong><span>{data.companyRow.pendingFollowups > 0 ? 'Esiste prossima azione' : 'Manca prossima azione'}</span></div></div>
                <div className="simple-row static"><div><strong>Indicazione</strong><span>{topAction ? topAction.title : 'Continuare monitoraggio'}</span></div></div>
              </div>
            </div>
          </div>
        </div>
      </details>
    </section>
  )
}
