'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'

type NavItem = {
  href: string
  label: string
  mobileLabel: string
  icon: 'home' | 'agenda' | 'deals' | 'contacts' | 'companies'
}

const primaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Home', mobileLabel: 'Home', icon: 'home' },
  { href: '/followups', label: 'Agenda', mobileLabel: 'Agenda', icon: 'agenda' },
  { href: '/opportunities', label: 'Deals', mobileLabel: 'Deals', icon: 'deals' },
  { href: '/contacts', label: 'Contacts', mobileLabel: 'Contatti', icon: 'contacts' },
  { href: '/companies', label: 'Aziende', mobileLabel: 'Aziende', icon: 'companies' },
]

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function currentTitle(pathname: string) {
  if (pathname.startsWith('/contacts')) return 'Contacts'
  if (pathname.startsWith('/opportunities')) return 'Deals'
  if (pathname.startsWith('/followups')) return 'Agenda'
  if (pathname.startsWith('/companies')) return 'Aziende'
  if (pathname.startsWith('/assistant')) return 'Analytics'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Dashboard'
}

function NavIcon({ name }: { name: NavItem['icon'] }) {
  switch (name) {
    case 'home':
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 10.5V19h9v-8.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'agenda':
      return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="6" width="15" height="13.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8 4.75v2.5M16 4.75v2.5M4.5 10.25h15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
    case 'deals':
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18.5V11m6 7.5V7m6 11.5v-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /><path d="M4.5 18.5h15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
    case 'contacts':
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'companies':
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5h15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M6.5 19.5V8.5h11v11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9.5 6.5h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01M9 14.5h.01M12 14.5h.01M15 14.5h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
  }
}

function VoiceBar() {
  return (
    <div className="voice-bar-shell" aria-label="Voice control bar">
      <div className="voice-bar-pill">
        <span className="voice-mic" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 0 0 3.5-3.5V8a3.5 3.5 0 1 0-7 0v4a3.5 3.5 0 0 0 3.5 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 11.5a5.5 5.5 0 1 0 11 0M12 17v3M9 20h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <span className="voice-wave voice-wave-live" />
        <span className="voice-more" aria-hidden="true">•••</span>
      </div>
    </div>
  )
}

function ModelBadge({ label }: { label: string }) {
  return <span className="brand-badge">{label}</span>
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell quadra-visual-refresh">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <img src="/icons/brand-mark-v21.png" alt="Quadra" className="sidebar-brand-mark sidebar-brand-mark-image" />
          <div>
            <div className="sidebar-brand-title">Quadra</div>
            <div className="sidebar-brand-subtitle">CRM predittiva e vocale</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${active(pathname, item.href) ? 'is-active' : ''}`}>
              <span className="sidebar-link-icon"><NavIcon name={item.icon} /></span>
              <span className="sidebar-link-text">{item.label}</span>
            </Link>
          ))}
          <Link href="/assistant" className={`sidebar-link ${active(pathname, '/assistant') ? 'is-active' : ''}`}>
            <span className="sidebar-link-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7L12 4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <span className="sidebar-link-text">Analytics</span>
          </Link>
          <Link href="/settings" className={`sidebar-link ${active(pathname, '/settings') ? 'is-active' : ''}`}>
            <span className="sidebar-link-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4.8a7.9 7.9 0 0 0-2-.9L14 3h-4l-.5 2.7a7.9 7.9 0 0 0-2 .9l-2.4-.8-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-.8c.6.4 1.3.7 2 .9L10 21h4l.5-2.7c.7-.2 1.4-.5 2-.9l2.4.8 2-3.5-2-1.5c.1-.4.1-.8.1-1.2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <span className="sidebar-link-text">Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer sidebar-footer-refresh">
          <LogoutButton />
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar quadra-topbar">
          <div className="topbar-title-block">
            <div className="app-topbar-title">{currentTitle(pathname)}</div>
          </div>
          <div className="topbar-center"><VoiceBar /></div>
          <div className="app-topbar-actions app-topbar-actions-refresh">
            <ModelBadge label="Siri" />
            <ModelBadge label="Gemini" />
            <ModelBadge label="GPT-4" />
          </div>
        </header>

        <main className="page-shell">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Navigazione primaria">
        {primaryNav.map((item) => {
          const isActive = active(pathname, item.href)
          return (
            <Link key={item.href} href={item.href} className={`mobile-nav-link ${isActive ? 'is-active' : ''}`} aria-current={isActive ? 'page' : undefined}>
              <span className="mobile-nav-icon-wrap"><span className="mobile-nav-icon"><NavIcon name={item.icon} /></span></span>
              <span className="mobile-nav-label">{item.mobileLabel}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
