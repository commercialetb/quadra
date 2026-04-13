'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createFollowup, deleteFollowup, updateFollowupStatus } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { formatDateTime } from '@/lib/format'

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
    return followups.filter((item) => {
      const text = `${item.title} ${item.status ?? ''} ${item.priority ?? ''}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesFilter = filter === 'all' ? true : item.status === filter
      return matchesQuery && matchesFilter
    })
  }, [followups, query, filter])

  return (
    <>
      <section className="panel-card page-section-card">
        <div className="list-head">
          <div>
            <h2>Follow-up</h2>
            <p>Agenda operativa più chiara, con stati e priorità leggibili al volo.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
            + Nuovo follow-up
          </button>
        </div>

        <div className="toolbar-row">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per titolo, stato o priorita" />
          <div className="segmented-control">
            {['all', 'pending', 'in_progress', 'overdue', 'completed'].map((item) => (
              <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutti' : item}
              </button>
            ))}
          </div>
        </div>

        <div className="cards-stack">
          {items.map((item) => (
            <article key={item.id} className="entity-card">
              <div className="entity-card-copy stretch">
                <div className="entity-card-top">
                  <div>
                    <h3>{item.title}</h3>
                    <p>Scade {formatDateTime(item.due_at)}</p>
                  </div>
                  <div className="entity-inline-meta wrap align-end">
                    <span className={`tone-badge ${statusTone(item.status)}`}>{item.status}</span>
                    <span className={`tone-badge ${priorityTone(item.priority)}`}>{item.priority}</span>
                  </div>
                </div>
                {item.description ? <div className="entity-body-copy">{item.description}</div> : null}
              </div>
              <div className="entity-card-actions">
                <form action={updateFollowupStatus} className="inline-mini-form">
                  <input type="hidden" name="id" value={item.id} />
                  <select name="status" defaultValue={item.status} className="field-control compact-control">
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <SaveButton />
                </form>
                <form action={deleteFollowup}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="danger-button" type="submit">Elimina</button>
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
                <label className="field-stack"><span>Priorita</span><select className="field-control" name="priority" defaultValue="medium">{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="field-stack"><span>Stato</span><select className="field-control" name="status" defaultValue="pending">{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="field-stack"><span>Azienda</span><select className="field-control" name="company_id" defaultValue=""><option value="">Nessuna</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
                <label className="field-stack"><span>Contatto</span><select className="field-control" name="contact_id" defaultValue=""><option value="">Nessuno</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}</select></label>
                <label className="field-stack"><span>Opportunita</span><select className="field-control" name="opportunity_id" defaultValue=""><option value="">Nessuna</option>{opportunities.map((opportunity) => <option key={opportunity.id} value={opportunity.id}>{opportunity.title}</option>)}</select></label>
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
