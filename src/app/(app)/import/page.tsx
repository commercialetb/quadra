import { AnalysisOverview } from '@/components/import/analysis-overview'
import { ImportShell } from '@/components/import/import-shell'
import { MappingEditor } from '@/components/import/mapping-editor'
import { PreviewTable } from '@/components/import/preview-table'
import { UploadDropzone } from '@/components/import/upload-dropzone'
import { buildWorkbookAnalysis } from '@/lib/import/analyze'

const demoAnalysis = buildWorkbookAnalysis('Copia di CRM.xlsx', [
  {
    name: 'Companies',
    columns: ['ID', 'Name', 'URL', 'Address', 'Tipologia', 'Settore'],
    rows: [
      { ID: '1', Name: 'Edilnova', URL: 'https://edilnova.it', Address: 'Milano', Tipologia: 'Cliente', Settore: 'Edilizia' },
      { ID: '2', Name: 'ArchiLab', URL: 'https://archilab.it', Address: 'Roma', Tipologia: 'Partner', Settore: 'Architettura' },
    ],
  },
  {
    name: 'Contacts',
    columns: ['ID', 'First Name', 'Last Name', 'Email', 'Mobile Phone', 'Company'],
    rows: [
      { ID: '11', 'First Name': 'Mario', 'Last Name': 'Rossi', Email: 'mario@edilnova.it', 'Mobile Phone': '3331234567', Company: 'Edilnova' },
      { ID: '12', 'First Name': 'Laura', 'Last Name': 'Bianchi', Email: 'laura@archilab.it', 'Mobile Phone': '3337654321', Company: 'ArchiLab' },
    ],
  },
])

export default function ImportPage() {
  const selectedSheet = demoAnalysis.sheets[0]

  return (
    <ImportShell>
      <UploadDropzone />
      <AnalysisOverview analysis={demoAnalysis} />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PreviewTable sheet={selectedSheet} />
        <MappingEditor sheet={selectedSheet} />
      </div>
    </ImportShell>
  )
}
