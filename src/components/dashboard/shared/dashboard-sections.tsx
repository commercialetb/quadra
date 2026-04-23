import Link from 'next/link'
import type { DashboardData, DashboardItem } from './dashboard-types'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function formatDate(value?: string | null) {
  if (!value) return 'Senza data'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Senza data'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit' }).format(date)
}

export function priorityLabel(value?: string | null) {
  if (value === 'high') return 'Alta'
  if (value === 'medium') return 'Media'
  if (value === 'low') return 'Bassa'
  return 'Normale'
}

export function stageLabel(value?: string | null) {
  switch (value) {
    case 'new_lead': return 'Nuovo lead'
    case 'contacted': return 'Contattata'
    case 'qualified': return 'Qualificata'
    case 'proposal': return 'Proposta'
    case 'negotiation': return 'Negoziazione'
    case 'won': return 'Vinta'
    case 'lost': return 'Persa'
    default: return 'Aperta'
  }
}

function personName(item: DashboardItem) {
  return item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Contatto'
}



export function dashboardDaySummary(data: DashboardData) {
  const followups = data.kpis.todayCount || 0
  const deals = data.kpis.openCount || 0
  if (followups > 0 && deals > 0) return `Oggi hai ${followups} follow-up e ${deals} trattative aperte.`
  if (followups > 0) return `Oggi hai ${followups} follow-up da chiudere.`
  if (deals > 0) return `Hai ${deals} trattative aperte in pipeline.`
  return 'Quadra è pronta con i punti chiave della giornata.'
}

export function DashboardWelcomePanel({ data, mobile = false }: { data: DashboardData; mobile?: boolean }) {
  const pipelineValue = formatCurrency(data.kpis.pipelineValue || 0)
  const summary = dashboardDaySummary(data)
  return (
    <section className={`quadra-dashboard-welcome ${mobile ? 'is-mobile' : ''}`}>
      <div className="quadra-dashboard-intro-pill">{summary}</div>
      <div className="quadra-dashboard-welcome-card">
        <div className="quadra-dashboard-welcome-copy">
          <h2>Bentornato,</h2>
          <p>Quadra è pronta a mostrarti subito priorità, pipeline e prossime mosse.</p>
        </div>
        <div className="quadra-dashboard-spotlight-card">
          <span>Pipeline status</span>
          <strong>{data.kpis.openCount || 0} trattative aperte</strong>
          <p>{pipelineValue}</p>
          <i aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export function DashboardMetricCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="quadra-dashboard-metric-card">
      <span className="quadra-dashboard-metric-label">{label}</span>
      <strong className="quadra-dashboard-metric-value">{value}</strong>
      <span className="quadra-dashboard-metric-note">{note}</span>
    </article>
  )
}

