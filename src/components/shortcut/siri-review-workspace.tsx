'use client'

import { useEffect, useState } from 'react'

type Candidate = {
  kind: 'company' | 'contact' | 'opportunity'
  id: string
  title: string
  subtitle: string
  openUrl?: string
  score: number
}

type ReviewItem = {
  id: string
  actionKey: 'add_note' | 'log_call_outcome' | 'log_interaction'
  status: 'pending' | 'resolved' | 'dismissed'
  query: string | null
  entityType: 'company' | 'contact' | 'opportunity' | null
  bestGuessKind: 'company' | 'contact' | 'opportunity' | null
  bestGuessEntityId: string | null
  bestGuessTitle: string | null
  ambiguityReason: string | null
  candidateResults: Candidate[]
  createdAt: string
  processedResult?: { openUrl?: string | null } | null
  resolutionConfidence: 'low' | 'medium' | 'high'
  retryCount: number
  lastRetryAt: string | null
  autoResolved: boolean
  lastError: string | null
}

type ReviewApiResult = {
  ok: boolean
  count?: number
  items?: ReviewItem[]
  error?: string
}

async function postJson<T>(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return (await response.json()) as T
}

export function SiriReviewWorkspace() {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/shortcut/review-queue', { cache: 'no-store' })
      const data = (await response.json()) as ReviewApiResult
      if (!data.ok) {
        setMessage(data.error || 'Impossibile caricare la review queue')
        setItems([])
      } else {
        setItems(data.items || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function resolveItem(itemId: string, candidate: Candidate) {
    setBusyId(itemId)
    setMessage('')
    try {
      const result = await postJson<{ ok: boolean; error?: string; spokenResponse?: string }>('/api/shortcut/resolve-review', {
        itemId,
        mode: 'resolve',
        entityType: candidate.kind,
        entityId: candidate.id,
      })
      if (!result.ok) {
        setMessage(result.error || 'Errore nel risolvere la review')
      } else {
        setMessage(result.spokenResponse || 'Review risolta')
        await load()
      }
    } finally {
      setBusyId('')
    }
  }

  async function retryItem(itemId: string) {
    setBusyId(itemId)
    setMessage('')
    try {
      const result = await postJson<{ ok: boolean; error?: string; spokenResponse?: string; autoResolved?: boolean }>('/api/shortcut/resolve-review', {
        itemId,
        mode: 'retry',
      })
      if (!result.ok) {
        setMessage(result.error || 'Errore nel retry della review')
      } else {
        setMessage(result.spokenResponse || (result.autoResolved ? 'Retry con auto-resolve completato' : 'Retry completato'))
        await load()
      }
    } finally {
      setBusyId('')
    }
  }

  async function autoResolve(itemId: string) {
    setBusyId(itemId)
    setMessage('')
    try {
      const result = await postJson<{ ok: boolean; error?: string; spokenResponse?: string }>('/api/shortcut/resolve-review', {
        itemId,
        mode: 'auto_resolve',
      })
      if (!result.ok) {
        setMessage(result.error || 'Errore nell’auto-resolve')
      } else {
        setMessage(result.spokenResponse || 'Auto-resolve completato')
        await load()
      }
    } finally {
      setBusyId('')
    }
  }

  async function dismissItem(itemId: string) {
    setBusyId(itemId)
    setMessage('')
    try {
      const result = await postJson<{ ok: boolean; error?: string }>('/api/shortcut/resolve-review', {
        itemId,
        mode: 'dismiss',
      })
      if (!result.ok) {
        setMessage(result.error || 'Errore nella chiusura review')
      } else {
        setMessage('Review archiviata')
        await load()
      }
    } finally {
      setBusyId('')
    }
  }

  const pending = items.filter((item) => item.status === 'pending')
  const closed = items.filter((item) => item.status !== 'pending').slice(0, 8)

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Siri review queue</p>
          <h1 className="page-title">Ambiguità e casi non risolti</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Qui trovi i comandi Siri che non hanno trovato un record sicuro. In v11 puoi ritentare la ricerca, auto-risolvere i match forti o chiuderli a mano, con auth coerente anche da Apple Shortcuts.
          </p>
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head"><div><h2>Stato queue</h2><p>{pending.length} pendenti · {closed.length} chiusi recenti</p></div></div>
        <div className="stack-sm">
          <div><strong>Confidence:</strong> ogni review ha un livello low, medium o high basato sul match attuale.</div>
          <div><strong>Retry:</strong> rilancia la ricerca con i dati più aggiornati e prova l’auto-resolve se il best guess diventa forte.</div>
          <div><strong>Auto-resolve:</strong> disponibile solo quando Quadra vede un candidato nettamente più probabile.</div>
        </div>
        {message ? <p className="helper-text">{message}</p> : null}
      </section>

      {loading ? <section className="panel-card page-section-card"><p>Caricamento review queue…</p></section> : null}

      {!loading && pending.length === 0 ? (
        <section className="panel-card page-section-card"><p>Nessun elemento pendente. Ottimo.</p></section>
      ) : null}

      <div className="dashboard-grid two-up assistant-grid">
        {pending.map((item) => (
          <section key={item.id} className="panel-card page-section-card">
            <div className="panel-head"><div><h2>{item.query || item.actionKey}</h2><p>{item.ambiguityReason || 'Review Siri'}</p></div></div>
            <div className="stack-sm">
              <div><strong>Azione:</strong> {item.actionKey}</div>
              <div><strong>Confidence:</strong> {item.resolutionConfidence}</div>
              <div><strong>Retry count:</strong> {item.retryCount}{item.lastRetryAt ? ` · ultimo ${new Date(item.lastRetryAt).toLocaleString('it-IT')}` : ''}</div>
              <div><strong>Creato:</strong> {new Date(item.createdAt).toLocaleString('it-IT')}</div>
              {item.bestGuessTitle ? <div><strong>Best guess:</strong> {item.bestGuessTitle}</div> : null}
              {item.lastError ? <div className="helper-text">{item.lastError}</div> : null}
              <div className="inline-actions">
                <button className="ghost-button" onClick={() => retryItem(item.id)} disabled={busyId === item.id}>Retry</button>
                {item.bestGuessEntityId && item.resolutionConfidence === 'high' ? (
                  <button className="primary-button" onClick={() => autoResolve(item.id)} disabled={busyId === item.id}>Auto-resolve</button>
                ) : null}
              </div>
              <div className="stack-sm">
                {(item.candidateResults || []).map((candidate) => (
                  <div key={candidate.id} className="panel-card panel-card-muted" style={{ padding: 12 }}>
                    <div><strong>{candidate.title}</strong></div>
                    <div className="helper-text">{candidate.subtitle} · score {candidate.score}</div>
                    <div className="inline-actions" style={{ marginTop: 8 }}>
                      <button className="primary-button" onClick={() => resolveItem(item.id, candidate)} disabled={busyId === item.id}>Usa questo</button>
                      {candidate.openUrl ? <a href={candidate.openUrl} className="ghost-button">Apri</a> : null}
                    </div>
                  </div>
                ))}
                {item.candidateResults.length === 0 ? <div className="helper-text">Nessun candidato automatico trovato. Prova Retry oppure risolvi dentro Quadra.</div> : null}
              </div>
              <div className="inline-actions">
                <button className="ghost-button" onClick={() => dismissItem(item.id)} disabled={busyId === item.id}>Archivia</button>
              </div>
            </div>
          </section>
        ))}
      </div>

      {closed.length > 0 ? (
        <section className="panel-card page-section-card">
          <div className="panel-head"><div><h2>Chiusi recenti</h2><p>Ultimi elementi risolti, auto-risolti o archiviati.</p></div></div>
          <div className="stack-sm">
            {closed.map((item) => (
              <div key={item.id}><strong>{item.query || item.actionKey}</strong> · {item.status}{item.autoResolved ? ' · auto-resolved' : ''}</div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
