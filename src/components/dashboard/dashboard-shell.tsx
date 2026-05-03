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
  dashboardSignals?: Array<{ companyId: string; companyName: string; signal: 'high' | 'medium' | 'low'; title: string; detail: string }>
  suggestedFollowups?: Array<{ companyId: string; companyName: string; title: string; description: string; priority: 'medium' | 'high' | 'urgent' }>
  actionPlan?: Array<{ companyId: string; companyName: string; title: string; detail: string; priority: 'medium' | 'high' | 'urgent'; lane: 'agenda' | 'pipeline' | 'ordini' | 'copertura' }>
  priorityBuckets?: {
    callNow: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>
    reactivate: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>
    monitor: Array<{ companyId: string; companyName: string; score: number; band: 'alta' | 'media' | 'base'; reason: string }>
  }
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

function signalText(level: 'high' | 'medium' | 'low') {
  if (level === 'high') return 'Alta'
  if (level === 'medium') return 'Media'
  return 'Base'
}

function bandClass(band?: 'alta' | 'media' | 'base') {
  if (band === 'alta') return 'is-high'
  if (band === 'media') return 'is-medium'
  return 'is-base'
}

function priorityClass(priority?: 'medium' | 'high' | 'urgent') {
  if (priority === 'urgent') return 'is-high'
  if (priority === 'high') return 'is-medium'
  return 'is-base'
}

function EmptyState({ text }: { text: string }) {
  return <div className="dashboard-widget-empty apple-empty">{text}</div>
}

function KpiCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="apple-kpi-card apple-kpi-card-v6">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}

function CompactLinkRow({ href, title, meta, badge }: { href: string; title: string; meta: string; badge?: React.ReactNode }) {
  return (
    <Link href={href} className="apple-list-row">
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      {badge}
    </Link>
  )
}

