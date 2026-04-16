import Link from 'next/link'
import { AssistantPanel } from '@/components/ai/assistant-panel'
import { VoiceControlBar } from '@/components/voice-control-bar'
import { followupStatusLabel, priorityLabel, stageLabel } from '@/lib/crm-labels'

export function DashboardShell({ data }: { data: any }) {
  const recentCompanies = (data.recentCompanies || []).slice(0, 4)
  const recentContacts = (data.recentContacts || []).slice(0, 4)
  const recentActivities = (data.recentActivities || []).slice(0, 5)
  const todayFollowups = (data.todayFollowups || []).slice(0, 3)
  const staleOpportunities = (data.staleOpportunities || []).slice(0, 3)

  const pipelineValue = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(data.kpis.pipelineValue || 0)

  const compactValue = new Intl.NumberFormat('it-IT', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(data.kpis.pipelineValue || 0)

  return (
    <div className="page-stack dashboard-phase2">
      <section className="dashboard-showcase glass-panel">
        <div className="dashboard-showcase-copy">
          <div className="hero-pill-row">
            <span className="hero-chip">Dashboard CRM Predittiva e Vocale</span>
            <span className="hero-chip ghost">Siri · Gemini · GPT-4</span>
          </div>
          <p className="page-eyebrow">Bentornato</p>
          <h1 className="page-title">Quadra deve essere chiara, tappabile e davvero utile.</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Ho ripulito la scena: meno sovrapposizioni, card più leggibili, collegamenti reali ai record e una barra vocale che apre subito il workflow giusto.
          </p>

          <div className="showcase-mini-metrics">
            <article className="showcase-metric glass-pill">
              <span>Pipeline status</span>
              <strong>{pipelineValue}</strong>
            </article>
            <article className="showcase-metric glass-pill">
              <span>Trattative aperte</span>
              <strong>{data.kpis.openCount}</strong>
            </article>
            <article className="showcase-metric glass-pill">
              <span>Follow-up oggi</span>
              <strong>{data.kpis.todayCount}</strong>
            </article>
          </div>
        </div>

        <div className="dashboard-showcase-stage">
          <VoiceControlBar compact />

          <div className="stage-screen glass-panel">
            <div className="stage-screen-main">
              <div className="stage-card stage-card-welcome">
                <span className="stage-card-label">Bentornato</span>
                <strong>Workspace commerciale</strong>
                <div className="stage-metric-inline">
                  <span>Pipeline Status</span>
                  <b>{pipelineValue}</b>
                </div>
              </div>

              <div className="stage-card stage-card-focus">
                <div className="stage-card-head">
                  <span>Daily Focus</span>
                  <span>{data.kpis.todayCount} oggi</span>
                </div>
                <div className="stage-list">
                  {todayFollowups.length === 0 ? (
                    <div className="stage-list-item muted">Nessun follow-up urgente.</div>
                  ) : todayFollowups.map((item: any) => (
                    <Link key={item.id} href="/followups" className="stage-list-item stage-link-card">
                      <strong>{item.title}</strong>
                      <span>{priorityLabel(item.priority)} · {followupStatusLabel(item.status)}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="stage-card stage-card-pipeline">
                <div className="stage-card-head">
                  <span>Pipeline Deals</span>
                  <span>{data.kpis.openCount} aperte</span>
                </div>
                <div className="stage-table">
                  <div><span>Attive</span><strong>{data.kpis.openCount}</strong></div>
                  <div><span>Valore</span><strong>{compactValue}</strong></div>
                  <div><span>In ritardo</span><strong>{data.kpis.overdueCount}</strong></div>
                </div>
              </div>
            </div>

            <aside className="stage-screen-side">
              <div className="stage-card stage-card-contacts">
                <div className="stage-card-head">
                  <span>Contatti</span>
                  <span>apri scheda</span>
                </div>
                <div className="contact-rail">
                  {recentContacts.length === 0 ? (
                    <div className="stage-list-item muted">Nessun contatto recente.</div>
                  ) : recentContacts.map((item: any) => (
                    <Link key={item.id} href={`/contacts/${item.id}`} className="contact-rail-row stage-link-card">
                      <span className="contact-rail-avatar">{(item.first_name || item.full_name || 'Q').slice(0, 1).toUpperCase()}</span>
                      <div>
                        <strong>{item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim()}</strong>
                        <span>{item.companies?.name || 'Azienda non assegnata'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="stage-card stage-card-companies">
                <div className="stage-card-head">
                  <span>Aziende</span>
                  <span>CRM live</span>
                </div>
                <div className="contact-rail">
                  {recentCompanies.length === 0 ? (
                    <div className="stage-list-item muted">Nessuna azienda recente.</div>
                  ) : recentCompanies.map((item: any) => (
                    <Link key={item.id} href={`/companies/${item.id}`} className="contact-rail-row stage-link-card">
                      <span className="contact-rail-avatar">{(item.name || 'Q').slice(0, 1).toUpperCase()}</span>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.city || 'Località'} · {item.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="today-grid today-grid-premium quadra-kpi-row">
        <article className="metric-card metric-primary">
          <span className="metric-label">Follow-up oggi</span>
          <strong className="metric-value">{data.kpis.todayCount}</strong>
          <span className="metric-note">Azioni in agenda da chiudere.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Da sbloccare</span>
          <strong className="metric-value">{data.kpis.overdueCount}</strong>
          <span className="metric-note">Elementi in ritardo o scoperti.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Opportunità attive</span>
          <strong className="metric-value">{data.kpis.openCount}</strong>
          <span className="metric-note">Trattative in lavorazione.</span>
        </article>
        <article className="metric-card metric-soft-accent">
          <span className="metric-label">Contesto rapido</span>
          <strong className="metric-value">{recentCompanies.length + recentActivities.length + recentContacts.length}</strong>
          <span className="metric-note">Aggiornamenti recenti del CRM.</span>
        </article>
      </section>

      <div className="dashboard-grid dashboard-grid-phase2">
        <section className="panel-card panel-card-accent panel-card-elevated focus-panel-phase2">
          <div className="panel-head panel-head-spacious">
            <div>
              <h2>Focus giornaliero</h2>
              <p>Task di oggi e trattative ferme, senza rumore visivo e con CTA immediate.</p>
            </div>
            <Link href="/followups" className="secondary-button">Apri agenda</Link>
          </div>

          <div className="focus-columns">
            <div className="task-list task-list-premium">
              <div className="focus-column-title">Today</div>
              {todayFollowups.length === 0 ? <div className="empty-block">Nessuna azione urgente per oggi.</div> : null}
              {todayFollowups.map((item: any) => (
                <Link key={item.id} href="/followups" className="task-item clickable-task-item">
                  <div>
                    <div className="task-title">{item.title}</div>
                    <div className="task-meta">Scade oggi · {priorityLabel(item.priority)} · {followupStatusLabel(item.status)}</div>
                  </div>
                  <span className="task-badge">oggi</span>
                </Link>
              ))}
            </div>

            <div className="task-list task-list-premium">
              <div className="focus-column-title">Pipeline ferma</div>
              {staleOpportunities.length === 0 ? <div className="empty-block">Nessuna opportunità bloccata.</div> : null}
              {staleOpportunities.map((item: any) => (
                <Link key={item.id} href={`/opportunities/${item.id}`} className="task-item clickable-task-item">
                  <div>
                    <div className="task-title">{item.title}</div>
                    <div className="task-meta">{stageLabel(item.stage)} · trattativa ferma</div>
                  </div>
                  <span className="task-badge warning">ferma</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <AssistantPanel data={data} />
      </div>

      <div className="dashboard-grid two-up dashboard-two-up-mobile-order dashboard-lower-grid-phase2">
        <section className="panel-card mobile-priority-first panel-card-elevated">
          <div className="panel-head compact">
            <div>
              <h2>Attività recenti</h2>
              <p>Gli ultimi tocchi nel CRM, letti come una timeline pulita.</p>
            </div>
          </div>
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

        <section className="panel-card mobile-priority-second panel-card-elevated">
          <div className="panel-head compact">
            <div>
              <h2>Aziende recenti</h2>
              <p>Le anagrafiche appena toccate, con navigazione diretta alla scheda.</p>
            </div>
          </div>
          <div className="simple-list compact-list">
            {recentCompanies.length === 0 ? <div className="empty-block">Nessuna azienda recente.</div> : recentCompanies.map((item: any) => (
              <Link key={item.id} href={`/companies/${item.id}`} className="simple-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.city || 'Città non indicata'} · {item.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
