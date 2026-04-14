'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'

const primaryNav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/companies', label: 'Aziende' },
  { href: '/contacts', label: 'Contatti' },
  { href: '/opportunities', label: 'Opportunità' },
  { href: '/followups', label: 'Follow-up' },
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
  if (pathname.startsWith('/assistant')) return 'Assistente AI'
  if (pathname.startsWith('/capture/voice')) return 'Detta in Quadra'
  if (pathname.startsWith('/capture/siri/review')) return 'Review Siri'
  if (pathname.startsWith('/capture/siri')) return 'Shortcut ufficiale'
  if (pathname.startsWith('/capture/followup')) return 'Shortcut follow-up'
  return 'Dashboard'
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <img src="/icons/brand-mark-v21.png" alt="Quadra" className="sidebar-brand-mark sidebar-brand-mark-image" />
          <div>
            <div className="sidebar-brand-title">Quadra</div>
            <div className="sidebar-brand-subtitle">CRM personale</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active(pathname, item.href) ? 'is-active' : ''}`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
          <Link href="/import" className={`sidebar-link ${active(pathname, '/import') ? 'is-active' : ''}`}>
            <span>Import</span>
          </Link>
          <Link href="/assistant" className={`sidebar-link ${active(pathname, '/assistant') ? 'is-active' : ''}`}>
            <span>Assistente AI</span>
          </Link>
        </nav>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Quick add</div>
          <div className="sidebar-quick-grid">
            <Link href="/companies" className="sidebar-quick-card">
              <span className="sidebar-quick-title">Nuova azienda</span>
              <span className="sidebar-quick-copy">Anagrafica pulita e veloce.</span>
            </Link>
            <Link href="/capture/siri" className="sidebar-quick-card">
              <span className="sidebar-quick-title">Siri layer</span>
              <span className="sidebar-quick-copy">Follow-up, ricerca, agenda, note e review queue Siri.</span>
            </Link>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-status">Core CRM + AI online</div>
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
            <Link href="/assistant" className="ghost-button hide-mobile">
              Assistente AI
            </Link>
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
