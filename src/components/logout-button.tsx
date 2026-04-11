'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} style={styles.button}>
      Esci
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    marginTop: 'auto',
    height: 44,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
  },
};
