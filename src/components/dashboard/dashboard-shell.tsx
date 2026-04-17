import Link from 'next/link'
import { AssistantPanel } from '@/components/ai/assistant-panel'
import { VoiceControlBar } from '@/components/voice-control-bar'
import { followupStatusLabel, priorityLabel, stageLabel } from '@/lib/crm-labels'

type Item = Record<string, any>

type DashboardData = {
  kpis: {
    pipelineValue?: number
    openCount?: number
    todayCount?: number
    overdueCount?: number
  }
  recentCompanies?: Item[]
  recentContacts?: Item[]
  recentActivities?: Item[]
  todayFollowups?: Item[]
  staleOpportunities?: Item[]
}

function formatCurrency(value = 0) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompact(value = 0) {
  return new Intl.NumberFormat('it-IT', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function ContactCard({ item }: { item: Item }) {
  const name = item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Contatto'
  return (
    <Link href={`/contacts/${item.id}`} className="dashboard-list-card dashboard-link-card">
      <span className="dashboard-list-avatar">{name.slice(0, 1).toUpperCase()}</span>
      <div>
        <strong>{name}</strong>
        <span>{item.job_title || item.companies?.name || 'Apri scheda contatto'}</span>
      </div>
    </Link>
  )
}

function CompanyCard({ item }: { item: Item }) {
  return (
    <Link href={`/companies/${item.id}`} className="dashboard-list-card dashboard-link-card">
      <span className="dashboard-list-avatar">{(item.name || 'Q').slice(0, 1).toUpperCase()}</span>
      <div>
        <strong>{item.name || 'Azienda'}</strong>
        <span>{[item.city, item.status].filter(Boolean).join(' · ') || 'Apri scheda azienda'}</span>
      </div>
    </Link>
  )
}

function FollowupCard({ item }: { item: Item }) {
  return (
    <Link href="/followups" className="dashboard-list-card dashboard-link-card">
      <div>
        <strong>{item.title}</strong>
        <span>{priorityLabel(item.priority)} · {followupStatusLabel(item.status)}</span>
      </div>
      <b className="dashboard-inline-badge">oggi</b>
    </Link>
  )
}

function OpportunityCard({ item }: { item: Item }) {
  return (
    <Link href={`/opportunities/${item.id}`} className="dashboard-list-card dashboard-link-card">
      <div>
        <strong>{item.title}</strong>
        <span>{stageLabel(item.stage)} · opportunità da sbloccare</span>
      </div>
      <b className="dashboard-inline-badge warning">ferma</b>
    </Link>
  )
}

function MetricRow({ pipelineValue, openCount, todayCount }: { pipelineValue: string; openCount: number; todayCount: number }) {
  return (
    <div className="dashboard-summary-metrics">
      <article className="dashboard-summary-metric glass-pill">
        <span>Pipeline</span>
        <strong>{pipelineValue}</strong>
      </article>
      <article className="dashboard-summary-metric glass-pill">
        <span>Trattative aperte</span>
        <strong>{openCount}</strong>
      </article>
      <article className="dashboard-summary-metric glass-pill">
        <span>Follow-up oggi</span>
        <strong>{todayCount}</strong>
      </article>
    </div>
  )
}

export function DashboardShell({ data }: { data: DashboardData }) {
  const recentCompanies = (data.recentCompanies || []).slice(0, 4)
  const recentContacts = (data.recentContacts || []).slice(0, 4)
  const recentActivities = (data.recentActivities || []).slice(0, 5)
  const todayFollowups = (data.todayFollowups || []).slice(0, 4)
  const staleOpportunities = (data.staleOpportunities || []).slice(0, 3)

  const pipelineValue = formatCurrency(data.kpis.pipelineValue || 0)
  const compactValue = formatCompact(data.kpis.pipelineValue || 0)
  const openCount = data.kpis.openCount || 0
  const todayCount = data.kpis.todayCount || 0
  const overdueCount = data.kpis.overdueCount || 0

  return (
    <div className="page-stack dashboard-phaseA">
      <section className="dashboard-desktop-view">
        <div className="dashboard-showcase glass-panel dashboard-showcase-desktop">
          <div className="dashboard-showcase-copy">
            <div className="hero-pill-row">
              <span className="hero-chip">Dashboard CRM Predittiva e Vocale</span>
              <span className="hero-chip ghost">Siri · Gemini · GPT-4</span>
            </div>
            <p className="page-eyebrow">Bentornato</p>
            <h1 className="page-title">Quadra deve essere chiara, tappabile e davvero utile.</h1>
            <p className="page-subtitle dashboard-subtitle-compact">
              Dashboard desktop con gerarchia più netta: priorità, contatti recenti, aziende recenti e accesso rapido alla voce senza box che si mangiano spazio.
            </p>
            <MetricRow pipelineValue={pipelineValue} openCount={openCount} todayCount={todayCount} />
          </div>

          <div className="dashboard-showcase-stage">
            <VoiceControlBar compact />
            <div className="stage-screen glass-panel dashboard-stage-desktop">
              <div className="stage-screen-main">
                <div className="stage-card stage-card-welcome">
                  <span className="stage-card-label">Workspace commerciale</span>
                  <strong>Panoramica di oggi</strong>
                  <div className="stage-metric-inline">
                    <span>Pipeline attuale</span>
                    <b>{pipelineValue}</b>
                  </div>
                </div>

                <div className="stage-card stage-card-focus">
                  <div className="stage-card-head">
                    <span>Follow-up urgenti</span>
                    <span>{todayCount} oggi</span>
                  </div>
                  <div className="stage-list">
                    {todayFollowups.length === 0 ? <div className="stage-list-item muted">Nessun follow-up urgente.</div> : todayFollowups.map((item) => <FollowupCard key={item.id} item={item} />)}
                  </div>
                </div>

                <div className="stage-card stage-card-pipeline">
                  <div className="stage-card-head">
                    <span>Pipeline</span>
                    <span>{openCount} aperte</span>
                  </div>
                  <div className="stage-table">
                    <div><span>Attive</span><strong>{openCount}</strong></div>
                    <div><span>Valore</span><strong>{compactValue}</strong></div>
                    <div><span>In ritardo</span><strong>{overdueCount}</strong></div>
                  </div>
                </div>
              </div>

              <aside className="stage-screen-side">
                <div className="stage-card">
                  <div className="stage-card-head">
                    <span>Contatti recenti</span>
                    <span>apri scheda</span>
                  </div>
                  <div className="contact-rail">
                    {recentContacts.length === 0 ? <div className="stage-list-item muted">Nessun contatto recente.</div> : recentContacts.map((item) => <ContactCard key={item.id} item={item} />)}
                  </div>
                </div>
                <div className="stage-card">
                  <div className="stage-card-head">
                    <span>Aziende recenti</span>
                    <span>CRM live</span>
                  </div>
                  <div className="contact-rail">
                    {recentCompanies.length === 0 ? <div className="stage-list-item muted">Nessuna azienda recente.</div> : recentCompanies.map((item) => <CompanyCard key={item.id} item={item} />)}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <section className="today-grid today-grid-premium quadra-kpi-row">
          <article className="metric-card metric-primary">
            <span className="metric-label">Follow-up oggi</span>
            <strong className="metric-value">{todayCount}</strong>
            <span className="metric-note">Azioni in agenda da chiudere.</span>
          </article>
          <article className="metric-card">
            <span className="metric-label">Da sbloccare</span>
            <strong className="metric-value">{overdueCount}</strong>
            <span className="metric-note">Elementi in ritardo o scoperti.</span>
          </article>
          <article className="metric-card">
            <span className="metric-label">Opportunità attive</span>
            <strong className="metric-value">{openCount}</strong>
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
                <p>Task di oggi e trattative ferme, con CTA immediate.</p>
              </div>
              <Link href="/followups" className="secondary-button">Apri agenda</Link>
            </div>

            <div className="focus-columns">
              <div className="task-list task-list-premium">
                <div className="focus-column-title">Today</div>
                {todayFollowups.length === 0 ? <div className="empty-block">Nessuna azione urgente per oggi.</div> : null}
                {todayFollowups.map((item) => <FollowupCard key={item.id} item={item} />)}
              </div>

              <div className="task-list task-list-premium">
                <div className="focus-column-title">Pipeline ferma</div>
                {staleOpportunities.length === 0 ? <div className="empty-block">Nessuna opportunità bloccata.</div> : null}
                {staleOpportunities.map((item) => <OpportunityCard key={item.id} item={item} />)}
              </div>
            </div>
          </section>

          <AssistantPanel data={data} />
        </div>
      </section>

      <section className="dashboard-tablet-view glass-panel dashboard-compact-surface">
        <div className="dashboard-compact-head">
          <div>
            <p className="page-eyebrow">Bentornato</p>
            <h1 className="dashboard-compact-title">Dashboard operativa</h1>
            <p className="dashboard-compact-copy">Su iPad la priorità è chiarezza: niente mockup dentro il mockup, solo moduli leggibili e tappabili.</p>
          </div>
          <div className="dashboard-compact-voice"><VoiceControlBar compact /></div>
        </div>

        <MetricRow pipelineValue={pipelineValue} openCount={openCount} todayCount={todayCount} />

        <div className="dashboard-compact-grid two-col">
          <section className="panel-card dashboard-compact-panel">
            <div className="panel-head compact">
              <div>
                <h2>Follow-up urgenti</h2>
                <p>Le priorità di oggi, senza sovrapposizioni.</p>
              </div>
              <Link href="/followups" className="secondary-button">Agenda</Link>
            </div>
            <div className="dashboard-list-grid">
              {todayFollowups.length === 0 ? <div className="empty-block">Nessun follow-up urgente.</div> : todayFollowups.map((item) => <FollowupCard key={item.id} item={item} />)}
            </div>
          </section>

          <section className="panel-card dashboard-compact-panel">
            <div className="panel-head compact">
              <div>
                <h2>Pipeline ferma</h2>
                <p>Trattative da sbloccare rapidamente.</p>
              </div>
              <Link href="/opportunities" className="secondary-button">Pipeline</Link>
            </div>
            <div className="dashboard-list-grid">
              {staleOpportunities.length === 0 ? <div className="empty-block">Nessuna opportunità bloccata.</div> : staleOpportunities.map((item) => <OpportunityCard key={item.id} item={item} />)}
            </div>
          </section>

          <section className="panel-card dashboard-compact-panel">
            <div className="panel-head compact">
              <div>
                <h2>Contatti recenti</h2>
                <p>Tocca e apri subito la scheda.</p>
              </div>
              <Link href="/contacts" className="secondary-button">Contatti</Link>
            </div>
            <div className="dashboard-list-grid">
              {recentContacts.length === 0 ? <div className="empty-block">Nessun contatto recente.</div> : recentContacts.map((item) => <ContactCard key={item.id} item={item} />)}
            </div>
          </section>

          <section className="panel-card dashboard-compact-panel">
            <div className="panel-head compact">
              <div>
                <h2>Aziende recenti</h2>
                <p>Le ultime aziende toccate nel CRM.</p>
              </div>
              <Link href="/companies" className="secondary-button">Aziende</Link>
            </div>
            <div className="dashboard-list-grid">
              {recentCompanies.length === 0 ? <div className="empty-block">Nessuna azienda recente.</div> : recentCompanies.map((item) => <CompanyCard key={item.id} item={item} />)}
            </div>
          </section>
        </div>
      </section>

      <section className="dashboard-mobile-view glass-panel dashboard-compact-surface">
        <div className="dashboard-mobile-head">
          <p className="page-eyebrow">Bentornato</p>
          <h1 className="dashboard-compact-title">Dashboard operativa</h1>
          <p className="dashboard-compact-copy">Versione iPhone: una colonna sola, niente pannelli che si mangiano il contenuto.</p>
        </div>

        <div className="dashboard-compact-voice mobile"><VoiceControlBar compact /></div>

        <MetricRow pipelineValue={pipelineValue} openCount={openCount} todayCount={todayCount} />

        <div className="dashboard-mobile-stack">
          <section className="panel-card dashboard-compact-panel">
            <div className="panel-head compact">
              <div>
                <h2>Follow-up di oggi</h2>
                <p>Le azioni da chiudere subito.</p>
              </div>
              <Link href="/followups" className="secondary-button">Agenda</Link>
            </div>
            <div className="dashboard-list-grid">
              {todayFollowups.length === 0 ? <div className="empty-block">Nessun follow-up urgente.</div> : todayFollowups.slice(0, 3).map((item) => <FollowupCard key={item.id} item={item} />)}
            </div>
          </section>

          <section className="panel-card dashboard-compact-panel">
            <div className="panel-head compact">
              <div>
                <h2>Contatti recenti</h2>
                <p>Apri le schede più viste di recente.</p>
              </div>
              <Link href="/contacts" className="secondary-button">Contatti</Link>
            </div>
            <div className="dashboard-list-grid">
              {recentContacts.length === 0 ? <div className="empty-block">Nessun contatto recente.</div> : recentContacts.slice(0, 3).map((item) => <ContactCard key={item.id} item={item} />)}
            </div>
          </section>

          <section className="panel-card dashboard-compact-panel">
            <div className="panel-head compact">
              <div>
                <h2>Aziende recenti</h2>
                <p>Le aziende aperte più di recente.</p>
              </div>
              <Link href="/companies" className="secondary-button">Aziende</Link>
            </div>
            <div className="dashboard-list-grid">
              {recentCompanies.length === 0 ? <div className="empty-block">Nessuna azienda recente.</div> : recentCompanies.slice(0, 3).map((item) => <CompanyCard key={item.id} item={item} />)}
            </div>
          </section>

          <section className="panel-card dashboard-compact-panel dashboard-action-panel">
            <div>
              <h2>Azioni rapide</h2>
              <p>Usa la voce, apri l’assistente o vai alla pipeline.</p>
            </div>
            <div className="dashboard-action-grid">
              <Link href="/capture/voice" className="primary-button">Detta in Quadra</Link>
              <Link href="/assistant" className="ghost-button">Assistente AI</Link>
              <Link href="/opportunities" className="ghost-button">Pipeline</Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
