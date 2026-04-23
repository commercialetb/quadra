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

function toneForPriority(value: Priority) {
  return value === 'urgent' ? 'danger' : value === 'high' ? 'warning' : ''
}

function toneForSignal(value: 'high' | 'medium' | 'low') {
  return value === 'high' ? 'danger' : value === 'medium' ? 'warning' : ''
}

export function CompanyAnalysisCard({ data }: { data: CompanyAnalysisData | null }) {
  if (!data) return null

  const topAction = data.actionPlan[0] ?? null
  const summary = [
    { label: 'Ultimo contatto', value: data.activeFollowups[0]?.due_at ? formatDate(data.activeFollowups[0].due_at) : (data.companyRow.pendingFollowups > 0 ? `${data.companyRow.pendingFollowups} attivi` : 'Nessuno') },
    { label: 'Opportunità aperte', value: String(data.companyRow.opportunities) },
    { label: 'Ultimo ordine', value: data.companyRow.lastOrderDate ? formatDate(data.companyRow.lastOrderDate) : 'Nessun dato' },
    { label: 'Pipeline', value: formatCurrency(data.companyRow.pipelineValue) },
  ]

  return (
    <section className="panel-card company-analysis-redesign">
      <div className="dashboard-redesign-head">
        <div>
          <p className="page-eyebrow">Scheda decisione</p>
          <h2>Sintesi azienda</h2>
        </div>
        <div className="cluster-wrap company-analysis-top-actions">
          <span className={`dashboard-pill-badge ${toneForSignal(data.companyRow.signal)}`}>{data.companyRow.signal}</span>
          <span className={`dashboard-pill-badge ${data.companyRow.priorityBand === 'alta' ? 'danger' : data.companyRow.priorityBand === 'media' ? 'warning' : ''}`}>{data.companyRow.priorityScore}/100</span>
          <Link href="/analysis" className="ghost-button">Apri insight</Link>
        </div>
      </div>

      <p className="company-analysis-lead-redesign">{data.companyRow.insight}</p>

      <div className="company-decision-grid">
        <div className="company-next-action-card">
          <span>Prossima azione</span>
          {topAction ? (
            <>
              <strong>{topAction.title}</strong>
              <p>{topAction.detail}</p>
              <div className="cluster-wrap">
                <span className={`dashboard-pill-badge ${toneForPriority(topAction.priority)}`}>{topAction.priority}</span>
                <CreateFollowupButton
                  companyId={data.companyRow.companyId}
                  title={topAction.title}
                  description={topAction.detail}
                  priority={topAction.priority}
                  defaultDueInDays={topAction.priority === 'urgent' ? 1 : topAction.priority === 'high' ? 2 : 7}
                  compact
                />
              </div>
            </>
          ) : (
            <>
              <strong>Continuare presidio</strong>
              <p>Nessuna urgenza critica. Mantieni il contatto attivo.</p>
            </>
          )}
        </div>

        <div className="company-summary-grid-redesign">
          {summary.map((item) => (
            <article key={item.label} className="company-summary-card-redesign">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </div>

      <details className="analysis-details-block redesigned-details">
        <summary>Approfondisci</summary>
        <div className="company-analysis-details-grid-redesign">
          <section className="panel-card subtle-panel">
            <div className="dashboard-redesign-head compact"><h3>Azioni suggerite</h3></div>
            <div className="apple-list-stack">
              {data.suggestions.length ? data.suggestions.slice(0, 4).map((item) => (
                <div key={item.title} className="apple-action-row">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                  <CreateFollowupButton companyId={data.companyRow.companyId} title={item.title} description={item.description} priority={item.priority} compact />
                </div>
              )) : <div className="dashboard-widget-empty apple-empty">Nessuna azione critica da mostrare.</div>}
            </div>
          </section>

          <section className="panel-card subtle-panel">
            <div className="dashboard-redesign-head compact"><h3>Pipeline e follow-up</h3></div>
            <div className="apple-list-stack">
              {data.openOpportunities.slice(0, 3).map((item) => (
                <Link key={item.id} href={`/opportunities/${item.id}`} className="apple-list-row">
                  <div>
                    <strong>{item.title || 'Opportunità'}</strong>
                    <span>{item.stage} · {formatCurrency(item.value_estimate ?? 0)}</span>
                  </div>
                </Link>
              ))}
              {data.activeFollowups.slice(0, 3).map((item) => (
                <div key={item.id} className="apple-list-row static-row">
                  <div>
                    <strong>{item.title || 'Follow-up'}</strong>
                    <span>{item.status} · {formatDate(item.due_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-card subtle-panel">
            <div className="dashboard-redesign-head compact"><h3>Ordini e alert</h3></div>
            <div className="apple-list-stack">
              {data.recentOrders.slice(0, 4).map((order) => (
                <div key={order.id ?? order.bega_order} className="apple-list-row static-row">
                  <div>
                    <strong>{order.bega_order}</strong>
                    <span>{formatDate(order.order_date)} · {order.status || '—'}</span>
                  </div>
                  <strong>{formatCurrency(order.total_eur)}</strong>
                </div>
              ))}
              {!data.recentOrders.length ? <div className="dashboard-widget-empty apple-empty">Nessun ordine collegato.</div> : null}
            </div>
            {!data.schemaReady ? <p className="analysis-inline-warning">La parte ordini si completa appena attivi lo schema Analisi in Supabase.</p> : null}
          </section>
        </div>
      </details>
    </section>
  )
}
