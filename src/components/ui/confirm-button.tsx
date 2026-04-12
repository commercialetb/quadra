'use client'

import { MouseEvent } from 'react'
import { useFormStatus } from 'react-dom'

export function ConfirmButton({
  label = 'Elimina',
  pendingLabel = 'Eliminazione...',
  confirmMessage = 'Confermi eliminazione?',
}: {
  label?: string
  pendingLabel?: string
  confirmMessage?: string
}) {
  const { pending } = useFormStatus()

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (pending) return
    if (!window.confirm(confirmMessage)) {
      event.preventDefault()
    }
  }

  return (
    <button className="danger-button" type="submit" disabled={pending} aria-busy={pending} onClick={onClick}>
      {pending ? pendingLabel : label}
    </button>
  )
}