export function DashboardSection({ title, meta, children, action }: { title: string; meta?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="quadra-dashboard-card">
      <div className="quadra-dashboard-card-head">
        <div>
          <h2>{title}</h2>
          {meta ? <p>{meta}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function FollowupList({ items, emptyText }: { items: DashboardItem[]; emptyText: string }) {
  if (items.length === 0) return <div className="quadra-dashboard-empty">{emptyText}</div>
  return (
    <div className="quadra-dashboard-list">
      {items.map((item) => (
        <Link href="/followups" key={item.id} className="quadra-dashboard-list-item">
          <div>
            <strong>{item.title || 'Follow-up'}</strong>
            <span>{priorityLabel(item.priority)} · {formatDate(item.due_at || item.scheduled_for)}</span>
          </div>
          <span className="quadra-dashboard-badge">oggi</span>
        </Link>
      ))}
    </div>
  )
}

export function OpportunityList({ items, emptyText }: { items: DashboardItem[]; emptyText: string }) {
  if (items.length === 0) return <div className="quadra-dashboard-empty">{emptyText}</div>
  return (
    <div className="quadra-dashboard-list">
      {items.map((item) => (
        <Link href={`/opportunities/${item.id}`} key={item.id} className="quadra-dashboard-list-item">
          <div>
            <strong>{item.title || 'Opportunità'}</strong>
            <span>{stageLabel(item.stage)} · {item.companies?.name || 'Senza azienda'}</span>
          </div>
          <span className="quadra-dashboard-badge warning">ferma</span>
        </Link>
      ))}
    </div>
  )
}

export function ContactList({ items, emptyText }: { items: DashboardItem[]; emptyText: string }) {
  if (items.length === 0) return <div className="quadra-dashboard-empty">{emptyText}</div>
  return (
    <div className="quadra-dashboard-list">
      {items.map((item) => (
        <Link href={`/contacts/${item.id}`} key={item.id} className="quadra-dashboard-list-item compact">
          <div>
            <strong>{personName(item)}</strong>
            <span>{item.companies?.name || item.job_title || 'Apri scheda'}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function CompanyList({ items, emptyText }: { items: DashboardItem[]; emptyText: string }) {
  if (items.length === 0) return <div className="quadra-dashboard-empty">{emptyText}</div>
  return (
    <div className="quadra-dashboard-list">
      {items.map((item) => (
        <Link href={`/companies/${item.id}`} key={item.id} className="quadra-dashboard-list-item compact">
          <div>
            <strong>{item.name || 'Azienda'}</strong>
            <span>{item.city || item.status || 'Apri scheda'}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function DashboardHero({ data, compact = false }: { data: DashboardData; compact?: boolean }) {
  const pipelineValue = formatCurrency(data.kpis.pipelineValue || 0)
  return (
    <DashboardSection
      title="Priorità di oggi"
      meta="Subito cosa guardare, chi sentire e cosa sbloccare."
      action={<Link href="/followups" className="quadra-pill-button ghost">Apri agenda</Link>}
    >
      <div className={`quadra-dashboard-kpis ${compact ? 'compact' : ''}`}>
        <DashboardMetricCard label="Pipeline status" value={pipelineValue} note="Valore attuale in trattativa." />
        <DashboardMetricCard label="Trattative aperte" value={data.kpis.openCount || 0} note="Deal attivi da seguire." />
        <DashboardMetricCard label="Follow-up oggi" value={data.kpis.todayCount || 0} note="Task da chiudere oggi." />
      </div>
    </DashboardSection>
  )
}

export function DashboardAiCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <section className="quadra-dashboard-card quadra-dashboard-ai-card">
      <div className="quadra-dashboard-card-head">
        <div>
          <h2>{mobile ? 'Insight AI' : 'Copilota AI'}</h2>
          <p>Brief giornaliero, query CRM e messaggi pronti in un unico spazio.</p>
        </div>
        {!mobile ? <Link href="/assistant" className="quadra-pill-button primary">Apri assistente</Link> : null}
      </div>
      <div className="quadra-dashboard-ai-prompt">Genera un brief veloce su appuntamenti, priorità e opportunità ferme.</div>
      <div className="quadra-dashboard-ai-chips">
        <Link href="/assistant?action=brief&tab=brief" className="quadra-dashboard-ai-chip">Brief di oggi</Link>
        <Link href="/assistant?q=Chi%20devo%20sentire%20oggi%3F&tab=query" className="quadra-dashboard-ai-chip">Chi sentire oggi</Link>
        <Link href="/assistant?q=Quali%20opportunita%20sopra%2010k%20sono%20ferme%3F&tab=query" className="quadra-dashboard-ai-chip">Deal fermi</Link>
      </div>
      {mobile ? (
        <div className="quadra-dashboard-ai-mobile-actions">
          <Link href="/assistant" className="quadra-pill-button primary wide">Apri assistente</Link>
        </div>
      ) : (
        <div className="quadra-dashboard-ai-actions">
          <Link href="/assistant?action=brief&tab=brief" className="quadra-pill-button primary">Genera brief</Link>
          <Link href="/assistant?q=Chi%20devo%20sentire%20oggi%3F&tab=query" className="quadra-pill-button ghost">Interroga il CRM</Link>
        </div>
      )}
    </section>
  )
}
