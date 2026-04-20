import { AnalysisDashboard } from '@/components/analysis/analysis-dashboard'
import { getAnalysisData } from '@/lib/analysis/queries'

export default async function AnalysisPage() {
  const data = await getAnalysisData()

  return (
    <div className="page-wrap">
      <AnalysisDashboard data={data} />
    </div>
  )
}
