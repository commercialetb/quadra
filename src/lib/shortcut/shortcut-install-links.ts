import type { ShortcutActionKey } from './shortcut-manifest'

export type ShortcutInstallLink = {
  key: ShortcutActionKey
  icloudUrl: string | null
}

function readShortcutLink(envName: string): string | null {
  const value = process.env[envName]?.trim()
  if (!value) return null
  return value
}

export function getShortcutInstallLinks(): ShortcutInstallLink[] {
  return [
    { key: 'create_followup', icloudUrl: readShortcutLink('NEXT_PUBLIC_SHORTCUT_LINK_CREATE_FOLLOWUP') },
    { key: 'search_record', icloudUrl: readShortcutLink('NEXT_PUBLIC_SHORTCUT_LINK_SEARCH_RECORD') },
    { key: 'today_agenda', icloudUrl: readShortcutLink('NEXT_PUBLIC_SHORTCUT_LINK_TODAY_AGENDA') },
    { key: 'add_note', icloudUrl: readShortcutLink('NEXT_PUBLIC_SHORTCUT_LINK_ADD_NOTE') },
    { key: 'log_call_outcome', icloudUrl: readShortcutLink('NEXT_PUBLIC_SHORTCUT_LINK_LOG_CALL_OUTCOME') },
    { key: 'log_interaction', icloudUrl: readShortcutLink('NEXT_PUBLIC_SHORTCUT_LINK_LOG_INTERACTION') },
    { key: 'ingest_email', icloudUrl: readShortcutLink('NEXT_PUBLIC_SHORTCUT_LINK_INGEST_EMAIL') },
    { key: 'ingest_gmail_crm', icloudUrl: readShortcutLink('NEXT_PUBLIC_SHORTCUT_LINK_INGEST_GMAIL_CRM') },
    { key: 'sync_gmail_crm', icloudUrl: readShortcutLink('NEXT_PUBLIC_SHORTCUT_LINK_SYNC_GMAIL_CRM') },
  ]
}
