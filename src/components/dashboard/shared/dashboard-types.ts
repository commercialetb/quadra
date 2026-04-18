export type DashboardItem = Record<string, any>

export type DashboardData = {
  kpis: {
    openCount: number
    overdueCount: number
    todayCount: number
    pipelineValue: number
    wonCount: number
  }
  openOpportunities: DashboardItem[]
  overdueFollowups: DashboardItem[]
  todayFollowups: DashboardItem[]
  upcomingFollowups: DashboardItem[]
  recentActivities: DashboardItem[]
  recentCompanies: DashboardItem[]
  recentContacts: DashboardItem[]
  staleOpportunities: DashboardItem[]
  pipelineCounts: Record<string, number>
}
