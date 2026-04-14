'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'

type NavItem = {
  href: string
  label: string
  shortLabel: string
  tinyLabel: string
  icon: 'home' | 'building' | 'person' | 'sparkles' | 'check'
}

const primaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home', tinyLabel: 'Home', icon: 'home' },
  { href: '/companies', label: 'Aziende', shortLabel: 'Az.', tinyLabel: 'Az', icon: 'building' },
  { href: '/contacts', label: 'Contatti', shortLabel: 'Cont.', tinyLabel: 'Cont', icon: 'person' },
  { href: '/opportunities', label: 'Opportunità', shortLabel: 'Opp.', tinyLabel: 'Opp', icon: 'sparkles' },
  { href: '/followups', label: 'Follow-up', shortLabel: 'Task', tinyLabel: 'Task', icon: 'check' },
]

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function currentTitle(pathname: string) {
  if (pathname.startsWith('/companies')) return 'Aziende'
  if (pathname.startsWith('/contacts')) return 'Contatti'
  if (pathname.startsWith('/opportunities')) return 'Opportunita'
  if (pathname.startsWith('/followups')) return 'Follow-up'
  if (pathname.startsWith('/import')) return 'Import dati'
  if (pathname.startsWith('/assistant')) return 'Assistente AI'
  if (pathname.startsWith('/capture/voice')) return 'Detta in Quadra'
  if (pathname.startsWith('/capture/siri/review')) return 'Review shortcut'
  if (pathname.startsWith('/capture/siri')) return 'Shortcut iPhone'
  if (pathname.startsWith('/capture/followup')) return 'Shortcut follow-up'
  return 'Dashboard'
}

function NavIcon({ name }: { name: NavItem['icon'] }) {
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11.5 12 5l8 6.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 10.5V19h9v-8.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'building':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 19V7.5c0-.8.4-1.4 1.1-1.7l5-2.2c.7-.3 1.4-.3 2.1 0l5 2.2c.7.3 1.1 1 1.1 1.7V19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 11h.01M15 11h.01M9 14.5h.01M15 14.5h.01M12 19v-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'person':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 4 1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7L12 4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m18.5 4 .5 1.5L20.5 6 19 6.5 18.5 8 18 6.5 16.5 6l1.5-.5.5-1.5ZM18.5 14l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'check':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4.5" y="5" width="15" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="m8.5 12 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
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
              <span className="sidebar-quick-title">Shortcut iPhone</span>
              <span className="sidebar-quick-copy">Installa i comandi ufficiali e apri la review queue.</span>
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
        {primaryNav.map((item) => {
          const isActive = active(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-link ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-nav-icon-wrap">
                <span className="mobile-nav-icon"><NavIcon name={item.icon} /></span>
              </span>
              <span className="sr-only">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
