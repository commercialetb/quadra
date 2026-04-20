'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type Props = {
  companyId: string
  title: string
  description: string
  priority?: 'medium' | 'high' | 'urgent'
  className?: string
  compact?: boolean
  createLabel?: string
  defaultDueInDays?: 1 | 2 | 3 | 7
}

const DUE_OPTIONS = [
  { value: 1, label: 'Domani' },
  { value: 2, label: '2g' },
  { value: 3, label: '3g' },
  { value: 7, label: '7g' },
] as const

export function CreateFollowupButton({
  companyId,
  title,
  description,
  priority = 'medium',
  className,
  compact = false,
  createLabel = 'Crea follow-up',
  defaultDueInDays = 2,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'duplicate' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [openUrl, setOpenUrl] = useState('/followups')
  const [dueInDays, setDueInDays] = useState<number>(defaultDueInDays)

  const buttonLabel = useMemo(() => {
    if (status === 'loading') return 'Creo…'
    if (status === 'done') return 'Creato'
    if (status === 'duplicate') return 'Già presente'
    return createLabel
  }, [createLabel, status])

  async function handleCreate() {
    if (status === 'loading' || status === 'done') return
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/analysis/create-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, title, description, priority, dueInDays }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Impossibile creare il follow-up.')
      }
      if (data?.openUrl) {
        setOpenUrl(String(data.openUrl))
      }
      if (data?.duplicate) {
        setStatus('duplicate')
        setMessage(data?.message || 'Esiste già un follow-up aperto simile.')
        return
      }
      setStatus('done')
      setMessage('Creato in agenda')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Errore inatteso')
    }
  }

  return (
    <div className={`analysis-followup-cta ${compact ? 'is-compact' : ''}`}>
      <div className="analysis-followup-controls">
        <label className="analysis-followup-due">
          <span>Scadenza</span>
          <select value={dueInDays} onChange={(event) => setDueInDays(Number(event.target.value))} disabled={status === 'loading' || status === 'done'}>
            {DUE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleCreate}
          disabled={status === 'loading' || status === 'done'}
          className={className || 'analysis-followup-button'}
        >
          {buttonLabel}
        </button>
      </div>
      {message ? (
        <span className={`analysis-followup-status is-${status}`}>
          {message}{' '}
          {(status === 'done' || status === 'duplicate') ? <Link href={openUrl}>Apri agenda</Link> : null}
        </span>
      ) : null}
    </div>
  )
}
