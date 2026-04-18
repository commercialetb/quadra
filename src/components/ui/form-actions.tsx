'use client'

import { useFormStatus } from 'react-dom'

export function PendingSubmitButton({
  idleLabel = 'Salva',
  pendingLabel = 'Salvataggio...',
  className = 'ghost-button save-button',
}: {
  idleLabel?: string
  pendingLabel?: string
  className?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button className={className} type="submit" disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}

export function ConfirmDangerButton({
  label = 'Elimina',
  confirmMessage = 'Confermi l\'eliminazione?',
  className = 'danger-button',
}: {
  label?: string
  confirmMessage?: string
  className?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button
      className={className}
      type="submit"
      disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault()
        }
      }}
    >
      {pending ? 'Eliminazione...' : label}
    </button>
  )
}
