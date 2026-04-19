'use client'

import Link from 'next/link'

import { LogoutButton } from '@/components/auth/logout-button'
import { VoiceControlBar } from '@/components/voice-control-bar'
import { getCurrentSubtitle, getCurrentTitle, isActive, NavIcon, primaryNav, secondaryNav } from './nav-config'

export function ShellTablet({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const title = getCurrentTitle(pathname)
  const subtitle = getCurrentSubtitle(pathname)

  return (
    <div className="shell-tablet">
      <header className="shell-tablet-header">
        <div className="shell-tablet-copy">
          <div className="shell-tablet-kicker">Quadra</div>
          <h1 className="shell-tablet-title">{title}</h1>
          <p className="shell-tablet-subtitle">{subtitle}</p>
        </div>

        <div className="shell-tablet-actions">
          {secondaryNav.map((item) => (
            <Link key={item.href} href={item.href} className="quadra-pill-button">
              {item.shortLabel ?? item.label}
            </Link>
          ))}
          <LogoutButton className="quadra-pill-button" />
        </div>
      </header>

      <div className="shell-tablet-voice">
        <VoiceControlBar />
      </div>

      <nav className="shell-tablet-nav">
        {primaryNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shell-tablet-nav-link ${isActive(pathname, item.href) ? 'is-active' : ''}`}
          >
            <NavIcon name={item.icon} className="shell-tablet-nav-icon" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <main className="shell-tablet-main">{children}</main>
    </div>
  )
}
