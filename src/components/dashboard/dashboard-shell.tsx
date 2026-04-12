import { FollowupPanels } from '@/components/dashboard/followup-panels'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { PipelineBoard } from '@/components/dashboard/pipeline-board'
import { PriorityList } from '@/components/dashboard/priority-list'
import { RecentActivityList } from '@/components/dashboard/recent-activity-list'
import { RecentCompaniesList } from '@/components/dashboard/recent-companies-list'

export function DashboardShell({ data }: { data: any }) {
  return (
    <div className="page-wrap">
      <section className="hero-card page-card">
        <p className="eyebrow">Today at a glance</p>
        <h1 className="hero-title">Dashboard operativa</h1>
        <p className="hero-copy">
          Il tuo centro di controllo: priorità da sbloccare, pipeline, follow-up e attività recenti in un colpo d'occhio.
        </p>

        <div className="hero-actions">
          <span className="status-pill"><span className="status-dot" /> {data.kpis.todayCount} follow-up oggi</span>
          <span className="status-pill"><span className="status-dot status-dot-blue" /> {data.kpis.openCount} opportunità aperte</span>
          <span className="status-pill"><span className="status-dot status-dot-warning" /> {data.kpis.overdueCount} elementi da sbloccare</span>
        </div>
      </section>

      <KpiGrid kpis={data.kpis} />

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <PriorityList staleOpportunities={data.staleOpportunities} />
        <RecentCompaniesList items={data.recentCompanies} />
      </div>

      <FollowupPanels overdue={data.overdueFollowups} today={data.todayFollowups} upcoming={data.upcomingFollowups} />
      <PipelineBoard pipelineCounts={data.pipelineCounts} />
      <RecentActivityList items={data.recentActivities} />
    </div>
  )
}
