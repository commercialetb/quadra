'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'

const primaryNav = [
  { href: '/dashboard', label: 'Home', desktop: 'Dashboard' },
  { href: '/companies', label: 'Aziende' },
  { href: '/contacts', label: 'Contatti' },
  { href: '/opportunities', label: 'Deal', desktop: 'Opportunita' },
  { href: '/followups', label: 'Task', desktop: 'Follow-up' },
]

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function currentTitle(pathname: string) {
  if (pathname.startsWith('/companies')) return 'Aziende'
  if (pathname.startsWith('/contacts')) return 'Contatti'
  if (pathname.startsWith('/opportunities')) return 'Opportunità'
  if (pathname.startsWith('/followups')) return 'Follow-up'
  if (pathname.startsWith('/import')) return 'Import dati'
  return 'Dashboard'
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">Q</div>
          <div>
            <div className="sidebar-brand-title">Quadra</div>
            <div className="sidebar-brand-subtitle">CRM personale, simply better</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active(pathname, item.href) ? 'is-active' : ''}`}
            >
              <span>{item.desktop ?? item.label}</span>
            </Link>
          ))}
          <Link href="/import" className={`sidebar-link ${active(pathname, '/import') ? 'is-active' : ''}`}>
            <span>Import</span>
          </Link>
        </nav>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Quick add</div>
          <div className="sidebar-quick-grid">
            <Link href="/companies" className="sidebar-quick-card">
              <span className="sidebar-quick-title">Nuova azienda</span>
              <span className="sidebar-quick-copy">Anagrafica pulita e veloce.</span>
            </Link>
            <Link href="/contacts" className="sidebar-quick-card">
              <span className="sidebar-quick-title">Nuovo contatto</span>
              <span className="sidebar-quick-copy">Persona, ruolo e contesto.</span>
            </Link>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-status">Core CRM online</div>
          <LogoutButton />
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="app-topbar-kicker">Quadra</div>
            <div className="app-topbar-title">{currentTitle(pathname)}</div>
          </div>
          <div className="app-topbar-actions">
            <Link href="/import" className="ghost-button hide-mobile">
              Import
            </Link>
            <LogoutButton />
          </div>
        </header>

        <main className="page-shell">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Navigazione primaria">
        {primaryNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-link ${active(pathname, item.href) ? 'is-active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
