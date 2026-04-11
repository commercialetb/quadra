'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const fieldStyle: React.CSSProperties = { height: 50, borderRadius: 16, padding: '0 14px' }

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) setError(error.message)
    else setMessage('Email inviata. Apri il link e imposta una nuova password.')

    setLoading(false)
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" style={{ maxWidth: 560 }}>
        <p className="auth-kicker">Reset password</p>
        <h1 style={{ margin: '10px 0 0', fontSize: 36, letterSpacing: '-0.06em' }}>Recupera accesso</h1>
        <p className="auth-copy" style={{ marginTop: 12 }}>Inserisci la tua email e riceverai un link per impostare una nuova password.</p>
        <form className="auth-form" onSubmit={onSubmit} style={{ marginTop: 22 }}>
          <label className="auth-label">Email<input style={fieldStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@azienda.it" /></label>
          {error ? <div className="notice-error">{error}</div> : null}
          {message ? <div className="notice-success">{message}</div> : null}
          <button className="button-primary" type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Invio in corso...' : 'Invia link di reset'}</button>
        </form>
        <p className="auth-foot"><Link href="/login" style={{ color: 'var(--text)', fontWeight: 700 }}>Torna al login</Link></p>
      </section>
    </main>
  )
}
