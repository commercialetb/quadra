'use client'

import { useState } from 'react'

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

export function AssistantWorkspace() {
  const [note, setNote] = useState('')
  const [summary, setSummary] = useState('')
  const [context, setContext] = useState({ company: '', contact: '', opportunity: '', stage: '', note: '' })
  const [nextAction, setNextAction] = useState('')
  const [parseInput, setParseInput] = useState('')
  const [parsed, setParsed] = useState<ParsedNote | null>(null)
  const [crmQuestion, setCrmQuestion] = useState('')
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


  return (
    <div className="page-stack utility-page-stack">
      <div className="dashboard-grid two-up assistant-grid">
        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Copilota CRM</h2>
              <p>Fai una domanda vera sul CRM e ottieni una risposta utile, non blocchi generici.</p>
            </div>
          </div>
          <label className="field-stack">
            <span>Domanda</span>
            <textarea className="field-control field-area assistant-textarea" value={crmQuestion} onChange={(e) => setCrmQuestion(e.target.value)} placeholder="Es. Chi devo sentire oggi? Quali account rischiano? Cosa apro prima?" />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={askCrm} disabled={!crmQuestion.trim() || busy === 'crm'}>
              {busy === 'crm' ? 'Analisi...' : 'Interroga il CRM'}
            </button>
          </div>
          <div className="assistant-output">{crmAnswer || 'La risposta comparirà qui.'}</div>
          {crmMeta ? <div className="helper-text">{crmMeta}</div> : null}
        </section>

        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Prossimo passo</h2>
              <p>Usa il contesto minimo e fai emergere un’azione concreta.</p>
            </div>
          </div>
          <div className="assistant-form-grid">
            <label className="field-stack"><span>Azienda</span><input className="field-control" value={context.company} onChange={(e) => setContext({ ...context, company: e.target.value })} /></label>
            <label className="field-stack"><span>Contatto</span><input className="field-control" value={context.contact} onChange={(e) => setContext({ ...context, contact: e.target.value })} /></label>
            <label className="field-stack"><span>Opportunità</span><input className="field-control" value={context.opportunity} onChange={(e) => setContext({ ...context, opportunity: e.target.value })} /></label>
            <label className="field-stack"><span>Fase</span><input className="field-control" value={context.stage} onChange={(e) => setContext({ ...context, stage: e.target.value })} /></label>
          </div>
          <label className="field-stack">
            <span>Nota</span>
            <textarea className="field-control field-area assistant-textarea" value={context.note} onChange={(e) => setContext({ ...context, note: e.target.value })} placeholder="Scrivi solo ciò che serve davvero." />
          </label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={suggest} disabled={busy === 'action'}>
              {busy === 'action' ? 'Analisi...' : 'Trova il prossimo passo'}
            </button>
          </div>
          <div className="assistant-output">{nextAction || 'Il prossimo passo suggerito comparirà qui.'}</div>
        </section>

        <section className="panel-card">
          <div className="panel-head">
            <div>
              <h2>Siri e voce</h2>
              <p>Questa è la parte da far funzionare davvero bene: detta, cattura e review queue.</p>
            </div>
          </div>
          <div className="assistant-output">Apri la cattura vocale o il layer Siri per verificare il flusso completo: ascolto, parsing e salvataggio.</div>
          <div className="sheet-actions assistant-actions">
            <a href="/capture/voice" className="primary-button">Apri cattura vocale</a>
            <a href="/capture/siri/install" className="ghost-button">Apri setup Siri</a>
            <a href="/capture/siri/review" className="ghost-button">Apri review queue</a>
          </div>
        </section>
      </div>
    </div>
  )
}
