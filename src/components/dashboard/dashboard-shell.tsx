'use client'

import { useEffect, useMemo, useState } from 'react'
import { AssistantPanel } from '@/components/ai/assistant-panel'
import { followupStatusLabel, priorityLabel, stageLabel } from '@/lib/crm-labels'

type WidgetId = 'kpis' | 'agenda' | 'pipeline' | 'companies' | 'activities' | 'assistant' | 'quick'
type ViewportKey = 'mobile' | 'tablet' | 'desktop'

type WidgetConfig = {
  id: WidgetId
  title: string
  description: string
}

const WIDGETS: WidgetConfig[] = [
  { id: 'kpis', title: 'Indicatori chiave', description: 'Numeri essenziali della giornata.' },
  { id: 'agenda', title: 'Agenda operativa', description: 'Follow-up e trattative da sbloccare.' },
  { id: 'pipeline', title: 'Pipeline', description: 'Distribuzione dello stato commerciale.' },
  { id: 'companies', title: 'Aziende recenti', description: 'Anagrafiche toccate di recente.' },
  { id: 'activities', title: 'Attività recenti', description: 'Ultimi movimenti nel CRM.' },
  { id: 'assistant', title: 'Assistente AI', description: 'Sintesi e priorità del giorno.' },
  { id: 'quick', title: 'Azioni rapide', description: 'Shortcut utili e voce.' },
]

const DEFAULT_LAYOUTS: Record<ViewportKey, WidgetId[]> = {
  mobile: ['kpis', 'agenda', 'quick', 'companies', 'assistant', 'activities', 'pipeline'],
  tablet: ['kpis', 'agenda', 'companies', 'assistant', 'pipeline', 'activities', 'quick'],
  desktop: ['kpis', 'agenda', 'assistant', 'companies', 'pipeline', 'activities', 'quick'],
}

function getViewportKey(width: number): ViewportKey {
  if (width < 780) return 'mobile'
  if (width < 1180) return 'tablet'
  return 'desktop'
}

function storageKey(viewport: ViewportKey) {
  return `quadra.dashboard.layout.${viewport}`
}

function formatCurrency(value?: number) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function restoreLayout(viewport: ViewportKey): WidgetId[] {
  if (typeof window === 'undefined') return DEFAULT_LAYOUTS[viewport]
  try {
    const raw = window.localStorage.getItem(storageKey(viewport))
    if (!raw) return DEFAULT_LAYOUTS[viewport]
    const parsed = JSON.parse(raw) as WidgetId[]
    const valid = parsed.filter((id) => WIDGETS.some((widget) => widget.id === id))
    const missing = WIDGETS.map((widget) => widget.id).filter((id) => !valid.includes(id))
    return [...valid, ...missing]
  } catch {
    return DEFAULT_LAYOUTS[viewport]
  }
}

function saveLayout(viewport: ViewportKey, layout: WidgetId[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey(viewport), JSON.stringify(layout))
}

function KpiWidget({ data }: { data: any }) {
  return (
    <section className="panel-card dash-widget dash-widget-kpis">
      <div className="panel-head compact">
        <div>
          <h2>Indicatori chiave</h2>
          <p>La fotografia utile, senza box duplicati.</p>
        </div>
      </div>
      <div className="dash-kpi-grid">
        <article className="metric-card metric-primary">
          <span className="metric-label">Follow-up oggi</span>
          <strong className="metric-value">{data.kpis?.todayCount ?? 0}</strong>
          <span className="metric-note">Attività da toccare oggi.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">In ritardo</span>
          <strong className="metric-value">{data.kpis?.overdueCount ?? 0}</strong>
          <span className="metric-note">Da sbloccare subito.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Opportunità aperte</span>
          <strong className="metric-value">{data.kpis?.openCount ?? 0}</strong>
          <span className="metric-note">Trattative in lavorazione.</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Valore pipeline</span>
          <strong className="metric-value">{formatCurrency(data.kpis?.pipelineValue)}</strong>
          <span className="metric-note">Stima sulle trattative attive.</span>
        </article>
      </div>
    </section>
  )
}

