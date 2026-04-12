'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'

const desktopNav = [
  { href: '/dashboard', label: 'Dashboard', short: '01' },
  { href: '/companies', label: 'Aziende', short: '02' },
  { href: '/contacts', label: 'Contatti', short: '03' },
  { href: '/opportunities', label: 'Opportunita', short: '04' },
  { href: '/followups', label: 'Follow-up', short: '05' },
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

function titleForPath(pathname: string) {
  if (pathname.startsWith('/companies')) return 'Aziende'
  if (pathname.startsWith('/contacts')) return 'Contatti'
  if (pathname.startsWith('/opportunities')) return 'Opportunita'
  if (pathname.startsWith('/followups')) return 'Follow-up'
  if (pathname.startsWith('/import')) return 'Import'
  return 'Dashboard'
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-card">
          <Link href="/dashboard" className="brand-link">
            <div className="brand-mark">Q</div>
            <div>
              <h1 className="brand-title">Quadra</h1>
              <p className="brand-copy">CRM operativo, pulito e personale.</p>
            </div>
          </Link>

          <div className="status-cluster">
            <span className="status-pill status-pill-accent"><span className="status-dot status-dot-blue" /> Core CRM</span>
            <span className="status-pill"><span className="status-dot" /> Ready</span>
          </div>

          <nav className="nav-stack" aria-label="Navigazione principale">
            {desktopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className="nav-link"
                data-active={isActive(pathname, item.href)}
              >
                <span className="nav-pill">{item.short}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="quick-add-panel">
            <p className="mini-label">Quick add</p>
            <div className="quick-actions-column">
              <Link href="/companies#new-company" className="button-primary button-full">+ Azienda</Link>
              <Link href="/contacts#new-contact" className="button-secondary button-full" style={{ marginTop: 10 }}>+ Contatto</Link>
              <Link href="/opportunities#new-opportunity" className="button-secondary button-full" style={{ marginTop: 10 }}>+ Opportunita</Link>
            </div>
          </div>

          <div className="sidebar-footer-block">
            <Link href="/import" className="sidebar-footer-link">Import dati</Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="shell-main">
        <header className="mobile-topbar">
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Quadra</div>
            <strong>{titleForPath(pathname)}</strong>
          </div>
          <Link href="/import" className="button-ghost mobile-import-link">Import</Link>
        </header>

        {children}
      </main>

      <nav className="mobile-tabbar" aria-label="Navigazione mobile">
        {mobileNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className="mobile-tab"
            data-active={isActive(pathname, item.href)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
