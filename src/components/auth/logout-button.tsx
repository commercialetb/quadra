'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export function LogoutButton({ className = 'ghost-button' }: { className?: string }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)

  async function onLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <button type="button" onClick={onLogout} disabled={loading} className={className}>
      {loading ? 'Uscita...' : 'Esci'}
    </button>
  )
}
