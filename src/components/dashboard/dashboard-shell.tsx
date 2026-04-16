import { followupStatusLabel, priorityLabel, stageLabel } from '@/lib/crm-labels'
import { formatCurrency } from '@/lib/format'

function focusText(item: any) {
  const isDeal = Object.prototype.hasOwnProperty.call(item, 'stage')
  if (isDeal) return `${stageLabel(item.stage)} · trattativa ferma`
  return `${followupStatusLabel(item.status)} · ${priorityLabel(item.priority)}`
}

function focusIcon(item: any) {
  const isDeal = Object.prototype.hasOwnProperty.call(item, 'stage')
  if (isDeal) return '✎'
  if (item.status === 'overdue') return '⚠'
  return '✅'
}

function VoiceMiniBar() {
  return (
    <div className="quadra-inline-voicebar" aria-label="Voice control bar">
      <span className="quadra-inline-mic">🎙</span>
      <span className="quadra-inline-wave"><i /><i /><i /><i /><i /><i /></span>
    </div>
  )
}

function MobileDashboard({ data }: { data: any }) {
  const dailyFocus = [...(data.todayFollowups || []), ...(data.staleOpportunities || [])].slice(0, 3)

  return (
    <section className="dashboard-mobile-faithful" aria-label="Dashboard mobile mockup">
      <div className="dashboard-mobile-banner">Oggi hai {data.kpis.todayCount} appuntamenti e {data.kpis.overdueCount} task critici</div>

      <div className="dashboard-mobile-phone-card dashboard-mobile-reference-card">
        <div className="dashboard-mobile-reference-head">
          <div>
            <h1>Bentornato,</h1>
            <p>User Name</p>
          </div>
        </div>

        <article className="dashboard-mobile-status-card faithful reference-tight">
          <span>Pipeline Status</span>
          <strong>{data.kpis.openCount} Trattative Aperte</strong>
          <b>{formatCurrency(data.kpis.pipelineValue || 0)}</b>
          <div className="dashboard-mini-line" />
        </article>

        <article className="dashboard-mobile-focus-card faithful reference-tight">
          <div className="dashboard-mobile-card-head">
            <span>Daily Focus</span>
            <span>›</span>
          </div>
          <div className="dashboard-mobile-focus-list">
            {dailyFocus.length ? dailyFocus.map((item: any) => (
              <div key={item.id} className="dashboard-mobile-focus-item faithful soft-item">
                <span className="dashboard-mobile-focus-icon">{focusIcon(item)}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{focusText(item)}</p>
                </div>
              </div>
            )) : <div className="dashboard-mobile-focus-empty">Nessun promemoria urgente.</div>}
          </div>
        </article>
      </div>
    </section>
  )
}

function DesktopDashboard({ data }: { data: any }) {
  const focusItems = [...(data.todayFollowups || []), ...(data.staleOpportunities || [])].slice(0, 3)
  const openDeals = (data.openOpportunities || []).slice(0, 5)
  const contacts = (data.recentContacts || data.recentCompanies || []).slice(0, 6)

  return (
    <section className="dashboard-desktop-faithful" aria-label="Dashboard desktop mockup">
      <div className="dashboard-tablet-board">
        <div className="dashboard-tablet-topchrome">
          <span className="dashboard-reference-corner-brand">Q</span>
          <VoiceMiniBar />
          <div className="dashboard-topchrome-tools">⌕ ⦿</div>
        </div>

        <div className="dashboard-tablet-grid">
          <div className="dashboard-tablet-left">
            <article className="dashboard-reference-panel faithful-panel compact-panel">
              <h2>Bentornato,</h2>
              <p>User Name</p>
            </article>
            <article className="dashboard-reference-panel faithful-panel compact-panel lilac-panel">
              <span>Pipeline Status</span>
              <strong>{data.kpis.openCount} Trattative Aperte</strong>
              <b>{formatCurrency(data.kpis.pipelineValue || 0)}</b>
              <div className="dashboard-mini-line" />
            </article>
            <article className="dashboard-reference-panel faithful-panel compact-panel">
              <div className="dashboard-reference-panel-head"><span>Daily Focus</span><span>›</span></div>
              <div className="dashboard-reference-focus-list">
                {focusItems.length ? focusItems.map((item: any) => (
                  <div key={item.id} className="dashboard-reference-focus-item faithful-item soft-item">
                    <span className="dashboard-reference-dot">{focusIcon(item)}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{focusText(item)}</p>
                    </div>
                  </div>
                )) : <div className="dashboard-reference-empty">Nessun allarme. Ottimo segnale.</div>}
              </div>
            </article>
          </div>

          <div className="dashboard-tablet-center">
            <article className="dashboard-reference-panel faithful-panel compact-panel">
              <h2>Bentornato,</h2>
              <p>User Name</p>
            </article>
            <article className="dashboard-reference-panel faithful-panel compact-panel lilac-panel">
              <span>Pipeline Status</span>
              <strong>{data.kpis.openCount} Trattative Aperte</strong>
              <b>{formatCurrency(data.kpis.pipelineValue || 0)}</b>
              <div className="dashboard-mini-line" />
            </article>
            <article className="dashboard-reference-panel faithful-panel compact-panel">
              <div className="dashboard-reference-panel-head"><span>Pipeline Deals</span></div>
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

          <div className="dashboard-tablet-right">
            <article className="dashboard-reference-panel faithful-panel compact-panel">
              <div className="dashboard-reference-panel-head"><span>Contacts</span><span>›</span></div>
              <div className="dashboard-reference-contact-list">
                {contacts.length ? contacts.map((item: any) => (
                  <div key={item.id} className="dashboard-reference-contact-row faithful-item soft-item">
                    <span className="dashboard-reference-avatar">{(item.full_name || item.name || 'A').slice(0, 1)}</span>
                    <div>
                      <strong>{item.full_name || item.name}</strong>
                      <p>{item.role || item.city || 'Presenza CRM'}</p>
                    </div>
                  </div>
                )) : <div className="dashboard-reference-empty">Nessuna anagrafica recente.</div>}
              </div>
            </article>
            <article className="dashboard-reference-panel faithful-panel compact-panel mint-panel">
              <div className="dashboard-reference-panel-head"><span>Meeting Analytics</span></div>
              <div className="dashboard-reference-chart-value">60%</div>
              <div className="dashboard-reference-bars"><span /><span /><span /><span /></div>
            </article>
            <article className="dashboard-reference-panel faithful-panel compact-panel mint-panel">
              <div className="dashboard-reference-panel-head"><span>Meeting Insights</span></div>
              <div className="dashboard-reference-linechart" />
              <div className="dashboard-reference-chart-footer"><span>Jan</span><span>Mar</span><span>Apr</span><span>Jun</span></div>
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
