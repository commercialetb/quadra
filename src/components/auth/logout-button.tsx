'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type LogoutButtonProps = {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)

  async function onLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  const buttonClassName = [className ?? '', !className ? 'ghost-button' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" onClick={onLogout} disabled={loading} className={buttonClassName}>
      {loading ? 'Uscita...' : 'Esci'}
    </button>
  )
}
