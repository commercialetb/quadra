import Link from 'next/link'
import { VoiceControlBar } from '@/components/voice-control-bar'
import { QuadraVoiceGreeting } from '@/components/ai/quadra-voice-greeting'
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
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit' }).format(date)
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
      <div className="dashboard-metric-spark" aria-hidden="true"><i /><i /><i /><i /><i /></div>
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
        <span>{priorityLabel(item.priority)} · {followupStatusLabel(item.status)} · {formatDate(item.due_at || item.scheduled_for)}</span>
      </div>
      <span className="dashboard-pill-badge">oggi</span>
    </Link>
  )
}

function OpportunityRow({ item }: { item: Item }) {
  return (
    <Link href={`/opportunities/${item.id}`} className="dashboard-entity-row dashboard-link-card compact">
      <div className="dashboard-entity-copy">
        <strong>{item.title || 'Opportunita'}</strong>
        <span>{stageLabel(item.stage)} · {item.companies?.name || 'Senza azienda'}</span>
      </div>
      <span className="dashboard-pill-badge warning">ferma</span>
    </Link>
  )
}

export function DashboardShell({ data, userName = '' }: { data: DashboardData; userName?: string }) {
  const recentCompanies = (data.recentCompanies || []).slice(0, 4)
  const recentContacts = (data.recentContacts || []).slice(0, 4)
  const todayFollowups = (data.todayFollowups || []).slice(0, 4)
  const staleOpportunities = (data.staleOpportunities || []).slice(0, 3)

  const pipelineValue = formatCurrency(data.kpis.pipelineValue || 0)
  const openCount = data.kpis.openCount || 0
  const todayCount = data.kpis.todayCount || 0
  const overdueCount = data.kpis.overdueCount || 0
  const greetingName = userName ? userName.split(' ')[0] : ''

  return (
    <div className="page-stack dashboard-phaseE dashboard-phaseE2">
      <section className="dashboard-mobile-voice">
        <VoiceControlBar compact />
      </section>

      <QuadraVoiceGreeting
        userName={userName}
        storageKey="quadra_dashboard_greeting_v1"
        message={greetingName ? `Ciao ${greetingName}. Oggi hai ${todayCount} follow-up da chiudere e ${staleOpportunities.length} opportunita da sbloccare.` : undefined}
      />

      <section className="dashboard-e2-layout" aria-label="Dashboard predittiva">
        <div className="dashboard-e2-main">
          <section className="dashboard-widget dashboard-widget-priority">
            <div className="dashboard-widget-head compact-head">
              <div>
                <h2>Priorita di oggi</h2>
                <p>Subito cosa guardare, chi sentire e cosa sbloccare.</p>
              </div>
              <Link href="/followups" className="secondary-button">Apri agenda</Link>
            </div>

            <div className="dashboard-e2-kpis">
              <MetricCard label="Stato pipeline" value={pipelineValue} note="Valore attuale in trattativa." />
              <MetricCard label="Opportunita aperte" value={openCount} note="Deal attivi da seguire." />
              <MetricCard label="Follow-up oggi" value={todayCount} note="Task da chiudere oggi." />
            </div>

            <div className="dashboard-stage-strip" aria-label="Sintesi pipeline">
              <span className="dashboard-stage-pill is-active">Priorita oggi: {todayCount}</span>
              <span className="dashboard-stage-pill">In ritardo: {overdueCount}</span>
              <span className="dashboard-stage-pill">Da sbloccare: {staleOpportunities.length}</span>
            </div>

            <div className="dashboard-e2-priority-grid">
              <div className="dashboard-e2-subcard">
                <div className="dashboard-subcard-head">
                  <h3>Focus giornaliero</h3>
                  <span>{todayCount} oggi</span>
                </div>
                <div className="dashboard-widget-stack compact-stack">
                  {todayFollowups.length === 0 ? <EmptyState text="Nessuna azione urgente per oggi." /> : todayFollowups.map((item) => <FollowupRow key={item.id} item={item} />)}
                </div>
              </div>

              <div className="dashboard-e2-subcard">
                <div className="dashboard-subcard-head">
                  <h3>Opportunita da sbloccare</h3>
                  <span>{overdueCount} elementi</span>
                </div>
                <div className="dashboard-widget-stack compact-stack">
                  {staleOpportunities.length === 0 ? <EmptyState text="Nessuna opportunita bloccata." /> : staleOpportunities.map((item) => <OpportunityRow key={item.id} item={item} />)}
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-widget dashboard-widget-copilot">
            <div className="dashboard-widget-head compact-head">
              <div>
                <h2>Assistente AI</h2>
                <p>Quadra sintetizza, suggerisce la prossima mossa e ti lascia azioni pronte.</p>
              </div>
              <Link href="/assistant?action=brief&tab=brief" className="primary-button">Genera brief</Link>
            </div>

            <div className="dashboard-copilot-brief">
              <strong>Brief del giorno.</strong> Parti dai follow-up in scadenza, poi sblocca le opportunita ferme sopra 10k e chiudi almeno un recap.
            </div>

            <div className="dashboard-copilot-actions dashboard-copilot-actions--chips">
              <Link href="/assistant?tab=query&q=Chi%20devo%20sentire%20oggi%3F" className="dashboard-query-chip">Chi devo sentire oggi?</Link>
              <Link href="/assistant?tab=query&q=Quali%20opportunita%20sopra%2010k%20sono%20ferme%3F" className="dashboard-query-chip">Opportunita sopra 10k</Link>
              <Link href="/assistant?tab=query&q=Quali%20follow-up%20sono%20in%20ritardo%3F" className="dashboard-query-chip">Follow-up in ritardo</Link>
            </div>

            <div className="dashboard-ai-preview-grid">
              <div className="dashboard-ai-preview-card">
                <span>Sintesi</span>
                <p>Quadra ti restituisce una risposta breve, ordinata e gia orientata all’azione.</p>
              </div>
              <div className="dashboard-ai-preview-card">
                <span>Prossimo passo</span>
                <p>Dalla risposta puoi creare un follow-up, aprire le opportunita o generare un messaggio.</p>
              </div>
            </div>

            <div className="dashboard-copilot-actions">
              <Link href="/assistant?tab=query&q=Chi%20devo%20sentire%20oggi%3F" className="secondary-button">Interroga il CRM</Link>
              <Link href="/assistant" className="secondary-button">Apri assistente</Link>
              <Link href="/capture/voice" className="secondary-button">Detta nota</Link>
            </div>

            <div className="dashboard-copilot-footer">
              Oggi: {todayCount} follow-up · {overdueCount} in ritardo · {openCount} opportunita aperte.
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
              <Link href="/contacts" className="ghost-button">Contatti</Link>
            </div>
            <div className="dashboard-widget-stack compact-stack">
              {recentContacts.length === 0 ? <EmptyState text="Nessun contatto recente." /> : recentContacts.map((item) => <ContactRow key={item.id} item={item} />)}
            </div>
          </section>

          <section className="dashboard-widget dashboard-widget-companies rail-widget">
            <div className="dashboard-widget-head rail-head">
              <div>
                <h2>Aziende recenti</h2>
                <p>Apri subito i record principali.</p>
              </div>
              <Link href="/companies" className="ghost-button">Aziende</Link>
            </div>
            <div className="dashboard-widget-stack compact-stack">
              {recentCompanies.length === 0 ? <EmptyState text="Nessuna azienda recente." /> : recentCompanies.map((item) => <CompanyRow key={item.id} item={item} />)}
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}
