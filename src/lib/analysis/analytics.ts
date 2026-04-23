import { normalizeAccountName } from '@/lib/analysis/parser'

export type AnalysisOrder = {
  id?: string
  owner_id?: string
  company_id?: string | null
  account: string
  source_type: string
  order_date: string
  customer_order: string
  bega_order: string
  status: string
  ship_date: string | null
  positions: number
  total_eur: number
  month: string
}

export type CrmCompanyLite = {
  id: string
  name: string
  status: string
  city: string | null
  province: string | null
  industry: string | null
}

export type CrmOpportunityLite = {
  id: string
  company_id: string | null
  stage: string
  value_estimate: number | null
  updated_at?: string | null
  title?: string | null
}

export type CrmFollowupLite = {
  id: string
  company_id: string | null
  status: string
  priority: string
  due_at: string
  title?: string | null
}

export type AnalysisCompanyRow = {
  companyId: string
  companyName: string
  status: string
  city: string | null
  province: string | null
  industry: string | null
  opportunities: number
  pipelineValue: number
  pendingFollowups: number
  overdueFollowups: number
  importedOrders: number
  importedValue: number
  lastOrderDate: string | null
  signal: 'high' | 'medium' | 'low'
  insight: string
  potentialScore: number
  riskScore: number
  priorityScore: number
  priorityBand: 'alta' | 'media' | 'base'
}

export type DashboardAnalysisSignal = {
  companyId: string
  companyName: string
  signal: 'high' | 'medium' | 'low'
  title: string
  detail: string
}

export type SuggestedFollowup = {
  companyId: string
  companyName: string
  title: string
  description: string
  priority: 'medium' | 'high' | 'urgent'
}

export type AnalysisActionPlanItem = {
  companyId: string
  companyName: string
  title: string
  detail: string
  priority: 'medium' | 'high' | 'urgent'
  lane: 'agenda' | 'pipeline' | 'ordini' | 'copertura'
}

export type PriorityBucketItem = {
  companyId: string
  companyName: string
  score: number
  band: AnalysisCompanyRow['priorityBand']
  reason: string
}

export type PriorityBuckets = {
  callNow: PriorityBucketItem[]
  reactivate: PriorityBucketItem[]
  monitor: PriorityBucketItem[]
}

function daysSince(value: string | null | undefined) {
  if (!value) return null
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return null
  return Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24))
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function getPriorityBand(score: number): AnalysisCompanyRow['priorityBand'] {
  if (score >= 70) return 'alta'
  if (score >= 45) return 'media'
  return 'base'
}

export function buildOrderKpis(orders: AnalysisOrder[]) {
  const totalValue = orders.reduce((sum, order) => sum + Number(order.total_eur || 0), 0)
  const completedValue = orders
    .filter((order) => normalizeAccountName(order.source_type) === 'completed')
    .reduce((sum, order) => sum + Number(order.total_eur || 0), 0)
  const outstandingValue = orders
    .filter((order) => normalizeAccountName(order.source_type) === 'outstanding')
    .reduce((sum, order) => sum + Number(order.total_eur || 0), 0)
  const deliveredCount = orders.filter((order) => normalizeAccountName(order.status) === 'consegnato').length
  const cancelledCount = orders.filter((order) => normalizeAccountName(order.status) === 'annullato').length

  return {
    totalValue,
    completedValue,
    outstandingValue,
    orderCount: orders.length,
    averageOrderValue: orders.length > 0 ? totalValue / orders.length : 0,
    deliveredCount,
    cancelledCount,
  }
}

export function buildMonthlySeries(orders: AnalysisOrder[]) {
  const map = new Map<string, number>()
  for (const order of orders) {
    if (!order.month) continue
    map.set(order.month, (map.get(order.month) ?? 0) + Number(order.total_eur || 0))
  }
  return Array.from(map.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, value]) => ({ label, value }))
}

export function buildStatusSeries(orders: AnalysisOrder[]) {
  const map = new Map<string, number>()
  for (const order of orders) {
    const key = order.status?.trim() || 'Senza stato'
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([label, value]) => ({ label, value }))
}

export function buildAccountSeries(orders: AnalysisOrder[]) {
  const map = new Map<string, number>()
  for (const order of orders) {
    const key = order.account?.trim() || 'Account non assegnato'
    map.set(key, (map.get(key) ?? 0) + Number(order.total_eur || 0))
  }
  return Array.from(map.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }))
}

