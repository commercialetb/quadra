import type {
  ImportColumnMapping,
  ImportEntityType,
  ImportPreviewResult,
  ImportSheetPreview,
  ImportValidationIssue,
  ImportWorkbookAnalysis,
} from '@/types/import'
import { IMPORT_TARGET_FIELDS } from '@/lib/import/field-catalog'

const TYPE_KEYWORDS: Record<Exclude<ImportEntityType, 'unknown'>, string[]> = {
  companies: ['company', 'azienda', 'societa', 'ragione sociale', 'industry', 'settore'],
  contacts: ['first name', 'last name', 'contact', 'email', 'telefono', 'mobile phone'],
  opportunities: ['opportunity', 'deal', 'pipeline', 'stage', 'value', 'expected close'],
  followups: ['followup', 'follow-up', 'due date', 'priority', 'reminder'],
}

const FIELD_SYNONYMS: Record<string, string[]> = {
  name: ['name', 'company', 'azienda', 'nome azienda', 'ragione sociale'],
  website: ['website', 'url', 'site', 'sito web'],
  address_line1: ['address', 'indirizzo'],
  industry: ['industry', 'settore'],
  status: ['status', 'stato'],
  first_name: ['first name', 'nome'],
  last_name: ['last name', 'cognome'],
  role: ['title', 'role', 'ruolo'],
  email: ['email', 'mail'],
  phone: ['phone', 'telefono'],
  mobile_phone: ['mobile phone', 'cellulare'],
  company_name: ['company', 'azienda', 'societa'],
  title: ['title', 'opportunity', 'deal', 'oggetto'],
  stage: ['stage', 'fase'],
  value_estimate: ['value', 'amount', 'importo', 'valore'],
  due_at: ['due at', 'due date', 'date', 'scadenza'],
  priority: ['priority', 'priorita'],
  description: ['description', 'descrizione', 'notes', 'note'],
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function detectSheetType(columns: string[]): ImportEntityType {
  const normalized = columns.map(normalize)
  let bestType: ImportEntityType = 'unknown'
  let bestScore = 0

  ;(Object.keys(TYPE_KEYWORDS) as Array<Exclude<ImportEntityType, 'unknown'>>).forEach((type) => {
    const score = TYPE_KEYWORDS[type].reduce((acc, keyword) => {
      return acc + (normalized.some((column) => column.includes(keyword)) ? 1 : 0)
    }, 0)

    if (score > bestScore) {
      bestScore = score
      bestType = type
    }
  })

  return bestScore > 0 ? bestType : 'unknown'
}

export function suggestMappings(entityType: ImportEntityType, columns: string[]): ImportColumnMapping[] {
  const allowedFields = IMPORT_TARGET_FIELDS[entityType] ?? []

  return columns.map((column) => {
    const normalizedColumn = normalize(column)
    let targetField: string | null = null
    let confidence = 0

    for (const field of allowedFields) {
      const synonyms = FIELD_SYNONYMS[field] ?? []
      const matched = synonyms.find((synonym) => normalizedColumn.includes(normalize(synonym)))
      if (matched) {
        targetField = field
        confidence = Math.max(confidence, matched.length / Math.max(normalizedColumn.length, 1))
      }
    }

    return {
      sourceColumn: column,
      targetField,
      confidence,
    }
  })
}

export function buildWorkbookAnalysis(fileName: string, sheets: Array<{ name: string; columns: string[]; rows: Record<string, unknown>[] }>): ImportWorkbookAnalysis {
  return {
    fileName,
    sheetCount: sheets.length,
    sheets: sheets.map((sheet) => {
      const suggestedType = detectSheetType(sheet.columns)
      return {
        name: sheet.name,
        rowCount: sheet.rows.length,
        columns: sheet.columns,
        rows: sheet.rows.slice(0, 8) as Record<string, string | number | null>[],
        suggestedType,
        mappings: suggestMappings(suggestedType, sheet.columns),
      }
    }),
  }
}

export function createPreviewResult(sheet: ImportSheetPreview): ImportPreviewResult {
  const issues: ImportValidationIssue[] = []

  const mappedRows = sheet.rows.map((row, index) => {
    const out: Record<string, unknown> = {}

    for (const mapping of sheet.mappings) {
      if (!mapping.targetField) continue
      out[mapping.targetField] = row[mapping.sourceColumn] ?? null
    }

    if (sheet.suggestedType === 'companies' && !out.name) {
      issues.push({
        level: 'error',
        message: 'Company name mancante',
        rowIndex: index,
      })
    }

    if (sheet.suggestedType === 'contacts' && !out.first_name && !out.last_name) {
      issues.push({
        level: 'warning',
        message: 'Contatto senza nome/cognome riconosciuto',
        rowIndex: index,
      })
    }

    return out
  })

  return {
    entityType: sheet.suggestedType,
    mappedRows,
    issues,
  }
}
