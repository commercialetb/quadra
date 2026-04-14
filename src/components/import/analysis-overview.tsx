import type { ImportWorkbookAnalysis } from '@/types/import'

type AnalysisOverviewProps = {
  analysis: ImportWorkbookAnalysis
  selectedSheetIndex: number
  onSelectSheet: (index: number) => void
}

export function AnalysisOverview({ analysis, selectedSheetIndex, onSelectSheet }: AnalysisOverviewProps) {
  return (
    <div className="import-sheet-grid">
      {analysis.sheets.map((sheet, index) => {
        const selected = selectedSheetIndex === index
        return (
          <button
            key={sheet.name}
            type="button"
            onClick={() => onSelectSheet(index)}
            className="import-sheet-card"
            data-active={selected}
          >
            <div className="entity-title-row">
              <div>
                <div className="entity-title">{sheet.name}</div>
                <div className="entity-subtitle">{sheet.rowCount} righe · {sheet.columns.length} colonne</div>
              </div>
              <span className="badge badge-dark">{sheet.suggestedType}</span>
            </div>
            <div className="import-chip-row">
              {sheet.columns.slice(0, 6).map((column) => (
                <span key={column} className="import-chip">{column}</span>
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
