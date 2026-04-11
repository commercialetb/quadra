'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.replace('/dashboard')
    router.refresh()
  }

  async function onMagicLink() {
    setLoading(true)
    setError(null)
    setMessage(null)

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Magic link inviato. Apri la mail e torna qui.')
    }

    setLoading(false)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <div className="w-full rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm text-black/50">Quadra CRM</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Accedi</h1>
          <p className="mt-2 text-sm text-black/60">
            Email e password come flusso principale. Magic link solo come alternativa.
          </p>
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

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-black/60 hover:text-black">
                Password dimenticata?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-black/30"
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="my-6 h-px bg-black/10" />

        <div className="space-y-4">
          <button
            type="button"
            onClick={onMagicLink}
            disabled={loading || !email.trim()}
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ricevi magic link
          </button>

          <p className="text-center text-sm text-black/60">
            Non hai un account?{' '}
            <Link href="/signup" className="font-medium text-black hover:opacity-70">
              Crea account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
