'use client'

import { useMemo, useState } from 'react'

type ParsedNote = {
  summary: string
  followUpTitle: string
  followUpDueHint: string
  priority: 'low' | 'medium' | 'high'
  opportunitySignal: 'negative' | 'neutral' | 'positive'
  suggestedStatusUpdate: string
}

type CreateFollowupAction = (formData: FormData) => Promise<void>

type Props = {
  createFollowupAction: CreateFollowupAction
  initialNote?: string
  initialTitle?: string
  initialDescription?: string
  initialPriority?: string
}

function toLocalInput(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

function addHours(hours: number) {
  return toLocalInput(new Date(Date.now() + hours * 60 * 60 * 1000))
}

function nextWeekday(targetDay: number) {
  const date = new Date()
  const current = date.getDay()
  let diff = targetDay - current
  if (diff <= 0) diff += 7
  date.setDate(date.getDate() + diff)
  date.setHours(9, 0, 0, 0)
  return toLocalInput(date)
}

function dueHintToInput(hint: string) {
  const value = hint.toLowerCase()
  if (!value.trim()) return addHours(2)
  if (value.includes('oggi')) return addHours(2)
  if (value.includes('domani')) return addHours(24)
  if (value.includes('48')) return addHours(48)
  if (value.includes('settim')) return addHours(24 * 7)
  if (value.includes('lun')) return nextWeekday(1)
  if (value.includes('mar')) return nextWeekday(2)
  if (value.includes('mer')) return nextWeekday(3)
  if (value.includes('gio')) return nextWeekday(4)
  if (value.includes('ven')) return nextWeekday(5)
  return addHours(24)
}

export function VoiceCaptureWorkspace({
  createFollowupAction,
  initialNote = '',
  initialTitle = '',
  initialDescription = '',
  initialPriority = 'medium',
}: Props) {
  const [note, setNote] = useState(initialNote)
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [priority, setPriority] = useState(initialPriority)
  const [dueAt, setDueAt] = useState(addHours(2))
  const [status, setStatus] = useState('pending')
  const [parsed, setParsed] = useState<ParsedNote | null>(null)
  const [busy, setBusy] = useState(false)
  const [providerMeta, setProviderMeta] = useState('')
  const [error, setError] = useState('')

  const composedDescription = useMemo(() => {
    const blocks = [description.trim()]
    if (parsed?.summary) blocks.push(`Sintesi AI: ${parsed.summary}`)
    if (note.trim()) blocks.push(`Dettato originale: ${note.trim()}`)
    return blocks.filter(Boolean).join('\n\n')
  }, [description, parsed, note])

  async function parseVoiceNote() {
    if (!note.trim()) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/ai/parse-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Impossibile analizzare la nota')
      }
      const structured: ParsedNote = result.parsed
      setParsed(structured)
      setProviderMeta(result.provider ? `${result.provider} · ${result.model}` : '')
      setTitle((current) => current || structured.followUpTitle || 'Follow-up da nota vocale')
      setPriority(structured.priority || 'medium')
      setDueAt(dueHintToInput(structured.followUpDueHint || ''))
      setDescription((current) => current || structured.suggestedStatusUpdate || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Siri / Shortcut</p>
          <h1 className="page-title">Cattura vocale guidata</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Incolla il dettato di Siri o una trascrizione, lascia che Quadra lo strutturi e salva subito il follow-up.
          </p>
        </div>
      </section>

      <div className="dashboard-grid two-up assistant-grid">
        <section className="panel-card page-section-card">
          <div className="panel-head">
            <div>
              <h2>1. Dettato o testo libero</h2>
              <p>Perfetto per Shortcut che passano testo come query string o per note vocali già trascritte.</p>
            </div>
          </div>
          <label className="field-stack">
            <span>Dettato</span>
            <textarea
              className="field-control field-area assistant-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Es. Sentito Rossi, interessato, richiamare giovedì, budget 12k, vuole demo."
            />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={parseVoiceNote} disabled={!note.trim() || busy}>
              {busy ? 'Analisi...' : 'Analizza e prepara'}
            </button>
            <a href="/capture/followup" className="secondary-button">Vai alla cattura semplice</a>
          </div>
          <div className="helper-text">
            Esempio shortcut: <code>/capture/voice?note=Richiama%20Rossi%20domani%20per%20demo</code>
          </div>
          {error ? <div className="assistant-brief" style={{ marginTop: 12 }}>{error}</div> : null}
        </section>

        <section className="panel-card page-section-card">
          <div className="panel-head">
            <div>
              <h2>2. Struttura proposta dall'AI</h2>
              <p>Groq prepara un follow-up chiaro, una priorità e un timing suggerito.</p>
            </div>
          </div>
          <div className="assistant-output">
            {parsed ? (
              <div className="stack-sm">
                <div><strong>Sintesi:</strong> {parsed.summary}</div>
                <div><strong>Titolo follow-up:</strong> {parsed.followUpTitle}</div>
                <div><strong>Quando:</strong> {parsed.followUpDueHint}</div>
                <div><strong>Priorità:</strong> {parsed.priority}</div>
                <div><strong>Segnale opportunità:</strong> {parsed.opportunitySignal}</div>
                <div><strong>Aggiornamento suggerito:</strong> {parsed.suggestedStatusUpdate}</div>
              </div>
            ) : (
              'La struttura proposta comparirà qui.'
            )}
          </div>
          {providerMeta ? <div className="helper-text" style={{ marginTop: 10 }}>{providerMeta}</div> : null}
        </section>
      </div>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>3. Salva nel CRM</h2>
            <p>Controlla i campi e crea il follow-up. Il flusso manuale resta sempre disponibile.</p>
          </div>
        </div>
        <form action={createFollowupAction} className="sheet-form inline-shortcut-form">
          <div className="form-grid two-col">
            <label className="field-stack"><span>Titolo</span><input className="field-control" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
            <label className="field-stack"><span>Scadenza</span><input className="field-control" name="due_at" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required /></label>
            <label className="field-stack">
              <span>Priorità</span>
              <select className="field-control" name="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </label>
            <label className="field-stack">
              <span>Stato</span>
              <select className="field-control" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Da fare</option>
                <option value="in_progress">In corso</option>
              </select>
            </label>
          </div>
          <label className="field-stack">
            <span>Descrizione</span>
            <textarea className="field-control field-area" name="description" value={composedDescription} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="sheet-actions">
            <button className="primary-button" type="submit" disabled={!title.trim() || !dueAt}>Salva follow-up</button>
            <a href="/followups" className="ghost-button">Apri agenda</a>
          </div>
        </form>
      </section>
    </div>
  )
}
