'use client'

import { useFormStatus } from 'react-dom'

type Variant = 'primary' | 'ghost' | 'secondary'

export function FormSubmitButton({
  idleLabel = 'Salva',
  pendingLabel = 'Salvataggio...',
  variant = 'ghost',
}: {
  idleLabel?: string
  pendingLabel?: string
  variant?: Variant
}) {
  const { pending } = useFormStatus()
  const className =
    variant === 'primary' ? 'primary-button' : variant === 'secondary' ? 'secondary-button' : 'ghost-button'

  return (
    <button className={`${className} save-button`} type="submit" disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}
