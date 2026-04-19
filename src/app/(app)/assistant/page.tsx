import { AssistantWorkspace } from '@/components/ai/assistant-workspace'
import { requireUser } from '@/lib/auth'

export default async function AssistantPage() {
  const { user } = await requireUser()
  const userName = String(user.user_metadata?.full_name || user.user_metadata?.name || user.email || '').trim()
  return <AssistantWorkspace userName={userName} />
}
