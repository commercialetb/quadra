import { FollowupPanels } from '@/components/dashboard/followup-panels';
import { KpiGrid } from '@/components/dashboard/kpi-grid';
import { PipelineBoard } from '@/components/dashboard/pipeline-board';
import { PriorityList } from '@/components/dashboard/priority-list';
import { RecentActivityList } from '@/components/dashboard/recent-activity-list';
import { RecentCompaniesList } from '@/components/dashboard/recent-companies-list';

export function DashboardShell({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-400">Quadra</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Dashboard operativa</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500">
              Le cose da fare, le trattative da sbloccare e i segnali importanti del CRM, in un unico colpo d’occhio.
            </p>
          </div>
        </div>
      </section>

      <KpiGrid kpis={data.kpis} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PriorityList staleOpportunities={data.staleOpportunities} />
        <RecentCompaniesList items={data.recentCompanies} />
      </div>

      <FollowupPanels
        overdue={data.overdueFollowups}
        today={data.todayFollowups}
        upcoming={data.upcomingFollowups}
      />

      <PipelineBoard pipelineCounts={data.pipelineCounts} />

      <RecentActivityList items={data.recentActivities} />
    </div>
  );
}
