import { ReactNode } from 'react';

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  const template = `repeat(${columns.length}, minmax(0, 1fr))`;

  return (
    <div style={styles.table}>
      <div style={{ ...styles.headerRow, gridTemplateColumns: template }}>
        {columns.map((column) => (
          <strong key={column}>{column}</strong>
        ))}
      </div>
      {rows.map((row, index) => (
        <div key={index} style={{ ...styles.row, gridTemplateColumns: template }}>
          {row.map((cell, cellIndex) => (
            <div key={cellIndex}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: { display: 'grid' },
  headerRow: {
    padding: '0 0 14px',
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
    display: 'grid',
    gap: 16,
  },
  row: {
    padding: '14px 0',
    borderBottom: '1px solid #f3f4f6',
    display: 'grid',
    gap: 16,
    alignItems: 'center',
  },
};
