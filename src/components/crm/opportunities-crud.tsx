'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createOpportunity, deleteOpportunity, updateOpportunityStage } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { formatCurrency, formatDate } from '@/lib/format'
import { ConfirmDangerButton, PendingSubmitButton } from '@/components/ui/form-actions'

const stages = ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const
const stageLabel: Record<string, string> = {
  new_lead: 'Nuovo lead',
  contacted: 'Contattata',
  qualified: 'Qualificata',
  proposal: 'Proposta',
  negotiation: 'Negoziazione',
  won: 'Vinta',
  lost: 'Persa',
}

function stageTone(stage: string) {
  if (stage === 'won') return 'success'
  if (stage === 'lost') return 'danger'
  if (stage === 'proposal' || stage === 'negotiation') return 'warning'
  return 'neutral'
}

export function OpportunitiesCrud({ opportunities, companies, contacts }: { opportunities: any[]; companies: any[]; contacts: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

  const items = useMemo(() => {
    return opportunities.filter((item) => {
      const text = `${item.title} ${item.companies?.name ?? ''} ${item.stage ?? ''}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesFilter = filter === 'all' ? true : item.stage === filter
      return matchesQuery && matchesFilter
    })
  }, [opportunities, query, filter])

  return (
    <>
      <section className="panel-card page-section-card">
        <div className="list-head">
          <div>
            <h2>Opportunità</h2>
            <p>Pipeline leggibile, con valore, stato e next step in primo piano.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
            + Nuova opportunità
          </button>
        </div>

        <div className="toolbar-row">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per titolo, azienda o fase" />
          <div className="segmented-control">
            {['all', 'new_lead', 'proposal', 'negotiation', 'won'].map((item) => (
              <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutte' : stageLabel[item] ?? item}
              </button>
            ))}
          </div>
        </div>

        <div className="cards-stack">
          {items.map((item) => (
            <article key={item.id} className="entity-card opportunity-card">
              <div className="entity-card-copy stretch">
                <div className="entity-card-top">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.companies?.name ?? 'Azienda non indicata'} · chiusura {formatDate(item.expected_close_date)}</p>
                  </div>
                  <span className={`tone-badge ${stageTone(item.stage)}`}>{stageLabel[item.stage] ?? item.stage}</span>
                </div>
                <div className="entity-inline-meta wrap">
                  <span>{formatCurrency(item.value_estimate)}</span>
                  {item.next_action ? <span>{item.next_action}</span> : null}
                  {item.primary_contact?.full_name ? <span>{item.primary_contact.full_name}</span> : null}
                </div>
              </div>
              <div className="entity-card-actions">
                <Link href={`/opportunities/${item.id}`} className="secondary-button">Apri</Link>
                <form action={updateOpportunityStage} className="inline-mini-form">
                  <input type="hidden" name="id" value={item.id} />
                  <select name="stage" defaultValue={item.stage} className="field-control compact-control">
                    {stages.map((stage) => <option key={stage} value={stage}>{stageLabel[stage] ?? stage}</option>)}
                  </select>
                  <PendingSubmitButton />
                </form>
                <form action={deleteOpportunity}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmDangerButton confirmMessage={`Eliminare davvero l'opportunità ${item.title}?`} />
                </form>
              </div>
            </article>
          ))}
          {!items.length ? <div className="empty-state-box">Nessuna opportunità trovata.</div> : null}
        </div>
      </section>

      {showCreate ? (
        <div className="overlay-shell" role="dialog" aria-modal="true">
          <div className="overlay-backdrop" onClick={() => setShowCreate(false)} />
          <div className="sheet-card">
            <div className="sheet-head">
              <div>
                <p className="page-eyebrow">Quick add</p>
                <h3>Nuova opportunità</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setShowCreate(false)}>Chiudi</button>
            </div>
            <form action={createOpportunity} className="sheet-form">
              <div className="form-grid two-col">
                <label className="field-stack"><span>Titolo</span><input className="field-control" name="title" required /></label>
                <label className="field-stack"><span>Azienda</span><select className="field-control" name="company_id" required defaultValue=""><option value="" disabled>Seleziona</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
                <label className="field-stack"><span>Contatto</span><select className="field-control" name="primary_contact_id" defaultValue=""><option value="">Nessuno</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}</select></label>
                <label className="field-stack"><span>Fase</span><select className="field-control" name="stage" defaultValue="new_lead">{stages.map((item) => <option key={item} value={item}>{stageLabel[item] ?? item}</option>)}</select></label>
                <label className="field-stack"><span>Valore stimato</span><input className="field-control" name="value_estimate" type="number" step="0.01" /></label>
                <label className="field-stack"><span>Probabilità</span><input className="field-control" name="probability" type="number" min="0" max="100" /></label>
                <label className="field-stack"><span>Chiusura prevista</span><input className="field-control" name="expected_close_date" type="date" /></label>
                <label className="field-stack"><span>Fonte</span><input className="field-control" name="source" /></label>
                <label className="field-stack"><span>Next action</span><input className="field-control" name="next_action" /></label>
                <label className="field-stack"><span>Scadenza next action</span><input className="field-control" name="next_action_due_at" type="datetime-local" /></label>
              </div>
              <label className="field-stack"><span>Descrizione</span><textarea className="field-control field-area" name="description" /></label>
              <div className="sheet-actions">
                <button className="secondary-button" type="button" onClick={() => setShowCreate(false)}>Annulla</button>
                <PendingSubmitButton className="primary-button" idleLabel="Salva opportunità" />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
