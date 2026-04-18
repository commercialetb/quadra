import Link from 'next/link'
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

function formatDate(value?: string) {
  if (!value) return 'Senza data'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Senza data'
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function personName(item: Item) {
  return item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Contatto'
}

function statusLine(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' · ') || 'Apri scheda'
}

function EmptyState({ text }: { text: string }) {
  return <div className="dashboard-widget-empty">{text}</div>
}

function MetricCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="dashboard-metric-card">
      <span className="dashboard-metric-label">{label}</span>
      <strong className="dashboard-metric-value">{value}</strong>
      <span className="dashboard-metric-note">{note}</span>
    </article>
  )
}

function ContactRow({ item }: { item: Item }) {
  const name = personName(item)
  return (
    <Link href={`/contacts/${item.id}`} className="dashboard-entity-row dashboard-link-card compact-row">
      <span className="dashboard-entity-avatar">{name.slice(0, 1).toUpperCase()}</span>
      <div className="dashboard-entity-copy">
        <strong>{name}</strong>
        <span>{statusLine([item.job_title, item.companies?.name])}</span>
      </div>
    </Link>
  )
}

function CompanyRow({ item }: { item: Item }) {
  return (
    <Link href={`/companies/${item.id}`} className="dashboard-entity-row dashboard-link-card compact-row">
      <span className="dashboard-entity-avatar">{(item.name || 'A').slice(0, 1).toUpperCase()}</span>
      <div className="dashboard-entity-copy">
        <strong>{item.name || 'Azienda'}</strong>
        <span>{statusLine([item.city, item.status])}</span>
      </div>
    </Link>
  )
}

function FollowupRow({ item }: { item: Item }) {
  return (
    <Link href="/followups" className="dashboard-entity-row dashboard-link-card compact">
      <div className="dashboard-entity-copy">
        <strong>{item.title || 'Follow-up'}</strong>
        <span>
          {priorityLabel(item.priority)} · {followupStatusLabel(item.status)} · {formatDate(item.due_at || item.scheduled_for)}
        </span>
      </div>
      <span className="dashboard-pill-badge">oggi</span>
    </Link>
  )
}

function OpportunityRow({ item }: { item: Item }) {
  return (
    <Link href={`/opportunities/${item.id}`} className="dashboard-entity-row dashboard-link-card compact">
      <div className="dashboard-entity-copy">
        <strong>{item.title || 'Opportunità'}</strong>
        <span>{stageLabel(item.stage)} · {item.companies?.name || 'Senza azienda'}</span>
      </div>
      <span className="dashboard-pill-badge warning">ferma</span>
    </Link>
  )
}

