function getExpectedShortcutToken() {
  return process.env.SHORTCUT_SHARED_TOKEN?.trim() || ''
}

export function verifyShortcutToken(request: Request, bodyToken?: string | null) {
  const expected = getExpectedShortcutToken()
  if (!expected) return true

  const headerToken = request.headers.get('x-shortcut-token')?.trim() || ''
  const candidate = headerToken || String(bodyToken || '').trim()
  return candidate === expected
}
