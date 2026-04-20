import Link from 'next/link'
import { CreateFollowupButton } from '@/components/analysis/create-followup-button'

type DashboardSignal = {
  companyId: string
  companyName: string
  signal: 'high' | 'medium' | 'low'
  title: string
  detail: string
}

type SuggestedFollowup = {
  companyId: string
  companyName: string
  title: string
  description: string
  priority: 'medium' | 'high' | 'urgent'
}

type ActionPlanItem = {
  companyId: string
  companyName: string
  title: string
  detail: string
  priority: 'medium' | 'high' | 'urgent'
  lane: 'agenda' | 'pipeline' | 'ordini' | 'copertura'
}

type PriorityBucketItem = {
  companyId: string
  companyName: string
  score: number
  band: 'alta' | 'media' | 'base'
  reason: string
}

function SignalPill({ level }: { level: 'high' | 'medium' | 'low' }) {
  return <span className={`analysis-signal-pill is-${level}`}>{level === 'high' ? 'Alta' : level === 'medium' ? 'Media' : 'Bassa'}</span>
}

function LaneLabel({ lane }: { lane: ActionPlanItem['lane'] }) {
  const label = lane === 'agenda' ? 'agenda' : lane === 'pipeline' ? 'pipeline' : lane === 'ordini' ? 'ordini' : 'copertura'
  return <span className="dashboard-pill-badge">{label}</span>
}

function ScoreBadge({ score, band }: { score: number; band: 'alta' | 'media' | 'base' }) {
  return <span className={`dashboard-pill-badge ${band === 'alta' ? 'danger' : band === 'media' ? 'warning' : ''}`}>{score}/100</span>
}

function PriorityBucket({ title, items, empty }: { title: string; items: PriorityBucketItem[]; empty: string }) {
  return (
    <div className="dashboard-analysis-block dashboard-analysis-priority-block">
      <div className="dashboard-subcard-head">
        <h3>{title}</h3>
        <span>{items.length}</span>
      </div>
      <div className="dashboard-widget-stack compact-stack">
        {items.length > 0 ? items.map((item) => (
          <Link key={`${item.companyId}-${title}`} href={`/companies/${item.companyId}`} className="dashboard-entity-row dashboard-link-card compact">
            <div className="dashboard-entity-copy">
              <strong>{item.companyName}</strong>
              <span>{item.reason}</span>
            </div>
            <ScoreBadge score={item.score} band={item.band} />
          </Link>
        )) : <div className="dashboard-widget-empty">{empty}</div>}
      </div>
    </div>
  )
}

export function DashboardAnalysisPanel({
  signals,
  suggestions,
  actionPlan,
  priorityBuckets,
}: {
  signals: DashboardSignal[]
  suggestions: SuggestedFollowup[]
  actionPlan: ActionPlanItem[]
  priorityBuckets: {
    callNow: PriorityBucketItem[]
    reactivate: PriorityBucketItem[]
    monitor: PriorityBucketItem[]
  }
}) {
  return (
    <section className="dashboard-widget dashboard-analysis-widget">
      <div className="dashboard-widget-head compact-head">
        <div>
          <h2>Analisi operativa</h2>
          <p>Segnali trasversali dal CRM e dalle basi ordine già importate.</p>
        </div>
        <Link href="/analysis" className="secondary-button">Apri Analisi</Link>
      </div>

      <div className="dashboard-analysis-grid dashboard-analysis-grid--triple">
        <div className="dashboard-analysis-block">
          <div className="dashboard-subcard-head">
            <h3>Cosa fare oggi</h3>
            <span>{actionPlan.length}</span>
          </div>
          <div className="dashboard-widget-stack compact-stack">
            {actionPlan.length > 0 ? actionPlan.map((item) => (
              <div key={`${item.companyId}-${item.title}`} className="dashboard-analysis-suggestion-card">
                <Link href={`/companies/${item.companyId}`} className="dashboard-entity-row dashboard-link-card compact">
                  <div className="dashboard-entity-copy">
                    <strong>{item.title}</strong>
                    <span>{item.companyName} · {item.detail}</span>
                  </div>
                  <LaneLabel lane={item.lane} />
                </Link>
                <CreateFollowupButton
                  companyId={item.companyId}
                  title={item.title}
                  description={item.detail}
                  priority={item.priority}
                  defaultDueInDays={item.priority === 'urgent' ? 1 : item.priority === 'high' ? 2 : 5}
                  compact
                />
              </div>
            )) : <div className="dashboard-widget-empty">Nessuna priorità immediata da mostrare.</div>}
          </div>
        </div>

        <div className="dashboard-analysis-block">
          <div className="dashboard-subcard-head">
            <h3>Segnali da presidiare</h3>
            <span>{signals.length}</span>
          </div>
          <div className="dashboard-widget-stack compact-stack">
            {signals.length > 0 ? signals.map((item) => (
              <div key={`${item.companyId}-${item.title}`} className="dashboard-analysis-suggestion-card">
                <Link href={`/companies/${item.companyId}`} className="dashboard-entity-row dashboard-link-card compact">
                  <div className="dashboard-entity-copy">
                    <strong>{item.companyName}</strong>
                    <span>{item.title} · {item.detail}</span>
                  </div>
                  <SignalPill level={item.signal} />
                </Link>
                <CreateFollowupButton
                  companyId={item.companyId}
                  title={`Presidio: ${item.title}`}
                  description={item.detail}
                  priority={item.signal === 'high' ? 'urgent' : item.signal === 'medium' ? 'high' : 'medium'}
                  createLabel="Presidia segnale"
                  defaultDueInDays={item.signal === 'high' ? 1 : 3}
                  compact
                />
              </div>
            )) : <div className="dashboard-widget-empty">Nessun segnale rilevante per ora.</div>}
          </div>
        </div>

        <div className="dashboard-analysis-block">
          <div className="dashboard-subcard-head">
            <h3>Follow-up suggeriti</h3>
            <span>{suggestions.length}</span>
          </div>
          <div className="dashboard-widget-stack compact-stack">
            {suggestions.length > 0 ? suggestions.map((item) => (
              <div key={`${item.companyId}-${item.title}`} className="dashboard-analysis-suggestion-card">
                <Link href={`/companies/${item.companyId}`} className="dashboard-entity-row dashboard-link-card compact">
                  <div className="dashboard-entity-copy">
                    <strong>{item.title}</strong>
                    <span>{item.companyName} · {item.description}</span>
                  </div>
                  <span className={`dashboard-pill-badge ${item.priority === 'urgent' ? 'danger' : item.priority === 'high' ? 'warning' : ''}`}>{item.priority}</span>
                </Link>
                <CreateFollowupButton
                  companyId={item.companyId}
                  title={item.title}
                  description={item.description}
                  priority={item.priority}
                  compact
                />
              </div>
            )) : <div className="dashboard-widget-empty">Nessuna proposta automatica da mostrare.</div>}
          </div>
        </div>
      </div>

      <div className="dashboard-analysis-grid dashboard-analysis-grid--priority">
        <PriorityBucket title="Da chiamare" items={priorityBuckets.callNow} empty="Nessuna azienda con priorità alta da chiamare ora." />
        <PriorityBucket title="Da riattivare" items={priorityBuckets.reactivate} empty="Nessuna riattivazione urgente al momento." />
        <PriorityBucket title="Da presidiare" items={priorityBuckets.monitor} empty="Nessun presidio medio aperto." />
      </div>
    </section>
  )
}
