'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Ti abbiamo inviato il link per reimpostare la password.')
    }

    setLoading(false)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <div className="w-full rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm text-black/50">Quadra CRM</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Recupera password</h1>
          <p className="mt-2 text-sm text-black/60">Inserisci la tua email e ricevi il link di reset.</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-black/30"
              placeholder="nome@azienda.it"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Invio in corso...' : 'Invia link di reset'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-black/60">
          <Link href="/login" className="font-medium text-black hover:opacity-70">
            Torna al login
          </Link>
        </p>
      </div>
    </main>
  )
}
