'use client'

import { useMemo, useState } from 'react'
import { createFollowup, deleteFollowup, updateFollowupStatus } from '@/app/(app)/actions'
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives'
import { SearchInput } from '@/components/ui/search-input'
import { formatDateTime } from '@/lib/format'

const statuses = ['pending', 'in_progress', 'completed', 'cancelled', 'overdue']
const priorities = ['low', 'medium', 'high', 'urgent']

function statusBadge(status: string) {
  if (status === 'completed') return 'badge-success'
  if (status === 'overdue') return 'badge-danger'
  if (status === 'in_progress') return 'badge-warning'
  return 'badge-dark'
}

function priorityBadge(priority: string) {
  if (priority === 'urgent') return 'badge-danger'
  if (priority === 'high') return 'badge-warning'
  return 'badge'
}

export function FollowupsCrud({ followups, companies, contacts, opportunities }: { followups: any[]; companies: any[]; contacts: any[]; opportunities: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const items = useMemo(() => {
    return followups.filter((item) => {
      const text = `${item.title} ${item.status ?? ''} ${item.priority ?? ''}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesFilter = filter === 'all' ? true : item.status === filter
      return matchesQuery && matchesFilter
    })
  }, [followups, query, filter])

  return (
    <div className="dual-panel">
      <div className="sticky-panel">
        <form id="new-followup" action={createFollowup}>
          <FormCard title="Nuovo follow-up" subtitle="La tua agenda operativa, con priorità e scadenza chiare.">
            <FormGrid>
              <Field label="Titolo"><input name="title" required style={inputStyle()} /></Field>
              <Field label="Scadenza"><input name="due_at" type="datetime-local" required style={inputStyle()} /></Field>
              <Field label="Priorità">
                <select name="priority" defaultValue="medium" style={selectStyle()}>
                  {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Stato">
                <select name="status" defaultValue="pending" style={selectStyle()}>
                  {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Azienda">
                <select name="company_id" style={selectStyle()} defaultValue="">
                  <option value="">Nessuna</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </Field>
              <Field label="Contatto">
                <select name="contact_id" style={selectStyle()} defaultValue="">
                  <option value="">Nessuno</option>
                  {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}
                </select>
              </Field>
              <Field label="Opportunità">
                <select name="opportunity_id" style={selectStyle()} defaultValue="">
                  <option value="">Nessuna</option>
                  {opportunities.map((opportunity) => <option key={opportunity.id} value={opportunity.id}>{opportunity.title}</option>)}
                </select>
              </Field>
            </FormGrid>
            <Field label="Descrizione"><textarea name="description" style={textareaStyle()} /></Field>
            <ActionBar><PrimaryButton>Salva follow-up</PrimaryButton></ActionBar>
          </FormCard>
        </form>
      </div>

      <section className="frost-card">
        <div className="section-heading">
          <div>
            <h2>Follow-up</h2>
            <p>Agenda sobria, chiara, finalmente leggibile anche su mobile.</p>
          </div>
          <div className="section-utility">{items.length} risultati</div>
        </div>

        <div className="search-row" style={{ marginBottom: 18 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per titolo, stato o priorità" />
          <div className="segmented">
            {['all', 'pending', 'in_progress', 'overdue', 'completed'].map((item) => (
              <button key={item} type="button" data-active={filter === item} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutti' : item}
              </button>
            ))}
          </div>
        </div>

        <div className="crm-list-grid">
          {items.map((item) => (
            <article key={item.id} className="crm-card">
              <div className="crm-card-header">
                <div>
                  <div className="crm-title">{item.title}</div>
                  <div className="crm-meta">Scade {formatDateTime(item.due_at)}</div>
                  <div className="crm-tags">
                    <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                    <span className={`badge ${priorityBadge(item.priority)}`}>{item.priority}</span>
                  </div>
                </div>
              </div>
              <div className="crm-card-footer">
                <form action={updateFollowupStatus} className="inline-stack">
                  <input type="hidden" name="id" value={item.id} />
                  <select name="status" defaultValue={item.status} style={selectStyle()}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <PrimaryButton>Aggiorna</PrimaryButton>
                </form>
                <form action={deleteFollowup}>
                  <input type="hidden" name="id" value={item.id} />
                  <InlineDangerButton>Elimina</InlineDangerButton>
                </form>
              </div>
            </article>
          ))}
          {!items.length ? <div className="empty-copy">Nessun follow-up trovato per questo filtro.</div> : null}
        </div>
      </section>
    </div>
  )
}
