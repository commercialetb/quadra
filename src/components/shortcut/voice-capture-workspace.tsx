'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type ParsedNote = {
  summary: string
  followUpTitle: string
  followUpDueHint: string
  priority: 'low' | 'medium' | 'high'
  opportunitySignal: 'negative' | 'neutral' | 'positive'
  suggestedStatusUpdate: string
}

type ProcessVoiceResult = {
  ok: boolean
  error?: string
  canAutoCreate?: boolean
  createdFollowupId?: string | null
  parsed?: {
    personName: string | null
      companyName: string | null
    summary: string
    followUpTitle: string
    dueDateISO: string | null
    priority: 'low' | 'medium' | 'high'
    statusSignal: string | null
    reminderTitle: string
    reminderNotes: string
  }
  matches?: {
    contact?: { match?: { name: string } ; ambiguous?: boolean } | null
    opportunity?: { match?: { name: string } ; ambiguous?: boolean } | null
    company?: { match?: { name: string } ; ambiguous?: boolean } | null
  }
}

type CreateFollowupAction = (formData: FormData) => Promise<void>

type Props = {
  createFollowupAction: CreateFollowupAction
  initialNote?: string
  initialTitle?: string
  initialDescription?: string
  initialPriority?: string
}

type SpeechRecognitionAlternative = { transcript: string }
type SpeechRecognitionResult = {
  0: SpeechRecognitionAlternative
  isFinal: boolean
}
type SpeechRecognitionEventLike = Event & {
  resultIndex: number
  results: SpeechRecognitionResult[]
}

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: Event & { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
    SpeechRecognition?: new () => SpeechRecognitionInstance
  }
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

