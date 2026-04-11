import { ImportShell } from '@/components/import/import-shell'
import { ImportWorkflow } from '@/components/import/import-workflow'

export default function ImportPage() {
  return (
    <ImportShell>
      <ImportWorkflow />
    </ImportShell>
  )
}
