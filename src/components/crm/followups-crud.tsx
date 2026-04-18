'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createFollowup, deleteFollowup, updateFollowupStatus } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { formatDateTime } from '@/lib/format'
import { CrmHero, CrmScene } from '@/components/crm/crm-scene'
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

export function FollowupsCrud({ followups, companies, contacts, opportunities }: { followups: any[]; companies: any[]; contacts: any[]; opportunities: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

  const items = useMemo(() => {
    return followups
      .filter((item) => {
        const text = `${item.title} ${item.status ?? ''} ${item.priority ?? ''}`.toLowerCase()
        const matchesQuery = text.includes(query.toLowerCase())
        const matchesFilter = filter === 'all' ? true : item.status === filter
        return matchesQuery && matchesFilter
      })
      .sort((a, b) => {
        const aTime = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER
        const bTime = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER
        return aTime - bTime
      })
  }, [followups, query, filter])

  const overdueCount = items.filter((item) => item.status === 'overdue').length
  const progressCount = items.filter((item) => item.status === 'in_progress').length
  const completedCount = items.filter((item) => item.status === 'completed').length

  const companyMap = useMemo(() => new Map(companies.map((company) => [company.id, company.name])), [companies])
  const contactMap = useMemo(() => new Map(contacts.map((contact) => [contact.id, `${contact.first_name} ${contact.last_name}`.trim()])), [contacts])
  const opportunityMap = useMemo(() => new Map(opportunities.map((opportunity) => [opportunity.id, opportunity.title])), [opportunities])

  return (
    <>
      <CrmScene className="crm-scene-followups">
        <CrmHero
          eyebrow="Follow-up"
          title="Agenda workspace"
          description="Una vista più operativa di agenda, scadenze e task da chiudere senza perdere priorità."
          spotlight={{ kicker: 'Scaduti', value: String(overdueCount), note: `${progressCount} attività già in corso` }}
          stats={[
            { label: 'Totale', value: items.length, note: 'attività visibili' },
            { label: 'Scaduti', value: overdueCount, note: 'da rimettere in riga' },
            { label: 'In corso', value: progressCount, note: 'già presi in carico' },
            { label: 'Completati', value: completedCount, note: 'chiusi con successo' },
          ]}
          links={[
            { href: '/opportunities', label: 'Apri pipeline', tone: 'ghost' },
            { href: '/dashboard', label: 'Torna alla dashboard', tone: 'primary' },
          ]}
        />

      <section className="panel-card page-section-card crm-entity-panel crm-entity-panel-followups">
        <div className="list-head">
          <div>
            <h2>Agenda operativa</h2>
            <p>Priorità, scadenze e chiusure rapide senza perdere il contesto.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
            + Nuovo follow-up
          </button>
        </div>

        <div className="entity-summary-row" aria-label="Panoramica follow-up">
          <div className="entity-summary-pill"><span>Totale</span><strong>{items.length}</strong></div>
          <div className="entity-summary-pill"><span>Scaduti</span><strong>{items.filter((item) => item.status === 'overdue').length}</strong></div>
          <div className="entity-summary-pill"><span>In corso</span><strong>{items.filter((item) => item.status === 'in_progress').length}</strong></div>
          <div className="entity-summary-pill"><span>Completati</span><strong>{items.filter((item) => item.status === 'completed').length}</strong></div>
        </div>

        <div className="toolbar-row">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per titolo, stato o priorità" />
          <div className="segmented-control">
            {['all', 'pending', 'in_progress', 'overdue', 'completed'].map((item) => (
              <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutti' : followupStatusLabel(item)}
              </button>
            ))}
          </div>
        </div>

        <div className="cards-stack">
          {items.map((item) => (
            <article key={item.id} className="entity-card entity-card-followup">
              <div className="entity-card-copy stretch">
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
                {item.description ? <div className="entity-body-copy">{item.description}</div> : null}
                <div className="entity-inline-meta wrap entity-inline-meta-soft">
                  {item.company_id && companyMap.get(item.company_id) ? <span>{companyMap.get(item.company_id)}</span> : null}
                  {item.contact_id && contactMap.get(item.contact_id) ? <span>{contactMap.get(item.contact_id)}</span> : null}
                  {item.opportunity_id && opportunityMap.get(item.opportunity_id) ? <span>{opportunityMap.get(item.opportunity_id)}</span> : null}
                </div>
              </div>
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
      </CrmScene>

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
                <label className="field-stack"><span>Azienda</span><select className="field-control" name="company_id" defaultValue=""><option value="">Nessuna</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
                <label className="field-stack"><span>Contatto</span><select className="field-control" name="contact_id" defaultValue=""><option value="">Nessuno</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}</select></label>
                <label className="field-stack"><span>Opportunità</span><select className="field-control" name="opportunity_id" defaultValue=""><option value="">Nessuna</option>{opportunities.map((opportunity) => <option key={opportunity.id} value={opportunity.id}>{opportunity.title}</option>)}</select></label>
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
