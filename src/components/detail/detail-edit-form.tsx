'use client'

import { useState, type ReactNode } from 'react'
import { FormSubmitButton } from '@/components/ui/form-submit-button'

export function DetailEditCard({
  title = 'Modifica dati',
  subtitle,
  children,
  action,
  submitLabel = 'Salva modifiche',
}: {
  title?: string
  subtitle?: string
  children: ReactNode
  action: (formData: FormData) => void | Promise<void>
  submitLabel?: string
}) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    await action(formData)
    setOpen(false)
  }

  return (
    <section className="panel-card page-section-card detail-edit-card">
      <div className="panel-head compact" style={{ alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <button className="ghost-button" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? 'Chiudi modifica' : 'Modifica dati'}
        </button>
      </div>

      {open ? (
        <form action={handleSubmit} className="sheet-form detail-edit-form">
          <div className="form-grid two-col">{children}</div>
          <div className="sheet-actions detail-edit-actions">
            <button className="secondary-button" type="button" onClick={() => setOpen(false)}>
              Annulla
            </button>
            <FormSubmitButton idleLabel={submitLabel} pendingLabel="Salvataggio..." variant="primary" />
          </div>
        </form>
      ) : null}
    </section>
  )
}
