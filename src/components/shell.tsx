'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'

type ShellProps = {
  children: ReactNode
}

const desktopNav = [
  { href: '/dashboard', label: 'Dashboard', short: '01' },
  { href: '/companies', label: 'Aziende', short: '02' },
  { href: '/contacts', label: 'Contatti', short: '03' },
  { href: '/opportunities', label: 'Opportunita', short: '04' },
  { href: '/followups', label: 'Follow-up', short: '05' },
  { href: '/import', label: 'Import', short: '06' },
]

const mobileNav = [
  { href: '/dashboard', label: 'Home' },
  { href: '/companies', label: 'Aziende' },
  { href: '/contacts', label: 'Contatti' },
  { href: '/opportunities', label: 'Deal' },
  { href: '/followups', label: 'Task' },
]

export default function Shell({ children }: ShellProps) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-inner">
          <div className="brand-block">
            <Link href="/dashboard" className="brand-link">
              <div className="brand-mark">Q</div>
              <div>
                <p className="brand-title">Quadra</p>
                <p className="brand-subtitle">CRM operativo</p>
              </div>
            </Link>
          </div>

          <nav className="sidebar-nav" aria-label="Navigazione principale">
            {desktopNav.map((item) => {
              const active =
                pathname === item.href || pathname?.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${active ? 'is-active' : ''}`}
                >
                  <span className="sidebar-link-index">{item.short}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">A</div>
              <div>
                <p className="sidebar-user-name">Account</p>
                <p className="sidebar-user-meta">Sessione attiva</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <p className="topbar-kicker">Quadra</p>
            <h1 className="topbar-title">
              {pathname === '/dashboard' && 'Dashboard'}
              {pathname === '/companies' && 'Aziende'}
              {pathname === '/contacts' && 'Contatti'}
              {pathname === '/opportunities' && 'Opportunita'}
              {pathname === '/followups' && 'Follow-up'}
              {pathname === '/import' && 'Import'}
              {![
                '/dashboard',
                '/companies',
                '/contacts',
                '/opportunities',
                '/followups',
                '/import',
              ].includes(pathname || '') && 'Quadra'}
            </h1>
          </div>

          <div className="topbar-actions">
            <Link href="/companies" className="primary-button">
              + Nuovo
            </Link>
          </div>
        </header>

        <main className="page-content">{children}</main>

        <nav className="mobile-tabbar" aria-label="Navigazione mobile">
          {mobileNav.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-tab ${active ? 'is-active' : ''}`}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
