export function DashboardShell({ data }: { data: any }) {
  const recentCompanies = (data.recentCompanies || []).slice(0, 4)
  const recentActivities = (data.recentActivities || []).slice(0, 4)

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Workspace</p>
          <h1 className="page-title">Benvenuto.</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Oggi conta soprattutto questo: follow-up da chiudere e trattative da sbloccare.
          </p>
        </div>
      </section>

      <section className="today-grid">
        <article className="metric-card metric-primary">
          <span className="metric-label">Follow-up oggi</span>
          <strong className="metric-value">{data.kpis.todayCount}</strong>
          <span className="metric-note">Le azioni che meritano risposta prima di sera.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Da sbloccare</span>
          <strong className="metric-value">{data.kpis.overdueCount}</strong>
          <span className="metric-note">Scaduti o in ritardo.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Opportunita attive</span>
          <strong className="metric-value">{data.kpis.openCount}</strong>
          <span className="metric-note">Pipeline viva e in movimento.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Valore pipeline</span>
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
              <h2>Da fare oggi</h2>
              <p>Le azioni operative da tenere vicine.</p>
            </div>
          </div>
          <div className="task-list">
            {data.todayFollowups.length === 0 && data.staleOpportunities.length === 0 ? (
              <div className="empty-block">Nessun allarme. Ottimo segnale.</div>
            ) : null}
            {data.todayFollowups.map((item: any) => (
              <div key={item.id} className="task-item">
                <div>
                  <div className="task-title">{item.title}</div>
                  <div className="task-meta">Scade oggi · {item.priority}</div>
                </div>
                <span className="task-badge">oggi</span>
              </div>
            ))}
            {data.staleOpportunities.map((item: any) => (
              <div key={item.id} className="task-item">
                <div>
                  <div className="task-title">{item.title}</div>
                  <div className="task-meta">Trattativa ferma</div>
                </div>
                <span className="task-badge warning">ferma</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card quick-add-panel">
          <div className="panel-head">
            <div>
              <h2>Quick add</h2>
              <p>Parti subito senza passare da schermate lunghe.</p>
            </div>
          </div>
          <div className="quick-grid-cards">
            <a href="/companies" className="quick-card"><strong>Nuova azienda</strong><span>Crea una scheda pulita.</span></a>
            <a href="/contacts" className="quick-card"><strong>Nuovo contatto</strong><span>Persona, ruolo e contesto.</span></a>
            <a href="/opportunities" className="quick-card"><strong>Nuova opportunita</strong><span>Apri una trattativa in pochi tocchi.</span></a>
            <a href="/followups" className="quick-card"><strong>Nuovo follow-up</strong><span>Blocca subito la prossima azione.</span></a>
          </div>
        </section>
      </div>

      <div className="dashboard-grid two-up dashboard-two-up-mobile-order">
        <section className="panel-card mobile-priority-second">
          <div className="panel-head"><div><h2>Aziende recenti</h2><p>Le anagrafiche appena toccate.</p></div></div>
          <div className="simple-list compact-list">
            {recentCompanies.length === 0 ? <div className="empty-block">Nessuna azienda recente.</div> : recentCompanies.map((item: any) => (
              <a key={item.id} href={`/companies/${item.id}`} className="simple-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.city || 'Citta non indicata'} · {item.status}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="panel-card mobile-priority-first">
          <div className="panel-head"><div><h2>Attivita recenti</h2><p>Ultimi tocchi nel CRM.</p></div></div>
          <div className="simple-list compact-list">
            {recentActivities.length === 0 ? <div className="empty-block">Nessuna attivita recente.</div> : recentActivities.map((item: any) => (
              <div key={item.id} className="simple-row static">
                <div>
                  <strong>{item.subject || 'Attivita'}</strong>
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
