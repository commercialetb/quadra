export function SearchInput({
  value,
  onChange,
  placeholder = 'Cerca...',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="search-shell">
      <span className="search-icon">⌕</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
    </label>
  )
}
