import { NextResponse } from 'next/server'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import { getTodayShortcutAgenda } from '@/lib/shortcut/quadra-shortcuts'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const authorizedShortcut = verifyShortcutToken(request, body?.shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const agenda = await getTodayShortcutAgenda()
    return NextResponse.json({ ok: true, ...agenda, spokenResponse: agenda.spokenSummary })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
