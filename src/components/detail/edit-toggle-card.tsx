'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'

export type EditFormState = {
  ok: boolean
  message?: string
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="primary-button" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Salvataggio...' : label}
    </button>
  )
}

export function EditToggleCard({
  title = 'Modifica dati',
  description,
  submitLabel,
  action,
  children,
}: {
  title?: string
  description?: string
  submitLabel: string
  action: (state: EditFormState, formData: FormData) => Promise<EditFormState>
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(action, { ok: false, message: '' })

  useEffect(() => {
    if (state.ok) setOpen(false)
  }, [state.ok])

  return (
    <section className="panel-card edit-toggle-card">
      <div className="panel-head compact">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <button className="ghost-button" type="button" onClick={() => setOpen((current) => !current)}>
          {open ? 'Chiudi' : 'Modifica dati'}
        </button>
      </div>

      {state.message ? (
        <div className={state.ok ? 'notice-success' : 'notice-error'}>{state.message}</div>
      ) : null}

      {open ? (
        <form action={formAction} className="detail-edit-form">
          {children}
          <div className="detail-edit-actions">
            <button className="secondary-button" type="button" onClick={() => setOpen(false)}>
              Annulla
            </button>
            <SubmitButton label={submitLabel} />
          </div>
        </form>
      ) : null}
    </section>
  )
}
