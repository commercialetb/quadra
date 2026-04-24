import type { ComponentPropsWithoutRef } from 'react'

export type NavItem = {
  href: string
  label: string
  shortLabel?: string
  description?: string
  icon?: 'home' | 'companies' | 'contacts' | 'opportunities' | 'followups' | 'analysis' | 'assistant' | 'settings'
}

export const primaryNav: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    shortLabel: 'Home',
    description: "Capisci cosa fare, con chi, quando e perché in un colpo d'occhio.",
    icon: 'home',
  },
  {
    href: '/companies',
    label: 'Aziende',
    shortLabel: 'Aziende',
    description: 'Apri subito gli account da seguire e il loro prossimo passo.',
    icon: 'companies',
  },
  {
    href: '/contacts',
    label: 'Contatti',
    shortLabel: 'Contatti',
    description: 'Vedi chi sentire, tramite quale canale e in quale contesto.',
    icon: 'contacts',
  },
  {
    href: '/opportunities',
    label: 'Opportunità',
    shortLabel: 'Deal',
    description: 'Segui fase, valore e next action senza disperdere la pipeline.',
    icon: 'opportunities',
  },
  {
    href: '/followups',
    label: 'Follow-up',
    shortLabel: 'Agenda',
    description: 'Chiudi attività, scadenze e promemoria operativi di oggi.',
    icon: 'followups',
  },
]

export const secondaryNav: NavItem[] = [
  {
    href: '/analysis',
    label: 'Insight',
    shortLabel: 'Insight',
    description: 'Leggi segnali e trend solo quando servono per agire meglio.',
    icon: 'analysis',
  },
  {
    href: '/assistant',
    label: 'Assistente AI',
    shortLabel: 'Assistente',
    description: 'Fai domande al CRM, genera brief e prepara messaggi.',
    icon: 'assistant',
  },
  {
    href: '/settings',
    label: 'Strumenti',
    shortLabel: 'Strumenti',
    description: 'Configura import, export, shortcut e impostazioni di Quadra.',
    icon: 'settings',
  },
]

export const navItems: NavItem[] = [...primaryNav, ...secondaryNav]

function normalizePathname(pathname: string) {
  if (!pathname) return '/'
  if (pathname === '/') return pathname
  return pathname.replace(/\/$/, '')
}

export function isActive(pathname: string, href: string) {
  const normalized = normalizePathname(pathname)
  if (href === '/') return normalized === '/'
  return normalized === href || normalized.startsWith(`${href}/`)
}

export function getActiveNavItem(pathname: string) {
  return navItems.find((item) => isActive(pathname, item.href)) ?? navItems[0]
}

export function getCurrentTitle(pathname: string) {
  return getActiveNavItem(pathname).label
}

export function getPageTitle(pathname: string) {
  return getCurrentTitle(pathname)
}

export function getCurrentSubtitle(pathname: string) {
  return (
    getActiveNavItem(pathname).description ??
    'Lavora su clienti, opportunità e follow-up in un unico spazio operativo.'
  )
}

export function getPageDescription(pathname: string) {
  return getCurrentSubtitle(pathname)
}

export function NavIcon({
  name,
  className = '',
  ...props
}: {
  name?: NavItem['icon']
} & ComponentPropsWithoutRef<'span'>) {
  const iconMap: Record<string, string> = {
    home: '⌂',
    companies: '▣',
    contacts: '◉',
    opportunities: '◇',
    followups: '✓',
    analysis: '▤',
    assistant: '✦',
    settings: '⚙',
  }

  return (
    <span
      aria-hidden="true"
      className={className}
      {...props}
    >
      {iconMap[name ?? 'home']}
    </span>
  )
}
