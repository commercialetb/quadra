import type { ImportSheetPreview } from '@/types/import'

export function PreviewTable({ sheet }: { sheet: ImportSheetPreview }) {
  return (
    <div className="import-preview">
      <div className="import-preview-head">
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Anteprima righe</h3>
          <p className="entity-subtitle" style={{ marginTop: 6 }}>Controlla le prime righe del foglio selezionato.</p>
        </div>
        <span className="pill">{sheet.name}</span>
      </div>
      <div className="import-table-wrap">
        <table className="import-table">
          <thead>
            <tr>
              {sheet.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, index) => (
              <tr key={index}>
                {sheet.columns.map((column) => (
                  <td key={column}>{String(row[column] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
