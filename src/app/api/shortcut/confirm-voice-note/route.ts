import { NextResponse } from 'next/server'
import { confirmVoiceFollowup } from '@/lib/shortcut/siri-flow'
import { verifyShortcutToken } from '@/lib/shortcut/auth'
import { buildEntityHref, toAbsoluteAppUrl } from '@/lib/shortcut/quadra-shortcuts'

function getBestOpenUrl(links: { companyId: string | null; contactId: string | null; opportunityId: string | null }) {
  if (links.contactId) return toAbsoluteAppUrl(buildEntityHref('contact', links.contactId))
  if (links.companyId) return toAbsoluteAppUrl(buildEntityHref('company', links.companyId))
  if (links.opportunityId) return toAbsoluteAppUrl(buildEntityHref('opportunity', links.opportunityId))
  return toAbsoluteAppUrl('/followups')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!verifyShortcutToken(request, body?.shortcutToken)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const note = String(body?.note || body?.originalNote || '').trim()
    const parsed = body?.parsed

    if (!note || !parsed) {
      return NextResponse.json(
        { ok: false, error: 'Missing note or parsed payload' },
        { status: 400 },
      )
    }

    const result = await confirmVoiceFollowup({
      note,
      parsed,
      selectedContactId: body?.selectedContactId
        ? String(body.selectedContactId)
        : body?.contactId
          ? String(body.contactId)
          : null,
      selectedOpportunityId: body?.selectedOpportunityId
        ? String(body.selectedOpportunityId)
        : body?.opportunityId
          ? String(body.opportunityId)
          : null,
      selectedCompanyId: body?.selectedCompanyId
        ? String(body.selectedCompanyId)
        : body?.companyId
          ? String(body.companyId)
          : null,
    })

    return NextResponse.json({
      ok: true,
      status: 'created',
      followUpCreated: true,
      needsConfirmation: false,
      createdFollowupId: result.createdFollowupId,
      reminderTitle: result.reminder.title,
      reminderDate: result.reminder.dueDateISO,
      reminderNotes: result.reminder.notes,
      spokenResponse: result.spokenResponse,
      links: result.links,
      openUrl: getBestOpenUrl(result.links),
      followupsUrl: toAbsoluteAppUrl('/followups'),
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
