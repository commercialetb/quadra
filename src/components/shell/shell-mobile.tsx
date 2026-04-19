'use client'

import Link from 'next/link'
import { LogoutButton } from '@/components/auth/logout-button'
import { VoiceControlBar } from '@/components/voice-control-bar'
import { getCurrentSubtitle, getCurrentTitle, isActive, NavIcon, primaryNav } from './nav-config'

export function ShellMobile({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const title = getCurrentTitle(pathname)
  const subtitle = getCurrentSubtitle(pathname)
  const isDashboard = pathname.startsWith('/dashboard')

  return (
    <div className="quadra-shell quadra-shell-mobile">
      <div className="quadra-ambient quadra-ambient-a" aria-hidden="true" />
      <div className="quadra-ambient quadra-ambient-b" aria-hidden="true" />

      <header className="quadra-topbar quadra-topbar-mobile quadra-mobile-topbar-card">
        <div className="quadra-mobile-topbar-main">
          <div className="quadra-topbar-copy mobile-only quadra-mobile-topbar-copy">
            <span className="quadra-kicker">QUADRA MOBILE</span>
            <h1>{title}</h1>
            <p className="quadra-mobile-topbar-subtitle">{subtitle}</p>
          </div>
          <div className="quadra-mobile-topbar-actions">
            <Link href="/assistant" className="quadra-pill-button primary">AI</Link>
            <Link href="/settings" className="quadra-pill-button ghost">Strumenti</Link>
            <LogoutButton className="quadra-pill-button ghost quadra-pill-button-icon" />
          </div>
        </div>

        <div className="quadra-mobile-quickstrip" aria-label="Azioni rapide">
          <Link href="/capture/voice" className="quadra-mini-chip">Detta</Link>
          <Link href="/followups" className="quadra-mini-chip">Oggi</Link>
          <Link href="/opportunities" className="quadra-mini-chip">Pipeline</Link>
        </div>

        {isDashboard ? (
          <div className="quadra-mobile-topbar-voice">
            <VoiceControlBar compact />
          </div>
        ) : null}
      </header>

      <main className="quadra-main-content quadra-main-content-mobile">{children}</main>

      <nav className="quadra-bottom-nav" aria-label="Navigazione principale mobile">
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link key={item.href} href={item.href} className={`quadra-bottom-nav-link ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
              <span className="quadra-bottom-nav-icon"><NavIcon name={item.icon} /></span>
              <span>{item.tinyLabel}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
