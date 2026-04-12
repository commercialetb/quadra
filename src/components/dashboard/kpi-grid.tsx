function formatCurrency(value: number) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function KpiGrid({
  kpis,
}: {
  kpis: {
    openCount: number
    overdueCount: number
    todayCount: number
    pipelineValue: number
    wonCount: number
  }
}) {
  const items = [
    { label: 'Opportunità aperte', value: kpis.openCount, sub: 'Tutte le trattative attive', tone: 'blue' },
    { label: 'Follow-up scaduti', value: kpis.overdueCount, sub: 'Da sbloccare subito', tone: 'red' },
    { label: 'Follow-up di oggi', value: kpis.todayCount, sub: 'Focus giornata', tone: 'amber' },
    { label: 'Valore pipeline', value: formatCurrency(kpis.pipelineValue), sub: 'Valore totale stimato', tone: 'violet' },
    { label: 'Trattative vinte', value: kpis.wonCount, sub: 'Chiusure completate', tone: 'green' },
  ]

  return (
    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      {items.map((item) => (
        <div key={item.label} className="page-card kpi-card" data-tone={item.tone}>
          <div className="kpi-topline">
            <p className="kpi-label">{item.label}</p>
            <span className="metric-badge" data-tone={item.tone} />
          </div>
          <div className="kpi-value">{item.value}</div>
          <p className="kpi-sub">{item.sub}</p>
        </div>
      ))}
    </div>
  )
}
