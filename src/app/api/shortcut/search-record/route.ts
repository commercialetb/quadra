import { NextResponse } from 'next/server'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import { getShortcutContext, resolveShortcutEntity, searchShortcutRecords, toAbsoluteAppUrl } from '@/lib/shortcut/quadra-shortcuts'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authorizedShortcut = verifyShortcutToken(request, body?.shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const query = String(body?.query || '').trim()
    const kind = body?.kind ? String(body.kind).trim() as 'company' | 'contact' | 'opportunity' : undefined
    if (!query) {
      return NextResponse.json({ ok: false, error: 'Missing query' }, { status: 400 })
    }

    const context = await getShortcutContext()
    const results = searchShortcutRecords({
      query,
      companies: context.companies,
      contacts: context.contacts,
      opportunities: context.opportunities,
      kind,
    })
    const resolution = resolveShortcutEntity({
      query,
      companies: context.companies,
      contacts: context.contacts,
      opportunities: context.opportunities,
      kind,
    })

    const topResult = results[0] || null
    const openUrl = resolution.status === 'resolved'
      ? resolution.result.openUrl
      : toAbsoluteAppUrl('/capture/siri')

    const spokenResponse = !results.length
      ? 'Non ho trovato risultati in Quadra.'
      : resolution.status === 'resolved'
        ? `Ho trovato ${resolution.result.title} in Quadra.`
        : `Ho trovato ${results.length} risultati per ${query}. Apri Quadra per scegliere quello giusto.`

    return NextResponse.json({
      ok: true,
      query,
      kind: kind || null,
      count: results.length,
      topResult,
      results,
      resolution: resolution.status,
      openUrl,
      spokenResponse,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
