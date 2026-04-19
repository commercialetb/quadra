'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'
import { VoiceControlBar } from '@/components/voice-control-bar'
import { getCurrentSubtitle, getCurrentTitle, isActive, MenuIcon, NavIcon, primaryNav } from './nav-config'

export function ShellTablet({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const title = getCurrentTitle(pathname)
  const subtitle = getCurrentSubtitle(pathname)

  return (
    <div className="quadra-shell quadra-shell-tablet">
      <div className="quadra-ambient quadra-ambient-a" aria-hidden="true" />
      <div className="quadra-ambient quadra-ambient-b" aria-hidden="true" />

      <header className="quadra-topbar quadra-topbar-tablet quadra-tablet-topbar-card">
        <div className="quadra-tablet-topbar-row">
          <button type="button" className="quadra-menu-button" onClick={() => setMenuOpen(true)} aria-label="Apri menu">
            {MenuIcon()}
          </button>
          <div className="quadra-topbar-copy quadra-tablet-topbar-copy">
            <span className="quadra-kicker">QUADRA WORKSPACE</span>
            <h1>{title}</h1>
            <p className="quadra-tablet-topbar-subtitle">{subtitle}</p>
          </div>
          <div className="quadra-topbar-actions quadra-tablet-topbar-actions">
            <Link href="/assistant" className="quadra-pill-button primary">Assistente AI</Link>
            <Link href="/settings" className="quadra-pill-button ghost">Strumenti</Link>
            <LogoutButton className="quadra-pill-button ghost" />
          </div>
        </div>

        <div className="quadra-tablet-topbar-secondary">
          <div className="quadra-tablet-quickstrip" aria-label="Azioni rapide tablet">
            <Link href="/dashboard" className="quadra-mini-chip">Panoramica</Link>
            <Link href="/capture/voice" className="quadra-mini-chip">Voce</Link>
            <Link href="/followups" className="quadra-mini-chip">Agenda</Link>
          </div>
          <section className="quadra-inline-voice quadra-inline-voice-tablet"><VoiceControlBar compact /></section>
        </div>
      </header>

      <main className="quadra-main-content">{children}</main>

      <div className={`quadra-drawer-backdrop ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`quadra-drawer ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="quadra-brand-card">
          <div className="quadra-brand-mark">Q</div>
          <div>
            <p>Quadra</p>
            <span>Workspace vocale</span>
          </div>
        </div>
        <nav className="quadra-sidebar-nav">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link key={item.href} href={item.href} className={`quadra-sidebar-link ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={() => setMenuOpen(false)}>
                <span className="quadra-sidebar-link-icon"><NavIcon name={item.icon} /></span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}
