'use client'

import { useState } from 'react'

export function AssistantWorkspace() {
  const [note, setNote] = useState('')
  const [summary, setSummary] = useState('')
  const [context, setContext] = useState({ company: '', contact: '', opportunity: '', stage: '', note: '' })
  const [nextAction, setNextAction] = useState('')
  const [busy, setBusy] = useState<'summary' | 'action' | ''>('')

  async function summarize() {
    setBusy('summary')
    try {
      const response = await fetch('/api/ai/summarize-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      const result = await response.json()
      setSummary(result.summary || result.error || 'Nessun output disponibile.')
    } finally {
      setBusy('')
    }
  }

  async function suggest() {
    setBusy('action')
    try {
      const response = await fetch('/api/ai/suggest-next-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      })
      const result = await response.json()
      setNextAction(result.suggestion || result.error || 'Nessun output disponibile.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Quadra AI</p>
          <h1 className="page-title">Assistente operativo</h1>
          <p className="page-subtitle dashboard-subtitle-compact">Riassumi note e fatti suggerire la prossima azione migliore.</p>
        </div>
      </section>

      <div className="dashboard-grid two-up assistant-grid">
        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Riassumi nota</h2>
              <p>Trasforma appunti grezzi in una sintesi leggibile e utile.</p>
            </div>
          </div>
          <label className="field-stack">
            <span>Nota</span>
            <textarea className="field-control field-area assistant-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Incolla una nota, una call recap o un appunto vocale trascritto..." />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={summarize} disabled={!note.trim() || busy === 'summary'}>
              {busy === 'summary' ? 'Elaborazione...' : 'Riassumi'}
            </button>
          </div>
          <div className="assistant-output">{summary || 'La sintesi comparirà qui.'}</div>
        </section>

        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Suggerisci next action</h2>
              <p>Usa il contesto del deal per scegliere la prossima mossa.</p>
            </div>
          </div>
          <div className="form-grid two-col">
            <label className="field-stack"><span>Azienda</span><input className="field-control" value={context.company} onChange={(e) => setContext({ ...context, company: e.target.value })} /></label>
            <label className="field-stack"><span>Contatto</span><input className="field-control" value={context.contact} onChange={(e) => setContext({ ...context, contact: e.target.value })} /></label>
            <label className="field-stack"><span>Opportunità</span><input className="field-control" value={context.opportunity} onChange={(e) => setContext({ ...context, opportunity: e.target.value })} /></label>
            <label className="field-stack"><span>Fase</span><input className="field-control" value={context.stage} onChange={(e) => setContext({ ...context, stage: e.target.value })} /></label>
          </div>
          <label className="field-stack">
            <span>Contesto</span>
            <textarea className="field-control field-area assistant-textarea" value={context.note} onChange={(e) => setContext({ ...context, note: e.target.value })} placeholder="Esito call, obiezioni, segnali positivi, scadenze..." />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={suggest} disabled={busy === 'action'}>
              {busy === 'action' ? 'Elaborazione...' : 'Suggerisci'}
            </button>
          </div>
          <div className="assistant-output">{nextAction || 'Il suggerimento comparirà qui.'}</div>
        </section>
      </div>
    </div>
  )
}
