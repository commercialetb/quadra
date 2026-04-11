export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.subtitle}>{subtitle}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'grid', gap: 8 },
  title: { margin: 0, fontSize: 36, letterSpacing: '-0.04em' },
  subtitle: { margin: 0, color: '#6b7280', lineHeight: 1.6 },
};
