import { NextResponse } from 'next/server'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import {
  buildEntityHref,
  createShortcutActivity,
  createShortcutFollowup,
  findOrCreateEmailSenderEntities,
  inferCallOutcome,
  toAbsoluteAppUrl,
  type ShortcutPriority,
} from '@/lib/shortcut/quadra-shortcuts'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authorizedShortcut = verifyShortcutToken(request, body?.shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const fromEmail = String(body?.fromEmail || body?.email || '').trim()
    const fromName = String(body?.fromName || body?.senderName || '').trim() || null
    const subject = String(body?.subject || 'Email ricevuta').trim()
    const snippet = String(body?.snippet || body?.summary || '').trim()
    const content = String(body?.body || body?.content || snippet || subject).trim()
    const receivedAt = String(body?.receivedAt || '').trim() || new Date().toISOString()
    const createCompanyIfMissing = typeof body?.createCompanyIfMissing === 'boolean' ? Boolean(body.createCompanyIfMissing) : true
    const createContactIfMissing = typeof body?.createContactIfMissing === 'boolean' ? Boolean(body.createContactIfMissing) : true
    const createFollowup = typeof body?.createFollowup === 'boolean' ? Boolean(body.createFollowup) : false

    if (!fromEmail) {
      return NextResponse.json({ ok: false, error: 'Missing fromEmail' }, { status: 400 })
    }

    const provision = await findOrCreateEmailSenderEntities({
      fromEmail,
      fromName,
      createCompanyIfMissing,
      createContactIfMissing,
    })

    const entityType = provision.contactId ? 'contact' : provision.companyId ? 'company' : null
    const entityId = provision.contactId || provision.companyId || null
    if (!entityType || !entityId) {
      return NextResponse.json({ ok: false, error: 'Unable to link email to company or contact' }, { status: 422 })
    }

    const activityId = await createShortcutActivity({
      entityType,
      entityId,
      kind: 'email',
      subject,
      content: snippet ? `${subject}\n\n${snippet}\n\n${content}`.trim() : content,
      happenedAt: receivedAt,
    })

    const inference = inferCallOutcome(`${subject} ${snippet} ${content}`)
    const followupDate = String(body?.followupDate || inference.suggestedFollowupDate || '').trim()
    const followupTitle = String(body?.followupTitle || 'Seguire email').trim()
    const priority = String(body?.priority || inference.suggestedPriority || 'medium').trim() as ShortcutPriority
    let createdFollowupId: string | null = null
    if (createFollowup && followupDate) {
      createdFollowupId = await createShortcutFollowup({
        entityType,
        entityId,
        title: followupTitle,
        description: snippet || content,
        dueDate: followupDate,
        priority,
      })
    }

    const openPath = buildEntityHref(entityType, entityId)
    const spokenBits = [
      provision.createdCompany ? `Ho creato anche l'azienda ${provision.companyName}.` : null,
      provision.createdContact ? `Ho creato il contatto ${provision.contactName}.` : null,
      'Ho registrato l’email in Quadra.',
      createdFollowupId ? 'Ho creato anche il follow-up collegato.' : null,
    ].filter(Boolean)

    return NextResponse.json({
      ok: true,
      entityType,
      entityId,
      companyId: provision.companyId,
      companyName: provision.companyName,
      contactId: provision.contactId,
      contactName: provision.contactName,
      normalizedEmail: provision.email,
      domain: provision.domain,
      createdCompany: provision.createdCompany,
      createdContact: provision.createdContact,
      activityId,
      createdFollowupId,
      followUpCreated: Boolean(createdFollowupId),
      inference,
      openUrl: toAbsoluteAppUrl(openPath),
      spokenResponse: spokenBits.join(' '),
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
