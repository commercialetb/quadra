'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

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
            <span className="pill"><span className="pill-dot" /> Milestone 3.2</span>
            <span className="pill">Focus + chiarezza</span>
          </div>

          <nav className="nav-list">
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
            <button className="quick-btn">+ Azienda</button>
            <button className="quick-btn">+ Contatto</button>
            <button className="quick-btn">+ Opportunità</button>
          </div>

          <div className="status-chip"><span className="pill-dot" /> Core CRM online</div>
        </div>
      </aside>

      <main className="main-area">
        <div className="topbar">
          <div>
            <div className="topbar-title">QUADRA</div>
            <strong>Simply is better</strong>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-secondary">Esci</button>
          </div>
        </div>
        {children}
      </main>

      <nav className="bottom-nav">
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
