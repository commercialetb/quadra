import Link from 'next/link'
import type { DashboardData } from './shared/dashboard-types'
import { CompanyList, ContactList, DashboardAiCard, DashboardSection, DashboardWelcomePanel, FollowupList, OpportunityList, formatCurrency } from './shared/dashboard-sections'

export function DashboardTablet({ data }: { data: DashboardData }) {
  return (
    <div className="quadra-dashboard quadra-dashboard-tablet concept-tablet">
      <div className="quadra-dashboard-tablet-hero">
        <DashboardWelcomePanel data={data} />
        <DashboardSection title="Contatti recenti" meta="Tocca e riprendi la relazione." action={<Link href="/contacts" className="quadra-pill-button ghost">Contatti</Link>}>
          <ContactList items={(data.recentContacts || []).slice(0, 4)} emptyText="Nessun contatto recente." />
        </DashboardSection>
      </div>
      <div className="quadra-dashboard-split tablet">
        <DashboardSection title="Daily focus" meta="Azioni da chiudere oggi.">
          <FollowupList items={(data.todayFollowups || []).slice(0, 4)} emptyText="Nessuna azione urgente per oggi." />
        </DashboardSection>
        <DashboardSection title="Deal da sbloccare" meta="Opportunità ferme da riattivare.">
          <OpportunityList items={(data.staleOpportunities || []).slice(0, 4)} emptyText="Nessuna opportunità bloccata." />
        </DashboardSection>
      </div>
      <DashboardAiCard />
      <div className="quadra-dashboard-split tablet tablet-rail">
        <DashboardSection title="Aziende recenti" meta="Nuovi account inseriti." action={<Link href="/companies" className="quadra-pill-button ghost">Aziende</Link>}>
          <CompanyList items={(data.recentCompanies || []).slice(0, 4)} emptyText="Nessuna azienda recente." />
        </DashboardSection>
        <DashboardSection title="Pipeline rapida" meta="Vista sintetica del CRM in movimento.">
          <div className="quadra-dashboard-mini-kpis">
            <div><span>Pipeline</span><strong>{formatCurrency(data.kpis.pipelineValue || 0)}</strong></div>
            <div><span>Follow-up</span><strong>{data.kpis.todayCount || 0}</strong></div>
            <div><span>Overdue</span><strong>{data.kpis.overdueCount || 0}</strong></div>
          </div>
        </DashboardSection>
      </div>
    </div>
  )
}
