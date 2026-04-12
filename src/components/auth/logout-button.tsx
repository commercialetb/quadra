'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
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
    <button type="button" onClick={onLogout} disabled={loading} className="ghost-button">
      {loading ? 'Uscita...' : 'Esci'}
    </button>
  )
}
