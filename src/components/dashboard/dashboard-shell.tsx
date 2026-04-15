import { AssistantPanel } from '@/components/ai/assistant-panel'
import { followupStatusLabel, priorityLabel, stageLabel } from '@/lib/crm-labels'

export function DashboardShell({ data }: { data: any }) {
  const recentCompanies = (data.recentCompanies || []).slice(0, 4)
  const recentActivities = (data.recentActivities || []).slice(0, 4)

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Dashboard CRM Predittiva e Vocale</p>
          <h1 className="page-title">Bentornato,</h1>
          <p className="page-subtitle dashboard-subtitle-compact">Inizia la UX vocale con Quadra, Siri, Gemini e GPT.</p>
        </div>
      </section>

      <section className="panel-card shortcut-callout">
        <div className="panel-head"><div><h2>Voice Control Bar</h2><p>Gestisci agenda, deal e contatti con la voce.</p></div></div>
        <div className="cluster-wrap">
          <a href="/capture/siri/install" className="secondary-button">Installa shortcuts</a>
          <a href="/capture/siri/review" className="ghost-button">Apri review</a>
        </div>
      </section>

      <section className="today-grid">
        <article className="metric-card metric-primary">
          <span className="metric-label">Daily Focus</span>
          <strong className="metric-value">{data.kpis.todayCount}</strong>
          <span className="metric-note">Priorità di oggi.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Meeting Insights</span>
          <strong className="metric-value">{data.kpis.overdueCount}</strong>
          <span className="metric-note">Scaduti o in ritardo.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Pipeline Deals</span>
          <strong className="metric-value">{data.kpis.openCount}</strong>
          <span className="metric-note">Trattative aperte.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Pipeline Status</span>
          <strong className="metric-value">
            {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.kpis.pipelineValue || 0)}
          </strong>
          <span className="metric-note">Stima sulle trattative aperte.</span>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="panel-card panel-card-accent">
          <div className="panel-head">
            <div>
              <h2>Focus Giornaliero</h2>
              <p>Le azioni operative da tenere vicine.</p>
            </div>
            <a href="/followups" className="secondary-button">Apri Agenda</a>
          </div>
          <div className="task-list">
            {data.todayFollowups.length === 0 && data.staleOpportunities.length === 0 ? (
              <div className="empty-block">Nessun allarme. Ottimo segnale.</div>
            ) : null}
            {data.todayFollowups.map((item: any) => (
              <a key={item.id} href="/followups" className="task-item clickable-task-item">
                <div>
                  <div className="task-title">{item.title}</div>
                  <div className="task-meta">Scade oggi · {priorityLabel(item.priority)} · {followupStatusLabel(item.status)}</div>
                </div>
                <span className="task-badge">oggi</span>
              </a>
            ))}
            {data.staleOpportunities.map((item: any) => (
              <a key={item.id} href={`/opportunities/${item.id}`} className="task-item clickable-task-item">
                <div>
                  <div className="task-title">{item.title}</div>
                  <div className="task-meta">{stageLabel(item.stage)} · trattativa ferma</div>
                </div>
                <span className="task-badge warning">ferma</span>
              </a>
            ))}
          </div>
        </section>

        <AssistantPanel data={data} />
      </div>


      <div className="dashboard-grid two-up dashboard-two-up-mobile-order">
        <section className="panel-card mobile-priority-second">
          <div className="panel-head"><div><h2>Contacts</h2><p>Anagrafica viva e subito azionabile.</p></div></div>
          <div className="simple-list compact-list">
            {recentCompanies.length === 0 ? <div className="empty-block">Nessuna azienda recente.</div> : recentCompanies.map((item: any) => (
              <a key={item.id} href={`/companies/${item.id}`} className="simple-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.city || 'Città non indicata'} · {item.status}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-grid two-up dashboard-two-up-mobile-order">
        <section className="panel-card mobile-priority-first">
          <div className="panel-head"><div><h2>Meeting Analytics</h2><p>Indicatori rapidi sulla giornata.</p></div></div>
          <div className="simple-list compact-list">
            {recentActivities.length === 0 ? <div className="empty-block">Nessuna attività recente.</div> : recentActivities.map((item: any) => (
              <div key={item.id} className="simple-row static">
                <div>
                  <strong>{item.subject || 'Attività'}</strong>
                  <span>{item.kind}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  )
}
