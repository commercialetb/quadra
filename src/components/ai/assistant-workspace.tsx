'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

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

type AssistantTab = 'query' | 'brief' | 'write' | 'parse'

const QUICK_PROMPTS = [
  'Chi devo sentire oggi?',
  'Quali opportunità sopra 10k sono ferme?',
  'Fammi il recap delle priorità di oggi.',
  'Quali follow-up sono in ritardo?',
]

export function AssistantWorkspace() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<AssistantTab>('query')
  const [note, setNote] = useState('')
  const [summary, setSummary] = useState('')
  const [context, setContext] = useState({ company: '', contact: '', opportunity: '', stage: '', note: '' })
  const [nextAction, setNextAction] = useState('')
  const [parseInput, setParseInput] = useState('')
  const [parsed, setParsed] = useState<ParsedNote | null>(null)
  const [crmQuestion, setCrmQuestion] = useState('')
  const [crmAnswer, setCrmAnswer] = useState('')
  const [crmMeta, setCrmMeta] = useState('')
  const [brief, setBrief] = useState('')
  const [briefMeta, setBriefMeta] = useState('')
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
  const [busy, setBusy] = useState<'summary' | 'action' | 'parse' | 'message' | 'crm' | 'brief' | ''>('')

  const initialQuery = searchParams.get('q') || searchParams.get('prompt') || ''
  const initialTab = (searchParams.get('tab') || '').toLowerCase()
  const initialAction = (searchParams.get('action') || '').toLowerCase()

  useEffect(() => {
    if (initialQuery) {
      setCrmQuestion((current) => current || initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    if (initialTab === 'brief' || initialAction === 'brief') {
      setActiveTab('brief')
    } else if (initialTab === 'write') {
      setActiveTab('write')
    } else if (initialTab === 'parse') {
      setActiveTab('parse')
    } else if (initialQuery) {
      setActiveTab('query')
    }
  }, [initialAction, initialQuery, initialTab])

  useEffect(() => {
    if (initialAction === 'brief' && !brief && busy === '') {
      void generateBrief()
    }
  }, [initialAction])

  const crmSuggestions = useMemo(() => QUICK_PROMPTS, [])

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
    if (!crmQuestion.trim()) return
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

  async function generateBrief() {
    setBusy('brief')
    try {
      const response = await fetch('/api/ai/daily-brief', { method: 'POST' })
      const result = await response.json()
      setBrief(result.brief || result.error || 'Nessun brief disponibile.')
      setBriefMeta(result.provider ? `${result.provider} · ${result.model}` : '')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="page-stack utility-page-stack quadra-ai-workspace">
      <section className="panel-card quadra-ai-hero">
        <div className="quadra-ai-hero-copy">
          <span className="quadra-ai-eyebrow">Assistente AI</span>
          <h1>Interroga il CRM, genera brief e trasforma note in azioni.</h1>
          <p>Un solo workspace per priorità del giorno, recap commerciali, messaggi pronti e parsing di note vocali.</p>
        </div>
        <div className="quadra-ai-hero-actions">
          <button type="button" className={`quadra-ai-tab ${activeTab === 'query' ? 'is-active' : ''}`} onClick={() => setActiveTab('query')}>CRM</button>
          <button type="button" className={`quadra-ai-tab ${activeTab === 'brief' ? 'is-active' : ''}`} onClick={() => setActiveTab('brief')}>Brief</button>
          <button type="button" className={`quadra-ai-tab ${activeTab === 'write' ? 'is-active' : ''}`} onClick={() => setActiveTab('write')}>Messaggi</button>
          <button type="button" className={`quadra-ai-tab ${activeTab === 'parse' ? 'is-active' : ''}`} onClick={() => setActiveTab('parse')}>Note</button>
        </div>
      </section>

      <section className="panel-card quadra-ai-query-card">
        <div className="panel-head">
          <div>
            <h2>Chiedi a Quadra</h2>
            <p>Domande naturali sul CRM con scorciatoie già pronte per la giornata.</p>
          </div>
          <button type="button" className="primary-button" onClick={askCrm} disabled={busy === 'crm' || !crmQuestion.trim()}>
            {busy === 'crm' ? 'Analisi...' : 'Interroga il CRM'}
          </button>
        </div>
        <div className="quadra-ai-suggestion-row">
          {crmSuggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="quadra-ai-chip"
              onClick={() => {
                setCrmQuestion(prompt)
                setActiveTab('query')
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
        <label className="field-stack">
          <span>Domanda</span>
          <textarea
            className="field-control field-area assistant-textarea"
            value={crmQuestion}
            onChange={(e) => setCrmQuestion(e.target.value)}
            placeholder="Es. Chi devo sentire oggi? Quali opportunità sopra 10k sono ferme? Fammi il recap di Rossi."
          />
        </label>
        <div className="assistant-output quadra-ai-output">{crmAnswer || 'La risposta del CRM comparirà qui, con priorità operative e sintesi chiara.'}</div>
        {crmMeta ? <div className="helper-text">{crmMeta}</div> : null}
      </section>

      <div className="dashboard-grid two-up quadra-ai-lower-grid">
        <section className={`panel-card quadra-ai-card ${activeTab === 'brief' ? 'is-emphasis' : ''}`}>
          <div className="panel-head">
            <div>
              <h2>Brief giornaliero</h2>
              <p>Recap rapido di follow-up, ritardi e opportunità da sbloccare.</p>
            </div>
            <button type="button" className="secondary-button" onClick={generateBrief} disabled={busy === 'brief'}>
              {busy === 'brief' ? 'Generazione...' : 'Genera brief'}
            </button>
          </div>
          <div className="assistant-output quadra-ai-output">{brief || 'Premi il pulsante per generare un brief immediato della giornata.'}</div>
          {briefMeta ? <div className="helper-text">{briefMeta}</div> : null}
        </section>

        <section className={`panel-card quadra-ai-card ${activeTab === 'write' ? 'is-emphasis' : ''}`}>
          <div className="panel-head">
            <div>
              <h2>Genera messaggio</h2>
              <p>Email, WhatsApp, follow-up o recap con tono già controllato.</p>
            </div>
          </div>
          <div className="form-grid two-col">
            <label className="field-stack"><span>Tipo</span>
              <select className="field-control" value={messageForm.messageType} onChange={(e) => setMessageForm({ ...messageForm, messageType: e.target.value as MessageForm['messageType'] })}>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="followup">Follow-up</option>
                <option value="recap">Recap</option>
              </select>
            </label>
            <label className="field-stack"><span>Tono</span>
              <select className="field-control" value={messageForm.tone} onChange={(e) => setMessageForm({ ...messageForm, tone: e.target.value as MessageForm['tone'] })}>
                <option value="formale">Formale</option>
                <option value="diretto">Diretto</option>
                <option value="caldo">Caldo</option>
                <option value="commerciale">Commerciale</option>
              </select>
            </label>
            <label className="field-stack"><span>Azienda</span><input className="field-control" value={messageForm.company} onChange={(e) => setMessageForm({ ...messageForm, company: e.target.value })} /></label>
            <label className="field-stack"><span>Contatto</span><input className="field-control" value={messageForm.contact} onChange={(e) => setMessageForm({ ...messageForm, contact: e.target.value })} /></label>
          </div>
          <label className="field-stack"><span>Obiettivo</span><input className="field-control" value={messageForm.objective} onChange={(e) => setMessageForm({ ...messageForm, objective: e.target.value })} /></label>
          <label className="field-stack"><span>Note</span><textarea className="field-control field-area assistant-textarea compact" value={messageForm.notes} onChange={(e) => setMessageForm({ ...messageForm, notes: e.target.value })} /></label>
          <div className="assistant-actions">
            <button type="button" className="primary-button" onClick={generateMessage} disabled={busy === 'message'}>
              {busy === 'message' ? 'Scrittura...' : 'Genera messaggio'}
            </button>
          </div>
          <div className="assistant-output quadra-ai-output">{generatedMessage || 'Il messaggio pronto all’uso comparirà qui.'}</div>
        </section>

        <section className={`panel-card quadra-ai-card ${activeTab === 'parse' ? 'is-emphasis' : ''}`}>
          <div className="panel-head">
            <div>
              <h2>Nota → struttura CRM</h2>
              <p>Prende testo o dettato e restituisce summary, follow-up e segnale opportunità.</p>
            </div>
          </div>
          <label className="field-stack">
            <span>Nota libera</span>
            <textarea className="field-control field-area assistant-textarea" value={parseInput} onChange={(e) => setParseInput(e.target.value)} placeholder="Es. Sentito Rossi, interessato, richiamare giovedì, budget 12k, vuole demo..." />
          </label>
          <div className="assistant-actions">
            <button type="button" className="primary-button" onClick={parseNote} disabled={!parseInput.trim() || busy === 'parse'}>
              {busy === 'parse' ? 'Analisi...' : 'Struttura'}
            </button>
          </div>
          <div className="assistant-output quadra-ai-output">
            {parsed ? (
              <div className="stack-sm">
                <div><strong>Summary:</strong> {parsed.summary}</div>
                <div><strong>Follow-up:</strong> {parsed.followUpTitle}</div>
                <div><strong>Quando:</strong> {parsed.followUpDueHint}</div>
                <div><strong>Priorità:</strong> {parsed.priority}</div>
                <div><strong>Segnale opportunità:</strong> {parsed.opportunitySignal}</div>
                <div><strong>Aggiornamento:</strong> {parsed.suggestedStatusUpdate}</div>
              </div>
            ) : 'La struttura CRM comparirà qui con indicazioni già leggibili.'}
          </div>
        </section>

        <section className="panel-card quadra-ai-card">
          <div className="panel-head">
            <div>
              <h2>Riassumi e suggerisci</h2>
              <p>Per note più lunghe puoi generare prima una sintesi e poi la prossima mossa.</p>
            </div>
          </div>
          <label className="field-stack">
            <span>Nota o trascrizione</span>
            <textarea className="field-control field-area assistant-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Incolla la nota libera o una trascrizione vocale..." />
          </label>
          <div className="assistant-actions">
            <button type="button" className="secondary-button" onClick={summarize} disabled={!note.trim() || busy === 'summary'}>
              {busy === 'summary' ? 'Sintesi...' : 'Riassumi'}
            </button>
          </div>
          <div className="assistant-output quadra-ai-output">{summary || 'La sintesi comparirà qui.'}</div>
          <div className="form-grid two-col">
            <label className="field-stack"><span>Azienda</span><input className="field-control" value={context.company} onChange={(e) => setContext({ ...context, company: e.target.value })} /></label>
            <label className="field-stack"><span>Contatto</span><input className="field-control" value={context.contact} onChange={(e) => setContext({ ...context, contact: e.target.value })} /></label>
            <label className="field-stack"><span>Opportunità</span><input className="field-control" value={context.opportunity} onChange={(e) => setContext({ ...context, opportunity: e.target.value })} /></label>
            <label className="field-stack"><span>Fase</span><input className="field-control" value={context.stage} onChange={(e) => setContext({ ...context, stage: e.target.value })} /></label>
          </div>
          <label className="field-stack"><span>Contesto / nota</span><textarea className="field-control field-area assistant-textarea compact" value={context.note} onChange={(e) => setContext({ ...context, note: e.target.value })} /></label>
          <div className="assistant-actions">
            <button type="button" className="primary-button" onClick={suggest} disabled={busy === 'action'}>
              {busy === 'action' ? 'Elaborazione...' : 'Suggerisci next action'}
            </button>
          </div>
          <div className="assistant-output quadra-ai-output">{nextAction || 'Il suggerimento sulla prossima azione comparirà qui.'}</div>
        </section>
      </div>
    </div>
  )
}
