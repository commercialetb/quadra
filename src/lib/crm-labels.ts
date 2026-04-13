export function labelize(value?: string | null) {
  if (!value) return '—'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

export function stageLabel(stage?: string | null) {
  const labels: Record<string, string> = {
    new_lead: 'Nuovo lead',
    contacted: 'Contattata',
    qualified: 'Qualificata',
    proposal: 'Proposta',
    negotiation: 'Negoziazione',
    won: 'Vinta',
    lost: 'Persa',
  }
  return labels[stage ?? ''] ?? labelize(stage)
}

export function followupStatusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    pending: 'Da fare',
    in_progress: 'In corso',
    completed: 'Completato',
    cancelled: 'Annullato',
    overdue: 'In ritardo',
  }
  return labels[status ?? ''] ?? labelize(status)
}

export function priorityLabel(priority?: string | null) {
  const labels: Record<string, string> = {
    low: 'Bassa',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
  }
  return labels[priority ?? ''] ?? labelize(priority)
}
