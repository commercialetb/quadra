'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createOpportunity, deleteOpportunity, updateOpportunityStage } from '@/app/(app)/actions'
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives'
import { SearchInput } from '@/components/ui/search-input'
import { formatCurrency, formatDate } from '@/lib/format'

const stages = ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

function stageBadge(stage: string) {
  if (stage === 'won') return 'badge-success'
  if (stage === 'lost') return 'badge-danger'
  if (stage === 'proposal' || stage === 'negotiation') return 'badge-warning'
  return 'badge-dark'
}

export function OpportunitiesCrud({ opportunities, companies, contacts }: { opportunities: any[]; companies: any[]; contacts: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const items = useMemo(() => {
    return opportunities.filter((item) => {
      const text = `${item.title} ${item.companies?.name ?? ''} ${item.stage ?? ''}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesFilter = filter === 'all' ? true : item.stage === filter
      return matchesQuery && matchesFilter
    })
  }, [opportunities, query, filter])

  return (
    <div className="dual-panel">
      <div className="sticky-panel">
        <form id="new-opportunity" action={createOpportunity}>
          <FormCard title="Nuova opportunità" subtitle="Pipeline semplice, leggibile e pronta a diventare progetto.">
            <FormGrid>
              <Field label="Titolo"><input name="title" required style={inputStyle()} /></Field>
              <Field label="Azienda">
                <select name="company_id" required style={selectStyle()} defaultValue="">
                  <option value="" disabled>Seleziona</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </Field>
              <Field label="Contatto principale">
                <select name="primary_contact_id" style={selectStyle()} defaultValue="">
                  <option value="">Nessuno</option>
                  {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.first_name} {contact.last_name}</option>)}
                </select>
              </Field>
              <Field label="Fase">
                <select name="stage" defaultValue="new_lead" style={selectStyle()}>
                  {stages.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Valore stimato"><input name="value_estimate" type="number" step="0.01" style={inputStyle()} /></Field>
              <Field label="Probabilità"><input name="probability" type="number" min="0" max="100" style={inputStyle()} /></Field>
              <Field label="Chiusura prevista"><input name="expected_close_date" type="date" style={inputStyle()} /></Field>
              <Field label="Fonte"><input name="source" style={inputStyle()} /></Field>
              <Field label="Prossima azione"><input name="next_action" style={inputStyle()} /></Field>
              <Field label="Scadenza prossima azione"><input name="next_action_due_at" type="datetime-local" style={inputStyle()} /></Field>
            </FormGrid>
            <Field label="Descrizione"><textarea name="description" style={textareaStyle()} /></Field>
            <ActionBar><PrimaryButton>Salva opportunità</PrimaryButton></ActionBar>
          </FormCard>
        </form>
      </div>

      <section className="frost-card">
        <div className="section-heading">
          <div>
            <h2>Opportunità</h2>
            <p>Stato, valore e prossima azione senza il peso di un CRM vecchio stile.</p>
          </div>
          <div className="section-utility">{items.length} risultati</div>
        </div>

        <div className="search-row" style={{ marginBottom: 18 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per titolo, azienda o fase" />
          <div className="segmented">
            {['all', 'new_lead', 'proposal', 'negotiation', 'won'].map((item) => (
              <button key={item} type="button" data-active={filter === item} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutte' : item}
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
                  <div className="crm-meta">{item.companies?.name ?? 'Azienda non indicata'} · chiusura {formatDate(item.expected_close_date)}</div>
                  <div className="crm-tags">
                    <span className={`badge ${stageBadge(item.stage)}`}>{item.stage}</span>
                    <span className="badge">{formatCurrency(item.value_estimate)}</span>
                    {item.next_action ? <span className="badge">{item.next_action}</span> : null}
                  </div>
                </div>
                <Link className="button-secondary" href={`/opportunities/${item.id}`}>Apri scheda</Link>
              </div>
              <div className="crm-card-footer">
                <form action={updateOpportunityStage} className="inline-stack">
                  <input type="hidden" name="id" value={item.id} />
                  <select name="stage" defaultValue={item.stage} style={selectStyle()}>
                    {stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                  </select>
                  <PrimaryButton>Aggiorna</PrimaryButton>
                </form>
                <form action={deleteOpportunity}>
                  <input type="hidden" name="id" value={item.id} />
                  <InlineDangerButton>Elimina</InlineDangerButton>
                </form>
              </div>
            </article>
          ))}
          {!items.length ? <div className="empty-copy">Nessuna opportunità trovata per questo filtro.</div> : null}
        </div>
      </section>
    </div>
  )
}
