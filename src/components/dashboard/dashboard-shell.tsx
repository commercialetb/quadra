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
    <article className="apple-kpi-card">
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
  const todayFollowups = (data.todayFollowups || []).slice(0, 5)
  const staleOpportunities = (data.staleOpportunities || []).slice(0, 4)
  const topSignals = (data.dashboardSignals || []).slice(0, 3)
  const topSuggestions = (data.suggestedFollowups || []).slice(0, 3)
  const bestCompanies = [
    ...(data.priorityBuckets?.callNow || []).slice(0, 2),
    ...(data.priorityBuckets?.reactivate || []).slice(0, 2),
    ...(data.priorityBuckets?.monitor || []).slice(0, 1),
  ].slice(0, 5)

  const pipelineValue = formatCurrency(data.kpis.pipelineValue || 0)
  const openCount = data.kpis.openCount || 0
  const todayCount = data.kpis.todayCount || 0
  const overdueCount = data.kpis.overdueCount || 0
  const topAction = data.actionPlan?.[0]
  const topSignal = topSignals[0]
  const nextCompany = bestCompanies[0]

  return (
    <div className="page-stack dashboard-redesign-page dashboard-v2-page">
      <section className="dashboard-mobile-voice redesign-dashboard-voice">
        <VoiceControlBar compact />
      </section>

      <section className="panel-card dashboard-hero-redesign dashboard-hero-v2">
        <div>
          <p className="page-eyebrow">Home</p>
          <h1 className="page-title">System of action</h1>
          <p className="page-subtitle">Il posto dove apri Quadra e capisci subito cosa fare, con chi, quando e perché.</p>
        </div>
        <div className="cluster-wrap">
          <Link href="/followups" className="primary-button">Apri agenda</Link>
          <Link href="/companies" className="ghost-button">Aziende</Link>
        </div>
      </section>

      <section className="panel-card dashboard-command-card">
        <div className="dashboard-redesign-head">
          <div>
            <p className="page-eyebrow">Adesso</p>
            <h2>Una risposta in un colpo d'occhio</h2>
          </div>
          {topAction ? <span className={`dashboard-pill-badge ${priorityClass(topAction.priority)}`}>azione guida</span> : null}
        </div>

        <div className="dashboard-command-grid">
          <article className="dashboard-command-item is-primary">
            <span>Cosa fare</span>
            <strong>{topAction?.title || 'Rivedi agenda e opportunità aperte'}</strong>
            <p>{topAction?.detail || "Non c'è un'urgenza dominante: presidia follow-up di oggi e deal da sbloccare."}</p>
          </article>
          <article className="dashboard-command-item">
            <span>Con chi</span>
            <strong>{topAction?.companyName || nextCompany?.companyName || 'Nessuna azienda prioritaria'}</strong>
            <p>{nextCompany?.reason || 'Apri le aziende migliori per capire dove spingere oggi.'}</p>
          </article>
          <article className="dashboard-command-item">
            <span>Quando</span>
            <strong>{todayCount > 0 ? `Oggi · ${todayCount} azioni` : 'Appena apri la giornata'}</strong>
            <p>{overdueCount > 0 ? `${overdueCount} attività sono in ritardo e vanno rimesse in linea.` : 'Nessun arretrato critico rilevato ora.'}</p>
          </article>
          <article className="dashboard-command-item">
            <span>Perché</span>
            <strong>{topSignal?.title || 'Per proteggere pipeline e relazione'}</strong>
            <p>{topSignal?.detail || 'Quadra mette davanti solo i segnali che possono cambiare la giornata operativa.'}</p>
          </article>
        </div>
      </section>

      <section className="dashboard-redesign-grid">
        <div className="dashboard-redesign-main">
          <section className="dashboard-redesign-block">
            <div className="dashboard-redesign-head">
              <div>
                <p className="page-eyebrow">Oggi</p>
                <h2>Priorità di oggi</h2>
              </div>
              <span className="dashboard-section-helper">Prima l'operativo, poi il resto</span>
            </div>

            <div className="apple-kpi-grid">
              <KpiCard label="Pipeline" value={pipelineValue} note="valore stimato" />
              <KpiCard label="Opportunità" value={openCount} note="aperte ora" />
              <KpiCard label="Follow-up oggi" value={todayCount} note="azioni pianificate" />
              <KpiCard label="In ritardo" value={overdueCount} note="da chiudere" />
            </div>

            <div className="apple-dashboard-two-col">
              <div className="panel-card apple-subpanel">
                <div className="dashboard-redesign-head compact">
                  <h3>Da fare oggi</h3>
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

          <section className="dashboard-redesign-block">
            <div className="dashboard-redesign-head">
              <div>
                <p className="page-eyebrow">Migliori account</p>
                <h2>Chi sta andando meglio</h2>
              </div>
              <Link href="/analysis" className="ghost-button">Apri insight</Link>
            </div>
            <div className="apple-best-list">
              {bestCompanies.length ? bestCompanies.map((item) => (
                <Link key={`${item.companyId}-${item.reason}`} href={`/companies/${item.companyId}`} className="apple-best-row">
                  <div>
                    <strong>{item.companyName}</strong>
                    <span>{item.reason}</span>
                  </div>
                  <div className="apple-best-meta">
                    <span className={`dashboard-pill-badge ${bandClass(item.band)}`}>{item.band}</span>
                    <strong>{item.score}/100</strong>
                  </div>
                </Link>
              )) : <EmptyState text="Servono più segnali per ordinare le aziende migliori." />}
            </div>
          </section>

          <details className="analysis-details-block redesigned-details dashboard-secondary-details" open>
            <summary>Apri approfondimenti secondari</summary>
            <div className="dashboard-secondary-stack">
              <section className="dashboard-redesign-block secondary-block">
                <div className="dashboard-redesign-head">
                  <div>
                    <p className="page-eyebrow">Insight</p>
                    <h2>Solo ciò che serve</h2>
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
      </section>
    </div>
  )
}
