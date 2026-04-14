import { SiriShortcutWorkspace } from '@/components/shortcut/siri-shortcut-workspace'

export default async function CaptureSiriPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const note = typeof params.note === 'string' ? params.note : ''

  return <SiriShortcutWorkspace initialNote={note} />
}
