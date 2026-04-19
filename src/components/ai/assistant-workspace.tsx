'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuadraVoiceGreeting } from '@/components/ai/quadra-voice-greeting'

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
type VoiceMode = 'silent' | 'assisted' | 'voice'

type ExecutiveView = {
  summary: string
  actions: string[]
  nextStep: string
}

const QUICK_PROMPTS = [
  'Chi devo sentire oggi?',
  'Quali opportunita sopra 10k sono ferme?',
  'Fammi il recap delle priorita di oggi.',
  'Quali follow-up sono in ritardo?',
]

function buildDueAtFromHint(hint?: string) {
  const now = new Date()
  const due = new Date(now)
  const lower = (hint || '').toLowerCase()
  if (lower.includes('oggi')) {
    due.setHours(17, 0, 0, 0)
    return due.toISOString()
  }
  if (lower.includes('domani')) {
    due.setDate(due.getDate() + 1)
    due.setHours(9, 0, 0, 0)
    return due.toISOString()
  }
  const weekdayMap: Record<string, number> = {
    lunedi: 1, martedi: 2, mercoledi: 3, giovedi: 4, venerdi: 5, sabato: 6, domenica: 0,
  }
  for (const [label, weekday] of Object.entries(weekdayMap)) {
    if (lower.includes(label)) {
      const current = due.getDay()
      let delta = (weekday - current + 7) % 7
      if (delta === 0) delta = 7
      due.setDate(due.getDate() + delta)
      due.setHours(9, 0, 0, 0)
      return due.toISOString()
    }
  }
  due.setDate(due.getDate() + 1)
  due.setHours(9, 0, 0, 0)
  return due.toISOString()
}

function normalizeMessageObjective(input: string) {
  return input.trim().replace(/\s+/g, ' ')
}

