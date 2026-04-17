type DashboardData = {
  kpis: {
    overdueCount?: number
    todayCount?: number
    openCount?: number
    pipelineValue?: number
  }
}

type AssistantPanelProps = {
  data: DashboardData
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function AssistantPanel({ data }: AssistantPanelProps) {
  const todayCount = data.kpis.todayCount ?? 0
  const overdueCount = data.kpis.overdueCount ?? 0
  const openCount = data.kpis.openCount ?? 0
  const pipelineValue = data.kpis.pipelineValue ?? 0

  return (
    <section className="quadra-panel quadra-assistant-panel">
      <div className="quadra-panel__header">
        <div>
          <p className="quadra-eyebrow">Assistente</p>
          <h3>Focus intelligente</h3>
        </div>
      </div>

      <div className="quadra-assistant-card">
        <p className="quadra-assistant-card__title">Cosa richiede attenzione</p>
        <p className="quadra-assistant-card__body">
          Oggi: {todayCount} follow-up · {overdueCount} in ritardo · {openCount} opportunità aperte.
        </p>
      </div>

      <div className="quadra-assistant-card">
        <p className="quadra-assistant-card__title">Pipeline attuale</p>
        <p className="quadra-assistant-card__body">{formatCurrency(pipelineValue)}</p>
      </div>
    </section>
  )
}
