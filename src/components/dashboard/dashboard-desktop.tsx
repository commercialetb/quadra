import Link from 'next/link'
import type { DashboardData } from './shared/dashboard-types'
import { CompanyList, ContactList, DashboardAiCard, DashboardHero, DashboardSection, FollowupList, OpportunityList } from './shared/dashboard-sections'

export function DashboardDesktop({ data }: { data: DashboardData }) {
  return (
    <div className="quadra-dashboard quadra-dashboard-desktop">
      <div className="quadra-dashboard-main">
        <DashboardHero data={data} />
        <div className="quadra-dashboard-split">
          <DashboardSection title="Daily focus" meta="Azioni urgenti da chiudere oggi.">
            <FollowupList items={(data.todayFollowups || []).slice(0, 4)} emptyText="Nessuna azione urgente per oggi." />
          </DashboardSection>
          <DashboardSection title="Deal da sbloccare" meta="Opportunità ferme da riattivare.">
            <OpportunityList items={(data.staleOpportunities || []).slice(0, 4)} emptyText="Nessuna opportunità bloccata." />
          </DashboardSection>
        </div>
        <DashboardAiCard />
      </div>

      <aside className="quadra-dashboard-rail">
        <DashboardSection title="Contatti recenti" meta="Tocca e apri la scheda." action={<Link href="/contacts" className="quadra-pill-button ghost">Contatti</Link>}>
          <ContactList items={(data.recentContacts || []).slice(0, 5)} emptyText="Nessun contatto recente." />
        </DashboardSection>
        <DashboardSection title="Aziende recenti" meta="Nuovi account inseriti." action={<Link href="/companies" className="quadra-pill-button ghost">Aziende</Link>}>
          <CompanyList items={(data.recentCompanies || []).slice(0, 5)} emptyText="Nessuna azienda recente." />
        </DashboardSection>
      </aside>
    </div>
  )
}
