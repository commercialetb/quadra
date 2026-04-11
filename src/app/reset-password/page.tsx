'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const fieldStyle: React.CSSProperties = { height: 50, borderRadius: 16, padding: '0 14px' }

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (password.length < 8) return setError('La password deve avere almeno 8 caratteri.')
    if (password !== confirmPassword) return setError('Le password non coincidono.')

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage('Password aggiornata. Verrai reindirizzato al login.')
    setLoading(false)
    setTimeout(() => {
      router.replace('/login')
      router.refresh()
    }, 900)
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" style={{ maxWidth: 560 }}>
        <p className="auth-kicker">Nuova password</p>
        <h1 style={{ margin: '10px 0 0', fontSize: 36, letterSpacing: '-0.06em' }}>Imposta una nuova password</h1>
        <form className="auth-form" onSubmit={onSubmit} style={{ marginTop: 22 }}>
          <label className="auth-label">Nuova password<input style={fieldStyle} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 8 caratteri" /></label>
          <label className="auth-label">Conferma password<input style={fieldStyle} type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ripeti la password" /></label>
          {error ? <div className="notice-error">{error}</div> : null}
          {message ? <div className="notice-success">{message}</div> : null}
          <button className="button-primary" type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Aggiornamento...' : 'Aggiorna password'}</button>
        </form>
        <p className="auth-foot"><Link href="/login" style={{ color: 'var(--text)', fontWeight: 700 }}>Torna al login</Link></p>
      </section>
    </main>
  )
}
