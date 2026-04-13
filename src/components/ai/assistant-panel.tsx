'use client'

import { useState } from 'react'

type DashboardData = {
  kpis: {
    overdueCount: number
    todayCount: number
    openCount: number
    pipelineValue: number
  }
}

export function AssistantPanel({ data }: { data: DashboardData }) {
  const [brief, setBrief] = useState('')
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState<'brief' | 'query' | ''>('')
  const [meta, setMeta] = useState('')

  async function generateBrief() {
    setLoading('brief')
    try {
      const response = await fetch('/api/ai/daily-brief', { method: 'POST' })
      const result = await response.json()
      setBrief(result.brief || result.error || 'Nessun brief disponibile.')
      setMeta(result.provider ? `${result.provider} · ${result.model}` : '')
    } catch {
      setBrief('Impossibile generare il brief in questo momento.')
      setMeta('')
    } finally {
      setLoading('')
    }
  }

  async function runQuery() {
    if (!query.trim()) return
    setLoading('query')
    try {
      const response = await fetch('/api/ai/query-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      })
      const result = await response.json()
      setAnswer(result.answer || result.error || 'Nessun risultato disponibile.')
      setMeta(result.provider ? `${result.provider} · ${result.model}` : '')
    } catch {
      setAnswer('Impossibile interrogare il CRM in questo momento.')
      setMeta('')
    } finally {
      setLoading('')
    }
  }

  return (
    <section className="panel-card assistant-panel">
      <div className="panel-head">
        <div>
          <h2>Copilota AI</h2>
          <p>Brief giornaliero e query naturali sui dati reali del CRM.</p>
        </div>
        <button type="button" className="primary-button" onClick={generateBrief} disabled={loading === 'brief'}>
          {loading === 'brief' ? 'Generazione...' : 'Genera brief'}
        </button>
      </div>

      {brief ? <div className="assistant-brief">{brief}</div> : <div className="empty-block">Genera un brief veloce sulle priorità di oggi.</div>}

      <div className="field-stack" style={{ marginTop: 14 }}>
        <span>Chiedi a Quadra</span>
        <textarea
          className="field-control field-area assistant-textarea"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Es. Chi devo sentire oggi? Oppure: quali opportunità sopra 10k sono ferme?"
        />
      </div>
      <div className="assistant-links" style={{ marginTop: 12 }}>
        <button type="button" className="secondary-button" onClick={runQuery} disabled={loading === 'query' || !query.trim()}>
          {loading === 'query' ? 'Analisi...' : 'Interroga il CRM'}
        </button>
        <a href="/assistant" className="ghost-button">Apri assistente</a>
        <a href="/capture/voice" className="ghost-button">Cattura vocale</a>
        <a href="/capture/siri" className="ghost-button">Siri flow</a>
      </div>

      {answer ? <div className="assistant-brief" style={{ marginTop: 14 }}>{answer}</div> : null}
      {meta ? <div className="helper-text">{meta}</div> : null}

      <div className="helper-text" style={{ marginTop: 10 }}>
        Oggi: {data.kpis.todayCount} follow-up · {data.kpis.overdueCount} in ritardo · {data.kpis.openCount} opportunità aperte.
      </div>
    </section>
  )
}
