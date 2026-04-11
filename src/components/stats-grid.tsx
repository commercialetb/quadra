export function StatsGrid({
  stats,
}: {
  stats: { label: string; value: string | number }[];
}) {
  return (
    <div style={styles.grid}>
      {stats.map((stat) => (
        <div key={stat.label} style={styles.card}>
          <div style={styles.value}>{stat.value}</div>
          <div style={styles.label}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 18,
    padding: 20,
  },
  value: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: '-0.04em',
  },
  label: {
    marginTop: 8,
    color: '#6b7280',
  },
};
