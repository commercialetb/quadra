'use client'

import { useState } from 'react'

type ProcessResult = {
  ok: boolean
  error?: string
  canAutoCreate?: boolean
  createdFollowupId?: string | null
  parsed?: {
    personName: string | null
    projectName: string | null
    companyName: string | null
    summary: string
    followUpTitle: string
    dueDateISO: string | null
    priority: 'low' | 'medium' | 'high'
    statusSignal: string | null
    reminderTitle: string
    reminderNotes: string
  }
  reminder?: {
    title: string
    dueDateISO: string | null
    notes: string
  }
  matches?: {
    contact?: { match?: { name: string } ; ambiguous?: boolean } | null
    opportunity?: { match?: { name: string } ; ambiguous?: boolean } | null
    company?: { match?: { name: string } ; ambiguous?: boolean } | null
  }
}

export function SiriShortcutWorkspace({ initialNote = '' }: { initialNote?: string }) {
  const [note, setNote] = useState(initialNote)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ProcessResult | null>(null)

  async function runFlow() {
    if (!note.trim()) return
    setBusy(true)
    setResult(null)
    try {
      const response = await fetch('/api/shortcut/process-voice-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      const json = (await response.json()) as ProcessResult
      setResult(json)
    } finally {
      setBusy(false)
    }
  }

  const reminderBlock = result?.reminder
    ? `Titolo: ${result.reminder.title}\nData: ${result.reminder.dueDateISO || 'da definire'}\nNote: ${result.reminder.notes}`
    : ''

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Siri automation</p>
          <h1 className="page-title">Siri → Quadra → Promemoria</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Incolla il dettato di Siri oppure passa il testo da Comandi Rapidi. Quadra prova a creare il follow-up e ti restituisce anche il promemoria Apple da usare nello shortcut.
          </p>
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>Dettato</h2>
            <p>Esempio: Ho parlato con l'arch. Pinco e mi ha detto che il progetto EUR è in stallo e di richiamarlo il 25 aprile.</p>
          </div>
        </div>
        <label className="field-stack">
          <span>Testo di Siri</span>
          <textarea className="field-control field-area assistant-textarea" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className="sheet-actions assistant-actions">
          <button type="button" className="primary-button" onClick={runFlow} disabled={!note.trim() || busy}>
            {busy ? 'Elaborazione...' : 'Analizza e crea'}
          </button>
          <a href="/capture/voice" className="secondary-button">Apri cattura guidata</a>
        </div>
        <div className="helper-text">Per lo shortcut puoi chiamare questa pagina con <code>/capture/siri?note=...</code> oppure usare direttamente l'endpoint server.</div>
      </section>

      <div className="dashboard-grid two-up assistant-grid">
        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>Esito Quadra</h2><p>Creazione automatica se il match e chiaro.</p></div></div>
          <div className="assistant-output">
            {result ? (
              result.ok ? (
                <div className="stack-sm">
                  <div><strong>Esito:</strong> {result.canAutoCreate ? 'Follow-up creato in Quadra' : 'Serve revisione rapida'}</div>
                  <div><strong>Contatto:</strong> {result.matches?.contact?.match?.name || 'Non trovato'}</div>
                  <div><strong>Opportunità:</strong> {result.matches?.opportunity?.match?.name || 'Non trovata'}</div>
                  <div><strong>Azienda:</strong> {result.matches?.company?.match?.name || 'Non trovata'}</div>
                  <div><strong>Sintesi:</strong> {result.parsed?.summary}</div>
                  <div><strong>Follow-up:</strong> {result.parsed?.followUpTitle}</div>
                  <div><strong>Data:</strong> {result.parsed?.dueDateISO || 'Da definire'}</div>
                </div>
              ) : result.error || 'Errore sconosciuto'
            ) : 'L’esito comparirà qui.'}
          </div>
        </section>

        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>Payload Promemoria Apple</h2><p>Usalo nelle azioni di Comandi Rapidi “Aggiungi promemoria”.</p></div></div>
          <textarea className="field-control field-area assistant-textarea" value={reminderBlock} readOnly />
          <div className="helper-text" style={{ marginTop: 10 }}>
            Shortcut: detta testo → ottieni testo → chiama endpoint Quadra → prendi titolo e data → crea promemoria Apple.
          </div>
        </section>
      </div>
    </div>
  )
}
