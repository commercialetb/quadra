'use client'

import { useState } from 'react'

export function OpportunityAiCard({ opportunityId }: { opportunityId: string }) {
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [meta, setMeta] = useState('')

  async function generateSuggestion() {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/opportunity-next-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId }),
      })
      const result = await response.json()
      setSuggestion(result.suggestion || result.error || 'Nessun output disponibile.')
      setMeta(result.provider ? `${result.provider} · ${result.model}` : '')
    } catch {
      setSuggestion('Impossibile generare un suggerimento in questo momento.')
      setMeta('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel-card">
      <div className="panel-head">
        <div>
          <h2>Next action AI</h2>
          <p>Suggerimento operativo basato su fase, note e follow-up collegati.</p>
        </div>
        <button type="button" className="primary-button" onClick={generateSuggestion} disabled={loading}>
          {loading ? 'Analisi...' : 'Suggerisci'}
        </button>
      </div>

      <div className="assistant-output">{suggestion || 'Genera una proposta concreta per la prossima mossa commerciale.'}</div>
      {meta ? <div className="helper-text">{meta}</div> : null}
    </section>
  )
}
