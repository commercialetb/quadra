'use client'

import { useMemo, useState } from 'react'

type SearchResult = {
  kind: 'company' | 'contact' | 'opportunity'
  id: string
  title: string
  subtitle: string
  href: string
  score: number
}

type ProcessResult = {
  ok: boolean
  error?: string
  status?: string
  needsConfirmation?: boolean
  question?: string | null
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
  links?: {
    companyId: string | null
    contactId: string | null
    opportunityId: string | null
  }
  reminderTitle?: string
  reminderDate?: string | null
  reminderNotes?: string
  spokenResponse?: string
  openUrl?: string
}

type SearchApiResult = {
  ok: boolean
  error?: string
  count?: number
  resolution?: 'resolved' | 'ambiguous' | 'missing'
  topResult?: SearchResult | null
  results?: SearchResult[]
  openUrl?: string
  spokenResponse?: string
}

type AgendaItem = {
  id: string
  title: string
  dueAt: string
  priority: string
  status: string
  companyName: string | null
  contactName: string | null
  opportunityTitle: string | null
  href: string
  openUrl?: string
}

type AgendaApiResult = {
  ok: boolean
  error?: string
  count?: number
  highPriorityCount?: number
  date?: string
  items?: AgendaItem[]
  openUrl?: string
  spokenSummary?: string
}

type AddNoteApiResult = {
  ok: boolean
  error?: string
  noteId?: string
  needsConfirmation?: boolean
  openUrl?: string
  spokenResponse?: string
}

type InteractionApiResult = {
  ok: boolean
  error?: string
  spokenResponse?: string
  openUrl?: string
  activityId?: string
  createdFollowupId?: string | null
}

type CallOutcomeApiResult = {
  ok: boolean
  error?: string
  activityId?: string
  createdFollowupId?: string | null
  followUpCreated?: boolean
  openUrl?: string
  spokenResponse?: string
  needsConfirmation?: boolean
  results?: SearchResult[]
  inference?: {
    classification: 'hot' | 'warm' | 'cold' | 'lost' | 'neutral'
    suggestedPriority: 'low' | 'medium' | 'high' | 'urgent'
    suggestedFollowupTitle: string
    suggestedFollowupDate: string | null
    shouldCreateFollowup: boolean
  }
  suggestedFollowup?: {
    title: string
    dueDate: string | null
    priority: 'low' | 'medium' | 'high' | 'urgent'
  }
}

const shortcutCards = [
  {
    title: 'Crea follow-up',
    phrase: 'Ehi Siri, crea follow-up in Quadra',
    note: 'Perfetto per richiamate, promemoria e next step post-call.',
  },
  {
    title: 'Registra esito chiamata',
    phrase: 'Ehi Siri, registra esito chiamata in Quadra',
    note: 'Scrive l’attività e può creare subito il follow-up successivo.',
  },
  {
    title: 'Cerca record',
    phrase: 'Ehi Siri, cerca Rossi in Quadra',
    note: 'Apre o suggerisce azienda, contatto o opportunità corretta.',
  },
  {
    title: 'Mostra oggi',
    phrase: 'Ehi Siri, mostrami oggi in Quadra',
    note: 'Recupera follow-up e priorità del giorno.',
  },
  {
    title: 'Aggiungi nota',
    phrase: 'Ehi Siri, aggiungi nota in Quadra',
    note: 'Salva una nota veloce sul record giusto.',
  },
]

async function postJson<T>(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return (await response.json()) as T
}

