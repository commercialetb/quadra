'use client'

import { IMPORT_TARGET_FIELDS } from '@/lib/import/field-catalog'
import type { ImportSheetPreview } from '@/types/import'

type MappingEditorProps = {
  sheet: ImportSheetPreview
  onConfirm: () => void
}

export function MappingEditor({ sheet, onConfirm }: MappingEditorProps) {
  const availableFields = IMPORT_TARGET_FIELDS[sheet.suggestedType] ?? []

  return (
    <div className="import-panel">
      <div className="section-heading">
        <div>
          <h2>Mapping colonne</h2>
          <p>Controlla i suggerimenti automatici prima di procedere.</p>
        </div>
      </div>
      <div className="import-mapping-list">
        {sheet.mappings.map((mapping) => (
          <div key={mapping.sourceColumn} className="import-mapping-row">
            <div>
              <div className="entity-title" style={{ fontSize: '1rem' }}>{mapping.sourceColumn}</div>
              <div className="entity-subtitle">Colonna origine</div>
            </div>
            <div className="entity-muted" style={{ textAlign: 'center' }}>→</div>
            <div>
              <select defaultValue={mapping.targetField ?? ''} style={{ borderRadius: 16, height: 46, padding: '0 14px' }}>
                <option value="">Ignora colonna</option>
                {availableFields.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="import-actions">
        <button type="button" onClick={onConfirm} className="button-primary">Conferma mapping</button>
      </div>
    </div>
  )
}
