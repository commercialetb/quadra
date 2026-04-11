import type { ImportSheetPreview } from '@/types/import'

export function PreviewTable({ sheet }: { sheet: ImportSheetPreview }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Anteprima righe</h3>
          <p className="mt-1 text-sm text-slate-600">Controlla le prime righe del foglio selezionato.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{sheet.name}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {sheet.columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-100">
                {sheet.columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-slate-700">{String(row[column] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
