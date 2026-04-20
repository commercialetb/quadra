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

function parseImportContext(notes: string | null) {
  const raw = String(notes || '').trim()
  if (!raw) return { company_name: null, source_type: null }
  const parts = raw.split('/').map((item) => item.trim())
  return {
    company_name: parts[0] || null,
    source_type: parts[1] || null,
  }
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

  return {
    companiesForImport: companies.map((company) => ({ id: company.id, name: company.name })),
    crmKpis,
    orderKpis,
    monthlySeries: buildMonthlySeries(orders),
    accountSeries: buildAccountSeries(orders),
    statusSeries: buildStatusSeries(orders),
    companyRows: companyRows.slice(0, 24),
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
    openOpportunities: opportunities.filter((item) => ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation'].includes(item.stage)).slice(0, 4),
    activeFollowups: followups.filter((item) => ['pending', 'in_progress', 'overdue'].includes(item.status)).slice(0, 4),
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
