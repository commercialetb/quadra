import { followupStatusLabel, priorityLabel, stageLabel } from '@/lib/crm-labels'
import { formatCurrency } from '@/lib/format'

function MobileDashboard({ data }: { data: any }) {
  const dailyFocus = [...(data.todayFollowups || []), ...(data.staleOpportunities || [])].slice(0, 3)

  return (
    <section className="dashboard-mobile-reference" aria-label="Dashboard mobile ispirata al mockup">
      <div className="dashboard-mobile-banner">Oggi hai {data.kpis.todayCount} appuntamenti e {data.kpis.overdueCount} task critici</div>

      <div className="dashboard-mobile-heading">
        <h1>Bentornato,</h1>
        <p>User Name</p>
      </div>

      <article className="dashboard-mobile-status-card">
        <span>Pipeline Status</span>
        <strong>{data.kpis.openCount} Trattative Aperte</strong>
        <b>{formatCurrency(data.kpis.pipelineValue || 0)}</b>
        <div className="dashboard-mini-line" />
      </article>

      <article className="dashboard-mobile-focus-card">
        <div className="dashboard-mobile-card-head">
          <span>Daily Focus</span>
          <span>›</span>
        </div>
        <div className="dashboard-mobile-focus-list">
          {dailyFocus.length ? dailyFocus.map((item: any) => {
            const isDeal = Object.prototype.hasOwnProperty.call(item, 'stage')
            return (
              <div key={item.id} className={`dashboard-mobile-focus-item ${isDeal ? 'is-note' : ''}`}>
                <span className="dashboard-mobile-focus-icon">{isDeal ? '✎' : item.status === 'overdue' ? '⚠' : '✅'}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{isDeal ? `${stageLabel(item.stage)} · trattativa ferma` : `${followupStatusLabel(item.status)} · ${priorityLabel(item.priority)}`}</p>
                </div>
              </div>
            )
          }) : <div className="dashboard-mobile-focus-empty">Nessun promemoria urgente.</div>}
        </div>
      </article>
    </section>
  )
}

function DesktopDashboard({ data }: { data: any }) {
  const focusItems = [...(data.todayFollowups || []), ...(data.staleOpportunities || [])].slice(0, 3)
  const openDeals = (data.openOpportunities || []).slice(0, 5)
  const recentCompanies = (data.recentCompanies || []).slice(0, 6)

  return (
    <section className="dashboard-reference-desktop" aria-label="Dashboard desktop ispirata al mockup">
      <div className="dashboard-reference-device">
        <div className="dashboard-reference-device-topbar">
          <span className="dashboard-reference-corner-brand">Q</span>
          <div className="dashboard-reference-voice-pill">
            <span className="voice-mic" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 0 0 3.5-3.5V8a3.5 3.5 0 1 0-7 0v4a3.5 3.5 0 0 0 3.5 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 11.5a5.5 5.5 0 1 0 11 0M12 17v3M9 20h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="voice-wave voice-wave-live" />
            <span className="voice-more">•••</span>
          </div>
          <div className="dashboard-reference-utility-icons">⌂ ⌕ ⦿</div>
        </div>

        <div className="dashboard-reference-grid">
          <div className="dashboard-column dashboard-column-left">
            <article className="dashboard-reference-panel dashboard-reference-welcome">
              <h1>Bentornato,</h1>
              <p>User Name</p>
            </article>

            <article className="dashboard-reference-panel dashboard-reference-kpi">
              <span>Pipeline Status</span>
              <strong>{data.kpis.openCount} Trattative Aperte</strong>
              <b>{formatCurrency(data.kpis.pipelineValue || 0)}</b>
              <div className="dashboard-mini-line" />
            </article>

            <article className="dashboard-reference-panel dashboard-reference-list">
              <div className="dashboard-reference-panel-head">
                <span>Daily Focus</span>
                <span>›</span>
              </div>
              <div className="dashboard-reference-focus-list">
                {focusItems.length ? focusItems.map((item: any) => {
                  const isDeal = Object.prototype.hasOwnProperty.call(item, 'stage')
                  return (
                    <div key={item.id} className="dashboard-reference-focus-item">
                      <span className="dashboard-reference-dot">{isDeal ? '✎' : item.status === 'overdue' ? '⚠' : '✅'}</span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{isDeal ? `${stageLabel(item.stage)} · trattativa ferma` : `${priorityLabel(item.priority)} · ${followupStatusLabel(item.status)}`}</p>
                      </div>
                    </div>
                  )
                }) : <div className="dashboard-reference-empty">Nessun allarme. Ottimo segnale.</div>}
              </div>
            </article>
          </div>

          <div className="dashboard-column dashboard-column-center">
            <article className="dashboard-reference-panel dashboard-reference-welcome second">
              <h1>Bentornato,</h1>
              <p>User Name</p>
            </article>

            <article className="dashboard-reference-panel dashboard-reference-kpi">
              <span>Pipeline Status</span>
              <strong>{data.kpis.openCount} Trattative Aperte</strong>
              <b>{formatCurrency(data.kpis.pipelineValue || 0)}</b>
              <div className="dashboard-mini-line" />
            </article>

            <article className="dashboard-reference-panel dashboard-reference-table-panel">
              <div className="dashboard-reference-panel-head">
                <span>Pipeline Deals</span>
              </div>
              <div className="dashboard-reference-table">
                <div className="dashboard-reference-table-row dashboard-reference-table-head-row">
                  <span>Pipeline</span>
                  <span>Fase</span>
                  <span>Valore</span>
                </div>
                {openDeals.length ? openDeals.map((item: any) => (
                  <div key={item.id} className="dashboard-reference-table-row">
                    <span>{item.title}</span>
                    <span>{stageLabel(item.stage)}</span>
                    <span>{formatCurrency(item.value_estimate || 0)}</span>
                  </div>
                )) : <div className="dashboard-reference-empty">Nessuna trattativa aperta.</div>}
              </div>
            </article>
          </div>

          <div className="dashboard-column dashboard-column-right">
            <article className="dashboard-reference-panel dashboard-reference-contacts">
              <div className="dashboard-reference-panel-head">
                <span>Contacts</span>
                <span>›</span>
              </div>
              <div className="dashboard-reference-contact-list">
                {recentCompanies.length ? recentCompanies.map((item: any) => (
                  <div key={item.id} className="dashboard-reference-contact-row">
                    <span className="dashboard-reference-avatar">{item.name?.slice(0, 1) || 'A'}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.city || 'User Name Presence'}</p>
                    </div>
                  </div>
                )) : <div className="dashboard-reference-empty">Nessuna anagrafica recente.</div>}
              </div>
            </article>

            <article className="dashboard-reference-panel dashboard-reference-chart-panel">
              <div className="dashboard-reference-panel-head"><span>Meeting Analytics</span></div>
              <div className="dashboard-reference-chart-value">60%</div>
              <div className="dashboard-reference-bars"><span /><span /><span /><span /></div>
            </article>

            <article className="dashboard-reference-panel dashboard-reference-chart-panel">
              <div className="dashboard-reference-panel-head"><span>Posting Insights</span></div>
              <div className="dashboard-reference-linechart" />
              <div className="dashboard-reference-chart-footer">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export function DashboardShell({ data }: { data: any }) {
  return (
    <div className="page-stack page-stack-reference-dashboard">
      <DesktopDashboard data={data} />
      <MobileDashboard data={data} />
    </div>
  )
}
