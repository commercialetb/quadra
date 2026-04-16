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
  if (pathname.startsWith('/settings')) return 'Strumenti'
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

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  /**
   * This Shell component has been simplified to follow a bottom‑dock navigation
   * pattern on every screen size. The previous sidebar and quick‑add panels
   * have been removed to focus the layout on the content area and a lightweight
   * topbar with utility actions. Navigation links are now provided via the
   * bottom dock. See globals.css for corresponding layout changes.
   */

  return (
    <div className="app-shell">
      <div className="app-main">
        {/* Top bar with page title and global actions */}
        <header className="app-topbar">
          <div>
            <div className="app-topbar-kicker">Quadra</div>
            <div className="app-topbar-title">{currentTitle(pathname)}</div>
          </div>
          <div className="app-topbar-actions">
            {/* Keep core actions accessible in the header */}
            <Link href="/assistant" className="ghost-button hide-mobile">Assistente AI</Link>
            <Link href="/settings" className="ghost-button">Strumenti</Link>
            <LogoutButton />
          </div>
        </header>
        <main className="page-shell">{children}</main>
      </div>

      {/* Global navigation dock at the bottom. This is visible on all screen sizes */}
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
        {/* Additional entry for settings on the dock so it’s easily reachable */}
        <Link
          href="/settings"
          className={`mobile-nav-link ${active(pathname, '/settings') ? 'is-active' : ''}`}
          aria-current={active(pathname, '/settings') ? 'page' : undefined}
        >
          <span className="mobile-nav-icon-wrap">
            <span className="mobile-nav-icon">
              {/* Settings icon (cog) */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.5 2.75a1.5 1.5 0 0 1 3 0v1.34a7.5 7.5 0 0 1 1.93.8l.95-.95a1.5 1.5 0 0 1 2.12 2.12l-.95.95c.35.6.63 1.25.8 1.93h1.34a1.5 1.5 0 0 1 0 3h-1.34a7.5 7.5 0 0 1-.8 1.93l.95.95a1.5 1.5 0 1 1-2.12 2.12l-.95-.95a7.5 7.5 0 0 1-1.93.8v1.34a1.5 1.5 0 0 1-3 0v-1.34a7.5 7.5 0 0 1-1.93-.8l-.95.95a1.5 1.5 0 1 1-2.12-2.12l.95-.95a7.5 7.5 0 0 1-.8-1.93H2.75a1.5 1.5 0 0 1 0-3h1.34a7.5 7.5 0 0 1 .8-1.93l-.95-.95a1.5 1.5 0 1 1 2.12-2.12l.95.95c.6-.35 1.25-.63 1.93-.8V2.75ZM12 9.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z" fill="currentColor" />
              </svg>
            </span>
          </span>
          <span className="sr-only">Strumenti</span>
        </Link>
      </nav>
    </div>
  )
}
