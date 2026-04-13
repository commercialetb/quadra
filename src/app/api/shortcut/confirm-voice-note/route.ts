import { NextResponse } from 'next/server'
import { confirmVoiceFollowup } from '@/lib/shortcut/siri-flow'
import { verifyShortcutToken } from '@/lib/shortcut/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!verifyShortcutToken(request, body?.shortcutToken)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const note = String(body?.note || '').trim()
    const parsed = body?.parsed

    if (!note || !parsed) {
      return NextResponse.json({ ok: false, error: 'Missing note or parsed payload' }, { status: 400 })
    }

    const result = await confirmVoiceFollowup({
      note,
      parsed,
      selectedContactId: body?.selectedContactId ? String(body.selectedContactId) : null,
      selectedOpportunityId: body?.selectedOpportunityId ? String(body.selectedOpportunityId) : null,
      selectedCompanyId: body?.selectedCompanyId ? String(body.selectedCompanyId) : null,
    })

    return NextResponse.json({ ok: true, status: 'created', ...result })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
