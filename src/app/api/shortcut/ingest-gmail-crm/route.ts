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

function normalizeLabels(input: unknown) {
  if (Array.isArray(input)) {
    return input.map((item) => String(item || '').trim()).filter(Boolean)
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return [] as string[]
}

function hasCrmLabel(labels: string[]) {
  return labels.some((label) => label.trim().toLowerCase() === 'crm')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authorizedShortcut = verifyShortcutToken(request, body?.shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const gmailLabels = normalizeLabels(body?.gmailLabels || body?.labels || body?.labelNames)
    const requiredLabel = String(body?.requiredLabel || 'CRM').trim()
    if (!hasCrmLabel(gmailLabels) && requiredLabel.toLowerCase() === 'crm') {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: 'missing_crm_label',
        gmailLabels,
        spokenResponse: 'Email ignorata: non ha l’etichetta CRM.',
      })
    }

    const fromEmail = String(body?.fromEmail || body?.email || '').trim()
    const fromName = String(body?.fromName || body?.senderName || '').trim() || null
    const subject = String(body?.subject || 'Email Gmail CRM').trim()
    const snippet = String(body?.snippet || body?.summary || '').trim()
    const content = String(body?.body || body?.content || snippet || subject).trim()
    const threadId = String(body?.threadId || '').trim() || null
    const messageId = String(body?.messageId || '').trim() || null
    const receivedAt = String(body?.receivedAt || body?.internalDate || '').trim() || new Date().toISOString()
    const createCompanyIfMissing = typeof body?.createCompanyIfMissing === 'boolean' ? Boolean(body.createCompanyIfMissing) : true
    const createContactIfMissing = typeof body?.createContactIfMissing === 'boolean' ? Boolean(body.createContactIfMissing) : true
    const createFollowup = typeof body?.createFollowup === 'boolean' ? Boolean(body.createFollowup) : true

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
      return NextResponse.json({ ok: false, error: 'Unable to link Gmail thread to company or contact' }, { status: 422 })
    }

    const inference = inferCallOutcome(`${subject} ${snippet} ${content}`)
    const activityBody = [
      `Gmail labels: ${gmailLabels.join(', ') || 'CRM'}`,
      threadId ? `Thread ID: ${threadId}` : null,
      messageId ? `Message ID: ${messageId}` : null,
      snippet || null,
      content,
    ].filter(Boolean).join('\n\n')

    const activityId = await createShortcutActivity({
      entityType,
      entityId,
      kind: 'email',
      subject,
      content: activityBody,
      happenedAt: receivedAt,
    })

    const followupDate = String(body?.followupDate || inference.suggestedFollowupDate || '').trim()
    const followupTitle = String(body?.followupTitle || 'Seguire email CRM').trim()
    const priority = String(body?.priority || inference.suggestedPriority || 'medium').trim() as ShortcutPriority
    let createdFollowupId: string | null = null
    if (createFollowup && followupDate && inference.shouldCreateFollowup) {
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
      'Ho letto la mail Gmail con etichetta CRM.',
      provision.createdCompany ? `Ho creato anche l'azienda ${provision.companyName}.` : null,
      provision.createdContact ? `Ho creato il contatto ${provision.contactName}.` : null,
      'Ho registrato l’email in Quadra.',
      createdFollowupId ? 'Ho creato anche il follow-up collegato.' : null,
    ].filter(Boolean)

    return NextResponse.json({
      ok: true,
      gmailLabels,
      requiredLabel,
      threadId,
      messageId,
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
