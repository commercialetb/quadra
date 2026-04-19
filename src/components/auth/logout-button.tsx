'use client'

import { signOut } from '@/app/(app)/actions'

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="quadra-pill-button">
        Esci
      </button>
    </form>
  )
}
