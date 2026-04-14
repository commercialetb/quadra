import { NextResponse } from 'next/server'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import { listShortcutReviewItems } from '@/lib/shortcut/quadra-shortcuts'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const shortcutToken = url.searchParams.get('shortcutToken') || ''
    const authorizedShortcut = verifyShortcutToken(request, shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const items = await listShortcutReviewItems(25)
    return NextResponse.json({ ok: true, count: items.length, items })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
