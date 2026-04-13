import { PageHeader } from '@/components/page-header'
import { ImportWorkflow } from '@/components/import/import-workflow'

export default function ImportPage() {
  return (
    <div className="page-wrap">
      <PageHeader
        title="Import dati"
        subtitle="Carica il file, controlla il tipo di entità, sistema il mapping e conferma il salvataggio reale nel CRM."
        eyebrow="CRM core"
      />
      <ImportWorkflow />
    </div>
  )
}
