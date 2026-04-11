const labels: Record<string, string> = {
  new_lead: 'Nuovi lead',
  contacted: 'Contattati',
  qualified: 'Qualificati',
  proposal: 'Proposta',
  negotiation: 'Trattativa',
  won: 'Vinte',
  lost: 'Perse',
};

export function PipelineBoard({
  pipelineCounts,
}: {
  pipelineCounts: Record<string, number>;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-neutral-950">Pipeline</h2>
        <p className="mt-1 text-sm text-neutral-500">Distribuzione opportunità per fase.</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {Object.entries(labels).map(([key, label]) => (
          <div key={key} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm text-neutral-500">{label}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
              {pipelineCounts[key] ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
