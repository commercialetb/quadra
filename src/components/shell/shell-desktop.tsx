'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LogoutButton } from '@/components/auth/logout-button'
import { navItems, primaryNav, secondaryNav, getPageDescription, NavIcon } from '@/components/shell/nav-config'
import { VoiceControlBar } from '@/components/voice-control-bar'

export function ShellDesktop({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentItem = navItems.find((item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) ?? navItems[0]

  return (
    <div className="shell-desktop shell-redesign shell-v4-desktop">
      <aside className="app-sidebar quadra-sidebar redesign-sidebar redesign-sidebar-v4">
        <div className="sidebar-brand-phase2 redesign-brand">
          <div className="sidebar-brand-mark">Q</div>
          <div>
            <p>Quadra</p>
            <span>Focus first</span>
          </div>
        </div>

        <div className="sidebar-section-label">Vai</div>
        <nav className="sidebar-nav redesign-nav">
          {primaryNav.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link redesign-sidebar-link ${active ? 'is-active' : ''}`}>
                <NavIcon name={item.icon} className="sidebar-nav-icon" />
                <span className="sidebar-link-label">{item.shortLabel ?? item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-section-label compact">Altro</div>
        <nav className="sidebar-nav redesign-nav redesign-nav-secondary">
          {secondaryNav.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link redesign-sidebar-link ${active ? 'is-active' : ''}`}>
                <NavIcon name={item.icon} className="sidebar-nav-icon" />
                <span className="sidebar-link-label">{item.shortLabel ?? item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="quadra-sidebar-note redesign-note redesign-note-v4 apple-quiet-note">
          <div className="quadra-sidebar-note-label">Principio</div>
          <p>Prima decidi. Poi approfondisci.</p>
        </div>
      </aside>

      <div className="app-main redesign-main">
        <header className="app-topbar app-topbar-phase2 redesign-topbar redesign-topbar-v4">
          <div className="app-topbar-leading redesign-leading">
            <div className="app-topbar-copy redesign-copy">
              <div className="app-topbar-kicker">Quadra</div>
              <h1 className="app-topbar-title">{currentItem.label}</h1>
              <p className="app-topbar-subtitle">{getPageDescription(pathname)}</p>
            </div>
            <div className="desktop-now-card">
              <span>Adesso</span>
              <strong>{currentItem.label}</strong>
              <p>{currentItem.description}</p>
            </div>
          </div>

          <div className="topbar-voice-slot redesign-voice-slot">
            <VoiceControlBar />
          </div>

          <div className="app-topbar-actions redesign-actions">
            <Link href="/assistant" className="quadra-pill-button ghost">Assistente</Link>
            <Link href="/analysis" className="quadra-pill-button ghost">Insight</Link>
            <LogoutButton className="quadra-pill-button" />
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