function AgendaWidget({ data }: { data: any }) {
  const followups = data.todayFollowups ?? []
  const stale = data.staleOpportunities ?? []

  return (
    <section className="panel-card dash-widget dash-widget-agenda">
      <div className="panel-head compact">
        <div>
          <h2>Agenda operativa</h2>
          <p>Prima il lavoro da sbloccare, poi il resto.</p>
        </div>
        <a href="/followups" className="secondary-button">Apri agenda</a>
      </div>
      <div className="task-list compact-task-list">
        {followups.length === 0 && stale.length === 0 ? <div className="empty-block">Nessun allarme. Ottimo segnale.</div> : null}
        {followups.map((item: any) => (
          <a key={item.id} href="/followups" className="task-item clickable-task-item">
            <div>
              <div className="task-title">{item.title}</div>
              <div className="task-meta">Scade oggi · {priorityLabel(item.priority)} · {followupStatusLabel(item.status)}</div>
            </div>
            <span className="task-badge">oggi</span>
          </a>
        ))}
        {stale.map((item: any) => (
          <a key={item.id} href={`/opportunities/${item.id}`} className="task-item clickable-task-item">
            <div>
              <div className="task-title">{item.title}</div>
              <div className="task-meta">{stageLabel(item.stage)} · trattativa ferma</div>
            </div>
            <span className="task-badge warning">ferma</span>
          </a>
        ))}
      </div>
    </section>
  )
}

