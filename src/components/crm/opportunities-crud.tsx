'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createOpportunity, deleteOpportunity, updateOpportunityStage } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'

const stages = ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

function stageBadge(stage: string) {
  if (stage === 'won') return 'badge-success'
  if (stage === 'lost') return 'badge-danger'
  if (stage === 'proposal' || stage === 'negotiation') return 'badge-warning'
  return 'badge-accent'
}

export function OpportunitiesCrud({ opportunities, companies, contacts }: { opportunities: any[]; companies: any[]; contacts: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)

  const items = useMemo(() => {
    return opportunities.filter((item) => {
      const hay = `${item.title} ${item.companies?.name || ''} ${item.stage || ''}`.toLowerCase()
      return hay.includes(query.toLowerCase()) && (filter === 'all' || item.stage === filter)
    })
  }, [opportunities, query, filter])

  return (
    <>
      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">Opportunità</h2>
            <p className="section-copy">Pipeline leggibile, senza mini-form aperte ovunque.</p>
          </div>
          <div className="section-actions">
            <button type="button" className="button-primary" onClick={() => setOpen(true)}>+ Nuova opportunità</button>
          </div>
        </div>

        <div className="entity-toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per titolo, azienda o fase" />
          <div className="segmented">
            {['all', 'new_lead', 'proposal', 'negotiation', 'won'].map((item) => (
              <button key={item} type="button" data-active={filter === item} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutte' : item.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="entity-list">
          {items.map((item) => (
            <article key={item.id} className="entity-card">
              <div className="entity-head">
                <div className="entity-copy">
                  <div className="badge-row"><span className={`badge ${stageBadge(item.stage)}`}>{item.stage.replace('_', ' ')}</span><span className="badge badge-soft">{formatCurrency(item.value_estimate)}</span></div>
                  <h3 className="entity-title">{item.title}</h3>
                  <p className="entity-subtitle">{item.companies?.name || 'Azienda non indicata'} · chiusura {formatDate(item.expected_close_date)}</p>
                  <div className="entity-summary">
                    {item.next_action ? <span className="badge badge-soft">{item.next_action}</span> : null}
                    {item.next_action_due_at ? <span className="badge badge-soft">{formatDateTime(item.next_action_due_at)}</span> : null}
                  </div>
                </div>
                <div className="entity-actions"><Link className="button-secondary" href={`/opportunities/${item.id}`}>Apri</Link></div>
              </div>

              <details className="entity-details">
                <summary className="details-toggle">Gestisci opportunità <span>+</span></summary>
                <form action={updateOpportunityStage} className="actions-row" style={{ marginTop: 12 }}>
                  <input type="hidden" name="id" value={item.id} />
                  <label className="field-label" style={{ minWidth: 240 }}><span>Fase</span><select name="stage" defaultValue={item.stage}>{stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>
                  <button className="button-primary" type="submit">Aggiorna fase</button>
                </form>
                <form action={deleteOpportunity} className="actions-row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="button-danger" type="submit">Elimina</button>
                </form>
              </details>
            </article>
          ))}
          {!items.length ? <div className="empty-state">Nessuna opportunità trovata con questi filtri.</div> : null}
        </div>
      </section>

      {open ? (
        <div className="modal-layer" onClick={() => setOpen(false)}>
          <form id="new-opportunity" action={createOpportunity} className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3 className="modal-title">Nuova opportunità</h3>
                <p className="modal-copy">Titolo, azienda, fase e prossima azione. Tutto il resto viene dopo.</p>
              </div>
              <button type="button" className="button-ghost" onClick={() => setOpen(false)}>Chiudi</button>
            </div>
            <div className="modal-grid">
              <label className="field-label"><span>Titolo</span><input name="title" required /></label>
              <label className="field-label"><span>Azienda</span><select name="company_id" required defaultValue=""><option value="" disabled>Seleziona</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
              <label className="field-label"><span>Contatto principale</span><select name="primary_contact_id" defaultValue=""><option value="">Nessuno</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}</select></label>
              <label className="field-label"><span>Fase</span><select name="stage" defaultValue="new_lead">{stages.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="field-label"><span>Valore stimato</span><input name="value_estimate" type="number" step="0.01" /></label>
              <label className="field-label"><span>Probabilità</span><input name="probability" type="number" min="0" max="100" /></label>
              <label className="field-label"><span>Chiusura prevista</span><input name="expected_close_date" type="date" /></label>
              <label className="field-label"><span>Prossima azione</span><input name="next_action" /></label>
              <label className="field-label"><span>Scadenza prossima azione</span><input name="next_action_due_at" type="datetime-local" /></label>
              <label className="field-label"><span>Fonte</span><input name="source" /></label>
              <label className="field-label" style={{ gridColumn: '1 / -1' }}><span>Descrizione</span><textarea name="description" /></label>
            </div>
            <div className="modal-footer"><button type="button" className="button-ghost" onClick={() => setOpen(false)}>Annulla</button><button type="submit" className="button-primary">Salva opportunità</button></div>
          </form>
        </div>
      ) : null}
    </>
  )
}
