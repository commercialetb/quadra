'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'

const desktopNav = [
  { href: '/dashboard', label: 'Dashboard', short: '01' },
  { href: '/companies', label: 'Aziende', short: '02' },
  { href: '/contacts', label: 'Contatti', short: '03' },
  { href: '/opportunities', label: 'Opportunità', short: '04' },
  { href: '/followups', label: 'Follow-up', short: '05' },
  { href: '/import', label: 'Import', short: '06' },
]

const mobileNav = [
  { href: '/dashboard', label: 'Home' },
  { href: '/companies', label: 'Aziende' },
  { href: '/contacts', label: 'Contatti' },
  { href: '/opportunities', label: 'Deal' },
  { href: '/followups', label: 'Task' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function currentLabel(pathname: string) {
  if (pathname.startsWith('/companies')) return 'Aziende'
  if (pathname.startsWith('/contacts')) return 'Contatti'
  if (pathname.startsWith('/opportunities')) return 'Opportunità'
  if (pathname.startsWith('/followups')) return 'Follow-up'
  if (pathname.startsWith('/import')) return 'Import'
  return 'Dashboard'
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const pageTitle = currentLabel(pathname)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-card">
          <Link href="/dashboard" className="brand-link">
            <div className="brand-mark">Q</div>
            <div>
              <h1 className="brand-title">Quadra</h1>
              <p className="brand-copy">CRM personale, simply better</p>
            </div>
          </Link>

          <nav className="nav-list" aria-label="Navigazione principale">
            {desktopNav.map((item) => (
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

          <div className="quick-title">Quick add</div>
          <div className="quick-grid">
            <Link className="quick-btn" href="/companies#new-company">Nuova azienda</Link>
            <Link className="quick-btn" href="/contacts#new-contact">Nuovo contatto</Link>
          </div>

          <div className="status-chip"><span className="pill-dot" /> Core CRM online</div>
          <div className="sidebar-spacer" />
          <LogoutButton />
        </div>
      </aside>

      <main className="main-area">
        <div className="topbar mobile-only">
          <strong>{pageTitle}</strong>
          <div className="topbar-actions compact-actions">
            <Link href="/import" className="btn btn-secondary btn-compact">Import</Link>
            <LogoutButton compact />
          </div>
        </div>

        <div className="topbar desktop-only">
          <div>
            <div className="topbar-title">QUADRA</div>
            <strong>{pageTitle}</strong>
          </div>
          <div className="topbar-actions compact-actions">
            <Link href="/import" className="btn btn-secondary btn-compact">Import</Link>
            <LogoutButton compact />
          </div>
        </div>

        {children}
      </main>

      <nav className="bottom-nav" aria-label="Navigazione mobile">
        {mobileNav.map((item) => (
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
