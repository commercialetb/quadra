'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const fieldStyle: React.CSSProperties = { height: 50, borderRadius: 16, padding: '0 14px' }

export default function LoginPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.replace('/dashboard')
    router.refresh()
  }

  async function onMagicLink() {
    if (!email.trim()) {
      setError('Inserisci prima la tua email.')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    })

    if (error) setError(error.message)
    else setMessage('Magic link inviato. Apri la mail e torna su Quadra.')

    setLoading(false)
  }

  return (
    <main className="auth-shell">
      <div className="auth-grid">
        <section className="auth-panel">
          <p className="auth-kicker">Milestone 2</p>
          <h1 className="auth-title">Quadra diventa premium.</h1>
          <p className="auth-copy">
            Accesso classico, meno attrito e un look più vicino a un prodotto vero. Semplice, pulito, affidabile.
          </p>

          <div className="auth-list">
            {[
              ['01', 'Login con email e password', 'Rapido e prevedibile, perfetto per uso quotidiano.'],
              ['02', 'Magic link come fallback', 'Resta disponibile quando vuoi entrare senza password.'],
              ['03', 'Reset password e sessione chiara', 'Più professionale, più business-ready.'],
            ].map(([n, t, d]) => (
              <div key={n} className="auth-bullet">
                <div className="auth-badge">{n}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{t}</div>
                  <div style={{ marginTop: 4, color: 'var(--muted)', lineHeight: 1.6 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-card">
          <p className="auth-kicker">Accedi</p>
          <h2 style={{ margin: '10px 0 0', fontSize: 34, letterSpacing: '-0.06em' }}>Bentornato</h2>
          <p className="auth-copy" style={{ marginTop: 10 }}>Entra nel tuo CRM e riprendi esattamente da dove avevi lasciato.</p>

          <form className="auth-form" onSubmit={onSubmit} style={{ marginTop: 22 }}>
            <label className="auth-label">
              Email
              <input style={fieldStyle} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@azienda.it" />
            </label>

            <label className="auth-label">
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span>Password</span>
                <Link href="/forgot-password" style={{ color: 'var(--muted)', fontWeight: 500 }}>Password dimenticata?</Link>
              </span>
              <input style={fieldStyle} type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </label>

            {error ? <div className="notice-error">{error}</div> : null}
            {message ? <div className="notice-success">{message}</div> : null}

            <button className="button-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <div className="auth-divider" />

          <button className="button-secondary" type="button" disabled={loading} style={{ width: '100%' }} onClick={onMagicLink}>
            Ricevi magic link
          </button>

          <p className="auth-foot">
            Non hai ancora un account? <Link href="/signup" style={{ color: 'var(--text)', fontWeight: 700 }}>Crea account</Link>
          </p>
        </section>
      </div>
    </main>
  )
}
