export type ImportEntityType =
  | 'companies'
  | 'contacts'
  | 'opportunities'
  | 'followups'
  | 'unknown'

export type ImportColumnMapping = {
  sourceColumn: string
  targetField: string | null
  confidence?: number
}

export type ImportSheetPreview = {
  name: string
  rowCount: number
  columns: string[]
  rows: Record<string, string | number | null>[]
  suggestedType: ImportEntityType
  mappings: ImportColumnMapping[]
}

export type ImportWorkbookAnalysis = {
  fileName: string
  sheetCount: number
  sheets: ImportSheetPreview[]
}

export type ImportValidationIssue = {
  level: 'info' | 'warning' | 'error'
  message: string
  rowIndex?: number
  column?: string
}

export type ImportPreviewResult = {
  entityType: ImportEntityType
  mappedRows: Record<string, unknown>[]
  issues: ImportValidationIssue[]
}
