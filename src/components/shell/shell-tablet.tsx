'use client'

import Link from 'next/link'

import { LogoutButton } from '@/components/auth/logout-button'
import { VoiceControlBar } from '@/components/voice-control-bar'
import { getCurrentSubtitle, getCurrentTitle, isActive, NavIcon, primaryNav, secondaryNav } from './nav-config'

export function ShellTablet({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const title = getCurrentTitle(pathname)
  const subtitle = getCurrentSubtitle(pathname)

  return (
    <div className="shell-tablet shell-redesign-tablet shell-v4-tablet">
      <header className="shell-tablet-header redesign-tablet-header redesign-tablet-header-v4">
        <div className="shell-tablet-copy">
          <div className="shell-tablet-kicker">Quadra</div>
          <h1 className="shell-tablet-title">{title}</h1>
          <p className="shell-tablet-subtitle">{subtitle}</p>
        </div>

        <div className="shell-tablet-actions">
          <Link href="/analysis" className="quadra-pill-button ghost">Insight</Link>
          <Link href="/assistant" className="quadra-pill-button ghost">Assistente</Link>
          <LogoutButton className="quadra-pill-button" />
        </div>
      </header>

      <div className="shell-tablet-voice redesign-tablet-voice redesign-tablet-voice-v4">
        <div className="tablet-focus-chip">
          <span>Focus</span>
          <strong>{title}</strong>
        </div>
        <VoiceControlBar />
      </div>

      <nav className="shell-tablet-nav redesign-tablet-nav redesign-tablet-nav-v4">
        {primaryNav.map((item) => (
          <Link key={item.href} href={item.href} className={`shell-tablet-nav-link ${isActive(pathname, item.href) ? 'is-active' : ''}`}>
            <NavIcon name={item.icon} className="shell-tablet-nav-icon" />
            <span>{item.shortLabel ?? item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="tablet-secondary-links">
        {secondaryNav.map((item) => (
          <Link key={item.href} href={item.href} className={`tablet-secondary-link ${isActive(pathname, item.href) ? 'is-active' : ''}`}>
            <NavIcon name={item.icon} className="shell-tablet-nav-icon" />
            <span>{item.shortLabel ?? item.label}</span>
          </Link>
        ))}
      </div>

      <main className="shell-tablet-main redesign-tablet-main">{children}</main>
    </div>
  )
}
