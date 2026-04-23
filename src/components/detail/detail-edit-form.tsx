import type { ReactNode } from 'react'
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
  return (
    <section className="panel-card page-section-card detail-edit-card">
      <div className="panel-head compact">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <form action={action} className="sheet-form detail-edit-form">
        <div className="form-grid two-col">{children}</div>
        <div className="sheet-actions detail-edit-actions">
          <FormSubmitButton idleLabel={submitLabel} pendingLabel="Salvataggio..." variant="primary" />
        </div>
      </form>
    </section>
  )
}
