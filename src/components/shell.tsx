import Link from 'next/link';
import { ReactNode } from 'react';
import { LogoutButton } from './logout-button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/companies', label: 'Aziende' },
  { href: '/contacts', label: 'Contatti' },
  { href: '/opportunities', label: 'Opportunita' },
  { href: '/followups', label: 'Follow-up' },
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>Quadra</div>
          <p style={styles.caption}>CRM semplice, pulito, operativo.</p>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    background: '#f7f7f8',
    color: '#111827',
  },
  sidebar: {
    padding: '24px 18px',
    borderRight: '1px solid #e5e7eb',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  brand: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '-0.03em',
  },
  caption: {
    marginTop: 8,
    color: '#6b7280',
    lineHeight: 1.5,
  },
  nav: {
    display: 'grid',
    gap: 8,
  },
  navLink: {
    padding: '12px 14px',
    borderRadius: 12,
    textDecoration: 'none',
    color: '#111827',
    background: '#f3f4f6',
    fontWeight: 500,
  },
  main: {
    padding: 28,
  },
};
