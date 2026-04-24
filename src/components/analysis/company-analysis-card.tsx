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
  const topSuggestion = data.suggestions[0] ?? null
  const topSignal = data.signals[0] ?? null
  const primaryOpportunity = data.openOpportunities[0] ?? null

  return (
    <section className="panel-card company-analysis-redesign simplified-company-analysis">
      <div className="dashboard-redesign-head">
        <div>
          <p className="page-eyebrow">Insight operativo</p>
          <h2>Perché questa azienda richiede attenzione</h2>
        </div>
        <div className="cluster-wrap company-analysis-top-actions">
          <span className={`dashboard-pill-badge ${toneForSignal(data.companyRow.signal)}`}>{data.companyRow.signal}</span>
          <span className={`dashboard-pill-badge ${data.companyRow.priorityBand === 'alta' ? 'danger' : data.companyRow.priorityBand === 'media' ? 'warning' : ''}`}>
            {data.companyRow.priorityScore}/100
          </span>
          <Link href="/analysis" className="ghost-button">Apri insight</Link>
        </div>
      </div>

      <p className="company-analysis-lead-redesign">{data.companyRow.insight}</p>

      <div className="company-analysis-snapshot-grid">
        <article className="company-summary-card-redesign panel-card">
          <span>Pipeline</span>
          <strong>{formatCurrency(data.companyRow.pipelineValue)}</strong>
          <small>{data.companyRow.opportunities} opportunità aperte</small>
        </article>
        <article className="company-summary-card-redesign panel-card">
          <span>Follow-up attivi</span>
          <strong>{data.companyRow.pendingFollowups}</strong>
          <small>{data.companyRow.overdueFollowups} in ritardo</small>
        </article>
        <article className="company-summary-card-redesign panel-card">
          <span>Ordini collegati</span>
          <strong>{data.companyRow.importedOrders}</strong>
          <small>{formatCurrency(data.companyRow.importedValue)}</small>
        </article>
      </div>

      <div className="company-analysis-why-grid">
        <article className="company-next-action-card panel-card">
          <span>Priorità consigliata</span>
          <strong>{topAction?.title || 'Mantieni presidio'}</strong>
          <p>{topAction?.detail || 'Non ci sono urgenze critiche, ma la relazione va tenuta calda.'}</p>
          {topAction ? (
            <CreateFollowupButton
              companyId={data.companyRow.companyId}
              title={topAction.title}
              description={topAction.detail}
              priority={topAction.priority}
              defaultDueInDays={topAction.priority === 'urgent' ? 1 : topAction.priority === 'high' ? 2 : 7}
              compact
            />
          ) : null}
        </article>

        <div className="apple-list-stack">
          {topSignal ? (
            <div className="apple-list-row static-row">
              <div>
                <strong>Segnale principale</strong>
                <span>{topSignal.title}{topSignal.description ? ` · ${topSignal.description}` : ''}</span>
              </div>
              <span className={`dashboard-pill-badge ${topSignal.severity === 'high' ? 'danger' : topSignal.severity === 'medium' ? 'warning' : ''}`}>{topSignal.severity}</span>
            </div>
          ) : null}

          {primaryOpportunity ? (
            <Link href={`/opportunities/${primaryOpportunity.id}`} className="apple-list-row">
              <div>
                <strong>Opportunità da seguire</strong>
                <span>{primaryOpportunity.title || 'Opportunità'} · {primaryOpportunity.stage}</span>
              </div>
              <strong>{formatCurrency(primaryOpportunity.value_estimate ?? 0)}</strong>
            </Link>
          ) : null}

          {topSuggestion ? (
            <div className="apple-list-row static-row">
              <div>
                <strong>Suggerimento utile</strong>
                <span>{topSuggestion.title} · {topSuggestion.description}</span>
              </div>
              <span className={`dashboard-pill-badge ${toneForPriority(topSuggestion.priority)}`}>{topSuggestion.priority}</span>
            </div>
          ) : null}

          {!topSignal && !primaryOpportunity && !topSuggestion ? (
            <div className="dashboard-widget-empty apple-empty">Nessun segnale rilevante da mostrare adesso.</div>
          ) : null}
        </div>
      </div>

      <details className="analysis-details-block redesigned-details">
        <summary>Apri dettaglio completo</summary>
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
