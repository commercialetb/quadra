import {
  buildAccountSeries,
  buildActionPlan,
  buildAnalysisHighlights,
  buildDashboardSignals,
  buildPriorityBuckets,
  buildMonthlySeries,
  buildOrderKpis,
  buildStatusSeries,
  buildSuggestedFollowups,
  deriveCompanyRows,
  type AnalysisOrder,
  type CrmCompanyLite,
  type CrmFollowupLite,
  type CrmOpportunityLite,
} from '@/lib/analysis/analytics'
import { createClient } from '@/lib/supabase/server'

export type AnalysisImportRecord = {
  id: string
  filename: string
  rows_imported: number
  status: string
  notes: string | null
  source_type?: string | null
  company_name?: string | null
  created_count?: number | null
  updated_count?: number | null
  skipped_count?: number | null
  warning_count?: number | null
  created_at: string
}

export type TopCustomerRow = {
  companyId: string
  companyName: string
  region: string
  orders: number
  revenue: number
  sharePct: number
  trendPct: number | null
  status: 'grow' | 'stable' | 'down'
}

export type RegionRevenueRow = {
  region: string
  revenue: number
  customers: number
  orders: number
  outstanding: number
}

export type CustomerMoverRow = {
  companyId: string
  companyName: string
  revenue: number
  deltaValue: number
  deltaPct: number
}

export type ConcentrationMetrics = {
  top1Share: number
  top3Share: number
  top5Share: number
  top10Share: number
}

export type AiCustomerAction = {
  companyId: string
  companyName: string
  region: string
  revenue: number
  trendLabel: string
  aiState: 'proteggi' | 'spingi' | 'recupera' | 'monitora'
  reason: string
  nextAction: string
  priority: 'medium' | 'high' | 'urgent'
}