function PipelineWidget({ data }: { data: any }) {
  const counts = data.pipelineCounts ?? {}
  const rows = [
    { label: 'Nuovi lead', value: counts.new_lead ?? 0 },
    { label: 'Contattate', value: counts.contacted ?? 0 },
    { label: 'Qualificate', value: counts.qualified ?? 0 },
    { label: 'Proposte', value: counts.proposal ?? 0 },
    { label: 'Negoziazione', value: counts.negotiation ?? 0 },
    { label: 'Chiuse vinte', value: counts.won ?? 0 },
  ]

  return (
    <section className="panel-card dash-widget dash-widget-pipeline">
      <div className="panel-head compact">
        <div>
          <h2>Pipeline</h2>
          <p>Stato reale delle trattative, senza mini-card ripetute.</p>
        </div>
        <a href="/opportunities" className="secondary-button">Apri pipeline</a>
      </div>
      <div className="dash-stat-list">
        {rows.map((row) => (
          <div key={row.label} className="dash-stat-row">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function CompaniesWidget({ data }: { data: any }) {
  const items = (data.recentCompanies ?? []).slice(0, 5)
  return (
    <section className="panel-card dash-widget dash-widget-list">
      <div className="panel-head compact">
        <div>
          <h2>Aziende recenti</h2>
          <p>Apri subito una scheda utile.</p>
        </div>
        <a href="/companies" className="secondary-button">Aziende</a>
      </div>
      <div className="simple-list compact-list">
        {items.length === 0 ? (
          <div className="empty-block">Nessuna azienda recente.</div>
        ) : (
          items.map((item: any) => (
            <a key={item.id} href={`/companies/${item.id}`} className="simple-row">
              <div>
                <strong>{item.name}</strong>
                <span>{item.city || 'Città non indicata'} · {item.status}</span>
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  )
}

function ActivitiesWidget({ data }: { data: any }) {
  const items = (data.recentActivities ?? []).slice(0, 5)
  return (
    <section className="panel-card dash-widget dash-widget-list">
      <div className="panel-head compact">
        <div>
          <h2>Attività recenti</h2>
          <p>Ultimi tocchi nel CRM.</p>
        </div>
      </div>
      <div className="simple-list compact-list">
        {items.length === 0 ? (
          <div className="empty-block">Nessuna attività recente.</div>
        ) : (
          items.map((item: any) => (
            <div key={item.id} className="simple-row static">
              <div>
                <strong>{item.subject || 'Attività'}</strong>
                <span>{item.kind}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function QuickActionsWidget() {
  return (
    <section className="panel-card dash-widget dash-widget-quick">
      <div className="panel-head compact">
        <div>
          <h2>Azioni rapide</h2>
          <p>Voice e scorciatoie, senza doppioni in testata.</p>
        </div>
      </div>
      <div className="dash-quick-actions">
        <a href="/capture/voice" className="primary-button">Detta in Quadra</a>
        <a href="/assistant" className="secondary-button">Assistente AI</a>
        <a href="/opportunities" className="secondary-button">Pipeline</a>
      </div>
    </section>
  )
}

function DashboardEditor({
  viewport,
  layout,
  setLayout,
  onClose,
  onReset,
}: {
  viewport: ViewportKey
  layout: WidgetId[]
  setLayout: (next: WidgetId[]) => void
  onClose: () => void
  onReset: () => void
}) {
  function move(id: WidgetId, direction: -1 | 1) {
    const index = layout.indexOf(id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= layout.length) return
    const next = [...layout]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    setLayout(next)
  }

  function toggle(id: WidgetId) {
    const isVisible = layout.includes(id)
    if (isVisible && layout.length === 1) return
    const next = isVisible
      ? layout.filter((item) => item !== id)
      : [...layout, id]
    setLayout(next)
  }

  return (
    <section className="panel-card dash-editor-sheet">
      <div className="panel-head compact">
        <div>
          <h2>Personalizza dashboard</h2>
          <p>Layout {viewport === 'mobile' ? 'iPhone' : viewport === 'tablet' ? 'iPad' : 'desktop'} salvato su questo dispositivo.</p>
        </div>
        <div className="dash-editor-actions">
          <button type="button" className="secondary-button" onClick={onReset}>Ripristina</button>
          <button type="button" className="secondary-button" onClick={onClose}>Chiudi</button>
        </div>
      </div>
      <div className="dash-editor-list">
        {WIDGETS.map((widget) => {
          const visible = layout.includes(widget.id)
          return (
            <article key={widget.id} className="dash-editor-item">
              <div className="dash-editor-item-copy">
                <strong>{widget.title}</strong>
                <span>{widget.description}</span>
              </div>
              <div className="dash-editor-item-actions">
                <button type="button" className={visible ? 'secondary-button' : 'ghost-button'} onClick={() => toggle(widget.id)}>
                  {visible ? 'Nascondi' : 'Mostra'}
                </button>
                <button type="button" className="ghost-button" onClick={() => move(widget.id, -1)} disabled={!visible || layout.indexOf(widget.id) === 0}>Su</button>
                <button type="button" className="ghost-button" onClick={() => move(widget.id, 1)} disabled={!visible || layout.indexOf(widget.id) === layout.length - 1}>Giù</button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function DashboardShell({ data }: { data: any }) {
  const [viewport, setViewport] = useState<ViewportKey>('desktop')
  const [layout, setLayout] = useState<WidgetId[]>(DEFAULT_LAYOUTS.desktop)
  const [editorOpen, setEditorOpen] = useState(false)

  useEffect(() => {
    function syncViewport() {
      const nextViewport = getViewportKey(window.innerWidth)
      setViewport(nextViewport)
      setLayout(restoreLayout(nextViewport))
    }
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  useEffect(() => {
    saveLayout(viewport, layout)
  }, [layout, viewport])

  const widgetMap = useMemo(
    () => ({
      kpis: <KpiWidget data={data} />,
      agenda: <AgendaWidget data={data} />,
      pipeline: <PipelineWidget data={data} />,
      companies: <CompaniesWidget data={data} />,
      activities: <ActivitiesWidget data={data} />,
      assistant: <AssistantPanel data={data} />,
      quick: <QuickActionsWidget />,
    }),
    [data],
  )

  function resetLayout() {
    const next = DEFAULT_LAYOUTS[viewport]
    setLayout(next)
    saveLayout(viewport, next)
  }

  return (
    <div className="page-stack dash-modular-page">
      <section className="panel-card dash-control-bar">
        <div>
          <p className="page-eyebrow">Dashboard predittiva</p>
          <h2 className="dash-control-title">Widget modulari, meno ripetizioni.</h2>
          <p className="dash-control-copy">Su iPad e iPhone puoi mostrare, nascondere e riordinare i box senza toccare il codice.</p>
        </div>
        <div className="dash-control-actions">
          <button type="button" className="primary-button" onClick={() => setEditorOpen((value) => !value)}>
            {editorOpen ? 'Chiudi personalizzazione' : 'Personalizza dashboard'}
          </button>
          <button type="button" className="secondary-button" onClick={resetLayout}>Ripristina layout</button>
        </div>
      </section>

      {editorOpen ? (
        <DashboardEditor
          viewport={viewport}
          layout={layout}
          setLayout={setLayout}
          onClose={() => setEditorOpen(false)}
          onReset={resetLayout}
        />
      ) : null}

      <div className={`dash-widget-grid viewport-${viewport}`}>
        {layout.map((widgetId) => (
          <div key={widgetId} className={`dash-widget-slot dash-widget-slot-${widgetId}`}>
            {widgetMap[widgetId]}
          </div>
        ))}
      </div>
    </div>
  )
}
