function initialsFromContact(first?: string | null, last?: string | null) {
  const raw = `${first ?? ''} ${last ?? ''}`.trim()
  if (!raw) return 'C'
  return raw
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C'
}

export function ContactAvatar({ firstName, lastName }: { firstName?: string | null; lastName?: string | null }) {
  return <div className="contact-avatar" aria-hidden="true"><span>{initialsFromContact(firstName, lastName)}</span></div>
}
