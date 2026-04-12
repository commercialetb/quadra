const LABELS: Record<string, string> = {
  all: 'Tutte',
  lead: 'Lead',
  prospect: 'Prospect',
  client: 'Cliente',
  partner: 'Partner',
  inactive: 'Inattiva',
  active: 'Attivo',
  pending: 'Da fare',
  in_progress: 'In corso',
  completed: 'Completato',
  cancelled: 'Annullato',
  overdue: 'In ritardo',
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
  new_lead: 'Nuovo lead',
  contacted: 'Contattata',
  qualified: 'Qualificata',
  proposal: 'Proposta',
  negotiation: 'Negoziazione',
  won: 'Vinta',
  lost: 'Persa',
  email: 'Email',
  whatsapp: 'WhatsApp',
  phone: 'Telefono',
}

export function crmLabel(value?: string | null) {
  if (!value) return 'Non definito'
  return LABELS[value] ?? value.replace(/_/g, ' ').replace(/^./, (m) => m.toUpperCase())
}
