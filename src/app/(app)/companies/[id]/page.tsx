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

  return (
    <DetailShell title={company.name} subtitle={company.legal_name} backHref="/companies" backLabel="Aziende" eyebrow="Scheda azienda">
      <section className="panel-card company-decision-board">
        <div className="company-decision-board-head">
          <div>
            <p className="page-eyebrow">System of action</p>
            <h2>Cosa fare, con chi, quando e perché</h2>
            <p className="page-subtitle compact">
              La scheda sopra la piega mostra solo il necessario. Modifica, import e analisi complete restano sotto.
            </p>
          </div>
          <div className="cluster-wrap company-decision-board-actions">
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
        </div>

        <div className="company-decision-board-grid">
          <article className="panel-card company-decision-focus-card">
            <span className="company-focus-label">Prossima azione</span>
            <strong>{topAction?.title || 'Mantieni il presidio attivo'}</strong>
            <p>{topAction?.detail || analysis?.companyRow?.insight || 'Nessuna urgenza critica: continua la relazione e aggiorna la scheda quando serve.'}</p>
            <div className="company-focus-meta">
              <span className={`dashboard-pill-badge ${signal === 'high' ? 'danger' : signal === 'medium' ? 'warning' : ''}`}>{signal}</span>
              {priorityScore !== null ? (
                <span className={`dashboard-pill-badge ${priorityBand === 'alta' ? 'danger' : priorityBand === 'media' ? 'warning' : ''}`}>
                  {priorityScore}/100
                </span>
              ) : null}
              <span className="dashboard-pill-badge">{company.status || 'lead'}</span>
            </div>
          </article>

          <div className="company-decision-metrics">
            <article className="panel-card company-decision-metric">
              <span>Con chi</span>
              <strong>{mainContact?.full_name || 'Nessun referente'}</strong>
              <small>{[mainContact?.role, mainContact?.email].filter(Boolean).join(' · ') || 'Aggiungi un contatto principale'}</small>
            </article>
            <article className="panel-card company-decision-metric">
              <span>Quando</span>
              <strong>{activeFollowup?.due_at ? formatDate(activeFollowup.due_at) : 'Non pianificato'}</strong>
              <small>{activeFollowup?.title || (analysis?.companyRow?.pendingFollowups ? `${analysis.companyRow.pendingFollowups} follow-up attivi` : 'Nessuna azione in agenda')}</small>
            </article>
            <article className="panel-card company-decision-metric">
              <span>Opportunità aperte</span>
              <strong>{opportunityCount}</strong>
              <small>{analysis?.companyRow?.pipelineValue ? formatCurrency(analysis.companyRow.pipelineValue) : 'Pipeline non valorizzata'}</small>
            </article>
            <article className="panel-card company-decision-metric">
              <span>Ultimo ordine</span>
              <strong>{lastOrderDate ? formatDate(lastOrderDate) : 'Nessun dato'}</strong>
              <small>{analysis?.companyRow?.importedValue ? formatCurrency(analysis.companyRow.importedValue) : 'Ordini non collegati'}</small>
            </article>
          </div>
        </div>
      </section>

      <div className="company-page-redesign-grid company-page-simplified-grid">
        <div className="stack-lg company-detail-main-col">
          <section className="panel-card company-essentials-card">
            <div className="dashboard-redesign-head">
              <div>
                <p className="page-eyebrow">Essenziali</p>
                <h2>Tutto chiaro in un colpo d'occhio</h2>
              </div>
            </div>
            <div className="company-essentials-grid">
              <div className="company-essential-item">
                <span>Settore</span>
                <strong>{company.industry || 'Non indicato'}</strong>
              </div>
              <div className="company-essential-item">
                <span>Sito</span>
                <strong>{company.website ? <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a> : '—'}</strong>
              </div>
              <div className="company-essential-item">
                <span>Telefono</span>
                <strong>{company.phone || '—'}</strong>
              </div>
              <div className="company-essential-item">
                <span>Email</span>
                <strong>{company.email || '—'}</strong>
              </div>
              <div className="company-essential-item wide">
                <span>Indirizzo</span>
                <strong>{[company.address_line1, company.city, company.province].filter(Boolean).join(', ') || 'Non indicato'}</strong>
              </div>
              <div className="company-essential-item wide">
                <span>Nota rapida</span>
                <strong>{recentNote?.title || company.notes_summary || 'Nessuna nota rapida'}</strong>
              </div>
            </div>
          </section>

          <details className="redesigned-details company-insight-details">
            <summary>Apri insight e analisi</summary>
            <div className="company-detail-drawer-body-v21">
              <CompanyAnalysisCard data={analysis} />
            </div>
          </details>

          <details className="company-detail-drawer-v21 redesigned-details">
            <summary>Apri timeline, import e modifica</summary>
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
        </div>

        <aside className="stack-lg company-detail-side-col">
          <EntityListCard
            title="Contatto principale e riferimenti"
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
            title="Opportunità aperte"
            empty="Nessuna opportunità aperta."
            ctaLabel="+ Aggiungi opportunità"
            ctaHref="/opportunities"
            items={opportunities.map((opportunity) => ({
              id: opportunity.id,
              label: opportunity.title,
              meta: [opportunity.stage, opportunity.value_estimate ? `€ ${Number(opportunity.value_estimate).toLocaleString('it-IT')}` : null].filter(Boolean).join(' · '),
              href: `/opportunities/${opportunity.id}`,
            }))}
          />

          <EntityListCard
            title="Note recenti"
            empty="Nessuna nota collegata."
            items={notes.map((note) => ({ id: note.id, label: note.title || 'Nota', meta: note.body }))}
          />
        </aside>
      </div>
    </DetailShell>
  )
}
