'use client'

function domainFromWebsite(website?: string | null) {
  if (!website) return null
  try {
    const normalized = website.startsWith('http') ? website : `https://${website}`
    const url = new URL(normalized)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join('')
}

export function CompanyAvatar({
  name,
  website,
  size = 'md',
}: {
  name: string
  website?: string | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const domain = domainFromWebsite(website)
  const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : null

  return (
    <div className={`company-avatar company-avatar-${size}`} aria-hidden="true">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" onError={(event) => {
          const target = event.currentTarget
          target.style.display = 'none'
          const fallback = target.nextElementSibling as HTMLElement | null
          if (fallback) fallback.style.display = 'grid'
        }} />
      ) : null}
      <span style={{ display: logoUrl ? 'none' : 'grid' }}>{initialsFromName(name)}</span>
    </div>
  )
}
