import { NextResponse } from 'next/server'
import { processVoiceFollowup } from '@/lib/shortcut/siri-flow'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import { buildEntityHref, toAbsoluteAppUrl } from '@/lib/shortcut/quadra-shortcuts'

function getBestOpenUrl(links: { companyId: string | null; contactId: string | null; opportunityId: string | null }) {
  if (links.contactId) return toAbsoluteAppUrl(buildEntityHref('contact', links.contactId))
  if (links.companyId) return toAbsoluteAppUrl(buildEntityHref('company', links.companyId))
  if (links.opportunityId) return toAbsoluteAppUrl(buildEntityHref('opportunity', links.opportunityId))
  return toAbsoluteAppUrl('/capture/siri')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const authorizedShortcut = verifyShortcutToken(request, body?.shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized shortcut request' },
        { status: 401 },
      )
    }

    const note = String(body?.note || '').trim()
    if (!note) {
      return NextResponse.json(
        { ok: false, error: 'Missing note' },
        { status: 400 },
      )
    }

    const result = await processVoiceFollowup(note)
    const openUrl = getBestOpenUrl(result.links)
    const followupsUrl = toAbsoluteAppUrl('/followups')

    if (result.canAutoCreate) {
      const dueText = result.reminder.dueDateISO ? `per ${result.reminder.dueDateISO}` : 'con data da controllare'
      return NextResponse.json({
        ok: true,
        status: 'created',
        followUpCreated: true,
        needsConfirmation: false,
        createdFollowupId: result.createdFollowupId,
        parsed: result.parsed,
        reminderTitle: result.reminder.title,
        reminderDate: result.reminder.dueDateISO,
        reminderNotes: result.reminder.notes,
        spokenResponse: `Fatto. Ho creato il follow-up ${dueText} in Quadra.`,
        links: result.links,
        openUrl,
        followupsUrl,
      })
    }

    return NextResponse.json({
      ok: true,
      status: 'ambiguous',
      followUpCreated: false,
      needsConfirmation: true,
      question: result.question || 'Mi serve una conferma rapida prima di salvare.',
      parsed: result.parsed,
      reminderTitle: result.reminder.title,
      reminderDate: result.reminder.dueDateISO,
      reminderNotes: result.reminder.notes,
      links: result.links,
      matches: {
        contact: result.matches.contact
          ? {
              id: result.matches.contact.match.id,
              label: result.matches.contact.match.name,
              ambiguous: result.matches.contact.ambiguous,
            }
          : null,
        opportunity: result.matches.opportunity
          ? {
              id: result.matches.opportunity.match.id,
              label: result.matches.opportunity.match.name,
              ambiguous: result.matches.opportunity.ambiguous,
            }
          : null,
        company: result.matches.company
          ? {
              id: result.matches.company.match.id,
              label: result.matches.company.match.name,
              ambiguous: result.matches.company.ambiguous,
            }
          : null,
      },
      contactOptions: result.options.contacts,
      opportunityOptions: result.options.opportunities,
      companyOptions: result.options.companies,
      spokenResponse: result.question || 'Ho capito il promemoria ma mi serve una conferma rapida in Quadra.',
      openUrl: toAbsoluteAppUrl('/capture/siri'),
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
