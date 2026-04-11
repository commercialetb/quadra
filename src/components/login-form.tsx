'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage('Magic link inviato. Controlla la tua email.');
    setLoading(false);
    router.refresh();
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <button style={styles.button} type="submit" disabled={loading}>
        {loading ? 'Invio...' : 'Invia magic link'}
      </button>
      {message ? <p style={styles.message}>{message}</p> : null}
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'grid', gap: 12 },
  input: {
    height: 48,
    borderRadius: 14,
    border: '1px solid #d1d5db',
    padding: '0 14px',
  },
  button: {
    height: 48,
    borderRadius: 14,
    border: 'none',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
  },
  message: { margin: 0, color: '#374151', lineHeight: 1.5 },
};