export function deriveCompanyRows({
  companies,
  opportunities,
  followups,
  orders,
}: {
  companies: CrmCompanyLite[]
  opportunities: CrmOpportunityLite[]
  followups: CrmFollowupLite[]
  orders: AnalysisOrder[]
}) {
  const opportunityMap = new Map<string, { count: number; value: number }>()
  for (const opportunity of opportunities) {
    if (!opportunity.company_id) continue
    const bucket = opportunityMap.get(opportunity.company_id) ?? { count: 0, value: 0 }
    bucket.count += 1
    bucket.value += Number(opportunity.value_estimate ?? 0)
    opportunityMap.set(opportunity.company_id, bucket)
  }

  const followupMap = new Map<string, { pending: number; overdue: number }>()
  const now = Date.now()
  for (const followup of followups) {
    if (!followup.company_id) continue
    const bucket = followupMap.get(followup.company_id) ?? { pending: 0, overdue: 0 }
    bucket.pending += 1
    if (new Date(followup.due_at).getTime() < now) bucket.overdue += 1
    followupMap.set(followup.company_id, bucket)
  }

  const ordersMap = new Map<string, { count: number; value: number; lastOrderDate: string | null }>()
  for (const order of orders) {
    if (!order.company_id) continue
    const bucket = ordersMap.get(order.company_id) ?? { count: 0, value: 0, lastOrderDate: null }
    bucket.count += 1
    bucket.value += Number(order.total_eur || 0)
    if (!bucket.lastOrderDate || order.order_date > bucket.lastOrderDate) {
      bucket.lastOrderDate = order.order_date
    }
    ordersMap.set(order.company_id, bucket)
  }

  const rows: AnalysisCompanyRow[] = companies.map((company) => {
    const opp = opportunityMap.get(company.id) ?? { count: 0, value: 0 }
    const followup = followupMap.get(company.id) ?? { pending: 0, overdue: 0 }
    const order = ordersMap.get(company.id) ?? { count: 0, value: 0, lastOrderDate: null }

    let signal: AnalysisCompanyRow['signal'] = 'low'
    let insight = 'Monitoraggio ordinario.'

    if (followup.overdue > 0) {
      signal = 'high'
      insight = `${followup.overdue} follow-up in ritardo da riallineare.`
    } else if (order.value > 0 && opp.count === 0) {
      signal = 'medium'
      insight = 'Cliente con storico ordini ma senza opportunità aperte.'
    } else if (opp.count > 0 && followup.pending === 0) {
      signal = 'medium'
      insight = 'Pipeline attiva ma senza prossima azione.'
    } else if (order.count === 0 && company.status === 'client') {
      signal = 'medium'
      insight = 'Cliente senza dati ordine importati: utile completare la lettura.'
    }

    const potentialScore = clampScore(
      (opp.value >= 50000 ? 34 : opp.value >= 20000 ? 26 : opp.value > 0 ? 16 : 0) +
        (order.value >= 40000 ? 30 : order.value >= 15000 ? 22 : order.value > 0 ? 12 : 0) +
        (opp.count >= 3 ? 16 : opp.count > 0 ? 8 : 0) +
        (order.count >= 4 ? 12 : order.count > 0 ? 6 : 0) +
        (company.status === 'client' ? 8 : company.status === 'prospect' ? 5 : 0)
    )

    const riskScore = clampScore(
      (followup.overdue > 0 ? Math.min(40, 18 + followup.overdue * 8) : 0) +
        (opp.count > 0 && followup.pending === 0 ? 20 : 0) +
        (order.count === 0 && company.status === 'client' ? 18 : 0) +
        (order.value > 0 && opp.count === 0 ? 16 : 0) +
        (signal === 'high' ? 12 : signal === 'medium' ? 6 : 0)
    )

    const priorityScore = clampScore(Math.round(potentialScore * 0.55 + riskScore * 0.45))

    return {
      companyId: company.id,
      companyName: company.name,
      status: company.status,
      city: company.city,
      province: company.province,
      industry: company.industry,
      opportunities: opp.count,
      pipelineValue: opp.value,
      pendingFollowups: followup.pending,
      overdueFollowups: followup.overdue,
      importedOrders: order.count,
      importedValue: order.value,
      lastOrderDate: order.lastOrderDate,
      signal,
      insight,
      potentialScore,
      riskScore,
      priorityScore,
      priorityBand: getPriorityBand(priorityScore),
    }
  })

  return rows.sort((left, right) => {
    const signalScore = { high: 3, medium: 2, low: 1 }
    const delta = signalScore[right.signal] - signalScore[left.signal]
    if (delta !== 0) return delta
    return right.priorityScore - left.priorityScore
  })
}

