import type { ImportWorkbookAnalysis } from '@/types/import'

export function AnalysisOverview({ analysis }: { analysis: ImportWorkbookAnalysis }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {analysis.sheets.map((sheet) => (
        <div key={sheet.name} className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">{sheet.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{sheet.rowCount} righe • {sheet.columns.length} colonne</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {sheet.suggestedType}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {sheet.columns.slice(0, 6).map((column) => (
              <span key={column} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                {column}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
