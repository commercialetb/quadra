'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

type NavItem = {
  href: string
  label: string
  icon: 'home' | 'agenda' | 'deals' | 'contacts' | 'companies'
}

const primaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/followups', label: 'Agenda', icon: 'agenda' },
  { href: '/opportunities', label: 'Deals', icon: 'deals' },
  { href: '/contacts', label: 'Contacts', icon: 'contacts' },
  { href: '/companies', label: 'Aziende', icon: 'companies' },
]

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function currentTitle(pathname: string) {
  if (pathname.startsWith('/contacts')) return 'Contacts'
  if (pathname.startsWith('/opportunities')) return 'Pipeline'
  if (pathname.startsWith('/followups')) return 'Agenda'
  if (pathname.startsWith('/companies')) return 'Aziende'
  if (pathname.startsWith('/assistant')) return 'Analytics'
  if (pathname.startsWith('/settings')) return 'Strumenti'
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

function VoiceCapsule() {
  return (
    <div className="quadra-voice-capsule refined" aria-label="Voice control bar">
      <span className="quadra-voice-mic" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 0 0 3.5-3.5V8a3.5 3.5 0 1 0-7 0v4a3.5 3.5 0 0 0 3.5 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 11.5a5.5 5.5 0 1 0 11 0M12 17v3M9 20h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="quadra-voice-wave compact" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </span>
      <span className="quadra-voice-menu" aria-hidden="true">•••</span>
    </div>
  )
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell quadra-reference-layout quadra-dock-only-layout quadra-no-sidebar-experience">
      <div className="app-main app-main-reference app-main-dock-only app-main-fullwidth">
        <header className="app-topbar quadra-minimal-topbar quadra-device-topbar">
          <div className="quadra-topbar-brand-inline">
            <span className="quadra-reference-mark compact">Q</span>
            <div>
              <div className="app-topbar-title">{currentTitle(pathname)}</div>
              <div className="quadra-reference-subtitle">voice ux con quadra</div>
            </div>
          </div>
          <VoiceCapsule />
        </header>

        <main className="page-shell page-shell-reference page-shell-dock-only">{children}</main>
      </div>

      <nav className="mobile-nav bottom-dock-nav bottom-dock-nav-reference bottom-dock-nav-faithful" aria-label="Navigazione primaria">
        {primaryNav.map((item) => {
          const isActive = active(pathname, item.href)
          return (
            <Link key={item.href} href={item.href} className={`mobile-nav-link ${isActive ? 'is-active' : ''}`} aria-current={isActive ? 'page' : undefined}>
              <span className="mobile-nav-icon-wrap"><span className="mobile-nav-icon"><NavIcon name={item.icon} /></span></span>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
