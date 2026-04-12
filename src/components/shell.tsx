'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/logout-button'

const nav = [
  { href: '/dashboard', label: 'Dashboard', short: '01' },
  { href: '/companies', label: 'Aziende', short: '02' },
  { href: '/contacts', label: 'Contatti', short: '03' },
  { href: '/opportunities', label: 'Opportunità', short: '04' },
  { href: '/followups', label: 'Follow-up', short: '05' },
  { href: '/import', label: 'Import', short: '06' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-card">
          <div className="brand-mark">Q</div>
          <h1 className="brand-title">Quadra</h1>
          <p className="brand-copy">CRM personale, chiaro e operativo. Meno attrito, più controllo.</p>

          <div className="pill-row">
            <span className="pill"><span className="pill-dot" /> Rebuild UI</span>
            <span className="pill">Simply is better</span>
          </div>

          <nav className="nav-list" aria-label="Navigazione principale">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`nav-link ${isActive(pathname, item.href) ? 'active' : ''}`}
              >
                <span className="nav-index">{item.short}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="quick-title">Azioni rapide</div>
          <div className="quick-grid">
            <Link className="quick-btn" href="/companies#new-company">+ Azienda</Link>
            <Link className="quick-btn" href="/contacts#new-contact">+ Contatto</Link>
            <Link className="quick-btn" href="/opportunities#new-opportunity">+ Opportunità</Link>
          </div>

          <div className="quick-title">Sessione</div>
          <LogoutButton />

          <div className="status-chip"><span className="pill-dot" /> Core CRM online</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-title">QUADRA</div>
            <strong>Dashboard, CRM, import e basi AI pronte a crescere</strong>
          </div>
          <div className="topbar-actions">
            <span className="status-pill status-pill-accent"><span className="status-dot status-dot-blue" /> Responsive</span>
            <span className="status-pill"><span className="status-dot" /> Online</span>
          </div>
        </header>
        {children}
      </main>

      <nav className="bottom-nav" aria-label="Navigazione mobile">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={`bottom-link ${isActive(pathname, item.href) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
