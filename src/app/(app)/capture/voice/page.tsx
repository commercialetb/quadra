import { createFollowup } from '@/app/(app)/actions'
import { VoiceCaptureWorkspace } from '@/components/shortcut/voice-capture-workspace'

export default async function ShortcutVoicePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const note = typeof params.note === 'string' ? params.note : typeof params.text === 'string' ? params.text : ''
  const title = typeof params.title === 'string' ? params.title : ''
  const description = typeof params.description === 'string' ? params.description : ''
  const priority = typeof params.priority === 'string' ? params.priority : 'medium'

  return (
    <VoiceCaptureWorkspace
      createFollowupAction={createFollowup}
      initialNote={note}
      initialTitle={title}
      initialDescription={description}
      initialPriority={priority}
    />
  )
}
