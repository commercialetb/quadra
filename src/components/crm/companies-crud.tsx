'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createCompany, deleteCompany, updateCompanyStatus } from '@/app/(app)/actions'
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives'
import { SearchInput } from '@/components/ui/search-input'

const companyStatuses = ['lead', 'prospect', 'client', 'partner', 'inactive']

function companyBadge(status: string) {
  if (status === 'client' || status === 'partner') return 'badge-success'
  if (status === 'inactive') return 'badge-danger'
  if (status === 'prospect') return 'badge-warning'
  return 'badge-dark'
}

export function CompaniesCrud({ companies }: { companies: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const items = useMemo(() => {
    return companies.filter((company) => {
      const text = `${company.name} ${company.city ?? ''} ${company.website ?? ''} ${company.status ?? ''}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesFilter = filter === 'all' ? true : company.status === filter
      return matchesQuery && matchesFilter
    })
  }, [companies, query, filter])

  return (
    <div className="dual-panel">
      <div className="sticky-panel">
        <form id="new-company" action={createCompany}>
          <FormCard title="Nuova azienda" subtitle="Scheda essenziale, pronta per crescere senza rumore visivo.">
            <FormGrid>
              <Field label="Nome azienda"><input name="name" required style={inputStyle()} /></Field>
              <Field label="Sito web"><input name="website" placeholder="https://" style={inputStyle()} /></Field>
              <Field label="Email"><input name="email" type="email" style={inputStyle()} /></Field>
              <Field label="Telefono"><input name="phone" style={inputStyle()} /></Field>
              <Field label="Città"><input name="city" style={inputStyle()} /></Field>
              <Field label="Provincia"><input name="province" style={inputStyle()} /></Field>
              <Field label="Stato">
                <select name="status" defaultValue="lead" style={selectStyle()}>
                  {companyStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
            </FormGrid>
            <Field label="Note sintetiche"><textarea name="notes_summary" style={textareaStyle()} /></Field>
            <ActionBar><PrimaryButton>Salva azienda</PrimaryButton></ActionBar>
          </FormCard>
        </form>
      </div>

      <section className="frost-card">
        <div className="section-heading">
          <div>
            <h2>Aziende</h2>
            <p>Una vista più calda e operativa: meno tabella, più contesto.</p>
          </div>
          <div className="section-utility">{items.length} risultati</div>
        </div>

        <div className="search-row" style={{ marginBottom: 18 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, città o stato" />
          <div className="segmented">
            {['all', 'lead', 'prospect', 'client'].map((item) => (
              <button key={item} type="button" data-active={filter === item} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutte' : item}
              </button>
            ))}
          </div>
        </div>

        <div className="crm-list-grid">
          {items.map((company) => (
            <article key={company.id} className="crm-card">
              <div className="crm-card-header">
                <div>
                  <div className="crm-title">{company.name}</div>
                  <div className="crm-meta">{[company.city, company.province].filter(Boolean).join(', ') || 'Località non indicata'}</div>
                  <div className="crm-tags">
                    <span className={`badge ${companyBadge(company.status)}`}>{company.status}</span>
                    {company.website ? <span className="badge">{company.website.replace(/^https?:\/\//, '')}</span> : null}
                  </div>
                </div>
                <Link className="button-secondary" href={`/companies/${company.id}`}>Apri scheda</Link>
              </div>

              <div className="crm-card-footer">
                <form action={updateCompanyStatus} className="inline-stack">
                  <input type="hidden" name="id" value={company.id} />
                  <select name="status" defaultValue={company.status} style={selectStyle()}>
                    {companyStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <PrimaryButton>Aggiorna</PrimaryButton>
                </form>
                <form action={deleteCompany}>
                  <input type="hidden" name="id" value={company.id} />
                  <InlineDangerButton>Elimina</InlineDangerButton>
                </form>
              </div>
            </article>
          ))}
          {!items.length ? <div className="empty-copy">Nessuna azienda trovata per questo filtro.</div> : null}
        </div>
      </section>
    </div>
  )
}