export function DashboardShell({ data }: { data: DashboardData }) {
  const recentCompanies = (data.recentCompanies || []).slice(0, 4)
  const recentContacts = (data.recentContacts || []).slice(0, 4)
  const todayFollowups = (data.todayFollowups || []).slice(0, 4)
  const staleOpportunities = (data.staleOpportunities || []).slice(0, 3)

  const pipelineValue = formatCurrency(data.kpis.pipelineValue || 0)
  const openCount = data.kpis.openCount || 0
  const todayCount = data.kpis.todayCount || 0
  const overdueCount = data.kpis.overdueCount || 0

  return (
    <div className="page-stack dashboard-phaseE dashboard-phaseE2">
      <section className="dashboard-mobile-voice">
        <VoiceControlBar compact />
      </section>

      <section className="dashboard-e2-layout" aria-label="Dashboard predittiva">
        <div className="dashboard-e2-main">
          <section className="dashboard-widget dashboard-widget-priority dashboard-widget-priority-concept">
            <div className="dashboard-widget-head compact-head">
              <div>
                <h2>Priorità di oggi</h2>
                <p>Subito cosa guardare, chi sentire e cosa sbloccare.</p>
              </div>
              <Link href="/followups" className="secondary-button">
                Apri agenda
              </Link>
            </div>

            <div className="dashboard-e2-kpis">
              <MetricCard label="Pipeline status" value={pipelineValue} note="Valore attuale in trattativa." />
              <MetricCard label="Trattative aperte" value={openCount} note="Deal attivi da seguire." />
              <MetricCard label="Task oggi" value={todayCount} note="Azioni da chiudere oggi." />
            </div>

            <div className="dashboard-e2-priority-grid">
              <div className="dashboard-e2-subcard">
                <div className="dashboard-subcard-head">
                  <h3>Daily focus</h3>
                  <span>{todayCount} oggi</span>
                </div>
                <div className="dashboard-widget-stack compact-stack">
                  {todayFollowups.length === 0 ? (
                    <EmptyState text="Nessuna azione urgente per oggi." />
                  ) : (
                    todayFollowups.map((item) => <FollowupRow key={item.id} item={item} />)
                  )}
                </div>
              </div>

              <div className="dashboard-e2-subcard">
                <div className="dashboard-subcard-head">
                  <h3>Deal da sbloccare</h3>
                  <span>{overdueCount} elementi</span>
                </div>
                <div className="dashboard-widget-stack compact-stack">
                  {staleOpportunities.length === 0 ? (
                    <EmptyState text="Nessuna opportunità bloccata." />
                  ) : (
                    staleOpportunities.map((item) => <OpportunityRow key={item.id} item={item} />)
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-widget dashboard-widget-copilot">
            <div className="dashboard-widget-head compact-head">
              <div>
                <h2>Insight AI</h2>
                <p>Brief rapido e interrogazione CRM in stile Quadra.</p>
              </div>
              <button type="button" className="primary-button">
                Genera brief
              </button>
            </div>

            <div className="dashboard-copilot-brief">Genera un brief veloce su appuntamenti, opportunità ferme e task critici.</div>

            <div className="dashboard-copilot-field">
              <label htmlFor="dashboard-copilot-query">Chiedi a Quadra</label>
              <textarea
                id="dashboard-copilot-query"
                className="dashboard-copilot-textarea"
                placeholder="Es. Chi devo sentire oggi? Oppure: quali opportunità sopra 10k sono ferme?"
                rows={5}
              />
            </div>

            <div className="dashboard-copilot-actions">
              <button type="button" className="secondary-button">
                Interroga il CRM
              </button>
              <Link href="/assistant" className="secondary-button">
                Apri assistente
              </Link>
            </div>

            <div className="dashboard-copilot-footer">
              Oggi: {todayCount} follow-up · {overdueCount} in ritardo · {openCount} opportunità aperte.
            </div>
          </section>

          <section className="dashboard-widget dashboard-widget-actions e2-actions">
            <div className="dashboard-widget-head compact-head">
              <div>
                <h2>Azioni rapide</h2>
                <p>Solo le tre azioni che servono davvero.</p>
              </div>
            </div>

            <div className="dashboard-actions-grid dashboard-actions-grid--three">
              <Link href="/capture/voice" className="primary-button">
                Detta in Quadra
              </Link>
              <Link href="/assistant" className="secondary-button">
                Assistente AI
              </Link>
              <Link href="/opportunities" className="secondary-button">
                Pipeline
              </Link>
            </div>
          </section>
        </div>

        <aside className="dashboard-e2-rail">
          <section className="dashboard-widget dashboard-widget-contacts rail-widget">
            <div className="dashboard-widget-head rail-head">
              <div>
                <h2>Contatti recenti</h2>
                <p>Tocca e apri la scheda.</p>
              </div>
              <Link href="/contacts" className="ghost-button">
                Contatti
              </Link>
            </div>

            <div className="dashboard-widget-stack compact-stack">
              {recentContacts.length === 0 ? (
                <EmptyState text="Nessun contatto recente." />
              ) : (
                recentContacts.map((item) => <ContactRow key={item.id} item={item} />)
              )}
            </div>
          </section>

          <section className="dashboard-widget dashboard-widget-companies rail-widget">
            <div className="dashboard-widget-head rail-head">
              <div>
                <h2>Aziende recenti</h2>
                <p>Apri subito i record principali.</p>
              </div>
              <Link href="/companies" className="ghost-button">
                Aziende
              </Link>
            </div>

            <div className="dashboard-widget-stack compact-stack">
              {recentCompanies.length === 0 ? (
                <EmptyState text="Nessuna azienda recente." />
              ) : (
                recentCompanies.map((item) => <CompanyRow key={item.id} item={item} />)
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}
