import { notFound } from 'next/navigation'
import { CompanyEditCard } from '@/components/detail/company-edit-card'
import { DetailShell } from '@/components/detail/detail-shell'
import { EntityListCard } from '@/components/detail/entity-list-card'
import { TimelineCard } from '@/components/detail/timeline-card'
import { getCompanyDetail, getTimelineForEntity } from '@/lib/detail-queries'
import { getCompanyAnalysis } from '@/lib/analysis/queries'
import { CompanyAnalysisCard } from '@/components/analysis/company-analysis-card'
import { AnalysisImportCard } from '@/components/analysis/analysis-import-card'
import { CreateFollowupButton } from '@/components/analysis/create-followup-button'
import { formatCurrency, formatDate } from '@/lib/format'

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { company, contacts, opportunities, notes } = await getCompanyDetail(id)
  const [timeline, analysis] = await Promise.all([
    getTimelineForEntity({ companyId: id }),
    getCompanyAnalysis(id),
  ])

  if (!company) notFound()

  const topAction = analysis?.actionPlan?.[0] ?? null
  const mainContact = contacts[0] ?? null
  const recentNote = notes[0] ?? null
  const activeFollowup = analysis?.activeFollowups?.[0] ?? null
  const opportunityCount = analysis?.companyRow?.opportunities ?? opportunities.length
  const lastOrderDate = analysis?.companyRow?.lastOrderDate ?? null
  const priorityScore = analysis?.companyRow?.priorityScore ?? null
  const priorityBand = analysis?.companyRow?.priorityBand ?? null
  const signal = analysis?.companyRow?.signal ?? 'low'
  const whyText = analysis?.companyRow?.insight || topAction?.detail || 'Serve tenere la relazione viva e proteggere la pipeline aperta.'
  const whenText = activeFollowup?.due_at ? formatDate(activeFollowup.due_at) : 'Da pianificare'
  const contactMeta = [mainContact?.role, mainContact?.email].filter(Boolean).join(' · ')

  return (
    <DetailShell title={company.name} subtitle={company.legal_name} backHref="/companies" backLabel="Aziende" eyebrow="Account">
      <section className="panel-card company-decision-board company-v7-hero company-v8-hero">
        <div className="company-decision-board-head">
          <div>
            <p className="page-eyebrow">Account</p>
            <h2>La prossima mossa</h2>
            <p className="page-subtitle compact">Una sola risposta sopra la piega: cosa fare, con chi, quando e perché.</p>
          </div>
          {topAction ? (
            <CreateFollowupButton
              companyId={company.id}
              title={topAction.title}
              description={topAction.detail}
              priority={topAction.priority}
              defaultDueInDays={topAction.priority === 'urgent' ? 1 : topAction.priority === 'high' ? 2 : 7}
              compact
              createLabel="Metti in agenda"
            />
          ) : null}
        </div>

        <div className="company-decision-board-grid company-v7-focus-grid">
          <article className="panel-card company-decision-focus-card company-v7-focus-card">
            <span className="company-focus-label">Cosa fare</span>
            <strong>{topAction?.title || 'Presidia questo account'}</strong>
            <p>{topAction?.detail || 'Non c’è un’urgenza dominante: aggiorna la scheda e porta avanti il prossimo passo utile.'}</p>
          </article>

          <div className="company-decision-metrics company-v7-metrics">
            <article className="panel-card company-decision-metric">
              <span>Referente</span>
              <strong>{mainContact?.full_name || 'Nessun referente'}</strong>
              <small>{contactMeta || 'Aggiungi un contatto principale'}</small>
            </article>
            <article className="panel-card company-decision-metric">
              <span>Quando</span>
              <strong>{whenText}</strong>
              <small>{activeFollowup?.title || 'Nessuna azione pianificata'}</small>
            </article>
            <article className="panel-card company-decision-metric">
              <span>Motivo</span>
              <strong>{signal === 'high' ? 'Segnale alto' : signal === 'medium' ? 'Segnale medio' : 'Presidio base'}</strong>
              <small>{whyText}</small>
            </article>
          </div>
        </div>
      </section>

      <section className="panel-card company-v7-scoreboard company-v8-scoreboard">
        <div className="dashboard-redesign-head compact">
          <h3>Essenziali</h3>
          <div className="entity-inline-meta wrap align-end">
            {priorityScore !== null ? (
              <span className={`dashboard-pill-badge ${priorityBand === 'alta' ? 'danger' : priorityBand === 'media' ? 'warning' : ''}`}>
                priorità {priorityScore}/100
              </span>
            ) : null}
            <span className="dashboard-pill-badge">{company.status || 'lead'}</span>
          </div>
        </div>
        <div className="company-essentials-grid company-v7-essentials-grid">
          <div className="company-essential-item"><span>Opportunità aperte</span><strong>{opportunityCount}</strong></div>
          <div className="company-essential-item"><span>Ultimo ordine</span><strong>{lastOrderDate ? formatDate(lastOrderDate) : 'Nessun dato'}</strong></div>
          <div className="company-essential-item"><span>Settore</span><strong>{company.industry || 'Non indicato'}</strong></div>
          <div className="company-essential-item"><span>Sito</span><strong>{company.website ? <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a> : '—'}</strong></div>
          <div className="company-essential-item wide"><span>Nota rapida</span><strong>{recentNote?.title || company.notes_summary || 'Nessuna nota rapida'}</strong></div>
        </div>
      </section>

      <div className="company-page-redesign-grid company-page-simplified-grid company-v7-grid company-v8-grid">
        <div className="stack-lg company-detail-main-col">
          <details className="panel-card detail-collapse-card" open>
            <summary>Da fare</summary>
            <div className="stack-lg detail-inner-stack">
              <EntityListCard
                title="Referente coinvolgere"
                empty="Nessun contatto collegato."
                ctaLabel="+ Aggiungi contatto"
                ctaHref="/contacts"
                items={contacts.map((contact) => ({
                  id: contact.id,
                  label: contact.full_name,
                  meta: [contact.role, contact.email].filter(Boolean).join(' · '),
                  href: `/contacts/${contact.id}`,
                }))}
              />

              <EntityListCard
                title="Cosa è aperto"
                empty="Nessuna opportunità aperta."
                ctaLabel="+ Aggiungi opportunità"
                ctaHref="/opportunities"
                items={opportunities.map((opportunity) => ({
                  id: opportunity.id,
                  label: opportunity.title,
                  meta: [opportunity.stage, opportunity.value_estimate ? `€ ${Number(opportunity.value_estimate).toLocaleString('it-IT')}` : null]
                    .filter(Boolean)
                    .join(' · '),
                  href: `/opportunities/${opportunity.id}`,
                }))}
              />

              <EntityListCard
                title="Note"
                empty="Nessuna nota collegata."
                items={notes.map((note) => ({ id: note.id, label: note.title || 'Nota', meta: note.body }))}
              />
            </div>
          </details>
        </div>

        <aside className="stack-lg company-detail-side-col">
          <details className="redesigned-details company-insight-details">
            <summary>Apri insight</summary>
            <div className="company-detail-drawer-body-v21">
              <CompanyAnalysisCard data={analysis} />
            </div>
          </details>

          <details className="company-detail-drawer-v21 redesigned-details">
            <summary>Apri strumenti secondari</summary>
            <div className="company-detail-drawer-body-v21">
              <div className="company-detail-secondary-grid-v21">
                <TimelineCard items={timeline} />
                <AnalysisImportCard
                  companies={[{ id: company.id, name: company.name }]}
                  presetCompanyId={company.id}
                  presetCompanyName={company.name}
                  compact
                  eyebrow="Import"
                  title="Importa ordini per questa azienda"
                  description="Carichi il CSV dalla scheda azienda: prima fai anteprima, poi importi solo se il match opportunità è corretto."
                  submitLabel="Importa in questa azienda"
                />
              </div>
              <div className="company-edit-drawer">
                <CompanyEditCard company={company} />
              </div>
            </div>
          </details>
        </aside>
      </div>
    </DetailShell>
  )
}
