import { NextResponse } from 'next/server'
import { processVoiceFollowup } from '@/lib/shortcut/siri-flow'
import { verifyShortcutToken } from '@/lib/shortcut/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!verifyShortcutToken(request, body?.shortcutToken)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const note = String(body?.note || '').trim()

    if (!note) {
      return NextResponse.json({ ok: false, error: 'Missing note' }, { status: 400 })
    }

    const result = await processVoiceFollowup(note)

    if (result.canAutoCreate) {
      return NextResponse.json({
        ok: true,
        status: 'created',
        followUpCreated: true,
        needsConfirmation: false,
        parsed: result.parsed,
        createdFollowupId: result.createdFollowupId,
        reminderTitle: result.reminder.title,
        reminderDate: result.reminder.dueDateISO,
        reminderNotes: result.reminder.notes,
        spokenResponse: `Ho creato il follow-up in Quadra e il promemoria puo essere impostato per ${result.reminder.dueDateISO || 'la data indicata'}.`,
        links: result.links,
      })
    }

    return NextResponse.json({
      ok: true,
      status: 'ambiguous',
      followUpCreated: false,
      needsConfirmation: true,
      question: result.question,
      parsed: result.parsed,
      contactOptions: result.options.contacts,
      opportunityOptions: result.options.opportunities,
      companyOptions: result.options.companies,
      draftReminderTitle: result.reminder.title,
      draftReminderDate: result.reminder.dueDateISO,
      draftReminderNotes: result.reminder.notes,
      links: result.links,
      matches: result.matches,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
