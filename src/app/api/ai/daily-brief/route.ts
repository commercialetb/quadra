import { NextResponse } from 'next/server';
import { buildDailyBrief } from '@/lib/ai';
import { getDashboardData } from '@/lib/dashboard-queries';

export async function POST() {
  try {
    const dashboard = await getDashboardData();

    const highlights = [
      ...dashboard.todayFollowups.slice(0, 4).map((item) => `Follow-up oggi: ${item.title}`),
      ...dashboard.overdueFollowups.slice(0, 4).map((item) => `In ritardo: ${item.title}`),
      ...dashboard.staleOpportunities.slice(0, 4).map((item) => `Deal fermo: ${item.title}`),
    ];

    const result = await buildDailyBrief({
      overdueFollowups: dashboard.kpis.overdueCount,
      dueToday: dashboard.kpis.todayCount,
      openOpportunities: dashboard.kpis.openCount,
      pipelineValue: dashboard.kpis.pipelineValue,
      staleOpportunities: dashboard.staleOpportunities,
      highlights,
    });

    return NextResponse.json({
      brief: result.text,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
