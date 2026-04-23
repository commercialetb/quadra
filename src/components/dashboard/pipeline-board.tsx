import { SectionCard } from '@/components/section-card'

const labels: Record<string, string> = {
  new_lead: 'Nuovi lead',
  contacted: 'Contattati',
  qualified: 'Qualificati',
  proposal: 'Proposta',
  negotiation: 'Trattativa',
  won: 'Vinte',
  lost: 'Perse',
}

export function PipelineBoard({ pipelineCounts }: { pipelineCounts: Record<string, number> }) {
  return (
    <SectionCard title="Pipeline" subtitle="Distribuzione opportunità per fase, letta come un colpo d'occhio operativo.">
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {Object.entries(labels).map(([key, label]) => (
          <div key={key} className="page-card" style={{ padding: 16, background: 'rgba(255,255,255,0.62)' }}>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value" style={{ marginTop: 10, fontSize: 32 }}>{pipelineCounts[key] ?? 0}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
