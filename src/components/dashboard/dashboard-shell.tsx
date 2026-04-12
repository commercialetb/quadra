import { FollowupPanels } from '@/components/dashboard/followup-panels'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { PipelineBoard } from '@/components/dashboard/pipeline-board'
import { PriorityList } from '@/components/dashboard/priority-list'
import { RecentActivityList } from '@/components/dashboard/recent-activity-list'
import { RecentCompaniesList } from '@/components/dashboard/recent-companies-list'

export function DashboardShell({ data }: { data: any }) {
  return (
    <div className="page-wrap">
      <section className="hero-card page-card hero-card-v3 hero-card-compact">
        <p className="eyebrow">Oggi</p>
        <h1 className="hero-title">Dashboard operativa</h1>
        <p className="hero-copy">
          Hai {data.kpis.todayCount} follow-up oggi, {data.kpis.openCount} opportunita aperte e {data.kpis.overdueCount} elementi da sbloccare.
        </p>

        <div className="hero-actions hero-actions-compact">
          <span className="status-pill"><span className="status-dot status-dot-warning" /> {data.kpis.todayCount} oggi</span>
          <span className="status-pill"><span className="status-dot status-dot-blue" /> {data.kpis.openCount} pipeline</span>
          <span className="status-pill"><span className="status-dot" /> {data.kpis.overdueCount} da sbloccare</span>
        </div>
      </section>

      <KpiGrid kpis={data.kpis} />

      <div className="dashboard-two-up">
        <PriorityList staleOpportunities={data.staleOpportunities} />
        <RecentCompaniesList items={data.recentCompanies} />
      </div>

      <FollowupPanels overdue={data.overdueFollowups} today={data.todayFollowups} upcoming={data.upcomingFollowups} />
      <PipelineBoard pipelineCounts={data.pipelineCounts} />
      <RecentActivityList items={data.recentActivities} />
    </div>
  )
}