function dueIsoToInput(value?: string | null) {
  if (!value) return addHours(24)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T09:00`
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return addHours(24)
  return toLocalInput(date)
}

function cleanSpacing(value: string) {
  return value.replace(/\s+/g, ' ').trim()
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
  const [processResult, setProcessResult] = useState<ProcessVoiceResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [providerMeta, setProviderMeta] = useState('')
  const [error, setError] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechStatus, setSpeechStatus] = useState('')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSpeechSupported(Boolean(Recognition))
  }, [])

  useEffect(() => () => {
    recognitionRef.current?.stop()
  }, [])

  const composedDescription = useMemo(() => {
    const blocks = [description.trim()]
    if (processResult?.parsed?.summary) blocks.push(`Sintesi AI: ${processResult.parsed.summary}`)
    else if (parsed?.summary) blocks.push(`Sintesi AI: ${parsed.summary}`)
    if (note.trim()) blocks.push(`Dettato originale: ${note.trim()}`)
    return blocks.filter(Boolean).join('\n\n')
  }, [description, parsed, processResult, note])

  function applyStructuredDraft(structured: ParsedNote) {
    setParsed(structured)
    setTitle((current) => current || structured.followUpTitle || 'Follow-up da nota vocale')
    setPriority(structured.priority || 'medium')
    setDueAt(dueHintToInput(structured.followUpDueHint || ''))
    setDescription((current) => current || structured.suggestedStatusUpdate || '')
  }

  function applyVoiceRoutingResult(result: ProcessVoiceResult) {
    if (!result.parsed) return
    setProcessResult(result)
    setTitle((current) => current || result.parsed?.followUpTitle || 'Follow-up da nota vocale')
    setPriority(result.parsed.priority || 'medium')
    setDueAt(dueIsoToInput(result.parsed.dueDateISO))
    setDescription((current) => {
      if (current.trim()) return current
      const parts = [result.parsed?.summary]
      if (result.parsed?.statusSignal) parts.push(`Segnale stato: ${result.parsed.statusSignal}`)
      return parts.filter(Boolean).join('\n\n')
    })
  }

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
      setProviderMeta(result.provider ? `${result.provider} · ${result.model}` : '')
      applyStructuredDraft(structured)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setBusy(false)
    }
  }

  async function analyzeAndLink() {
    if (!note.trim()) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/shortcut/process-voice-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      const result = (await response.json()) as ProcessVoiceResult
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Impossibile analizzare il dettato')
      }
      applyVoiceRoutingResult(result)
      setProviderMeta('Groq · matching CRM')
      if (result.canAutoCreate) {
        setSpeechStatus('Follow-up creato automaticamente in Quadra.')
      } else {
        setSpeechStatus('Ho preparato una bozza: controlla i campi prima di salvare.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setBusy(false)
    }
  }

  function startDictation() {
    if (typeof window === 'undefined') return
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setSpeechStatus('Dettatura non disponibile su questo dispositivo.')
      return
    }

    recognitionRef.current?.stop()
    const recognition = new Recognition()
    recognition.lang = 'it-IT'
    recognition.continuous = false
    recognition.interimResults = true

    let finalTranscript = ''

    recognition.onresult = (event) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const current = event.results[i]?.[0]?.transcript ?? ''
        if (event.results[i]?.isFinal) finalTranscript += `${current} `
        else interimTranscript += current
      }
      const combined = cleanSpacing(`${finalTranscript} ${interimTranscript}`)
      if (combined) setNote(combined)
    }

    recognition.onerror = (event) => {
      setSpeechStatus(event.error === 'not-allowed' ? 'Consenti l’uso del microfono a Safari per dettare in Quadra.' : 'Dettatura interrotta.')
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setSpeechStatus((current) => current || 'Dettatura completata. Ora puoi analizzare e salvare.')
    }

    recognitionRef.current = recognition
    setIsListening(true)
    setSpeechStatus('Sto ascoltando… parla normalmente.')
    recognition.start()
  }

  function stopDictation() {
    recognitionRef.current?.stop()
    setIsListening(false)
    setSpeechStatus('Dettatura fermata.')
  }

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Detta in Quadra</p>
          <h1 className="page-title">Nota vocale e follow-up, senza uscire dall’app</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Questo è il flusso principale per gli utenti: detti dentro Quadra, l’AI struttura il follow-up e prova anche a collegarlo automaticamente a contatto, azienda o opportunità.
          </p>
        </div>
      </section>

      <div className="dashboard-grid two-up assistant-grid">
        <section className="panel-card page-section-card">
          <div className="panel-head">
            <div>
              <h2>1. Dettatura o testo libero</h2>
              <p>Perfetto quando esci da una call, da un sopralluogo o da un incontro cliente.</p>
            </div>
          </div>

          <div className="assistant-links" style={{ marginBottom: 14 }}>
            <button type="button" className="primary-button" onClick={isListening ? stopDictation : startDictation}>
              {isListening ? 'Ferma dettatura' : 'Detta adesso'}
            </button>
            <button type="button" className="secondary-button" onClick={() => setNote('')} disabled={!note.trim() || isListening}>
              Svuota testo
            </button>
            <a href="/capture/siri" className="ghost-button">Apri shortcut ufficiale</a>
          </div>

          <label className="field-stack">
            <span>Dettato</span>
            <textarea
              className="field-control field-area assistant-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Es. Ho parlato con l'arch. Pinco: progetto EUR in stallo, richiamarlo il 25 aprile."
            />
          </label>

          <div className="helper-text" style={{ marginTop: 10 }}>
            {speechSupported
              ? 'Su iPhone puoi dettare direttamente qui senza costruire shortcut manuali.'
              : 'Se la dettatura browser non è disponibile, puoi comunque incollare una trascrizione o usare Siri Shortcut.'}
          </div>
          {speechStatus ? <div className="assistant-brief" style={{ marginTop: 12 }}>{speechStatus}</div> : null}
          {error ? <div className="assistant-brief" style={{ marginTop: 12 }}>{error}</div> : null}
        </section>

        <section className="panel-card page-section-card">
          <div className="panel-head">
            <div>
              <h2>2. AI + collegamento CRM</h2>
              <p>Groq prepara la bozza e tenta il match con dati reali del CRM.</p>
            </div>
          </div>
          <div className="assistant-links" style={{ marginBottom: 14 }}>
            <button type="button" className="primary-button" onClick={analyzeAndLink} disabled={!note.trim() || busy}>
              {busy ? 'Analisi...' : 'Analizza e collega'}
            </button>
            <button type="button" className="ghost-button" onClick={parseVoiceNote} disabled={!note.trim() || busy}>
              Solo struttura AI
            </button>
          </div>
          <div className="assistant-output">
            {processResult?.parsed ? (
              <div className="stack-sm">
                <div><strong>Sintesi:</strong> {processResult.parsed.summary}</div>
                <div><strong>Follow-up:</strong> {processResult.parsed.followUpTitle}</div>
                <div><strong>Scadenza:</strong> {processResult.parsed.dueDateISO || 'Da definire'}</div>
                <div><strong>Contatto:</strong> {processResult.matches?.contact?.match?.name || 'Non trovato'}</div>
                <div><strong>Opportunità:</strong> {processResult.matches?.opportunity?.match?.name || 'Non trovata'}</div>
                <div><strong>Azienda:</strong> {processResult.matches?.company?.match?.name || 'Non trovata'}</div>
                <div><strong>Esito:</strong> {processResult.canAutoCreate ? 'Creato automaticamente in Quadra' : 'Bozza pronta da confermare'}</div>
              </div>
            ) : parsed ? (
              <div className="stack-sm">
                <div><strong>Sintesi:</strong> {parsed.summary}</div>
                <div><strong>Titolo follow-up:</strong> {parsed.followUpTitle}</div>
                <div><strong>Quando:</strong> {parsed.followUpDueHint}</div>
                <div><strong>Priorità:</strong> {parsed.priority}</div>
                <div><strong>Aggiornamento suggerito:</strong> {parsed.suggestedStatusUpdate}</div>
              </div>
            ) : (
              'La proposta AI comparirà qui.'
            )}
          </div>
          {providerMeta ? <div className="helper-text" style={{ marginTop: 10 }}>{providerMeta}</div> : null}
        </section>
      </div>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>3. Salva o rifinisci</h2>
            <p>Quando il match non è chiarissimo, resti tu in controllo. Il salvataggio manuale resta sempre disponibile.</p>
          </div>
        </div>

        {processResult?.canAutoCreate && processResult.createdFollowupId ? (
          <div className="assistant-brief" style={{ marginBottom: 16 }}>
            Follow-up già creato in Quadra. Puoi aprire l’agenda oppure registrare subito un’altra nota.
          </div>
        ) : null}

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
            <button className="primary-button" type="submit" disabled={!title.trim() || !dueAt || Boolean(processResult?.canAutoCreate)}>
              {processResult?.canAutoCreate ? 'Già creato automaticamente' : 'Salva follow-up'}
            </button>
            <a href="/followups" className="ghost-button">Apri agenda</a>
          </div>
        </form>
      </section>
    </div>
  )
}
