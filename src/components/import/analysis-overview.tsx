import type { ImportWorkbookAnalysis } from '@/types/import'

type AnalysisOverviewProps = {
  analysis: ImportWorkbookAnalysis
  selectedSheetIndex: number
  onSelectSheet: (index: number) => void
}

export function AnalysisOverview({ analysis, selectedSheetIndex, onSelectSheet }: AnalysisOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {analysis.sheets.map((sheet, index) => {
        const selected = selectedSheetIndex === index
        return (
          <button
            key={sheet.name}
            type="button"
            onClick={() => onSelectSheet(index)}
            className={`rounded-3xl border p-5 text-left shadow-sm transition ${selected ? 'border-slate-950 bg-slate-950 text-white' : 'border-black/5 bg-white text-slate-950'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{sheet.name}</h3>
                <p className={`mt-1 text-sm ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {sheet.rowCount} righe • {sheet.columns.length} colonne
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${selected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {sheet.suggestedType}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {sheet.columns.slice(0, 6).map((column) => (
                <span key={column} className={`rounded-full border px-2.5 py-1 text-xs ${selected ? 'border-white/15 text-slate-200' : 'border-slate-200 text-slate-600'}`}>
                  {column}
                </span>
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
