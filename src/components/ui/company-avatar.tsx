function cleanWebsite(value?: string | null) {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://${value}`
}

function initialsFromName(name?: string | null) {
  if (!name) return 'Q'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'Q'
}

export function CompanyAvatar({ name, website, size = 'md' }: { name?: string | null; website?: string | null; size?: 'sm' | 'md' }) {
  const srcWebsite = cleanWebsite(website)
  const favicon = srcWebsite ? `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(srcWebsite)}` : ''
  const classes = size === 'sm' ? 'company-avatar company-avatar-sm' : 'company-avatar'

  return (
    <div className={classes} aria-hidden="true">
      {favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={favicon} alt="" onError={(e) => { ;(e.currentTarget as HTMLImageElement).style.display = 'none' }} />
      ) : null}
      <span>{initialsFromName(name)}</span>
    </div>
  )
}
