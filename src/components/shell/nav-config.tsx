import type { ReactNode } from 'react'

export type NavItem = {
  href: string
  label: string
  shortLabel: string
  tinyLabel: string
  icon: 'home' | 'building' | 'person' | 'sparkles' | 'check'
}

export const primaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home', tinyLabel: 'Home', icon: 'home' },
  { href: '/companies', label: 'Aziende', shortLabel: 'Az.', tinyLabel: 'Az', icon: 'building' },
  { href: '/contacts', label: 'Contatti', shortLabel: 'Cont.', tinyLabel: 'Cont', icon: 'person' },
  { href: '/opportunities', label: 'Opportunita', shortLabel: 'Opp.', tinyLabel: 'Opp', icon: 'sparkles' },
  { href: '/followups', label: 'Follow-up', shortLabel: 'Task', tinyLabel: 'Task', icon: 'check' },
]

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getCurrentTitle(pathname: string) {
  if (pathname.startsWith('/companies')) return 'Aziende'
  if (pathname.startsWith('/contacts')) return 'Contatti'
  if (pathname.startsWith('/opportunities')) return 'Opportunita'
  if (pathname.startsWith('/followups')) return 'Follow-up'
  if (pathname.startsWith('/import')) return 'Import dati'
  if (pathname.startsWith('/assistant')) return 'Assistente AI'
  if (pathname.startsWith('/capture/voice')) return 'Detta in Quadra'
  if (pathname.startsWith('/capture/siri/review')) return 'Review shortcut'
  if (pathname.startsWith('/capture/siri')) return 'Shortcut iPhone'
  if (pathname.startsWith('/capture/followup')) return 'Shortcut follow-up'
  if (pathname.startsWith('/settings')) return 'Strumenti'
  return 'Dashboard'
}

export function NavIcon({ name }: { name: NavItem['icon'] }) {
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11.5 12 5l8 6.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 10.5V19h9v-8.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'building':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 19V7.5c0-.8.4-1.4 1.1-1.7l5-2.2c.7-.3 1.4-.3 2.1 0l5 2.2c.7.3 1.1 1 1.1 1.7V19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 11h.01M15 11h.01M9 14.5h.01M15 14.5h.01M12 19v-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'person':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 4 1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7L12 4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m18.5 4 .5 1.5L20.5 6 19 6.5 18.5 8 18 6.5 16.5 6l1.5-.5.5-1.5ZM18.5 14l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'check':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4.5" y="5" width="15" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="m8.5 12 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

export function MenuIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}


export function getCurrentSubtitle(pathname: string) {
  if (pathname.startsWith('/companies')) return 'Account, schede azienda e ultimi movimenti.'
  if (pathname.startsWith('/contacts')) return 'Relazioni, ruoli e prossimi passi.'
  if (pathname.startsWith('/opportunities')) return 'Pipeline, valore e trattative da spingere.'
  if (pathname.startsWith('/followups')) return 'Agenda operativa, scadenze e task prioritari.'
  if (pathname.startsWith('/import')) return 'Import guidato con mapping e controllo qualità.'
  if (pathname.startsWith('/assistant')) return 'Insight rapidi, query CRM e next action.'
  if (pathname.startsWith('/capture/voice')) return 'Detta note e follow-up in modo naturale.'
  if (pathname.startsWith('/capture/siri')) return 'Shortcut rapidi per cattura e revisione.'
  if (pathname.startsWith('/settings')) return 'Strumenti, scorciatoie e setup prodotto.'
  return "Priorità, pipeline e attività di oggi in un colpo d'occhio."
}
