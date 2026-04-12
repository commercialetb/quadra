'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = { compact?: boolean }

export function LogoutButton({ compact = false }: Props) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button type="button" className={compact ? 'btn btn-secondary btn-compact' : 'sidebar-logout'} onClick={handleLogout}>
      Esci
    </button>
  )
}