export function SiriShortcutWorkspace({ initialNote = '' }: { initialNote?: string }) {
  const [note, setNote] = useState(initialNote)
  const [searchQuery, setSearchQuery] = useState('')
  const [noteEntityType, setNoteEntityType] = useState<'company' | 'contact' | 'opportunity'>('contact')
  const [noteEntityId, setNoteEntityId] = useState('')
  const [noteTitle, setNoteTitle] = useState('Nota da Siri')
  const [noteBody, setNoteBody] = useState('')
  const [callQuery, setCallQuery] = useState('')
  const [callOutcome, setCallOutcome] = useState('')
  const [callCreateFollowup, setCallCreateFollowup] = useState(true)
  const [callFollowupTitle, setCallFollowupTitle] = useState('')
  const [callFollowupDate, setCallFollowupDate] = useState('')
  const [callPriority, setCallPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [busy, setBusy] = useState('')
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null)
  const [searchResult, setSearchResult] = useState<SearchApiResult | null>(null)
  const [agendaResult, setAgendaResult] = useState<AgendaApiResult | null>(null)
  const [addNoteResult, setAddNoteResult] = useState<AddNoteApiResult | null>(null)
  const [callOutcomeResult, setCallOutcomeResult] = useState<CallOutcomeApiResult | null>(null)
  const [interactionQuery, setInteractionQuery] = useState('')
  const [interactionKind, setInteractionKind] = useState<'meeting' | 'email'>('meeting')
  const [interactionContent, setInteractionContent] = useState('')
  const [interactionResult, setInteractionResult] = useState<InteractionApiResult | null>(null)

  async function runFollowupFlow() {
    if (!note.trim()) return
    setBusy('followup')
    setProcessResult(null)
    try {
      const result = await postJson<ProcessResult>('/api/shortcut/process-voice-note', { note })
      setProcessResult(result)
      if (result.links?.contactId) {
        setNoteEntityType('contact')
        setNoteEntityId(result.links.contactId)
      } else if (result.links?.companyId) {
        setNoteEntityType('company')
        setNoteEntityId(result.links.companyId)
      } else if (result.links?.opportunityId) {
        setNoteEntityType('opportunity')
        setNoteEntityId(result.links.opportunityId)
      }
      if (result.parsed?.summary && !noteBody.trim()) {
        setNoteBody(result.parsed.summary)
      }
      if (result.parsed?.personName && !callQuery.trim()) {
        setCallQuery(result.parsed.personName)
      }
    } finally {
      setBusy('')
    }
  }

  async function runSearch() {
    if (!searchQuery.trim()) return
    setBusy('search')
    setSearchResult(null)
    try {
      const result = await postJson<SearchApiResult>('/api/shortcut/search-record', { query: searchQuery })
      setSearchResult(result)
      if (result.topResult) {
        setNoteEntityType(result.topResult.kind)
        setNoteEntityId(result.topResult.id)
        setCallQuery(result.topResult.title)
      }
    } finally {
      setBusy('')
    }
  }

  async function runAgenda() {
    setBusy('agenda')
    setAgendaResult(null)
    try {
      const result = await postJson<AgendaApiResult>('/api/shortcut/today-agenda', {})
      setAgendaResult(result)
    } finally {
      setBusy('')
    }
  }

  async function runAddNote() {
    if (!noteEntityId.trim() || !noteBody.trim()) return
    setBusy('note')
    setAddNoteResult(null)
    try {
      const result = await postJson<AddNoteApiResult>('/api/shortcut/add-note', {
        entityType: noteEntityType,
        entityId: noteEntityId,
        title: noteTitle,
        body: noteBody,
      })
      setAddNoteResult(result)
    } finally {
      setBusy('')
    }
  }

  async function runInteraction() {
    if (!interactionQuery.trim() || !interactionContent.trim()) return
    setBusy('interaction')
    setInteractionResult(null)
    try {
      const result = await postJson<InteractionApiResult>('/api/shortcut/log-interaction', {
        query: interactionQuery,
        kind: interactionKind,
        content: interactionContent,
        createFollowup: true,
      })
      setInteractionResult(result)
    } finally {
      setBusy('')
    }
  }

  async function runCallOutcome() {
    if (!callQuery.trim() || !callOutcome.trim()) return
    setBusy('call')
    setCallOutcomeResult(null)
    try {
      const result = await postJson<CallOutcomeApiResult>('/api/shortcut/log-call-outcome', {
        query: callQuery,
        outcome: callOutcome,
        createFollowup: callCreateFollowup,
        followupTitle: callCreateFollowup ? callFollowupTitle : undefined,
        followupDate: callCreateFollowup ? callFollowupDate : undefined,
        priority: callCreateFollowup ? callPriority : undefined,
      })
      setCallOutcomeResult(result)
      if (result.inference?.suggestedFollowupTitle && !callFollowupTitle.trim()) setCallFollowupTitle(result.inference.suggestedFollowupTitle)
      if (result.inference?.suggestedFollowupDate && !callFollowupDate) setCallFollowupDate(result.inference.suggestedFollowupDate)
      if (result.inference?.suggestedPriority) setCallPriority(result.inference.suggestedPriority)
    } finally {
      setBusy('')
    }
  }

  const reminderBlock = useMemo(() => {
    if (!processResult?.ok) return ''
    return [
      `Titolo: ${processResult.reminderTitle || processResult.parsed?.followUpTitle || ''}`,
      `Data: ${processResult.reminderDate || processResult.parsed?.dueDateISO || 'da definire'}`,
      `Note: ${processResult.reminderNotes || processResult.parsed?.summary || ''}`,
    ].join('\n')
  }, [processResult])

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Siri layer</p>
          <h1 className="page-title">Quadra + Siri operativa v7</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Qui testi le azioni Siri che contano davvero: follow-up, esito chiamata intelligente, ricerca record, agenda e nota rapida.
          </p>
        </div>
      </section>

      <div className="dashboard-grid two-up assistant-grid">
        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>Azioni da esporre in Siri</h2><p>Queste sono le shortcut da portare in Comandi Rapidi.</p></div></div>
          <div className="stack-sm">
            {shortcutCards.map((card) => (
              <div key={card.title}>
                <strong>{card.title}</strong><br />
                <span>{card.phrase}</span><br />
                <span className="helper-text">{card.note}</span>
              </div>
            ))}
          </div>
          <div className="assistant-links" style={{ marginTop: 16 }}>
            <a href="/capture/voice" className="primary-button">Detta in Quadra</a>
            <a href="/capture/siri/install" className="ghost-button">Installa Siri</a>
            <a href="/capture/siri/review" className="ghost-button">Apri review queue</a>
            <a href="/assistant" className="ghost-button">Assistente AI</a>
          </div>
        </section>

        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>1. Crea follow-up</h2><p>Usa una frase naturale e lascia che Quadra colleghi il record.</p></div></div>
          <textarea className="field-control field-area assistant-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Es. Richiamare Mario Rossi domani per confermare demo e budget" />
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={runFollowupFlow} disabled={!note.trim() || busy === 'followup'}>
              {busy === 'followup' ? 'Elaborazione...' : 'Processa'}
            </button>
          </div>
          <div className="assistant-output">
            {processResult ? (
              processResult.ok ? (
                <div className="stack-sm">
                  <div><strong>Esito:</strong> {processResult.status === 'created' ? 'Creato subito' : 'Serve conferma'}</div>
                  <div><strong>Voce Siri:</strong> {processResult.spokenResponse || 'Pronto'}</div>
                  <div><strong>Follow-up:</strong> {processResult.parsed?.followUpTitle || '-'}</div>
                  <div><strong>Scadenza:</strong> {processResult.reminderDate || processResult.parsed?.dueDateISO || 'Da definire'}</div>
                  {processResult.openUrl ? <div><strong>Apri:</strong> <a href={processResult.openUrl}>record collegato</a></div> : null}
                  {processResult.question ? <div><strong>Nota:</strong> {processResult.question}</div> : null}
                </div>
              ) : (processResult.error || 'Errore sconosciuto')
            ) : 'L’esito del parsing Siri comparirà qui.'}
          </div>
        </section>
      </div>

      <div className="dashboard-grid two-up assistant-grid">
        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>2. Registra esito chiamata</h2><p>Salva l’attività e lascia che Quadra suggerisca priorità e ricontatto, se serve.</p></div></div>
          <label className="field-stack"><span>Chi hai chiamato</span><input className="field-control" value={callQuery} onChange={(e) => setCallQuery(e.target.value)} placeholder="Es. Mario Rossi" /></label>
          <label className="field-stack"><span>Esito</span><textarea className="field-control field-area assistant-textarea" value={callOutcome} onChange={(e) => setCallOutcome(e.target.value)} placeholder="Es. Interessato, vuole proposta aggiornata entro venerdì" /></label>
          <div className="form-grid two-col">
            <label className="field-stack">
              <span>Titolo follow-up</span>
              <input className="field-control" value={callFollowupTitle} onChange={(e) => setCallFollowupTitle(e.target.value)} disabled={!callCreateFollowup} />
            </label>
            <label className="field-stack">
              <span>Data follow-up</span>
              <input className="field-control" type="date" value={callFollowupDate} onChange={(e) => setCallFollowupDate(e.target.value)} disabled={!callCreateFollowup} />
            </label>
          </div>
          <div className="form-grid two-col">
            <label className="field-stack">
              <span>Priorità</span>
              <select className="field-control" value={callPriority} onChange={(e) => setCallPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')} disabled={!callCreateFollowup}>
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </label>
            <label className="field-stack" style={{ justifyContent: 'end' }}>
              <span>Crea follow-up</span>
              <input type="checkbox" checked={callCreateFollowup} onChange={(e) => setCallCreateFollowup(e.target.checked)} />
            </label>
          </div>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={runCallOutcome} disabled={!callQuery.trim() || !callOutcome.trim() || busy === 'call'}>
              {busy === 'call' ? 'Registrazione...' : 'Registra esito'}
            </button>
          </div>
          <div className="assistant-output">
            {callOutcomeResult ? (
              callOutcomeResult.ok ? (
                <div className="stack-sm">
                  <div><strong>Voce Siri:</strong> {callOutcomeResult.spokenResponse}</div>
                  {callOutcomeResult.activityId ? <div><strong>Attività:</strong> {callOutcomeResult.activityId}</div> : null}
                  {callOutcomeResult.createdFollowupId ? <div><strong>Follow-up:</strong> {callOutcomeResult.createdFollowupId}</div> : null}
                  {callOutcomeResult.openUrl ? <div><strong>Apri:</strong> <a href={callOutcomeResult.openUrl}>record aggiornato</a></div> : null}
                  {callOutcomeResult.inference ? (
                    <>
                      <div><strong>Classificazione:</strong> {callOutcomeResult.inference.classification}</div>
                      <div><strong>Priorità suggerita:</strong> {callOutcomeResult.inference.suggestedPriority}</div>
                      <div><strong>Ricontatto suggerito:</strong> {callOutcomeResult.inference.suggestedFollowupDate || '-'}</div>
                    </>
                  ) : null}
                  {callOutcomeResult.needsConfirmation && callOutcomeResult.results?.length ? (
                    <div>
                      <strong>Ambiguo:</strong>
                      {callOutcomeResult.results.map((item) => (
                        <div key={`${item.kind}-${item.id}`}>{item.title} · {item.subtitle}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (callOutcomeResult.error || 'Errore sconosciuto')
            ) : 'L’esito chiamata salvato da Siri comparirà qui.'}
          </div>
        </section>

        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>3. Cerca record</h2><p>Ricerca unica su aziende, contatti e opportunità.</p></div></div>
          <input className="field-control" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Es. Rossi o Acme" />
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={runSearch} disabled={!searchQuery.trim() || busy === 'search'}>
              {busy === 'search' ? 'Ricerca...' : 'Cerca'}
            </button>
          </div>
          <div className="assistant-output">
            {searchResult ? (
              searchResult.ok ? (
                <div className="stack-sm">
                  <div><strong>Voce Siri:</strong> {searchResult.spokenResponse}</div>
                  {searchResult.openUrl ? <div><strong>Apri:</strong> <a href={searchResult.openUrl}>vai al record</a></div> : null}
                  {(searchResult.results || []).map((item) => (
                    <div key={`${item.kind}-${item.id}`}>
                      <strong>{item.title}</strong> · {item.subtitle}
                    </div>
                  ))}
                </div>
              ) : (searchResult.error || 'Errore sconosciuto')
            ) : 'I risultati della ricerca Siri compariranno qui.'}
          </div>
        </section>
      </div>

      <div className="dashboard-grid two-up assistant-grid">
        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>4. Mostra oggi</h2><p>Agenda dei follow-up di oggi pronta per Siri.</p></div></div>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={runAgenda} disabled={busy === 'agenda'}>
              {busy === 'agenda' ? 'Caricamento...' : 'Carica agenda'}
            </button>
          </div>
          <div className="assistant-output">
            {agendaResult ? (
              agendaResult.ok ? (
                <div className="stack-sm">
                  <div><strong>Voce Siri:</strong> {agendaResult.spokenSummary}</div>
                  {agendaResult.highPriorityCount ? <div><strong>Alta priorità:</strong> {agendaResult.highPriorityCount}</div> : null}
                  {agendaResult.openUrl ? <div><strong>Apri:</strong> <a href={agendaResult.openUrl}>agenda di oggi</a></div> : null}
                  {(agendaResult.items || []).map((item) => (
                    <div key={item.id}>
                      <strong>{item.title}</strong> · {new Date(item.dueAt).toLocaleString('it-IT')} {item.contactName ? `· ${item.contactName}` : ''} {item.companyName ? `· ${item.companyName}` : ''}
                    </div>
                  ))}
                </div>
              ) : (agendaResult.error || 'Errore sconosciuto')
            ) : 'L’agenda di oggi comparirà qui.'}
          </div>
        </section>

        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>5. Aggiungi nota</h2><p>Usa l’ID trovato sopra o quello già risolto dal follow-up.</p></div></div>
          <div className="form-grid two-col">
            <label className="field-stack">
              <span>Tipo record</span>
              <select className="field-control" value={noteEntityType} onChange={(e) => setNoteEntityType(e.target.value as 'company' | 'contact' | 'opportunity')}>
                <option value="company">Azienda</option>
                <option value="contact">Contatto</option>
                <option value="opportunity">Opportunità</option>
              </select>
            </label>
            <label className="field-stack">
              <span>ID record</span>
              <input className="field-control" value={noteEntityId} onChange={(e) => setNoteEntityId(e.target.value)} placeholder="UUID del record" />
            </label>
          </div>
          <label className="field-stack"><span>Titolo</span><input className="field-control" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} /></label>
          <label className="field-stack"><span>Testo nota</span><textarea className="field-control field-area assistant-textarea" value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Es. Interessato, richiamare con offerta aggiornata" /></label>
          <div className="sheet-actions assistant-actions">
            <button type="button" className="primary-button" onClick={runAddNote} disabled={!noteEntityId.trim() || !noteBody.trim() || busy === 'note'}>
              {busy === 'note' ? 'Salvataggio...' : 'Salva nota'}
            </button>
          </div>
          <div className="assistant-output">
            {addNoteResult ? (
              addNoteResult.ok ? (
                <div className="stack-sm">
                  <div>{addNoteResult.spokenResponse}</div>
                  {addNoteResult.openUrl ? <div><a href={addNoteResult.openUrl}>Apri record</a></div> : null}
                </div>
              ) : (addNoteResult.error || 'Errore sconosciuto')
            ) : 'L’esito del salvataggio comparirà qui.'}
          </div>
        </section>
      </div>

      <div className="dashboard-grid two-up assistant-grid">
        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>Payload promemoria</h2><p>Output da usare nello shortcut Siri o in Promemoria Apple.</p></div></div>
          <textarea className="field-control field-area assistant-textarea" value={reminderBlock} readOnly />
          <div className="helper-text" style={{ marginTop: 10 }}>
            Questo blocco arriva dal parsing Quadra. Nello shortcut Apple devi solo inoltrarlo o aprire questa pagina con i parametri corretti.
          </div>
        </section>
      </div>

      <section className="panel-card page-section-card">
        <div className="panel-head"><div><h2>Registra meeting o email</h2><p>Flow v11 per interazioni non telefoniche con follow-up suggerito, deep link e review queue.</p></div></div>
        <div className="stack-sm">
          <label className="field-stack"><span>Record</span><input className="field-control" value={interactionQuery} onChange={(e) => setInteractionQuery(e.target.value)} placeholder="Mario Rossi o Acme" /></label>
          <label className="field-stack"><span>Tipo</span><select className="field-control" value={interactionKind} onChange={(e) => setInteractionKind(e.target.value as 'meeting' | 'email')}><option value="meeting">Meeting</option><option value="email">Email</option></select></label>
          <label className="field-stack"><span>Contenuto</span><textarea className="field-control field-area" value={interactionContent} onChange={(e) => setInteractionContent(e.target.value)} placeholder="Meeting positivo. Inviare proposta domani." /></label>
          <div className="sheet-actions"><button className="primary-button" type="button" onClick={runInteraction} disabled={busy === 'interaction'}>Registra interazione</button></div>
          {interactionResult ? <div className="assistant-response"><p>{interactionResult.spokenResponse || interactionResult.error}</p>{interactionResult.openUrl ? <a href={interactionResult.openUrl} className="secondary-button">Apri record</a> : null}</div> : null}
        </div>
      </section>
    </div>
  )
}
