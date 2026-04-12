import { FollowupPanels } from '@/components/dashboard/followup-panels'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { PipelineBoard } from '@/components/dashboard/pipeline-board'
import { PriorityList } from '@/components/dashboard/priority-list'
import { RecentActivityList } from '@/components/dashboard/recent-activity-list'
import { RecentCompaniesList } from '@/components/dashboard/recent-companies-list'

export function DashboardShell({ data }: { data: any }) {
  return (
    <div className="page-wrap">
      <section className="hero-card page-card dashboard-hero-compact">
        <p className="eyebrow">Workspace</p>
        <h1 className="hero-title">Benvenuto.</h1>
        <p className="hero-copy">
          Oggi conta soprattutto questo: follow-up da chiudere, trattative da sbloccare e un paio di scorciatoie per non perdere ritmo.
        </p>
        <div className="hero-actions hero-actions-compact">
          <span className="status-pill"><span className="status-dot" /> {data.kpis.todayCount} follow-up oggi</span>
          <span className="status-pill"><span className="status-dot-blue" /> {data.kpis.openCount} opportunità aperte</span>
          <span className="status-pill"><span className="status-dot-warning" /> {data.kpis.overdueCount} da sbloccare</span>
        </div>
      </section>

      <KpiGrid kpis={data.kpis} />

      <div className="dashboard-grid-primary">
        <PriorityList staleOpportunities={data.staleOpportunities} />
        <section className="frost-card quick-add-card compact-quick-add-card">
          <div className="section-heading">
            <div>
              <h2>Quick add</h2>
              <p>Parti subito senza passare da schermate lunghe.</p>
            </div>
          </div>
          <div className="quick-add-grid">
            <a href="/companies#new-company" className="quick-add-tile">
              <strong>Nuova azienda</strong>
              <span>Crea una scheda pulita.</span>
            </a>
            <a href="/contacts#new-contact" className="quick-add-tile">
              <strong>Nuovo contatto</strong>
              <span>Persona, ruolo e contesto.</span>
            </a>
            <a href="/opportunities#new-opportunity" className="quick-add-tile">
              <strong>Nuova opportunità</strong>
              <span>Apri una trattativa in pochi tocchi.</span>
            </a>
            <a href="/followups#new-followup" className="quick-add-tile">
              <strong>Nuovo follow-up</strong>
              <span>Blocca subito la prossima azione.</span>
            </a>
          </div>
        </section>
      </div>

      <div className="dashboard-grid-secondary">
        <RecentCompaniesList items={data.recentCompanies} />
        <RecentActivityList items={data.recentActivities} />
      </div>

      <FollowupPanels overdue={data.overdueFollowups} today={data.todayFollowups} upcoming={data.upcomingFollowups} />
      <PipelineBoard pipelineCounts={data.pipelineCounts} />
    </div>
  )
}
