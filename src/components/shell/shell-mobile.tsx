'use client'

import Link from 'next/link'

import { LogoutButton } from '@/components/auth/logout-button'
import { VoiceControlBar } from '@/components/voice-control-bar'
import { getCurrentSubtitle, getCurrentTitle, isActive, NavIcon, primaryNav } from './nav-config'

export function ShellMobile({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const title = getCurrentTitle(pathname)
  const subtitle = getCurrentSubtitle(pathname)
  const showVoice = pathname === '/' || pathname.startsWith('/assistant')

  return (
    <div className="shell-mobile shell-redesign-mobile">
      <header className="shell-mobile-header redesign-mobile-header">
        <div className="shell-mobile-copy">
          <div className="shell-mobile-kicker">Vai</div>
          <h1 className="shell-mobile-title">{title}</h1>
          <p className="shell-mobile-subtitle">{subtitle}</p>
        </div>

        <div className="shell-mobile-actions">
          <Link href="/assistant" className="quadra-pill-button ghost">AI</Link>
          <LogoutButton className="quadra-pill-button" />
        </div>
      </header>

      <div className="mobile-quick-strip">
        <Link href={pathname.startsWith('/followups') ? '/dashboard' : '/followups'} className="mobile-quick-chip">
          {pathname.startsWith('/followups') ? 'Home' : 'Oggi'}
        </Link>
        <Link href="/assistant" className="mobile-quick-chip">Assistente</Link>
      </div>

      {showVoice ? <div className="shell-mobile-voice redesign-mobile-voice"><VoiceControlBar /></div> : null}

      <main className="shell-mobile-main redesign-mobile-main">{children}</main>

      <nav className="mobile-nav quadra-bottom-nav redesign-bottom-nav">
        {primaryNav.map((item) => (
          <Link key={item.href} href={item.href} className={`mobile-nav-link ${isActive(pathname, item.href) ? 'is-active' : ''}`}>
            <NavIcon name={item.icon} className="mobile-nav-icon" />
            <span>{item.shortLabel ?? item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
