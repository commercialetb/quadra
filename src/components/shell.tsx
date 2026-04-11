'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { LogoutButton } from './logout-button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', short: 'Home', badge: '01' },
  { href: '/companies', label: 'Aziende', short: 'Aziende', badge: '02' },
  { href: '/contacts', label: 'Contatti', short: 'Contatti', badge: '03' },
  { href: '/opportunities', label: 'Opportunita', short: 'Deal', badge: '04' },
  { href: '/followups', label: 'Follow-up', short: 'Follow-up', badge: '05' },
]

const quickAdd = [
  { href: '/companies#new-company', label: '+ Azienda' },
  { href: '/contacts#new-contact', label: '+ Contatto' },
  { href: '/opportunities#new-opportunity', label: '+ Opportunita' },
]

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">Q</div>
          <div className="brand-title">Quadra</div>
          <p className="brand-copy">CRM personale, chiaro e operativo. Meno attrito, più controllo.</p>
        </div>

        <div className="status-cluster">
          <div className="status-pill status-pill-accent"><span className="status-dot" /> Milestone 3</div>
          <div className="status-pill"><span className="status-dot status-dot-warning" /> Focus + chiarezza</div>
        </div>

        <nav className="nav-stack">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href} prefetch className="nav-link" data-active={active}>
                <span className="nav-pill">{item.badge}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="quick-add-panel">
          <p className="mini-label">Azioni rapide</p>
          <div className="quick-actions quick-actions-column">
            {quickAdd.map((item) => (
              <Link key={item.href} href={item.href} prefetch className="button-secondary button-full">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'grid', gap: 12 }}>
          <div className="status-pill"><span className="status-dot" /> Core CRM online</div>
          <LogoutButton />
        </div>
      </aside>

      <main className="shell-main">
        <div className="mobile-topbar">
          <div>
            <div style={{ fontSize: 13, color: 'var(--soft)', textTransform: 'uppercase', letterSpacing: '.18em', fontWeight: 700 }}>Quadra</div>
            <div style={{ marginTop: 4, fontSize: 24, fontWeight: 700, letterSpacing: '-0.05em' }}>Simply is better</div>
          </div>
          <div className="status-pill status-pill-accent"><span className="status-dot" /> Milestone 3</div>
        </div>

        {children}

        <nav className="mobile-tabbar">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href} prefetch data-active={active}>
                {item.short}
              </Link>
            )
          })}
        </nav>
      </main>
    </div>
  )
}
