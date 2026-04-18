'use client'

import Link from 'next/link'
import { LogoutButton } from '@/components/auth/logout-button'
import { VoiceControlBar } from '@/components/voice-control-bar'
import { getCurrentTitle, isActive, NavIcon, primaryNav } from './nav-config'

export function ShellDesktop({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const title = getCurrentTitle(pathname)
  const isSettingsPage = pathname.startsWith('/settings')

  return (
    <div className="quadra-shell quadra-shell-desktop">
      <div className="quadra-ambient quadra-ambient-a" aria-hidden="true" />
      <div className="quadra-ambient quadra-ambient-b" aria-hidden="true" />

      <aside className="quadra-sidebar" aria-label="Quadra navigation">
        <div className="quadra-brand-card">
          <div className="quadra-brand-mark">Q</div>
          <div>
            <p>Quadra</p>
            <span>Workspace vocale</span>
          </div>
        </div>

        <div className="quadra-voice-promo">
          <span>Voice control</span>
          <strong>Siri, Gemini e GPT dentro la stessa UX.</strong>
        </div>

        <nav className="quadra-sidebar-nav">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link key={item.href} href={item.href} className={`quadra-sidebar-link ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
                <span className="quadra-sidebar-link-icon"><NavIcon name={item.icon} /></span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {!isSettingsPage ? (
          <div className="quadra-sidebar-note">
            <div className="quadra-sidebar-note-label">Quadra OS</div>
            <strong>Più scena, più gerarchia, meno rumore.</strong>
            <p>Desktop con sidebar vera, contenuto centrale ampio e dashboard più ordinata.</p>
          </div>
        ) : null}
      </aside>

      <div className="quadra-main-column">
        <header className="quadra-topbar">
          <div className="quadra-topbar-copy">
            <span className="quadra-kicker">QUADRA WORKSPACE</span>
            <h1>{title}</h1>
          </div>
          <div className="quadra-topbar-voice"><VoiceControlBar compact /></div>
          <div className="quadra-topbar-actions">
            <Link href="/assistant" className="quadra-pill-button">Assistente AI</Link>
            <Link href="/settings" className="quadra-pill-button">Strumenti</Link>
            <LogoutButton className="quadra-pill-button" />
          </div>
        </header>

        <main className="quadra-main-content">{children}</main>
      </div>
    </div>
  )
}
