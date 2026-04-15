'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const fieldStyle: React.CSSProperties = { height: 50, borderRadius: 16, padding: '0 14px' }

export default function SignupPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
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
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage('Account creato. Controlla la mail se è richiesta la conferma.')
    setLoading(false)
    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <main className="auth-shell">
      <div className="auth-grid">
        <section className="auth-panel">
          <p className="auth-kicker">Create account</p>
          <h1 className="auth-title">Inizia pulito.</h1>
          <p className="auth-copy">Quadra deve sembrare immediato già dal primo minuto: pochi campi, nessun rumore, solo il necessario.</p>
        </section>

        <section className="auth-card">
          <p className="auth-kicker">Nuovo account</p>
          <h2 style={{ margin: '10px 0 0', fontSize: 34, letterSpacing: '-0.06em' }}>Crea accesso</h2>
          <form className="auth-form" onSubmit={onSubmit} style={{ marginTop: 22 }}>
            <label className="auth-label">Nome completo<input style={fieldStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Mario Rossi" /></label>
            <label className="auth-label">Email<input style={fieldStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@azienda.it" /></label>
            <div className="auth-row">
              <label className="auth-label">Password<input style={fieldStyle} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 8 caratteri" /></label>
              <label className="auth-label">Conferma<input style={fieldStyle} type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ripeti la password" /></label>
            </div>
            {error ? <div className="notice-error">{error}</div> : null}
            {message ? <div className="notice-success">{message}</div> : null}
            <button className="button-primary" type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Creazione account...' : 'Crea account'}</button>
          </form>
          <p className="auth-foot">Hai già un account? <Link href="/login" style={{ color: 'var(--text)', fontWeight: 700 }}>Accedi</Link></p>
        </section>
      </div>
    </main>
  )
}
