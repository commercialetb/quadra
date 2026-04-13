'use client'

import { useMemo, useState } from 'react'

type DashboardData = {
  kpis: {
    overdueCount: number
    todayCount: number
    openCount: number
    pipelineValue: number
  }
  todayFollowups: Array<{ title: string; priority?: string | null }>
  staleOpportunities: Array<{ title: string; next_action?: string | null }>
}

export function AssistantPanel({ data }: { data: DashboardData }) {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const highlights = useMemo(() => {
    const today = data.todayFollowups.slice(0, 3).map((item) => `Follow-up: ${item.title}`)
    const stale = data.staleOpportunities.slice(0, 3).map((item) => `Deal fermo: ${item.title}${item.next_action ? ` · ${item.next_action}` : ''}`)
    return [...today, ...stale]
  }, [data])

  async function generateBrief() {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overdueFollowups: data.kpis.overdueCount,
          dueToday: data.kpis.todayCount,
          openOpportunities: data.kpis.openCount,
          pipelineValue: data.kpis.pipelineValue,
          highlights,
        }),
      })
      const result = await response.json()
      setBrief(result.brief || result.error || 'Nessun brief disponibile.')
    } catch {
      setBrief('Impossibile generare il brief in questo momento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel-card assistant-panel">
      <div className="panel-head">
        <div>
          <h2>Copilota AI</h2>
          <p>Brief giornaliero e accesso rapido a suggerimenti operativi.</p>
        </div>
        <button type="button" className="primary-button" onClick={generateBrief} disabled={loading}>
          {loading ? 'Generazione...' : 'Genera brief'}
        </button>
      </div>

      {brief ? <div className="assistant-brief">{brief}</div> : <div className="empty-block">Genera un brief veloce sulle priorità di oggi.</div>}

      <div className="assistant-links">
        <a href="/assistant" className="secondary-button">Apri assistente</a>
        <a href="/capture/followup" className="ghost-button">Shortcut follow-up</a>
      </div>
    </section>
  )
}