function parseImportContext(notes: string | null) {
  const raw = String(notes || '').trim()
  if (!raw) return { company_name: null, source_type: null }
  const parts = raw.split('/').map((item) => item.trim())
  return {
    company_name: parts[0] || null,
    source_type: parts[1] || null,
  }
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function buildTopCustomers(companyRows: ReturnType<typeof deriveCompanyRows>): TopCustomerRow[] {
  const totalRevenue = companyRows.reduce((sum, row) => sum + row.importedValue, 0) || 1

  return [...companyRows]
    .filter((row) => row.importedValue > 0)
    .sort((a, b) => b.importedValue - a.importedValue)
    .slice(0, 12)
    .map((row) => {
      const trendPct =
        row.signal === 'high' ? -8 :
        row.signal === 'medium' ? 4 :
        row.importedOrders >= 4 ? 9 : 2

      return {
        companyId: row.companyId,
        companyName: row.companyName,
        region: row.province || row.city || 'N/D',
        orders: row.importedOrders,
        revenue: row.importedValue,
        sharePct: round1((row.importedValue / totalRevenue) * 100),
        trendPct,
        status: trendPct > 5 ? 'grow' : trendPct < 0 ? 'down' : 'stable',
      }
    })
}

function buildConcentrationMetrics(topCustomers: TopCustomerRow[]): ConcentrationMetrics {
  const total = topCustomers.reduce((sum, row) => sum + row.revenue, 0) || 1

  const shareOf = (count: number) =>
    round1((topCustomers.slice(0, count).reduce((sum, row) => sum + row.revenue, 0) / total) * 100)

  return {
    top1Share: shareOf(1),
    top3Share: shareOf(3),
    top5Share: shareOf(5),
    top10Share: shareOf(10),
  }
}

function buildRegionSeries(companyRows: ReturnType<typeof deriveCompanyRows>, orders: AnalysisOrder[]): RegionRevenueRow[] {
  const companyMap = new Map(companyRows.map((row) => [row.companyId, row]))
  const grouped = new Map<string, RegionRevenueRow>()

  for (const row of companyRows) {
    const key = row.province || row.city || 'Non assegnata'
    const current = grouped.get(key) ?? {
      region: key,
      revenue: 0,
      customers: 0,
      orders: 0,
      outstanding: 0,
    }

    current.revenue += row.importedValue
    current.customers += 1
    current.orders += row.importedOrders
    grouped.set(key, current)
  }

  for (const order of orders) {
    if (!order.company_id) continue
    const company = companyMap.get(order.company_id)
    if (!company) continue
    const key = company.province || company.city || 'Non assegnata'
    const current = grouped.get(key)
    if (!current) continue

    const source = String(order.source_type || '').toLowerCase()
    if (source.includes('outstanding')) {
      current.outstanding += Number(order.total_eur || 0)
    }
  }

  return Array.from(grouped.values())
    .filter((row) => row.revenue > 0 || row.customers > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 12)
}

function buildCustomerMovers(companyRows: ReturnType<typeof deriveCompanyRows>) {
  const base = companyRows
    .filter((row) => row.importedValue > 0)
    .map((row) => {
      const deltaPct =
        row.signal === 'high' ? -12 :
        row.signal === 'medium' ? 6 :
        row.importedOrders >= 5 ? 11 : 3

      const deltaValue = round1(row.importedValue * (deltaPct / 100))

      return {
        companyId: row.companyId,
        companyName: row.companyName,
        revenue: row.importedValue,
        deltaValue,
        deltaPct,
      }
    })

  return {
    growthLeaders: [...base]
      .filter((row) => row.deltaPct > 0)
      .sort((a, b) => b.deltaPct - a.deltaPct)
      .slice(0, 6) as CustomerMoverRow[],
    declineLeaders: [...base]
      .filter((row) => row.deltaPct < 0)
      .sort((a, b) => a.deltaPct - b.deltaPct)
      .slice(0, 6) as CustomerMoverRow[],
  }
}

function deriveAiState(row: ReturnType<typeof deriveCompanyRows>[number]): AiCustomerAction['aiState'] {
  if (row.importedValue >= 40000 || row.priorityBand === 'alta') return 'proteggi'
  if (row.potentialScore >= 70 && row.signal !== 'high') return 'spingi'
  if (row.riskScore >= 60 || row.overdueFollowups > 0) return 'recupera'
  return 'monitora'
}

function buildAiCustomerActions(companyRows: ReturnType<typeof deriveCompanyRows>): AiCustomerAction[] {
  return companyRows
    .filter((row) => row.importedValue > 0 || row.priorityScore >= 45)
    .sort((a, b) => (b.importedValue + b.priorityScore * 100) - (a.importedValue + a.priorityScore * 100))
    .slice(0, 16)
    .map((row) => {
      const aiState = deriveAiState(row)

      let reason = row.insight
      let nextAction = 'Verifica lo stato del cliente e aggiorna la prossima mossa.'
      let priority: AiCustomerAction['priority'] = 'medium'
      let trendLabel = 'Stabile'

      if (row.signal === 'high') trendLabel = 'In calo'
      else if (row.potentialScore >= 70) trendLabel = 'In crescita'
      else if (row.importedOrders >= 4) trendLabel = 'Buona continuità'

      if (aiState === 'proteggi') {
        reason = row.importedValue > 0
          ? 'Cliente ad alto valore o alta priorità: va protetto con presidio regolare.'
          : row.insight
        nextAction = 'Pianifica un contatto di presidio e verifica nuove opportunità.'
        priority = 'high'
      } else if (aiState === 'spingi') {
        reason = 'Segnali positivi e potenziale alto: il cliente può crescere ancora.'
        nextAction = 'Proponi up-sell, visita o riattivazione commerciale mirata.'
        priority = 'high'
      } else if (aiState === 'recupera') {
        reason = row.overdueFollowups > 0
          ? 'Ci sono follow-up in ritardo o segnali di rallentamento.'
          : 'Il cliente mostra rischio o calo di attenzione commerciale.'
        nextAction = 'Apri un follow-up urgente e verifica blocchi, timing o rischio perdita.'
        priority = row.overdueFollowups > 0 ? 'urgent' : 'high'
      }

      return {
        companyId: row.companyId,
        companyName: row.companyName,
        region: row.province || row.city || 'N/D',
        revenue: row.importedValue,
        trendLabel,
        aiState,
        reason,
        nextAction,
        priority,
      }
    })
}

export async function getAnalysisData() {
  const supabase = await createClient()

  const [companiesRes, opportunitiesRes, followupsRes, ordersRes, importsRes] = await Promise.all([
    supabase
      .from('companies')
      .select('id,name,status,city,province,industry')
      .order('updated_at', { ascending: false })
      .limit(300),
    supabase
      .from('opportunities')
      .select('id,company_id,stage,value_estimate,updated_at,title')
      .in('stage', ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation'])
      .order('updated_at', { ascending: false })
      .limit(500),
    supabase
      .from('followups')
      .select('id,company_id,status,priority,due_at,title')
      .in('status', ['pending', 'in_progress', 'overdue'])
      .order('due_at', { ascending: true })
      .limit(500),
    supabase
      .from('orders')
      .select('id,company_id,account,source_type,order_date,customer_order,bega_order,status,ship_date,positions,total_eur,month')
      .order('order_date', { ascending: false })
      .limit(1000),
    supabase
      .from('analysis_imports')
      .select('id,filename,rows_imported,status,notes,created_count,updated_count,skipped_count,warning_count,created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const companies = (companiesRes.data ?? []) as CrmCompanyLite[]
  const opportunities = (opportunitiesRes.data ?? []) as CrmOpportunityLite[]
  const followups = (followupsRes.data ?? []) as CrmFollowupLite[]
  const orders = ordersRes.error ? [] : ((ordersRes.data ?? []) as AnalysisOrder[])
  const imports = importsRes.error
    ? []
    : ((importsRes.data ?? []).map((item: any) => ({
        ...item,
        ...parseImportContext(item.notes ?? null),
      })) as AnalysisImportRecord[])

  const orderKpis = buildOrderKpis(orders)
  const companyRows = deriveCompanyRows({ companies, opportunities, followups, orders })
  const crmKpis = {
    companies: companies.length,
    openOpportunities: opportunities.length,
    pendingFollowups: followups.length,
    companiesWithSignals: companyRows.filter((row) => row.signal !== 'low').length,
  }

  const topCustomers = buildTopCustomers(companyRows)
  const concentrationMetrics = buildConcentrationMetrics(topCustomers)
  const regionSeries = buildRegionSeries(companyRows, orders)
  const { growthLeaders, declineLeaders } = buildCustomerMovers(companyRows)
  const aiCustomerActions = buildAiCustomerActions(companyRows)

  return {
    companiesForImport: companies.map((company) => ({ id: company.id, name: company.name })),
    crmKpis,
    orderKpis,
    monthlySeries: buildMonthlySeries(orders),
    accountSeries: buildAccountSeries(orders),
    statusSeries: buildStatusSeries(orders),
    companyRows: companyRows.slice(0, 24),
    topCustomers,
    concentrationMetrics,
    regionSeries,
    growthLeaders,
    declineLeaders,
    aiCustomerActions,
    priorityBuckets: buildPriorityBuckets(companyRows),
    suggestedFollowups: buildSuggestedFollowups({ companyRows, opportunities, followups }),
    actionPlan: buildActionPlan({ companyRows, opportunities, followups }),
    imports,
    recentOrders: orders.slice(0, 12),
    highlights: buildAnalysisHighlights({ companyRows, orders, importsCount: imports.length }),
    schemaReady: !ordersRes.error && !importsRes.error,
    schemaError: ordersRes.error?.message ?? importsRes.error?.message ?? null,
  }
}

export async function getCompanyAnalysis(companyId: string) {
  const supabase = await createClient()

  const [companyRes, opportunitiesRes, followupsRes, ordersRes, signalsRes] = await Promise.all([
    supabase.from('companies').select('id,name,status,city,province,industry').eq('id', companyId).maybeSingle(),
    supabase
      .from('opportunities')
      .select('id,company_id,stage,value_estimate,updated_at,title')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false })
      .limit(20),
    supabase
      .from('followups')
      .select('id,company_id,status,priority,due_at,title')
      .eq('company_id', companyId)
      .order('due_at', { ascending: true })
      .limit(20),
    supabase
      .from('orders')
      .select('id,company_id,account,source_type,order_date,customer_order,bega_order,status,ship_date,positions,total_eur,month')
      .eq('company_id', companyId)
      .order('order_date', { ascending: false })
      .limit(24),
    supabase
      .from('analysis_signals')
      .select('id,signal_type,severity,title,description,status,created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const company = companyRes.data as CrmCompanyLite | null
  if (!company) return null

  const opportunities = (opportunitiesRes.data ?? []) as CrmOpportunityLite[]
  const followups = (followupsRes.data ?? []) as CrmFollowupLite[]
  const orders = ordersRes.error ? [] : ((ordersRes.data ?? []) as AnalysisOrder[])
  const companyRow = deriveCompanyRows({ companies: [company], opportunities, followups, orders })[0]
  const monthlySeries = buildMonthlySeries(orders)
  const orderKpis = buildOrderKpis(orders)
  const suggestions = buildSuggestedFollowups({ companyRows: [companyRow], opportunities, followups })

  return {
    companyRow,
    orderKpis,
    monthlySeries,
    recentOrders: orders.slice(0, 6),
    openOpportunities: opportunities
      .filter((item) => ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation'].includes(item.stage))
      .slice(0, 4),
    activeFollowups: followups
      .filter((item) => ['pending', 'in_progress', 'overdue'].includes(item.status))
      .slice(0, 4),
    suggestions,
    priorityBuckets: buildPriorityBuckets([companyRow]),
    actionPlan: buildActionPlan({ companyRows: [companyRow], opportunities, followups }),
    signals: signalsRes.error ? [] : (signalsRes.data ?? []),
    schemaReady: !ordersRes.error,
  }
}

export async function getDashboardAnalysisSummary() {
  const supabase = await createClient()

  const [companiesRes, opportunitiesRes, followupsRes, ordersRes] = await Promise.all([
    supabase.from('companies').select('id,name,status,city,province,industry').order('updated_at', { ascending: false }).limit(200),
    supabase
      .from('opportunities')
      .select('id,company_id,stage,value_estimate,updated_at,title')
      .in('stage', ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation'])
      .order('updated_at', { ascending: false })
      .limit(300),
    supabase
      .from('followups')
      .select('id,company_id,status,priority,due_at,title')
      .in('status', ['pending', 'in_progress', 'overdue'])
      .order('due_at', { ascending: true })
      .limit(300),
    supabase
      .from('orders')
      .select('id,company_id,account,source_type,order_date,customer_order,bega_order,status,ship_date,positions,total_eur,month')
      .order('order_date', { ascending: false })
      .limit(800),
  ])

  const companyRows = deriveCompanyRows({
    companies: (companiesRes.data ?? []) as CrmCompanyLite[],
    opportunities: (opportunitiesRes.data ?? []) as CrmOpportunityLite[],
    followups: (followupsRes.data ?? []) as CrmFollowupLite[],
    orders: ordersRes.error ? [] : ((ordersRes.data ?? []) as AnalysisOrder[]),
  })

  return {
    dashboardSignals: buildDashboardSignals(companyRows),
    suggestedFollowups: buildSuggestedFollowups({
      companyRows,
      opportunities: (opportunitiesRes.data ?? []) as CrmOpportunityLite[],
      followups: (followupsRes.data ?? []) as CrmFollowupLite[],
    }),
    actionPlan: buildActionPlan({
      companyRows,
      opportunities: (opportunitiesRes.data ?? []) as CrmOpportunityLite[],
      followups: (followupsRes.data ?? []) as CrmFollowupLite[],
    }),
    priorityBuckets: buildPriorityBuckets(companyRows),
  }
}
