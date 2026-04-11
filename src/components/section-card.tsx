import { ReactNode } from 'react';

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{title}</h2>
          {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: 20,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 22,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#6b7280',
  },
};
