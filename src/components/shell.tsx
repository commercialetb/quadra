'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import LogoutButton from '@/components/auth/logout-button'

const desktopNav = [
  { href: '/dashboard', label: 'Dashboard', short: '01' },
  { href: '/companies', label: 'Aziende', short: '02' },
  { href: '/contacts', label: 'Contatti', short: '03' },
  { href: '/opportunities', label: 'Opportunità', short: '04' },
  { href: '/followups', label: 'Follow-up', short: '05' },
]

const mobileNav = [
  { href: '/dashboard', label: 'Home', icon: '⌂' },
  { href: '/companies', label: 'Aziende', icon: '◫' },
  { href: '/contacts', label: 'Contatti', icon: '☺' },
  { href: '/opportunities', label: 'Deal', icon: '◌' },
  { href: '/followups', label: 'Follow-up', icon: '✓' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function titleFromPath(pathname: string) {
  if (pathname.startsWith('/companies')) return 'Aziende'
  if (pathname.startsWith('/contacts')) return 'Contatti'
  if (pathname.startsWith('/opportunities')) return 'Opportunità'
  if (pathname.startsWith('/followups')) return 'Follow-up'
  if (pathname.startsWith('/import')) return 'Import'
  return 'Dashboard'
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-panel">
          <div className="brand">
            <span className="brand-mark">Q</span>
            <div>
              <h1 className="brand-title">Quadra</h1>
              <p className="brand-copy">CRM personale, chiaro e operativo. Un prodotto vero, non un pannello improvvisato.</p>
            </div>
          </div>

          <div className="status-row">
            <span className="chip chip-accent"><span className="chip-dot" /> UI rebuild</span>
            <span className="chip">Simply is better</span>
          </div>

          <nav className="nav-stack" aria-label="Navigazione principale">
            {desktopNav.map((item) => (
              <Link key={item.href} href={item.href} prefetch className="nav-link" data-active={isActive(pathname, item.href)}>
                <span className="nav-link-index">{item.short}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div>
            <p className="muted-label">Tools</p>
            <div className="secondary-nav">
              <Link href="/import" className="secondary-link">Import dati</Link>
            </div>
          </div>

          <div className="sidebar-footer">
            <span className="chip"><span className="chip-dot" /> Core CRM online</span>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-copy">
            <span className="topbar-kicker">Quadra</span>
            <span className="topbar-title">{titleFromPath(pathname)}</span>
          </div>
          <div className="topbar-actions">
            {pathname !== '/import' ? <Link href="/import" className="button-ghost">Import</Link> : null}
            <LogoutButton compact />
          </div>
        </header>
        {children}
      </main>

      <nav className="bottom-nav" aria-label="Navigazione mobile">
        {mobileNav.map((item) => (
          <Link key={item.href} href={item.href} prefetch className="bottom-link" data-active={isActive(pathname, item.href)}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