export function DashboardShell({ data }: { data: DashboardData }) {
  const recentCompanies = (data.recentCompanies || []).slice(0, 4)
  const recentContacts = (data.recentContacts || []).slice(0, 4)
  const todayFollowups = (data.todayFollowups || []).slice(0, 4)
  const staleOpportunities = (data.staleOpportunities || []).slice(0, 3)
  const topSignals = (data.dashboardSignals || []).slice(0, 3)
  const topSuggestions = (data.suggestedFollowups || []).slice(0, 3)
  const bestCompaniesAll = [
    ...(data.priorityBuckets?.callNow || []).slice(0, 2),
    ...(data.priorityBuckets?.reactivate || []).slice(0, 1),
    ...(data.priorityBuckets?.monitor || []).slice(0, 1),
  ].slice(0, 4)

  const pipelineValue = formatCurrency(data.kpis.pipelineValue || 0)
  const openCount = data.kpis.openCount || 0
  const todayCount = data.kpis.todayCount || 0
  const overdueCount = data.kpis.overdueCount || 0
  const topAction = data.actionPlan?.[0]
  const topSignal = topSignals[0]
  const extraBestCompanies = bestCompaniesAll.slice(3)
  const bestCompanies = bestCompaniesAll.slice(0, 3)
  const nextCompany = bestCompanies[0]

  return (
    <div className="page-stack dashboard-redesign-page dashboard-v2-page dashboard-v6-page dashboard-v8-page">
      <section className="dashboard-mobile-voice redesign-dashboard-voice">
        <VoiceControlBar compact />
      </section>

      <section className="panel-card dashboard-v8-decision-stage dashboard-v6-focus-card">
        <div className="dashboard-v8-stage-head">
          <div>
            <p className="page-eyebrow">Home</p>
            <h1 className="page-title">Oggi</h1>
            <p className="page-subtitle">Una priorità chiara. Il resto sotto.</p>
          </div>
          <div className="cluster-wrap dashboard-v8-stage-actions">
            <Link href="/followups" className="primary-button">Apri agenda</Link>
            <Link href="/companies" className="ghost-button">Aziende</Link>
          </div>
        </div>
        <div className="dashboard-redesign-head">
          <div>
            <p className="page-eyebrow">Focus</p>
            <h2>Prossimo passo</h2>
          </div>
          {topAction ? <span className={`dashboard-pill-badge ${priorityClass(topAction.priority)}`}>priorità</span> : null}
        </div>

        <div className="dashboard-v6-focus-grid">
          <article className="dashboard-v6-primary-action">
            <span>Focus</span>
            <strong>{topAction?.title || 'Rivedi agenda e opportunità aperte'}</strong>
            <p>{topAction?.detail || "Non c'è un'urgenza dominante: presidia follow-up di oggi e deal da sbloccare."}</p>
            <div className="dashboard-v6-inline-meta">
              <div>
                <small>Con chi</small>
                <strong>{topAction?.companyName || nextCompany?.companyName || 'Nessuna azienda prioritaria'}</strong>
              </div>
              <div>
                <small>Quando</small>
                <strong>{todayCount > 0 ? `Oggi · ${todayCount} azioni` : 'Oggi'}</strong>
              </div>
              <div>
                <small>Motivo</small>
                <strong>{topSignal?.title || 'Proteggere pipeline e relazione'}</strong>
              </div>
            </div>
          </article>

          <aside className="dashboard-v6-side-note dashboard-v8-side-note">
            <div className="dashboard-v6-side-line">
              <small>Da seguire</small>
              <strong>{overdueCount > 0 ? `${overdueCount} attività in ritardo` : 'Nessun arretrato critico'}</strong>
            </div>
            <div className="dashboard-v6-side-line">
              <small>Se apri un account</small>
              <strong>{nextCompany?.companyName || 'Apri le aziende migliori'}</strong>
            </div>
          </aside>
        </div>
      </section>

      <section className="dashboard-redesign-block dashboard-v6-priority-block">
        <div className="dashboard-redesign-head">
          <div>
            <p className="page-eyebrow">Operativo</p>
            <h2>Essenziale</h2>
          </div>
        </div>

        <div className="apple-kpi-grid apple-kpi-grid-v6">
          <KpiCard label="Follow-up oggi" value={todayCount} note="azioni pianificate" />
          <KpiCard label="Pipeline aperta" value={openCount} note="opportunità attive" />
          <KpiCard label="Valore pipeline" value={pipelineValue} note="stima attuale" />
        </div>

        <div className="apple-dashboard-two-col apple-dashboard-two-col-v6">
          <div className="panel-card apple-subpanel">
            <div className="dashboard-redesign-head compact">
              <h3>Da fare</h3>
              <span>{todayFollowups.length}</span>
            </div>
            <div className="apple-list-stack">
              {todayFollowups.length ? todayFollowups.map((item) => (
                <CompactLinkRow
                  key={item.id}
                  href="/followups"
                  title={item.title || 'Follow-up'}
                  meta={`${priorityLabel(item.priority)} · ${followupStatusLabel(item.status)} · ${formatDate(item.due_at || item.scheduled_for)}`}
                  badge={<span className="dashboard-pill-badge">oggi</span>}
                />
              )) : <EmptyState text="Nessuna azione urgente per oggi." />}
            </div>
          </div>

          <div className="panel-card apple-subpanel">
            <div className="dashboard-redesign-head compact">
              <h3>Da sbloccare</h3>
              <span>{staleOpportunities.length}</span>
            </div>
            <div className="apple-list-stack">
              {staleOpportunities.length ? staleOpportunities.map((item) => (
                <CompactLinkRow
                  key={item.id}
                  href={`/opportunities/${item.id}`}
                  title={item.title || 'Opportunità'}
                  meta={`${stageLabel(item.stage)} · ${item.companies?.name || 'Senza azienda'}`}
                  badge={<span className="dashboard-pill-badge warning">ferma</span>}
                />
              )) : <EmptyState text="Nessuna opportunità bloccata." />}
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-redesign-block dashboard-v6-best-block">
        <div className="dashboard-redesign-head">
          <div>
            <p className="page-eyebrow">Account</p>
            <h2>Un account chiave</h2>
          </div>
          <Link href="/analysis" className="ghost-button">Approfondimenti</Link>
        </div>
        <div className="apple-best-list apple-best-list-v6 apple-best-list-v8">
          {nextCompany ? (
            <Link href={`/companies/${nextCompany.companyId}`} className="apple-best-row apple-best-row-v8">
              <div>
                <strong>{nextCompany.companyName}</strong>
                <span>{nextCompany.reason}</span>
              </div>
              <div className="apple-best-meta">
                <span className={`dashboard-pill-badge ${bandClass(nextCompany.band)}`}>{nextCompany.band}</span>
                <strong>{nextCompany.score}/100</strong>
              </div>
            </Link>
          ) : <EmptyState text="Servono più segnali per mettere un account davanti agli altri." />}
        </div>
      </section>

      <details className="analysis-details-block redesigned-details dashboard-secondary-details">
        <summary>Approfondimenti</summary>
        <div className="dashboard-secondary-stack">
          <section className="dashboard-redesign-block secondary-block">
            <div className="dashboard-redesign-head">
              <div>
                <p className="page-eyebrow">Secondario</p>
                <h2>Solo dopo</h2>
              </div>
              <Link href="/assistant" className="ghost-button">Assistente</Link>
            </div>
            <div className="apple-insight-grid">
              <div className="panel-card apple-subpanel">
                <div className="dashboard-redesign-head compact"><h3>Segnali da presidiare</h3></div>
                <div className="apple-list-stack">
                  {topSignals.length ? topSignals.map((item) => (
                    <CompactLinkRow
                      key={`${item.companyId}-${item.title}`}
                      href={`/companies/${item.companyId}`}
                      title={item.companyName}
                      meta={`${item.title} · ${item.detail}`}
                      badge={<span className={`dashboard-pill-badge ${item.signal === 'high' ? 'danger' : item.signal === 'medium' ? 'warning' : ''}`}>{signalText(item.signal)}</span>}
                    />
                  )) : <EmptyState text="Nessun segnale forte al momento." />}
                </div>
              </div>
              <div className="panel-card apple-subpanel">
                <div className="dashboard-redesign-head compact"><h3>Follow-up suggeriti</h3></div>
                <div className="apple-list-stack">
                  {topSuggestions.length ? topSuggestions.map((item) => (
                    <CompactLinkRow
                      key={`${item.companyId}-${item.title}`}
                      href={`/companies/${item.companyId}`}
                      title={item.title}
                      meta={`${item.companyName} · ${item.description}`}
                      badge={<span className={`dashboard-pill-badge ${priorityClass(item.priority)}`}>{priorityLabel(item.priority)}</span>}
                    />
                  )) : <EmptyState text="Nessun follow-up suggerito." />}
                </div>
              </div>
            </div>
          </section>

          <aside className="dashboard-redesign-rail dashboard-secondary-rail">
            <section className="panel-card apple-rail-card">
              <div className="dashboard-redesign-head compact">
                <h3>Contatti recenti</h3>
                <Link href="/contacts" className="ghost-button">Contatti</Link>
              </div>
              <div className="apple-list-stack">
                {recentContacts.length ? recentContacts.map((item) => (
                  <CompactLinkRow
                    key={item.id}
                    href={`/contacts/${item.id}`}
                    title={personName(item)}
                    meta={[item.job_title, item.companies?.name].filter(Boolean).join(' · ') || 'Apri scheda'}
                  />
                )) : <EmptyState text="Nessun contatto recente." />}
              </div>
            </section>

            <section className="panel-card apple-rail-card">
              <div className="dashboard-redesign-head compact">
                <h3>Aziende recenti</h3>
                <Link href="/companies" className="ghost-button">Aziende</Link>
              </div>
              <div className="apple-list-stack">
                {recentCompanies.length ? recentCompanies.map((item) => (
                  <CompactLinkRow
                    key={item.id}
                    href={`/companies/${item.id}`}
                    title={item.name || 'Azienda'}
                    meta={[item.city, item.status].filter(Boolean).join(' · ') || 'Apri scheda'}
                  />
                )) : <EmptyState text="Nessuna azienda recente." />}
              </div>
            </section>
          </aside>
        </div>
      </details>
    </div>
  )
}