export function buildAnalysisHighlights({
  companyRows,
  orders,
  importsCount,
}: {
  companyRows: AnalysisCompanyRow[]
  orders: AnalysisOrder[]
  importsCount: number
}) {
  const highlights: string[] = []
  const highSignalCount = companyRows.filter((row) => row.signal === 'high').length
  const highPriorityCount = companyRows.filter((row) => row.priorityBand === 'alta').length
  const withImportedOrders = companyRows.filter((row) => row.importedOrders > 0).length
  const crmOnlyCount = companyRows.length - withImportedOrders

  if (highSignalCount > 0) {
    highlights.push(`${highSignalCount} aziende hanno segnali alti da lavorare subito.`)
  }
  if (highPriorityCount > 0) {
    highlights.push(`${highPriorityCount} aziende hanno priorità alta nel nuovo scoring.`)
  }
  if (orders.length > 0) {
    highlights.push(`${orders.length} ordini importati stanno già arricchendo il CRM.`)
  }
  if (importsCount > 0) {
    highlights.push(`${importsCount} import completati: la base ordini è già riusabile.`)
  }
  if (crmOnlyCount > 0) {
    highlights.push(`${crmOnlyCount} aziende sono già analizzabili anche senza CSV.`)
  }

  return highlights.slice(0, 4)
}

export function buildDashboardSignals(companyRows: AnalysisCompanyRow[]): DashboardAnalysisSignal[] {
  return companyRows.slice(0, 5).map((row) => ({
    companyId: row.companyId,
    companyName: row.companyName,
    signal: row.signal,
    title:
      row.signal === 'high'
        ? 'Intervento rapido'
        : row.signal === 'medium'
          ? 'Da presidiare'
          : 'Monitoraggio',
    detail: `${row.insight} · score ${row.priorityScore}/100`,
  }))
}

export function buildSuggestedFollowups({
  companyRows,
  opportunities,
  followups,
}: {
  companyRows: AnalysisCompanyRow[]
  opportunities: CrmOpportunityLite[]
  followups: CrmFollowupLite[]
}): SuggestedFollowup[] {
  const followupCompanyIds = new Set(followups.map((item) => item.company_id).filter(Boolean))
  const staleOpportunityMap = new Map<string, number>()

  for (const opportunity of opportunities) {
    if (!opportunity.company_id) continue
    const days = daysSince(opportunity.updated_at)
    if (days != null && days >= 10) {
      staleOpportunityMap.set(opportunity.company_id, (staleOpportunityMap.get(opportunity.company_id) ?? 0) + 1)
    }
  }

  const suggestions: SuggestedFollowup[] = []

  for (const row of companyRows) {
    if (row.overdueFollowups > 0) {
      suggestions.push({
        companyId: row.companyId,
        companyName: row.companyName,
        title: `Riallineare agenda ${row.companyName}`,
        description: `${row.overdueFollowups} follow-up risultano in ritardo: serve una chiusura o una nuova data.`,
        priority: 'urgent',
      })
      continue
    }

    if (staleOpportunityMap.get(row.companyId) && row.pendingFollowups === 0) {
      suggestions.push({
        companyId: row.companyId,
        companyName: row.companyName,
        title: `Riattivare trattativa ${row.companyName}`,
        description: `Ci sono ${staleOpportunityMap.get(row.companyId)} opportunità ferme senza prossima azione attiva.`,
        priority: 'high',
      })
      continue
    }

    if (row.importedValue > 0 && row.opportunities === 0 && !followupCompanyIds.has(row.companyId)) {
      suggestions.push({
        companyId: row.companyId,
        companyName: row.companyName,
        title: `Aprire follow-up commerciale ${row.companyName}`,
        description: 'Storico ordini presente ma nessuna opportunità o agenda collegata: utile fissare un contatto.',
        priority: 'high',
      })
      continue
    }

    if (row.status === 'client' && row.importedOrders === 0) {
      suggestions.push({
        companyId: row.companyId,
        companyName: row.companyName,
        title: `Completare lettura dati ${row.companyName}`,
        description: 'Cliente attivo nel CRM ma senza base ordini importata: conviene completare il quadro.',
        priority: 'medium',
      })
    }
  }

  return suggestions.slice(0, 6)
}

