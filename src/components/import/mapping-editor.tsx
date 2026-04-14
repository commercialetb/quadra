'use client'

import { IMPORT_TARGET_FIELDS } from '@/lib/import/field-catalog'
import type { ImportColumnMapping, ImportSheetPreview } from '@/types/import'

type MappingEditorProps = {
  sheet: ImportSheetPreview
  mappings: ImportColumnMapping[]
  onChange: (sourceColumn: string, targetField: string | null) => void
}

export function MappingEditor({ sheet, mappings, onChange }: MappingEditorProps) {
  const availableFields = IMPORT_TARGET_FIELDS[sheet.suggestedType] ?? []

  return (
    <div className="import-panel">
      <div className="section-heading">
        <div>
          <h2>Mapping colonne</h2>
          <p>Controlla i suggerimenti automatici e correggi dove serve.</p>
        </div>
      </div>
      <div className="import-mapping-list">
        {mappings.map((mapping) => (
          <div key={mapping.sourceColumn} className="import-mapping-row">
            <div>
              <div className="entity-title" style={{ fontSize: '1rem' }}>{mapping.sourceColumn}</div>
              <div className="entity-subtitle">Colonna origine</div>
            </div>
            <div className="entity-muted" style={{ textAlign: 'center' }}>→</div>
            <div>
              <select
                value={mapping.targetField ?? ''}
                onChange={(event) => onChange(mapping.sourceColumn, event.target.value || null)}
                style={{ borderRadius: 16, height: 46, padding: '0 14px' }}
              >
                <option value="">Ignora colonna</option>
                {availableFields.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
