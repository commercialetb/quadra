import { createClient } from '@/lib/supabase/server'

const SHORTCUT_HEADER_NAMES = ['x-shortcut-token', 'x-quadra-shortcut-token']

function getExpectedToken() {
  return process.env.SHORTCUT_SHARED_TOKEN?.trim() || ''
}

export function verifyShortcutToken(request: Request, bodyToken?: string | null) {
  const expected = getExpectedToken()
  if (!expected) return false

  const headerToken = SHORTCUT_HEADER_NAMES.map((name) => request.headers.get(name)).find(Boolean)?.trim() || ''
  const provided = String(bodyToken || headerToken || '').trim()
  if (!provided) return false

  return provided === expected
}

export async function isAuthenticatedAppRequest() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return Boolean(data.user)
}