export function buildActionPlan({
  companyRows,
  opportunities,
  followups,
}: {
  companyRows: AnalysisCompanyRow[]
  opportunities: CrmOpportunityLite[]
  followups: CrmFollowupLite[]
}): AnalysisActionPlanItem[] {
  const staleOpportunityMap = new Map<string, number>()
  const followupCompanyIds = new Set(followups.map((item) => item.company_id).filter(Boolean))

  for (const opportunity of opportunities) {
    if (!opportunity.company_id) continue
    const days = daysSince(opportunity.updated_at)
    if (days != null && days >= 14) {
      staleOpportunityMap.set(opportunity.company_id, (staleOpportunityMap.get(opportunity.company_id) ?? 0) + 1)
    }
  }

  const items: AnalysisActionPlanItem[] = []

  for (const row of companyRows) {
    if (row.overdueFollowups > 0) {
      items.push({
        companyId: row.companyId,
        companyName: row.companyName,
        title: `Chiudi agenda ${row.companyName}`,
        detail: `${row.overdueFollowups} follow-up in ritardo: serve chiudere o ripianificare oggi.`,
        priority: 'urgent',
        lane: 'agenda',
      })
      continue
    }

    const staleCount = staleOpportunityMap.get(row.companyId) ?? 0
    if (staleCount > 0 && row.pendingFollowups === 0) {
      items.push({
        companyId: row.companyId,
        companyName: row.companyName,
        title: `Sblocca pipeline ${row.companyName}`,
        detail: `${staleCount} opportunità ferme senza prossima azione attiva.`,
        priority: row.pipelineValue >= 15000 ? 'urgent' : 'high',
        lane: 'pipeline',
      })
      continue
    }

    if (row.importedValue > 0 && row.opportunities === 0) {
      items.push({
        companyId: row.companyId,
        companyName: row.companyName,
        title: `Apri opportunità da ordini ${row.companyName}`,
        detail: `Storico ordini da ${Math.round(row.importedValue)} EUR ma nessuna opportunità collegata.`,
        priority: row.importedValue >= 10000 ? 'high' : 'medium',
        lane: 'ordini',
      })
      continue
    }

    if (row.status === 'client' && row.importedOrders === 0 && !followupCompanyIds.has(row.companyId)) {
      items.push({
        companyId: row.companyId,
        companyName: row.companyName,
        title: `Completa lettura ${row.companyName}`,
        detail: 'Cliente nel CRM ma senza base ordini o agenda attiva: conviene completare il quadro.',
        priority: 'medium',
        lane: 'copertura',
      })
    }
  }

  const priorityScore = { urgent: 3, high: 2, medium: 1 } as const
  return items
    .sort((left, right) => priorityScore[right.priority] - priorityScore[left.priority])
    .slice(0, 6)
}

export function buildPriorityBuckets(companyRows: AnalysisCompanyRow[]): PriorityBuckets {
  const sorted = [...companyRows].sort((left, right) => right.priorityScore - left.priorityScore)

  return {
    callNow: sorted
      .filter((row) => row.priorityScore >= 70 || row.overdueFollowups > 0)
      .slice(0, 4)
      .map((row) => ({
        companyId: row.companyId,
        companyName: row.companyName,
        score: row.priorityScore,
        band: row.priorityBand,
        reason: row.overdueFollowups > 0 ? `${row.overdueFollowups} follow-up in ritardo.` : row.insight,
      })),
    reactivate: sorted
      .filter((row) => row.opportunities > 0 && row.pendingFollowups === 0)
      .slice(0, 4)
      .map((row) => ({
        companyId: row.companyId,
        companyName: row.companyName,
        score: row.priorityScore,
        band: row.priorityBand,
        reason: row.insight,
      })),
    monitor: sorted
      .filter((row) => row.priorityScore >= 45 && row.priorityScore < 70)
      .slice(0, 4)
      .map((row) => ({
        companyId: row.companyId,
        companyName: row.companyName,
        score: row.priorityScore,
        band: row.priorityBand,
        reason: row.insight,
      })),
  }
}
