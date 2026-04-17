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
    <Link href={`/contacts/${item.id}`} className="dashboard-entity-row dashboard-link-card">
      <span className="dashboard-entity-avatar">{name.slice(0, 1).toUpperCase()}</span>
      <div className="dashboard-entity-copy">
        <strong>{name}</strong>
        <span>{statusLine([item.job_title, item.companies?.name])}</span>
      </div>
      <span className="dashboard-row-action">Apri</span>
    </Link>
  )
}

function CompanyRow({ item }: { item: Item }) {
  return (
    <Link href={`/companies/${item.id}`} className="dashboard-entity-row dashboard-link-card">
      <span className="dashboard-entity-avatar">{(item.name || 'A').slice(0, 1).toUpperCase()}</span>
      <div className="dashboard-entity-copy">
        <strong>{item.name || 'Azienda'}</strong>
        <span>{statusLine([item.city, item.status])}</span>
      </div>
      <span className="dashboard-row-action">Apri</span>
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
        <strong>{item.title || 'Opportunità'}</strong>
        <span>{stageLabel(item.stage)} · {item.companies?.name || 'Senza azienda'} </span>
      </div>
      <span className="dashboard-pill-badge warning">ferma</span>
    </Link>
  )
}

export function DashboardShell({ data }: { data: DashboardData }) {
  const recentCompanies = (data.recentCompanies || []).slice(0, 4)
  const recentContacts = (data.recentContacts || []).slice(0, 4)
  const recentActivities = (data.recentActivities || []).slice(0, 5)
  const todayFollowups = (data.todayFollowups || []).slice(0, 4)
  const staleOpportunities = (data.staleOpportunities || []).slice(0, 4)

  const pipelineValue = formatCurrency(data.kpis.pipelineValue || 0)
  const openCount = data.kpis.openCount || 0
  const todayCount = data.kpis.todayCount || 0
  const overdueCount = data.kpis.overdueCount || 0
  const contextCount = recentCompanies.length + recentContacts.length + recentActivities.length

  return (
    <div className="page-stack dashboard-phaseE">
      <section className="dashboard-mobile-voice">
        <VoiceControlBar compact />
      </section>

      <section className="dashboard-widget-grid" aria-label="Dashboard modulare">
        <section className="dashboard-widget dashboard-widget-kpis" aria-label="KPI principali">
          <MetricCard label="Pipeline" value={pipelineValue} note="Valore commerciale stimato." />
          <MetricCard label="Trattative aperte" value={openCount} note="Opportunità attive in lavorazione." />
          <MetricCard label="Follow-up oggi" value={todayCount} note="Azioni da chiudere entro oggi." />
          <MetricCard label="Da sbloccare" value={overdueCount} note="Elementi in ritardo o scoperti." />
        </section>

        <section className="dashboard-widget dashboard-widget-focus">
          <div className="dashboard-widget-head">
            <div>
              <h2>Focus di oggi</h2>
              <p>Priorità chiare, senza scene duplicate.</p>
            </div>
            <Link href="/followups" className="secondary-button">Apri agenda</Link>
          </div>

          <div className="dashboard-widget-stack">
            {todayFollowups.length === 0 ? <EmptyState text="Nessun follow-up urgente per oggi." /> : todayFollowups.map((item) => <FollowupRow key={item.id} item={item} />)}
          </div>
        </section>

        <section className="dashboard-widget dashboard-widget-pipeline">
          <div className="dashboard-widget-head">
            <div>
              <h2>Pipeline da sbloccare</h2>
              <p>Le opportunità ferme salgono subito in alto.</p>
            </div>
            <Link href="/opportunities" className="secondary-button">Vai alla pipeline</Link>
          </div>

          <div className="dashboard-widget-stack">
            {staleOpportunities.length === 0 ? <EmptyState text="Nessuna opportunità bloccata in questo momento." /> : staleOpportunities.map((item) => <OpportunityRow key={item.id} item={item} />)}
          </div>
        </section>

        <section className="dashboard-widget dashboard-widget-contacts">
          <div className="dashboard-widget-head">
            <div>
              <h2>Contatti recenti</h2>
              <p>Tocca per aprire subito la scheda.</p>
            </div>
            <Link href="/contacts" className="ghost-button">Contatti</Link>
          </div>

          <div className="dashboard-widget-stack">
            {recentContacts.length === 0 ? <EmptyState text="Nessun contatto recente." /> : recentContacts.map((item) => <ContactRow key={item.id} item={item} />)}
          </div>
        </section>

        <section className="dashboard-widget dashboard-widget-companies">
          <div className="dashboard-widget-head">
            <div>
              <h2>Aziende recenti</h2>
              <p>Accesso rapido alle schede principali.</p>
            </div>
            <Link href="/companies" className="ghost-button">Aziende</Link>
          </div>

          <div className="dashboard-widget-stack">
            {recentCompanies.length === 0 ? <EmptyState text="Nessuna azienda recente." /> : recentCompanies.map((item) => <CompanyRow key={item.id} item={item} />)}
          </div>
        </section>

        <section className="dashboard-widget dashboard-widget-actions">
          <div className="dashboard-widget-head">
            <div>
              <h2>Azioni rapide</h2>
              <p>Una dashboard operativa, non una vetrina.</p>
            </div>
          </div>

          <div className="dashboard-actions-grid">
            <Link href="/capture/voice" className="primary-button">Detta in Quadra</Link>
            <Link href="/assistant" className="secondary-button">Apri assistente</Link>
            <Link href="/opportunities" className="secondary-button">Pipeline</Link>
            <Link href="/followups" className="secondary-button">Task di oggi</Link>
          </div>

          <div className="dashboard-mini-note">
            <strong>{contextCount}</strong>
            <span>elementi recenti disponibili tra contatti, aziende e attività.</span>
          </div>
        </section>

        <section className="dashboard-widget dashboard-widget-assistant">
          <AssistantPanel data={data} />
        </section>
      </section>
    </div>
  )
}
