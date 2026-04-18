'use client'

import { useEffect, useRef, useState } from 'react'

type ParsedNote = {
  summary: string
  followUpTitle: string
  followUpDueHint: string
  priority: 'low' | 'medium' | 'high'
  opportunitySignal: 'negative' | 'neutral' | 'positive'
  suggestedStatusUpdate: string
}

type MessageForm = {
  messageType: 'email' | 'whatsapp' | 'followup' | 'recap'
  tone: 'formale' | 'diretto' | 'caldo' | 'commerciale'
  company: string
  contact: string
  opportunity: string
  objective: string
  notes: string
}

export function AssistantWorkspace({ initialCrmQuestion = '', autoRunCrm = false }: { initialCrmQuestion?: string; autoRunCrm?: boolean }) {
  const [note, setNote] = useState('')
  const [summary, setSummary] = useState('')
  const [context, setContext] = useState({ company: '', contact: '', opportunity: '', stage: '', note: '' })
  const [nextAction, setNextAction] = useState('')
  const [parseInput, setParseInput] = useState('')
  const [parsed, setParsed] = useState<ParsedNote | null>(null)
  const [crmQuestion, setCrmQuestion] = useState(initialCrmQuestion)
  const [crmAnswer, setCrmAnswer] = useState('')
  const [crmMeta, setCrmMeta] = useState('')
  const [messageForm, setMessageForm] = useState<MessageForm>({
    messageType: 'email',
    tone: 'commerciale',
    company: '',
    contact: '',
    opportunity: '',
    objective: '',
    notes: '',
  })
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [busy, setBusy] = useState<'summary' | 'action' | 'parse' | 'message' | 'crm' | ''>('')
  const autoRunRef = useRef(false)

  useEffect(() => {
    if (!initialCrmQuestion) return
    setCrmQuestion(initialCrmQuestion)
  }, [initialCrmQuestion])

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

  async function parseNote() {
    setBusy('parse')
    try {
      const response = await fetch('/api/ai/parse-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: parseInput }),
      })
      const result = await response.json()
      setParsed(result.parsed || null)
    } finally {
      setBusy('')
    }
  }

  async function generateMessage() {
    setBusy('message')
    try {
      const response = await fetch('/api/ai/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageForm),
      })
      const result = await response.json()
      setGeneratedMessage(result.message || result.error || 'Nessun output disponibile.')
    } finally {
      setBusy('')
    }
  }

  async function askCrm() {
    setBusy('crm')
    try {
      const response = await fetch('/api/ai/query-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: crmQuestion }),
      })
      const result = await response.json()
      setCrmAnswer(result.answer || result.error || 'Nessun output disponibile.')
      setCrmMeta(result.provider ? `${result.provider} · ${result.model}` : '')
    } finally {
      setBusy('')
    }
  }

  useEffect(() => {
    if (!autoRunCrm || autoRunRef.current) return
    if (!initialCrmQuestion.trim()) return
    autoRunRef.current = true
    void askCrm()
  }, [autoRunCrm, initialCrmQuestion])

  return (
    <div className="page-stack utility-page-stack">
      <div className="dashboard-grid two-up assistant-grid">
      <section className="panel-card">
        <div className="panel-head">
          <div>
            <h2>Siri / Shortcut</h2>
            <p>Per note vocali e cattura rapida usa la pagina guidata con parsing AI e salvataggio follow-up.</p>
          </div>
        </div>
        <div className="assistant-output">Apri la cattura vocale, incolla un dettato o passa il testo da Comandi Rapidi, poi salva il follow-up già strutturato.</div>
        <div className="sheet-actions assistant-actions">
          <a href="/capture/voice" className="primary-button">Apri cattura vocale</a>
          <a href="/capture/siri" className="secondary-button">Apri Siri layer</a>
        </div>
      </section>

        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Interroga il CRM</h2>
              <p>Usa linguaggio naturale per ottenere priorità, recap e deal da sbloccare.</p>
            </div>
          </div>
          <label className="field-stack">
            <span>Domanda</span>
            <textarea className="field-control field-area assistant-textarea" value={crmQuestion} onChange={(e) => setCrmQuestion(e.target.value)} placeholder="Es. Chi devo sentire oggi? Quali opportunità sopra 10k sono ferme? Fammi il recap di Rossi." />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={askCrm} disabled={!crmQuestion.trim() || busy === 'crm'}>
              {busy === 'crm' ? 'Analisi...' : 'Interroga'}
            </button>
          </div>
          <div className="assistant-output">{crmAnswer || 'La risposta sul CRM comparirà qui.'}</div>
          {crmMeta ? <div className="helper-text">{crmMeta}</div> : null}
        </section>

        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Riassumi nota</h2>
              <p>Trasforma appunti grezzi in una sintesi leggibile e utile.</p>
            </div>
          </div>
          <label className="field-stack">
            <span>Nota</span>
            <textarea className="field-control field-area assistant-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Incolla la nota libera o una trascrizione vocale..." />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={summarize} disabled={!note.trim() || busy === 'summary'}>
              {busy === 'summary' ? 'Sintesi...' : 'Riassumi'}
            </button>
          </div>
          <div className="assistant-output">{summary || 'La sintesi comparirà qui.'}</div>
        </section>

        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Suggerisci next action</h2>
              <p>Usa contesto commerciale per ottenere la prossima mossa più sensata.</p>
            </div>
          </div>
          <div className="form-grid two-col">
            <label className="field-stack"><span>Azienda</span><input className="field-control" value={context.company} onChange={(e) => setContext({ ...context, company: e.target.value })} /></label>
            <label className="field-stack"><span>Contatto</span><input className="field-control" value={context.contact} onChange={(e) => setContext({ ...context, contact: e.target.value })} /></label>
            <label className="field-stack"><span>Opportunità</span><input className="field-control" value={context.opportunity} onChange={(e) => setContext({ ...context, opportunity: e.target.value })} /></label>
            <label className="field-stack"><span>Fase</span><input className="field-control" value={context.stage} onChange={(e) => setContext({ ...context, stage: e.target.value })} /></label>
          </div>
          <label className="field-stack">
            <span>Contesto / nota</span>
            <textarea className="field-control field-area assistant-textarea" value={context.note} onChange={(e) => setContext({ ...context, note: e.target.value })} />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={suggest} disabled={busy === 'action'}>
              {busy === 'action' ? 'Elaborazione...' : 'Suggerisci'}
            </button>
          </div>
          <div className="assistant-output">{nextAction || 'Il suggerimento comparirà qui.'}</div>
        </section>

        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Nota → struttura CRM</h2>
              <p>Estrae riepilogo, follow-up suggerito, priorità e segnale opportunità.</p>
            </div>
          </div>
          <label className="field-stack">
            <span>Nota libera</span>
            <textarea className="field-control field-area assistant-textarea" value={parseInput} onChange={(e) => setParseInput(e.target.value)} placeholder="Es. Sentito Rossi, interessato, richiamare giovedì, budget 12k, vuole demo..." />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={parseNote} disabled={!parseInput.trim() || busy === 'parse'}>
              {busy === 'parse' ? 'Analisi...' : 'Struttura'}
            </button>
          </div>
          <div className="assistant-output">
            {parsed ? (
              <div className="stack-sm">
                <div><strong>Summary:</strong> {parsed.summary}</div>
                <div><strong>Follow-up:</strong> {parsed.followUpTitle}</div>
                <div><strong>Quando:</strong> {parsed.followUpDueHint}</div>
                <div><strong>Priorità:</strong> {parsed.priority}</div>
                <div><strong>Segnale opportunità:</strong> {parsed.opportunitySignal}</div>
                <div><strong>Aggiornamento:</strong> {parsed.suggestedStatusUpdate}</div>
              </div>
            ) : 'La struttura CRM comparirà qui.'}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Genera messaggio</h2>
              <p>Crea email, WhatsApp, recap o follow-up pronti da copiare.</p>
            </div>
          </div>
          <div className="form-grid two-col">
            <label className="field-stack">
              <span>Tipo</span>
              <select className="field-control" value={messageForm.messageType} onChange={(e) => setMessageForm({ ...messageForm, messageType: e.target.value as MessageForm['messageType'] })}>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="followup">Follow-up</option>
                <option value="recap">Recap post call</option>
              </select>
            </label>
            <label className="field-stack">
              <span>Tono</span>
              <select className="field-control" value={messageForm.tone} onChange={(e) => setMessageForm({ ...messageForm, tone: e.target.value as MessageForm['tone'] })}>
                <option value="commerciale">Commerciale</option>
                <option value="formale">Formale</option>
                <option value="diretto">Diretto</option>
                <option value="caldo">Caldo</option>
              </select>
            </label>
            <label className="field-stack"><span>Azienda</span><input className="field-control" value={messageForm.company} onChange={(e) => setMessageForm({ ...messageForm, company: e.target.value })} /></label>
            <label className="field-stack"><span>Contatto</span><input className="field-control" value={messageForm.contact} onChange={(e) => setMessageForm({ ...messageForm, contact: e.target.value })} /></label>
            <label className="field-stack"><span>Opportunità</span><input className="field-control" value={messageForm.opportunity} onChange={(e) => setMessageForm({ ...messageForm, opportunity: e.target.value })} /></label>
            <label className="field-stack"><span>Obiettivo</span><input className="field-control" value={messageForm.objective} onChange={(e) => setMessageForm({ ...messageForm, objective: e.target.value })} /></label>
          </div>
          <label className="field-stack">
            <span>Note di contesto</span>
            <textarea className="field-control field-area assistant-textarea" value={messageForm.notes} onChange={(e) => setMessageForm({ ...messageForm, notes: e.target.value })} />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={generateMessage} disabled={busy === 'message'}>
              {busy === 'message' ? 'Generazione...' : 'Genera'}
            </button>
          </div>
          <div className="assistant-output">{generatedMessage || 'Il messaggio generato comparirà qui.'}</div>
        </section>
      </div>
    </div>
  )
}
