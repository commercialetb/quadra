'use client'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cerca rapidamente…',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="search-input-wrap" aria-label={placeholder}>
      <span>⌕</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  )
}
