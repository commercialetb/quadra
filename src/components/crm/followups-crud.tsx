'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createFollowup, deleteFollowup, updateFollowupStatus } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { formatDateTime } from '@/lib/format'
import { followupStatusLabel, priorityLabel } from '@/lib/crm-labels'

const statuses = ['pending', 'in_progress', 'completed', 'cancelled', 'overdue']
const priorities = ['low', 'medium', 'high', 'urgent']

function statusTone(status: string) {
  if (status === 'completed') return 'success'
  if (status === 'overdue') return 'danger'
  if (status === 'in_progress') return 'warning'
  return 'neutral'
}

function priorityTone(priority: string) {
  if (priority === 'urgent') return 'danger'
  if (priority === 'high') return 'warning'
  return 'neutral'
}

function SaveButton({ idleLabel = 'Salva' }: { idleLabel?: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="ghost-button save-button" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Salvataggio...' : idleLabel}
    </button>
  )
}

function isDueToday(value?: string | null) {
  if (!value) return false
  const due = new Date(value)
  const now = new Date()
  return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth() && due.getDate() === now.getDate()
}

export function FollowupsCrud({ followups, companies, contacts, opportunities }: { followups: any[]; companies: any[]; contacts: any[]; opportunities: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

  const sortedCompanies = useMemo(() => [...companies].sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })), [companies])
  const sortedContacts = useMemo(() => [...contacts].sort((a, b) => `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim().localeCompare(`${b.first_name ?? ''} ${b.last_name ?? ''}`.trim(), 'it', { sensitivity: 'base' })), [contacts])
  const sortedOpportunities = useMemo(() => [...opportunities].sort((a, b) => (a.title ?? '').localeCompare((b.title ?? ''), 'it', { sensitivity: 'base' })), [opportunities])

  const items = useMemo(() => {
    return followups
      .filter((item) => {
        const text = `${item.title} ${item.status ?? ''} ${item.priority ?? ''} ${item.description ?? ''}`.toLowerCase()
        const matchesQuery = text.includes(query.toLowerCase())
        const matchesFilter = filter === 'all' ? true : item.status === filter
        const matchesPriority = priorityFilter === 'all' ? true : item.priority === priorityFilter
        return matchesQuery && matchesFilter && matchesPriority
      })
      .sort((a, b) => {
        const aTime = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER
        const bTime = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER
        return aTime - bTime
      })
  }, [filter, followups, priorityFilter, query])

  const overdueCount = items.filter((item) => item.status === 'overdue').length
  const progressCount = items.filter((item) => item.status === 'in_progress').length
  const completedCount = items.filter((item) => item.status === 'completed').length
  const todayCount = items.filter((item) => item.status !== 'completed' && isDueToday(item.due_at)).length
  const urgentCount = items.filter((item) => item.priority === 'urgent' && item.status !== 'completed').length
  const nextItem = items.find((item) => item.status !== 'completed')

  const companyMap = useMemo(() => new Map(companies.map((company) => [company.id, company.name])), [companies])
  const contactMap = useMemo(() => new Map(contacts.map((contact) => [contact.id, `${contact.first_name} ${contact.last_name}`.trim()])), [contacts])
  const opportunityMap = useMemo(() => new Map(opportunities.map((opportunity) => [opportunity.id, opportunity.title])), [opportunities])

  return (
    <>
      <section className="panel-card page-section-card crm-entity-panel crm-entity-panel-followups crm-v4-panel quiet-card">
        <div className="list-head">
          <div>
            <p className="page-eyebrow">Follow-up</p>
            <h2>Agenda che spinge all’azione</h2>
            <p>Qui devi vedere subito cosa chiudere oggi, cosa è in ritardo e quale passaggio sblocca il lavoro commerciale.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
            + Nuovo follow-up
          </button>
        </div>

        <div className="entity-summary-row entity-summary-row-v3" aria-label="Panoramica follow-up">
          <div className="entity-summary-pill"><span>Totale</span><strong>{items.length}</strong></div>
          <div className="entity-summary-pill"><span>Oggi</span><strong>{todayCount}</strong></div>
          <div className="entity-summary-pill"><span>Scaduti</span><strong>{overdueCount}</strong></div>
          <div className="entity-summary-pill"><span>Completati</span><strong>{completedCount}</strong></div>
        </div>

        <section className="crm-focus-strip" aria-label="Lettura rapida follow-up">
          <article className="crm-focus-card is-primary quiet-card">
            <span>Cosa fare adesso</span>
            <strong>{nextItem?.title || 'Nessun follow-up aperto'}</strong>
            <p>{nextItem ? `Scade ${formatDateTime(nextItem.due_at)} · ${followupStatusLabel(nextItem.status)}` : 'La tua agenda è pulita nel filtro corrente.'}</p>
          </article>
          <article className="crm-focus-card quiet-card">
            <span>Cosa rischia di bloccarti</span>
            <strong>{urgentCount > 0 ? `${urgentCount} urgenti` : 'Nessuna urgenza alta'}</strong>
            <p>{urgentCount > 0 ? 'Chiudi prima questi follow-up per evitare attrito operativo.' : 'Puoi lavorare per priorità senza rincorrere emergenze.'}</p>
          </article>
          <article className="crm-focus-card quiet-card">
            <span>Perché conta</span>
            <strong>{progressCount > overdueCount ? 'Pipeline in moto' : 'Serve pulizia agenda'}</strong>
            <p>{progressCount > overdueCount ? 'Hai più attività in avanzamento che attività fuori tempo.' : 'Vale la pena chiudere o ripianificare ciò che è rimasto indietro.'}</p>
          </article>
        </section>

        <div className="toolbar-row toolbar-row-v3">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per titolo, stato, priorità o descrizione" />
          <div className="toolbar-row-inline toolbar-row-inline-double">
            <div className="segmented-control">
              {['all', 'pending', 'in_progress', 'overdue', 'completed'].map((item) => (
                <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
                  {item === 'all' ? 'Tutti' : followupStatusLabel(item)}
                </button>
              ))}
            </div>
            <select className="field-control toolbar-select" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              <option value="all">Tutte le priorità</option>
              {priorities.map((item) => <option key={item} value={item}>{priorityLabel(item)}</option>)}
            </select>
          </div>
        </div>

        <div className="cards-stack cards-stack-v3">
          {items.map((item) => (
            <article key={item.id} className="entity-card entity-card-followup entity-card-v3 quiet-card">
              <div className="entity-card-copy stretch quiet-card">
                <div className="entity-card-top">
                  <div>
                    <h3>{item.title}</h3>
                    <p>Scade {formatDateTime(item.due_at)}</p>
                  </div>
                  <div className="entity-inline-meta wrap align-end">
                    <span className={`tone-badge ${statusTone(item.status)}`}>{followupStatusLabel(item.status)}</span>
                    <span className={`tone-badge ${priorityTone(item.priority)}`}>{priorityLabel(item.priority)}</span>
                  </div>
                </div>
                <div className="entity-glance-grid entity-glance-grid-followups">
                  <div className="entity-glance-item"><span>Azienda</span><strong>{item.company_id && companyMap.get(item.company_id) ? companyMap.get(item.company_id) : 'Non collegata'}</strong></div>
                  <div className="entity-glance-item"><span>Contatto</span><strong>{item.contact_id && contactMap.get(item.contact_id) ? contactMap.get(item.contact_id) : 'Non collegato'}</strong></div>
                  <div className="entity-glance-item"><span>Deal</span><strong>{item.opportunity_id && opportunityMap.get(item.opportunity_id) ? opportunityMap.get(item.opportunity_id) : 'Non collegato'}</strong></div>
                  <div className="entity-glance-item"><span>Quando</span><strong>{item.due_at ? formatDateTime(item.due_at) : 'Senza data'}</strong></div>
                </div>
                {item.description ? <div className="entity-body-copy entity-body-copy-compact">{item.description}</div> : null}
              </div>
              <details className="entity-more-details">
                <summary>Azioni rapide</summary>
                <div className="entity-inline-meta wrap entity-inline-meta-soft">
                  <span>{item.status === 'completed' ? 'Già chiuso' : 'Puoi chiuderlo o cambiare stato da qui sotto.'}</span>
                  {item.company_id && companyMap.get(item.company_id) ? <span>{companyMap.get(item.company_id)}</span> : null}
                  {item.contact_id && contactMap.get(item.contact_id) ? <span>{contactMap.get(item.contact_id)}</span> : null}
                </div>
              </details>
              <div className="entity-card-actions cleaner-actions">
                {item.status !== 'completed' ? (
                  <form action={updateFollowupStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="completed" />
                    <button className="secondary-button" type="submit">Segna completato</button>
                  </form>
                ) : null}
                <form action={updateFollowupStatus} className="inline-mini-form compact-inline-form">
                  <input type="hidden" name="id" value={item.id} />
                  <select name="status" defaultValue={item.status} className="field-control compact-control">
                    {statuses.map((status) => <option key={status} value={status}>{followupStatusLabel(status)}</option>)}
                  </select>
                  <SaveButton idleLabel="Aggiorna" />
                </form>
                <form action={deleteFollowup}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="ghost-button danger-ghost" type="submit">Elimina</button>
                </form>
              </div>
            </article>
          ))}
          {!items.length ? <div className="empty-state-box">Nessun follow-up trovato.</div> : null}
        </div>
      </section>

      {showCreate ? (
        <div className="overlay-shell" role="dialog" aria-modal="true">
          <div className="overlay-backdrop" onClick={() => setShowCreate(false)} />
          <div className="sheet-card">
            <div className="sheet-head">
              <div>
                <p className="page-eyebrow">Quick add</p>
                <h3>Nuovo follow-up</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setShowCreate(false)}>Chiudi</button>
            </div>
            <form action={createFollowup} className="sheet-form">
              <div className="form-grid two-col">
                <label className="field-stack"><span>Titolo</span><input className="field-control" name="title" required /></label>
                <label className="field-stack"><span>Scadenza</span><input className="field-control" name="due_at" type="datetime-local" required /></label>
                <label className="field-stack"><span>Priorità</span><select className="field-control" name="priority" defaultValue="medium">{priorities.map((item) => <option key={item} value={item}>{priorityLabel(item)}</option>)}</select></label>
                <label className="field-stack"><span>Stato</span><select className="field-control" name="status" defaultValue="pending">{statuses.map((item) => <option key={item} value={item}>{followupStatusLabel(item)}</option>)}</select></label>
                <label className="field-stack"><span>Azienda</span><select className="field-control" name="company_id" defaultValue=""><option value="">Nessuna</option>{sortedCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
                <label className="field-stack"><span>Contatto</span><select className="field-control" name="contact_id" defaultValue=""><option value="">Nessuno</option>{sortedContacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}</select></label>
                <label className="field-stack"><span>Opportunità</span><select className="field-control" name="opportunity_id" defaultValue=""><option value="">Nessuna</option>{sortedOpportunities.map((opportunity) => <option key={opportunity.id} value={opportunity.id}>{opportunity.title}</option>)}</select></label>
              </div>
              <label className="field-stack"><span>Descrizione</span><textarea className="field-control field-area" name="description" /></label>
              <div className="sheet-actions">
                <button className="secondary-button" type="button" onClick={() => setShowCreate(false)}>Annulla</button>
                <SaveButton idleLabel="Salva follow-up" />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
