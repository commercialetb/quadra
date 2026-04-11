import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Accedi a Quadra</h1>
        <p style={styles.subtitle}>Magic link con Supabase Auth, pulito e rapido.</p>
        <LoginForm />
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#f7f7f8',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 24,
    padding: 28,
  },
  title: { margin: 0, fontSize: 32, letterSpacing: '-0.04em' },
  subtitle: { color: '#6b7280', lineHeight: 1.6 },
};
