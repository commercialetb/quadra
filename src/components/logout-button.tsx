'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <button type="button" onClick={handleLogout} className="button-ghost" style={{ width: '100%', justifyContent: 'center' }}>
      Esci
    </button>
  )
}
