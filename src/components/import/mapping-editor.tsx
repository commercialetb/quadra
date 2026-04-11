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
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-950">Mapping colonne</h3>
        <p className="mt-1 text-sm text-slate-600">Controlla i suggerimenti automatici prima di procedere.</p>
      </div>
      <div className="grid gap-3">
        {sheet.mappings.map((mapping) => (
          <div key={mapping.sourceColumn} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div>
              <p className="text-sm font-medium text-slate-950">{mapping.sourceColumn}</p>
              <p className="text-xs text-slate-500">colonna origine</p>
            </div>
            <div className="text-center text-slate-400">→</div>
            <div>
              <select
                defaultValue={mapping.targetField ?? ''}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0"
              >
                <option value="">Ignora colonna</option>
                {availableFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Conferma mapping
        </button>
      </div>
    </div>
  )
}
