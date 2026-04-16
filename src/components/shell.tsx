'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/auth/logout-button'

type NavItem = {
  href: string
  label: string
  shortLabel: string
  tinyLabel: string
  icon: 'home' | 'building' | 'person' | 'sparkles' | 'check'
}

const primaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Home', shortLabel: 'Home', tinyLabel: 'Home', icon: 'home' },
  { href: '/followups', label: 'Agenda', shortLabel: 'Agenda', tinyLabel: 'Ag', icon: 'check' },
  { href: '/opportunities', label: 'Deals', shortLabel: 'Deals', tinyLabel: 'Deals', icon: 'sparkles' },
  { href: '/contacts', label: 'Contatti', shortLabel: 'Cont.', tinyLabel: 'Cont', icon: 'person' },
  { href: '/companies', label: 'Aziende', shortLabel: 'Az.', tinyLabel: 'Az', icon: 'building' },
]

const secondaryNav = [
  { href: '/assistant', label: 'Insight' },
  { href: '/settings', label: 'Settings' },
]

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function currentTitle(pathname: string) {
  if (pathname.startsWith('/companies')) return 'Aziende'
  if (pathname.startsWith('/contacts')) return 'Contatti'
  if (pathname.startsWith('/opportunities')) return 'Deals'
  if (pathname.startsWith('/followups')) return 'Agenda'
  if (pathname.startsWith('/import')) return 'Import dati'
  if (pathname.startsWith('/assistant')) return 'Insight'
  if (pathname.startsWith('/capture/voice')) return 'Detta in Quadra'
  if (pathname.startsWith('/capture/siri/review')) return 'Review shortcut'
  if (pathname.startsWith('/capture/siri')) return 'Shortcut iPhone'
  if (pathname.startsWith('/capture/followup')) return 'Shortcut follow-up'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Home'
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

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark" aria-hidden="true">Q</div>
          <div>
            <div className="sidebar-brand-title">Quadra</div>
            <div className="sidebar-brand-subtitle">CRM predittiva e vocale</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navigazione primaria desktop">
          {primaryNav.map((item) => {
            const isActive = active(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="mobile-nav-icon"><NavIcon name={item.icon} /></span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          {secondaryNav.map((item) => {
            const isActive = active(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}
          <div className="sidebar-status">Esperienza desktop allineata ai mockup: sidebar stabile, contenuto centrale e dock mobile separato.</div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="app-topbar-kicker">Quadra</div>
            <div className="app-topbar-title">{currentTitle(pathname)}</div>
          </div>
          <div className="app-topbar-actions">
            <Link href="/assistant" className="ghost-button hide-mobile">Insight</Link>
            <Link href="/capture/voice" className="ghost-button hide-mobile">Voice</Link>
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
              <span className="mobile-nav-label mobile-nav-label-full">{item.label}</span>
              <span className="mobile-nav-label mobile-nav-label-short">{item.shortLabel}</span>
              <span className="mobile-nav-label mobile-nav-label-tiny">{item.tinyLabel}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
