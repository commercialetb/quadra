import { SiriShortcutWorkspace } from '@/components/shortcut/siri-shortcut-workspace'

export default async function SiriCapturePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const note = typeof params.note === 'string' ? params.note : typeof params.text === 'string' ? params.text : ''

  return <SiriShortcutWorkspace initialNote={note} />
}
