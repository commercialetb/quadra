'use client'

import { useMemo, useState } from 'react'
import { createFollowup, deleteFollowup, updateFollowupStatus } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { formatDateTime } from '@/lib/format'

const statuses = ['pending', 'in_progress', 'completed', 'cancelled', 'overdue']
const priorities = ['low', 'medium', 'high', 'urgent']

function statusBadge(status: string) {
  if (status === 'completed') return 'badge-success'
  if (status === 'overdue') return 'badge-danger'
  if (status === 'in_progress') return 'badge-warning'
  return 'badge-accent'
}

function priorityBadge(priority: string) {
  if (priority === 'urgent') return 'badge-danger'
  if (priority === 'high') return 'badge-warning'
  return 'badge-soft'
}

export function FollowupsCrud({ followups, companies, contacts, opportunities }: { followups: any[]; companies: any[]; contacts: any[]; opportunities: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)

  const items = useMemo(() => {
    return followups.filter((item) => {
      const hay = `${item.title} ${item.status || ''} ${item.priority || ''}`.toLowerCase()
      return hay.includes(query.toLowerCase()) && (filter === 'all' || item.status === filter)
    })
  }, [followups, query, filter])

  return (
    <>
      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">Follow-up</h2>
            <p className="section-copy">Agenda più pulita, priorità più leggibili, inserimento solo on demand.</p>
          </div>
          <div className="section-actions"><button type="button" className="button-primary" onClick={() => setOpen(true)}>+ Nuovo follow-up</button></div>
        </div>

        <div className="entity-toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per titolo, stato o priorità" />
          <div className="segmented">
            {['all', 'pending', 'in_progress', 'overdue', 'completed'].map((item) => (
              <button key={item} type="button" data-active={filter === item} onClick={() => setFilter(item)}>{item === 'all' ? 'Tutti' : item}</button>
            ))}
          </div>
        </div>

        <div className="entity-list">
          {items.map((item) => (
            <article key={item.id} className="entity-card">
              <div className="entity-head">
                <div className="entity-copy">
                  <div className="badge-row">
                    <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                    <span className={`badge ${priorityBadge(item.priority)}`}>{item.priority}</span>
                  </div>
                  <h3 className="entity-title">{item.title}</h3>
                  <p className="entity-subtitle">Scade {formatDateTime(item.due_at)}</p>
                </div>
              </div>
              <details className="entity-details">
                <summary className="details-toggle">Gestisci follow-up <span>+</span></summary>
                <form action={updateFollowupStatus} className="actions-row" style={{ marginTop: 12 }}>
                  <input type="hidden" name="id" value={item.id} />
                  <label className="field-label" style={{ minWidth: 240 }}><span>Stato</span><select name="status" defaultValue={item.status}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                  <button className="button-primary" type="submit">Aggiorna stato</button>
                </form>
                <form action={deleteFollowup} className="actions-row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="button-danger" type="submit">Elimina</button>
                </form>
              </details>
            </article>
          ))}
          {!items.length ? <div className="empty-state">Nessun follow-up trovato con questi filtri.</div> : null}
        </div>
      </section>

      {open ? (
        <div className="modal-layer" onClick={() => setOpen(false)}>
          <form id="new-followup" action={createFollowup} className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3 className="modal-title">Nuovo follow-up</h3>
                <p className="modal-copy">Titolo, scadenza e priorità. Collega il resto solo se serve.</p>
              </div>
              <button type="button" className="button-ghost" onClick={() => setOpen(false)}>Chiudi</button>
            </div>
            <div className="modal-grid">
              <label className="field-label"><span>Titolo</span><input name="title" required /></label>
              <label className="field-label"><span>Scadenza</span><input name="due_at" type="datetime-local" required /></label>
              <label className="field-label"><span>Priorità</span><select name="priority" defaultValue="medium">{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="field-label"><span>Stato</span><select name="status" defaultValue="pending">{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="field-label"><span>Azienda</span><select name="company_id" defaultValue=""><option value="">Nessuna</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
              <label className="field-label"><span>Contatto</span><select name="contact_id" defaultValue=""><option value="">Nessuno</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}</select></label>
              <label className="field-label"><span>Opportunità</span><select name="opportunity_id" defaultValue=""><option value="">Nessuna</option>{opportunities.map((opportunity) => <option key={opportunity.id} value={opportunity.id}>{opportunity.title}</option>)}</select></label>
              <label className="field-label" style={{ gridColumn: '1 / -1' }}><span>Descrizione</span><textarea name="description" /></label>
            </div>
            <div className="modal-footer"><button type="button" className="button-ghost" onClick={() => setOpen(false)}>Annulla</button><button type="submit" className="button-primary">Salva follow-up</button></div>
          </form>
        </div>
      ) : null}
    </>
  )
}
