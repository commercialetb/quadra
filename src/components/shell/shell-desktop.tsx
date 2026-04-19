'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LogoutButton } from '@/components/auth/logout-button'
import { navItems, getPageDescription } from '@/components/shell/nav-config'
import { VoiceControlBar } from '@/components/voice-control-bar'

type ShellDesktopProps = {
  children: React.ReactNode
}

export function ShellDesktop({ children }: ShellDesktopProps) {
  const pathname = usePathname()
  const isSettingsPage = pathname.startsWith('/settings')

  return (
    <div className="shell-desktop">
      <aside className="app-sidebar quadra-sidebar">
        <div className="sidebar-brand-phase2">
          <div className="sidebar-brand-mark">Q</div>
          <p>Quadra</p>
          <span>Workspace vocale</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                <span className="sidebar-link-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {!isSettingsPage ? (
          <div className="quadra-sidebar-note">
            <div className="quadra-sidebar-note-label">Quadra OS</div>
            <strong>Più scena, più gerarchia, meno rumore.</strong>
            <p>Dashboard, AI e shortcut nello stesso flusso operativo.</p>
          </div>
        ) : null}
      </aside>

      <div className="app-main">
        <header className="app-topbar app-topbar-phase2">
          <div className="app-topbar-leading">
            <div className="app-topbar-copy">
              <div className="app-topbar-kicker">Quadra</div>
              <h1 className="app-topbar-title">Workspace</h1>
              <p className="app-topbar-subtitle">{getPageDescription(pathname)}</p>
            </div>
          </div>

          <div className="topbar-voice-slot">
            <VoiceControlBar />
          </div>

          <div className="app-topbar-actions">
            <Link href="/assistant" className="quadra-pill-button">
              Assistente AI
            </Link>
            <Link href="/settings" className="quadra-pill-button">
              Strumenti
            </Link>
            <LogoutButton className="quadra-pill-button" />
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
