'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LogoutButton } from '@/components/auth/logout-button'
import { navItems, secondaryNav, getPageDescription, NavIcon } from '@/components/shell/nav-config'
import { VoiceControlBar } from '@/components/voice-control-bar'

export function ShellDesktop({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="shell-desktop shell-redesign">
      <aside className="app-sidebar quadra-sidebar redesign-sidebar">
        <div className="sidebar-brand-phase2 redesign-brand">
          <div className="sidebar-brand-mark">Q</div>
          <div>
            <p>Quadra</p>
            <span>Apple Pro CRM</span>
          </div>
        </div>

        <nav className="sidebar-nav redesign-nav">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link redesign-sidebar-link ${active ? 'is-active' : ''}`}>
                <NavIcon name={item.icon} className="sidebar-nav-icon" />
                <span className="sidebar-link-label">{item.shortLabel ?? item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="quadra-sidebar-note redesign-note">
          <div className="quadra-sidebar-note-label">Simply is better</div>
          <strong>Meno dashboard, più decisioni.</strong>
          <p>Ogni schermata deve aiutarti a capire cosa fare adesso.</p>
        </div>
      </aside>

      <div className="app-main redesign-main">
        <header className="app-topbar app-topbar-phase2 redesign-topbar">
          <div className="app-topbar-leading redesign-leading">
            <div className="app-topbar-copy redesign-copy">
              <div className="app-topbar-kicker">Quadra workspace</div>
              <h1 className="app-topbar-title">{pathname === '/' ? 'Home' : (navItems.find((i) => pathname === i.href || (i.href !== '/' && pathname.startsWith(i.href)))?.label ?? 'Quadra')}</h1>
              <p className="app-topbar-subtitle">{getPageDescription(pathname)}</p>
            </div>
          </div>

          <div className="topbar-voice-slot redesign-voice-slot">
            <VoiceControlBar />
          </div>

          <div className="app-topbar-actions redesign-actions">
            {secondaryNav.map((item) => (
              <Link key={item.href} href={item.href} className="quadra-pill-button ghost">
                {item.shortLabel ?? item.label}
              </Link>
            ))}
            <LogoutButton className="quadra-pill-button" />
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
