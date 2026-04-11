function formatCurrency(value: number) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function KpiGrid({
  kpis,
}: {
  kpis: {
    openCount: number;
    overdueCount: number;
    todayCount: number;
    pipelineValue: number;
    wonCount: number;
  };
}) {
  const items = [
    { label: 'Opportunità aperte', value: kpis.openCount },
    { label: 'Follow-up scaduti', value: kpis.overdueCount },
    { label: 'Follow-up di oggi', value: kpis.todayCount },
    { label: 'Valore pipeline', value: formatCurrency(kpis.pipelineValue) },
    { label: 'Trattative vinte', value: kpis.wonCount },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">{item.label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
