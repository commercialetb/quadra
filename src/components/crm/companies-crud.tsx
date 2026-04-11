'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createCompany, deleteCompany, updateCompanyStatus } from '@/app/(app)/actions'
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives'
import { SearchInput } from '@/components/ui/search-input'
import { CompanyAvatar } from '@/components/ui/company-avatar'

const companyStatuses = ['lead', 'prospect', 'client', 'partner', 'inactive']

function companyBadge(status: string) {
  if (status === 'client' || status === 'partner') return 'badge-success'
  if (status === 'inactive') return 'badge-danger'
  if (status === 'prospect') return 'badge-warning'
  return 'badge-dark'
}

function sanitizeWebsite(url?: string | null) {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
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
    <div className="dual-panel polished-dual-panel">
      <div className="sticky-panel">
        <form id="new-company" action={createCompany}>
          <FormCard title="Nuova azienda" subtitle="Scheda essenziale, più chiara e pronta a crescere senza rumore.">
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

      <section className="frost-card polished-list-shell">
        <div className="section-heading">
          <div>
            <h2>Aziende</h2>
            <p>Più riconoscibili, più leggibili, meno sensazione da mini-form ripetuta.</p>
          </div>
          <div className="section-utility">{items.length} risultati</div>
        </div>

        <div className="search-row" style={{ marginBottom: 18 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, città o stato" />
          <div className="segmented">
            {['all', 'lead', 'prospect', 'client', 'partner'].map((item) => (
              <button key={item} type="button" data-active={filter === item} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutte' : item}
              </button>
            ))}
          </div>
        </div>

        <div className="company-list-v2">
          {items.map((company) => (
            <article key={company.id} className="entity-card-v2 company-card-v2">
              <div className="entity-main-row">
                <div className="entity-identity">
                  <CompanyAvatar name={company.name} website={company.website} />
                  <div className="entity-copy">
                    <div className="entity-title-row">
                      <div className="entity-title-block">
                        <div className="entity-title">{company.name}</div>
                        <div className="entity-subtitle">{[company.city, company.province].filter(Boolean).join(', ') || 'Località non indicata'}</div>
                      </div>
                      <span className={`badge ${companyBadge(company.status)}`}>{company.status}</span>
                    </div>
                    <div className="entity-meta-row">
                      {company.website ? <a className="entity-link" href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer">{sanitizeWebsite(company.website)}</a> : <span className="entity-muted">Sito non indicato</span>}
                      {company.email ? <span className="entity-muted">{company.email}</span> : null}
                    </div>
                  </div>
                </div>
                <div className="entity-actions-top">
                  <Link className="button-secondary" href={`/companies/${company.id}`}>Apri scheda</Link>
                </div>
              </div>

              <div className="entity-bottom-row">
                <form action={updateCompanyStatus} className="status-inline-form">
                  <input type="hidden" name="id" value={company.id} />
                  <div className="compact-label">Stato</div>
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
