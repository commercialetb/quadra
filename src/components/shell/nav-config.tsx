export type NavItem = {
  href: string
  label: string
  shortLabel?: string
  description?: string
}

export const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    shortLabel: 'Home',
    description: 'Priorità, pipeline e attività di oggi in un colpo d\'occhio.',
  },
  {
    href: '/companies',
    label: 'Aziende',
    shortLabel: 'Aziende',
    description: 'Gestisci account, relazioni e stato dei clienti.',
  },
  {
    href: '/contacts',
    label: 'Contatti',
    shortLabel: 'Contatti',
    description: 'Apri contatti, ruoli e canali principali.',
  },
  {
    href: '/opportunities',
    label: 'Opportunità',
    shortLabel: 'Opportunità',
    description: 'Segui pipeline, valore stimato e prossime azioni.',
  },
  {
    href: '/followups',
    label: 'Follow-up',
    shortLabel: 'Follow-up',
    description: 'Chiudi azioni, promemoria e scadenze operative.',
  },
  {
    href: '/assistant',
    label: 'Assistente AI',
    shortLabel: 'Assistente',
    description: 'Fai domande al CRM, genera brief e prepara messaggi.',
  },
  {
    href: '/settings',
    label: 'Strumenti',
    shortLabel: 'Strumenti',
    description: 'Configura import, export, shortcut e impostazioni di Quadra.',
  },
]

function normalizePathname(pathname: string) {
  if (!pathname) return '/'
  if (pathname === '/') return pathname
  return pathname.replace(/\/$/, '')
}

export function getActiveNavItem(pathname: string) {
  const normalized = normalizePathname(pathname)

  return (
    navItems.find((item) => {
      if (item.href === '/') return normalized === '/'
      return normalized === item.href || normalized.startsWith(`${item.href}/`)
    }) ?? navItems[0]
  )
}

export function getPageTitle(pathname: string) {
  return getActiveNavItem(pathname).label
}

export function getPageDescription(pathname: string) {
  return (
    getActiveNavItem(pathname).description ??
    'Lavora su clienti, opportunità e follow-up in un unico spazio operativo.'
  )
}