function cleanText(input: string) {
  return input
    .replace(/\r/g, ' ')
    .replace(/•/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildExecutiveView(text: string): ExecutiveView {
  const cleaned = cleanText(text)
  if (!cleaned) {
    return {
      summary: 'Quadra prepara qui una sintesi operativa della risposta.',
      actions: [],
      nextStep: 'Quando chiedi qualcosa al CRM, qui vedi subito la prossima mossa.',
    }
  }

  const rawParts = text
    .split(/\n+/)
    .flatMap((line) => line.split(/[•\-]\s+/))
    .map((part) => cleanText(part))
    .filter(Boolean)

  const sentences = cleaned
    .split(/(?<=[\.!?])\s+/)
    .map((part) => cleanText(part))
    .filter(Boolean)

  const actions = Array.from(new Set([...rawParts, ...sentences]))
    .filter((part) => part.length > 18)
    .slice(0, 3)

  const summary = sentences[0] || cleaned.slice(0, 180)
  const nextStep = actions[1] || sentences[1] || summary

  return { summary, actions, nextStep }
}

export function AssistantWorkspace({ userName = '' }: { userName?: string }) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<AssistantTab>('query')
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('assisted')
  const [audioStatus, setAudioStatus] = useState('')
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
  const [messageMeta, setMessageMeta] = useState('')
  const [quickFollowupTitle, setQuickFollowupTitle] = useState('')
  const [quickFollowupDescription, setQuickFollowupDescription] = useState('')
  const [quickFollowupDueAt, setQuickFollowupDueAt] = useState('')
  const [quickFollowupStatus, setQuickFollowupStatus] = useState('')
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
  const [busy, setBusy] = useState<'summary' | 'action' | 'parse' | 'message' | 'crm' | 'brief' | 'followup' | ''>('')

  const initialQuery = searchParams.get('q') || searchParams.get('prompt') || ''
  const initialTab = (searchParams.get('tab') || '').toLowerCase()
  const initialAction = (searchParams.get('action') || '').toLowerCase()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('quadra_voice_mode')
    if (saved === 'silent' || saved === 'assisted' || saved === 'voice') setVoiceMode(saved)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('quadra_voice_mode', voiceMode)
  }, [voiceMode])

  useEffect(() => {
    if (initialQuery) setCrmQuestion((current) => current || initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (initialTab === 'brief' || initialAction === 'brief') setActiveTab('brief')
    else if (initialTab === 'write') setActiveTab('write')
    else if (initialTab === 'parse') setActiveTab('parse')
    else if (initialQuery) setActiveTab('query')
  }, [initialAction, initialQuery, initialTab])

  useEffect(() => {
    if (initialAction === 'brief' && !brief && busy === '') void generateBrief()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [])

  const crmExecutive = useMemo(() => buildExecutiveView(crmAnswer), [crmAnswer])
  const briefExecutive = useMemo(() => buildExecutiveView(brief), [brief])
  const nextActionExecutive = useMemo(() => buildExecutiveView(nextAction), [nextAction])

  function speak(text: string) {
    if (typeof window === 'undefined' || voiceMode === 'silent') return
    const utteranceText = cleanText(text)
    if (!utteranceText) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(utteranceText)
    utterance.lang = 'it-IT'
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onstart = () => setAudioStatus('Quadra sta leggendo la sintesi.')
    utterance.onend = () => setAudioStatus('')
    utterance.onerror = () => setAudioStatus('Audio non disponibile su questo dispositivo.')
    window.speechSynthesis.speak(utterance)
  }

  function stopSpeaking() {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    setAudioStatus('')
  }

  async function copySummary(text: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    await navigator.clipboard.writeText(cleanText(text))
    setAudioStatus('Sintesi copiata.')
    window.setTimeout(() => setAudioStatus(''), 1600)
  }

  function prepareMessageFromText(text: string, preset?: Partial<MessageForm>) {
    const objective = normalizeMessageObjective(text)
    setMessageForm((current) => ({
      ...current,
      ...preset,
      objective: objective || current.objective,
      notes: preset?.notes ?? (objective || current.notes),
    }))
    setActiveTab('write')
  }

  function prepareFollowup(title: string, description: string, dueHint?: string) {
    setQuickFollowupTitle(title)
    setQuickFollowupDescription(description)
    setQuickFollowupDueAt(buildDueAtFromHint(dueHint))
    setQuickFollowupStatus('')
  }

  async function createQuickFollowup() {
    if (!quickFollowupTitle.trim() || !quickFollowupDueAt) return
    setBusy('followup')
    setQuickFollowupStatus('')
    try {
      const response = await fetch('/api/ai/create-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickFollowupTitle,
          description: quickFollowupDescription,
          dueAt: quickFollowupDueAt,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Errore durante la creazione del follow-up.')
      setQuickFollowupStatus('Follow-up creato con successo.')
    } catch (error) {
      setQuickFollowupStatus(error instanceof Error ? error.message : 'Errore durante la creazione del follow-up.')
    } finally {
      setBusy('')
    }
  }

  async function summarize() {
    setBusy('summary')
    try {
      const response = await fetch('/api/ai/summarize-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      const result = await response.json()
      const value = result.summary || result.error || 'Nessun output disponibile.'
      setSummary(value)
      prepareFollowup('Ricontattare cliente dalla sintesi AI', value, 'domani')
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
      const value = result.suggestion || result.error || 'Nessun output disponibile.'
      setNextAction(value)
      prepareFollowup(value.split(/[\n\.]/)[0] || 'Nuovo follow-up suggerito da AI', value, 'domani')
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
      if (result.parsed) prepareFollowup(result.parsed.followUpTitle, result.parsed.summary, result.parsed.followUpDueHint)
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
      setMessageMeta(result.provider ? `${result.provider} · ${result.model}` : '')
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
      const value = result.answer || result.error || 'Nessun output disponibile.'
      setCrmAnswer(value)
      setCrmMeta(result.provider ? `${result.provider} · ${result.model}` : '')
      prepareFollowup(`Azione da CRM: ${crmQuestion}`, value, 'oggi')
      if (voiceMode === 'voice') speak(buildExecutiveView(value).summary)
    } finally {
      setBusy('')
    }
  }

  async function generateBrief() {
    setBusy('brief')
    try {
      const response = await fetch('/api/ai/daily-brief', { method: 'POST' })
      const result = await response.json()
      const value = result.brief || result.error || 'Nessun brief disponibile.'
      setBrief(value)
      setBriefMeta(result.provider ? `${result.provider} · ${result.model}` : '')
      prepareFollowup('Seguire il brief del giorno', value, 'oggi')
      if (voiceMode === 'voice') speak(buildExecutiveView(value).summary)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="page-stack utility-page-stack quadra-ai-workspace">
      <section className="panel-card quadra-ai-hero">
        <div className="quadra-ai-hero-copy">
          <span className="quadra-ai-eyebrow">Assistente AI</span>
          <h1>Quadra legge il contesto, sintetizza la risposta e ti lascia una prossima mossa chiara.</h1>
          <p>Un solo spazio per CRM, brief del giorno, note vocali e messaggi pronti. Piu azione, meno testo dispersivo.</p>
        </div>
        <div className="quadra-ai-hero-actions">
          <button type="button" className={`quadra-ai-tab ${activeTab === 'query' ? 'is-active' : ''}`} onClick={() => setActiveTab('query')}>CRM</button>
          <button type="button" className={`quadra-ai-tab ${activeTab === 'brief' ? 'is-active' : ''}`} onClick={() => setActiveTab('brief')}>Brief del giorno</button>
          <button type="button" className={`quadra-ai-tab ${activeTab === 'write' ? 'is-active' : ''}`} onClick={() => setActiveTab('write')}>Messaggi</button>
          <button type="button" className={`quadra-ai-tab ${activeTab === 'parse' ? 'is-active' : ''}`} onClick={() => setActiveTab('parse')}>Note e follow-up</button>
        </div>
      </section>

      <QuadraVoiceGreeting userName={userName} storageKey="quadra_assistant_greeting_v1" message={userName ? `Ciao ${userName.split(' ')[0]}. In questo spazio puoi chiedere a Quadra cosa conta oggi e agire subito.` : undefined} />

      <section className="panel-card quadra-ai-query-card">
        <div className="panel-head">
          <div>
            <h2>Chiedi a Quadra</h2>
            <p>Domande naturali sul CRM con una risposta piu sintetica, piu operativa e gia pronta da usare.</p>
          </div>
          <button type="button" className="primary-button" onClick={askCrm} disabled={busy === 'crm' || !crmQuestion.trim()}>
            {busy === 'crm' ? 'Analisi...' : 'Interroga il CRM'}
          </button>
        </div>
        <div className="quadra-ai-toolbar">
          <div className="quadra-ai-suggestion-row">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" className="quadra-ai-chip" onClick={() => { setCrmQuestion(prompt); setActiveTab('query') }}>
                {prompt}
              </button>
            ))}
          </div>
          <div className="quadra-ai-mode-row" role="group" aria-label="Modalita voce di Quadra">
            <button type="button" className={`quadra-ai-mode ${voiceMode === 'silent' ? 'is-active' : ''}`} onClick={() => setVoiceMode('silent')}>Silenziosa</button>
            <button type="button" className={`quadra-ai-mode ${voiceMode === 'assisted' ? 'is-active' : ''}`} onClick={() => setVoiceMode('assisted')}>Assistita</button>
            <button type="button" className={`quadra-ai-mode ${voiceMode === 'voice' ? 'is-active' : ''}`} onClick={() => setVoiceMode('voice')}>Vocale</button>
          </div>
        </div>
        <label className="field-stack">
          <span>Domanda</span>
          <textarea className="field-control field-area assistant-textarea" value={crmQuestion} onChange={(e) => setCrmQuestion(e.target.value)} placeholder="Es. Chi devo sentire oggi? Quali opportunita sopra 10k sono ferme? Fammi il recap di Rossi." />
        </label>
        <div className="quadra-ai-executive-strip">
          <span className="quadra-ai-mini-pill primary">Risposta esecutiva</span>
          <span className="quadra-ai-mini-pill">{crmExecutive.actions.length || 0} azioni pronte</span>
          <span className="quadra-ai-mini-pill">Quadra pronta</span>
        </div>
        <div className="assistant-output quadra-ai-output">{crmExecutive.summary}</div>
        {crmAnswer ? (
          <div className="quadra-ai-executive-grid">
            <div className="quadra-ai-executive-card">
              <span>Cosa fare ora</span>
              <ul>
                {(crmExecutive.actions.length ? crmExecutive.actions : ['Quadra evidenzia qui i passaggi concreti.']).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="quadra-ai-executive-card">
              <span>Prossimo passo</span>
              <p>{crmExecutive.nextStep}</p>
            </div>
          </div>
        ) : null}
        {crmMeta ? <div className="helper-text">{crmMeta}</div> : null}
        {audioStatus ? <div className="helper-text">{audioStatus}</div> : null}
        {crmAnswer ? (
          <div className="quadra-ai-post-actions">
            <button type="button" className="quadra-pill-button primary" onClick={() => prepareMessageFromText(crmAnswer, { messageType: 'email', tone: 'commerciale' })}>Genera messaggio</button>
            <button type="button" className="quadra-pill-button ghost" onClick={() => prepareFollowup(`Azione da CRM: ${crmQuestion}`, crmExecutive.nextStep || crmAnswer, 'oggi')}>Crea follow-up</button>
            <Link href="/opportunities" className="quadra-pill-button ghost">Apri opportunita</Link>
            <button type="button" className="quadra-pill-button ghost" onClick={() => copySummary(crmExecutive.summary)}>Copia sintesi</button>
            <button type="button" className="quadra-pill-button ghost" onClick={() => speak(crmExecutive.summary)}>Ascolta Quadra</button>
            <button type="button" className="quadra-pill-button ghost" onClick={stopSpeaking}>Ferma audio</button>
          </div>
        ) : null}
      </section>

      <div className="dashboard-grid two-up quadra-ai-lower-grid">
        <section className={`panel-card quadra-ai-card ${activeTab === 'brief' ? 'is-emphasis' : ''}`}>
          <div className="panel-head">
            <div>
              <h2>Brief del giorno</h2>
              <p>Recap rapido di follow-up, ritardi e opportunita da sbloccare.</p>
            </div>
            <button type="button" className="secondary-button" onClick={generateBrief} disabled={busy === 'brief'}>
              {busy === 'brief' ? 'Generazione...' : 'Genera brief'}
            </button>
          </div>
          <div className="quadra-ai-executive-strip">
            <span className="quadra-ai-mini-pill primary">Brief operativo</span>
            <span className="quadra-ai-mini-pill">Priorita del giorno</span>
          </div>
          <div className="assistant-output quadra-ai-output">{briefExecutive.summary}</div>
          {brief ? (
            <div className="quadra-ai-executive-card brief-card">
              <span>Cosa fare ora</span>
              <ul>
                {briefExecutive.actions.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : null}
          {briefMeta ? <div className="helper-text">{briefMeta}</div> : null}
          {brief ? (
            <div className="quadra-ai-post-actions">
              <button type="button" className="quadra-pill-button primary" onClick={() => prepareFollowup('Seguire il brief del giorno', briefExecutive.nextStep || brief, 'oggi')}>Crea follow-up</button>
              <button type="button" className="quadra-pill-button ghost" onClick={() => prepareMessageFromText(briefExecutive.summary, { messageType: 'recap', tone: 'diretto' })}>Genera messaggio</button>
              <button type="button" className="quadra-pill-button ghost" onClick={() => speak(briefExecutive.summary)}>Ascolta Quadra</button>
            </div>
          ) : null}
        </section>

        <section className={`panel-card quadra-ai-card ${activeTab === 'write' ? 'is-emphasis' : ''}`}>
          <div className="panel-head">
            <div>
              <h2>Genera messaggio</h2>
              <p>Email, WhatsApp, follow-up o recap con tono gia controllato.</p>
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
          <div className="assistant-output quadra-ai-output">{generatedMessage || 'Il messaggio pronto all’uso comparira qui.'}</div>
          {messageMeta ? <div className="helper-text">{messageMeta}</div> : null}
          {generatedMessage ? (
            <div className="quadra-ai-post-actions">
              <button type="button" className="quadra-pill-button ghost" onClick={() => copySummary(generatedMessage)}>Copia testo</button>
              <button type="button" className="quadra-pill-button ghost" onClick={() => speak(generatedMessage)}>Ascolta Quadra</button>
            </div>
          ) : null}
        </section>

        <section className={`panel-card quadra-ai-card ${activeTab === 'parse' ? 'is-emphasis' : ''}`}>
          <div className="panel-head">
            <div>
              <h2>Nota → azione CRM</h2>
              <p>Prende testo o dettato e restituisce sintesi, follow-up e segnale opportunita.</p>
            </div>
          </div>
          <label className="field-stack">
            <span>Nota libera</span>
            <textarea className="field-control field-area assistant-textarea" value={parseInput} onChange={(e) => setParseInput(e.target.value)} placeholder="Es. Sentito Rossi, interessato, richiamare giovedi, budget 12k, vuole demo..." />
          </label>
          <div className="assistant-actions">
            <button type="button" className="primary-button" onClick={parseNote} disabled={!parseInput.trim() || busy === 'parse'}>
              {busy === 'parse' ? 'Analisi...' : 'Struttura la nota'}
            </button>
          </div>
          <div className="assistant-output quadra-ai-output">
            {parsed ? (
              <div className="stack-sm">
                <div><strong>Sintesi:</strong> {parsed.summary}</div>
                <div><strong>Follow-up:</strong> {parsed.followUpTitle}</div>
                <div><strong>Quando:</strong> {parsed.followUpDueHint}</div>
                <div><strong>Priorita:</strong> {parsed.priority}</div>
                <div><strong>Segnale opportunita:</strong> {parsed.opportunitySignal}</div>
                <div><strong>Aggiornamento suggerito:</strong> {parsed.suggestedStatusUpdate}</div>
              </div>
            ) : 'La struttura CRM comparira qui con indicazioni gia leggibili.'}
          </div>
          {parsed ? (
            <div className="quadra-ai-post-actions">
              <button type="button" className="quadra-pill-button primary" onClick={() => prepareFollowup(parsed.followUpTitle, parsed.summary, parsed.followUpDueHint)}>Crea follow-up</button>
              <Link href="/opportunities" className="quadra-pill-button ghost">Apri opportunita</Link>
              <button type="button" className="quadra-pill-button ghost" onClick={() => prepareMessageFromText(parsed.summary, { messageType: 'followup', tone: 'diretto' })}>Genera messaggio</button>
            </div>
          ) : null}
        </section>

        <section className="panel-card quadra-ai-card is-emphasis">
          <div className="panel-head">
            <div>
              <h2>Follow-up rapido da risposta AI</h2>
              <p>Quando Quadra ti da un prossimo passo, qui lo trasformi in un follow-up vero.</p>
            </div>
          </div>
          <div className="form-grid two-col">
            <label className="field-stack"><span>Titolo</span><input className="field-control" value={quickFollowupTitle} onChange={(e) => setQuickFollowupTitle(e.target.value)} /></label>
            <label className="field-stack"><span>Scadenza</span><input className="field-control" type="datetime-local" value={quickFollowupDueAt ? new Date(quickFollowupDueAt).toISOString().slice(0, 16) : ''} onChange={(e) => setQuickFollowupDueAt(e.target.value ? new Date(e.target.value).toISOString() : '')} /></label>
          </div>
          <label className="field-stack"><span>Descrizione</span><textarea className="field-control field-area assistant-textarea compact" value={quickFollowupDescription} onChange={(e) => setQuickFollowupDescription(e.target.value)} /></label>
          <div className="assistant-actions">
            <button type="button" className="primary-button" onClick={createQuickFollowup} disabled={busy === 'followup' || !quickFollowupTitle.trim() || !quickFollowupDueAt}>
              {busy === 'followup' ? 'Creazione...' : 'Crea follow-up'}
            </button>
            <Link href="/followups" className="secondary-button">Apri agenda</Link>
          </div>
          <div className="assistant-output quadra-ai-output">{quickFollowupStatus || 'Quadra prepara qui il follow-up usando la risposta appena generata.'}</div>
        </section>

        <section className="panel-card quadra-ai-card">
          <div className="panel-head">
            <div>
              <h2>Nota libera → sintesi</h2>
              <p>Per appunti grezzi, call recap e trascrizioni veloci.</p>
            </div>
          </div>
          <label className="field-stack"><span>Nota</span><textarea className="field-control field-area assistant-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Incolla una nota libera o una trascrizione vocale..." /></label>
          <div className="assistant-actions">
            <button type="button" className="primary-button" onClick={summarize} disabled={!note.trim() || busy === 'summary'}>
              {busy === 'summary' ? 'Sintesi...' : 'Riassumi'}
            </button>
          </div>
          <div className="assistant-output quadra-ai-output">{summary || 'La sintesi comparira qui.'}</div>
        </section>

        <section className="panel-card quadra-ai-card">
          <div className="panel-head">
            <div>
              <h2>Next action guidata</h2>
              <p>Usa il contesto commerciale per ottenere la prossima mossa piu sensata.</p>
            </div>
          </div>
          <div className="form-grid two-col">
            <label className="field-stack"><span>Azienda</span><input className="field-control" value={context.company} onChange={(e) => setContext({ ...context, company: e.target.value })} /></label>
            <label className="field-stack"><span>Contatto</span><input className="field-control" value={context.contact} onChange={(e) => setContext({ ...context, contact: e.target.value })} /></label>
            <label className="field-stack"><span>Opportunita</span><input className="field-control" value={context.opportunity} onChange={(e) => setContext({ ...context, opportunity: e.target.value })} /></label>
            <label className="field-stack"><span>Fase</span><input className="field-control" value={context.stage} onChange={(e) => setContext({ ...context, stage: e.target.value })} /></label>
          </div>
          <label className="field-stack"><span>Contesto / nota</span><textarea className="field-control field-area assistant-textarea compact" value={context.note} onChange={(e) => setContext({ ...context, note: e.target.value })} /></label>
          <div className="assistant-actions">
            <button type="button" className="primary-button" onClick={suggest} disabled={busy === 'action'}>
              {busy === 'action' ? 'Elaborazione...' : 'Suggerisci next action'}
            </button>
          </div>
          <div className="assistant-output quadra-ai-output">{nextActionExecutive.summary}</div>
          {nextAction ? (
            <div className="quadra-ai-post-actions">
              <button type="button" className="quadra-pill-button primary" onClick={() => prepareFollowup(nextActionExecutive.summary, nextActionExecutive.nextStep, 'domani')}>Crea follow-up</button>
              <button type="button" className="quadra-pill-button ghost" onClick={() => prepareMessageFromText(nextActionExecutive.summary, { messageType: 'email', tone: 'diretto' })}>Genera messaggio</button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
