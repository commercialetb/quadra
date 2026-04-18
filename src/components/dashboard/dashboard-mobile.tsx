import { VoiceControlBar } from '@/components/voice-control-bar'
import type { DashboardData } from './shared/dashboard-types'
import { DashboardAiCard, DashboardSection, DashboardWelcomePanel, FollowupList, OpportunityList } from './shared/dashboard-sections'

export function DashboardMobile({ data }: { data: DashboardData }) {
  return (
    <div className="quadra-dashboard quadra-dashboard-mobile concept-mobile">
      <DashboardWelcomePanel data={data} mobile />
      <section className="quadra-dashboard-mobile-voice">
        <VoiceControlBar compact />
      </section>
      <DashboardSection title="Daily focus" meta="Solo ciò che serve davvero oggi.">
        <FollowupList items={(data.todayFollowups || []).slice(0, 3)} emptyText="Nessuna azione urgente per oggi." />
      </DashboardSection>
      <DashboardSection title="Deal da sbloccare" meta="Opportunità sopra la linea di galleggiamento.">
        <OpportunityList items={(data.staleOpportunities || []).slice(0, 3)} emptyText="Nessuna opportunita bloccata." />
      </DashboardSection>
      <DashboardAiCard mobile />
    </div>
  )
}
