import { AssistantWorkspace } from '@/components/ai/assistant-workspace'

type AssistantPageProps = {
  searchParams?: Promise<{ q?: string; autorun?: string }>
}

export default async function AssistantPage({ searchParams }: AssistantPageProps) {
  const params = (await searchParams) ?? {}
  const initialCrmQuestion = typeof params.q === 'string' ? params.q : ''
  const autoRunCrm = params.autorun === '1'

  return <AssistantWorkspace initialCrmQuestion={initialCrmQuestion} autoRunCrm={autoRunCrm} />
}
