export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div style={styles.box}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.body}>{body}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  box: {
    border: '1px dashed #d1d5db',
    borderRadius: 20,
    padding: 24,
    background: '#fafafa',
  },
  title: { margin: 0, fontSize: 20 },
  body: { margin: '8px 0 0', color: '#6b7280', lineHeight: 1.6 },
};
