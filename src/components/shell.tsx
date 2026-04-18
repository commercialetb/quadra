'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'
import { VoiceControlBar } from '@/components/voice-control-bar'

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
  { href: '/opportunities', label: 'Opportunita', shortLabel: 'Opp.', tinyLabel: 'Opp', icon: 'sparkles' },
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


function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSettingsPage = pathname.startsWith('/settings')
  const [tabletNavOpen, setTabletNavOpen] = useState(false)

  useEffect(() => {
    setTabletNavOpen(false)
  }, [pathname])

  return (
    <div className="app-shell quadra-shell-refresh quadra-shell-phase2">
      <div className="quadra-ambient quadra-ambient-a" aria-hidden="true" />
      <div className="quadra-ambient quadra-ambient-b" aria-hidden="true" />

      <aside className="app-sidebar" aria-label="Quadra navigation">
        <div className="sidebar-brand sidebar-brand-phase2">
          <div className="sidebar-brand-mark">Q</div>
          <div>
            <p>Quadra</p>
            <span>CRM predittivo e vocale</span>
          </div>
        </div>

        <div className="sidebar-voice-pod">
          <span className="sidebar-pod-label">Voice Control</span>
          <strong>Siri, Gemini e GPT in un solo spazio.</strong>
          <div className="sidebar-pod-wave" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <nav className="sidebar-nav">
          {primaryNav.map((item) => {
            const isActive = active(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="sidebar-link-icon"><NavIcon name={item.icon} /></span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-secondary">
          <Link href="/assistant" className={`sidebar-link secondary ${active(pathname, '/assistant') ? 'is-active' : ''}`}>
            <span className="sidebar-link-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.5a6.5 6.5 0 0 0-6.5 6.5v2.2c0 .9-.3 1.8-.9 2.5l-1 1.2c-.7.9-.1 2.3 1.1 2.3h14.6c1.2 0 1.8-1.4 1.1-2.3l-1-1.2c-.6-.7-.9-1.6-.9-2.5V10A6.5 6.5 0 0 0 12 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <path d="M9.5 19a2.5 2.5 0 0 0 5 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <span>Assistente AI</span>
          </Link>
          <Link href="/settings" className={`sidebar-link secondary ${active(pathname, '/settings') ? 'is-active' : ''}`}>
            <span className="sidebar-link-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.5 2.75a1.5 1.5 0 0 1 3 0v1.34a7.5 7.5 0 0 1 1.93.8l.95-.95a1.5 1.5 0 0 1 2.12 2.12l-.95.95c.35.6.63 1.25.8 1.93h1.34a1.5 1.5 0 0 1 0 3h-1.34a7.5 7.5 0 0 1-.8 1.93l.95.95a1.5 1.5 0 1 1-2.12 2.12l-.95-.95a7.5 7.5 0 0 1-1.93.8v1.34a1.5 1.5 0 0 1-3 0v-1.34a7.5 7.5 0 0 1-1.93-.8l-.95.95a1.5 1.5 0 1 1-2.12-2.12l.95-.95a7.5 7.5 0 0 1-.8-1.93H2.75a1.5 1.5 0 0 1 0-3h1.34a7.5 7.5 0 0 1 .8-1.93l-.95-.95a1.5 1.5 0 1 1 2.12-2.12l.95.95c.6-.35 1.25-.63 1.93-.8V2.75Z" fill="currentColor" />
              </svg>
            </span>
            <span>Strumenti</span>
          </Link>
        </div>

        {!isSettingsPage ? (
          <div className="sidebar-card sidebar-card-phase2">
            <div className="sidebar-card-label">Quadra OS</div>
            <strong>Più scena, più gerarchia, meno rumore.</strong>
            <p>Desktop con sidebar vera, contenuto centrale ampio e dock mobile separato.</p>
          </div>
        ) : null}
      </aside>

      <div
        className={`tablet-drawer-backdrop ${tabletNavOpen ? 'is-open' : ''}`}
        aria-hidden={!tabletNavOpen}
        onClick={() => setTabletNavOpen(false)}
      />

      <aside
        className={`tablet-drawer ${tabletNavOpen ? 'is-open' : ''}`}
        aria-label="Navigazione iPad"
        aria-hidden={!tabletNavOpen}
      >
        <div className="tablet-drawer-head">
          <div className="sidebar-brand sidebar-brand-phase2">
            <div className="sidebar-brand-mark">Q</div>
            <div>
              <p>Quadra</p>
              <span>CRM predittivo e vocale</span>
            </div>
          </div>
          <button type="button" className="tablet-drawer-close" onClick={() => setTabletNavOpen(false)} aria-label="Chiudi menu">
            ×
          </button>
        </div>

        <nav className="sidebar-nav tablet-drawer-nav">
          {primaryNav.map((item) => {
            const isActive = active(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="sidebar-link-icon"><NavIcon name={item.icon} /></span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-secondary tablet-drawer-secondary">
          <Link href="/assistant" className={`sidebar-link secondary ${active(pathname, '/assistant') ? 'is-active' : ''}`}>
            <span className="sidebar-link-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.5a6.5 6.5 0 0 0-6.5 6.5v2.2c0 .9-.3 1.8-.9 2.5l-1 1.2c-.7.9-.1 2.3 1.1 2.3h14.6c1.2 0 1.8-1.4 1.1-2.3l-1-1.2c-.6-.7-.9-1.6-.9-2.5V10A6.5 6.5 0 0 0 12 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <path d="M9.5 19a2.5 2.5 0 0 0 5 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <span>Assistente AI</span>
          </Link>
          <Link href="/settings" className={`sidebar-link secondary ${active(pathname, '/settings') ? 'is-active' : ''}`}>
            <span className="sidebar-link-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.5 2.75a1.5 1.5 0 0 1 3 0v1.34a7.5 7.5 0 0 1 1.93.8l.95-.95a1.5 1.5 0 0 1 2.12 2.12l-.95.95c.35.6.63 1.25.8 1.93h1.34a1.5 1.5 0 0 1 0 3h-1.34a7.5 7.5 0 0 1-.8 1.93l.95.95a1.5 1.5 0 1 1-2.12 2.12l-.95-.95a7.5 7.5 0 0 1-1.93.8v1.34a1.5 1.5 0 0 1-3 0v-1.34a7.5 7.5 0 0 1-1.93-.8l-.95.95a1.5 1.5 0 1 1-2.12-2.12l.95-.95a7.5 7.5 0 0 1-.8-1.93H2.75a1.5 1.5 0 0 1 0-3h1.34a7.5 7.5 0 0 1 .8-1.93l-.95-.95a1.5 1.5 0 1 1 2.12-2.12l.95.95c.6-.35 1.25-.63 1.93-.8V2.75Z" fill="currentColor" />
              </svg>
            </span>
            <span>Strumenti</span>
          </Link>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar app-topbar-phase2">
          <div className="app-topbar-leading">
            <button
              type="button"
              className="app-topbar-menu"
              onClick={() => setTabletNavOpen(true)}
              aria-label="Apri menu"
              aria-expanded={tabletNavOpen}
            >
              <MenuIcon />
            </button>
            <div>
              <div className="app-topbar-kicker">Quadra workspace</div>
              <div className="app-topbar-title">{currentTitle(pathname)}</div>
            </div>
          </div>

          <div className="topbar-voice-slot topbar-voice-slot-desktop">
            <VoiceControlBar compact />
          </div>

          <div className="app-topbar-actions app-topbar-actions-desktop">
            {!active(pathname, '/assistant') ? <Link href="/assistant" className="ghost-button">Assistente AI</Link> : null}
            {!isSettingsPage ? <Link href="/settings" className="ghost-button">Strumenti</Link> : null}
            <LogoutButton />
          </div>

          <div className="app-topbar-actions app-topbar-actions-tablet">
            {!active(pathname, '/assistant') ? <Link href="/assistant" className="ghost-button">Assistente AI</Link> : null}
            {!isSettingsPage ? <Link href="/settings" className="ghost-button ghost-button-subtle">Strumenti</Link> : null}
            <LogoutButton />
          </div>

          <div className="app-topbar-actions app-topbar-actions-mobile">
            {!active(pathname, '/assistant') ? <Link href="/assistant" className="ghost-button ghost-button-subtle" aria-label="Apri Assistente AI">AI</Link> : null}
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
              <span className="mobile-nav-label">{item.tinyLabel}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
