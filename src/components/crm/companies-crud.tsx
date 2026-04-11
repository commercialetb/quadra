'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createCompany, deleteCompany, updateCompanyStatus } from '@/app/(app)/actions'
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives'
import { SearchInput } from '@/components/ui/search-input'
import { CompanyAvatar } from '@/components/ui/company-avatar'

const companyStatuses = ['lead', 'prospect', 'client', 'partner', 'inactive']

function companyBadge(status: string) {
  if (status === 'client') return 'badge-success'
  if (status === 'partner') return 'badge-violet'
  if (status === 'inactive') return 'badge-danger'
  if (status === 'prospect') return 'badge-warning'
  return 'badge-dark'
}

function statusLabel(status: string) {
  return status.replace('_', ' ')
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
    <div className="dual-panel dual-panel-elevated">
      <div className="sticky-panel">
        <form id="new-company" action={createCompany}>
          <FormCard title="Nuova azienda" subtitle="Scheda essenziale, più bella da compilare e pronta a mostrare un logo automatico dal sito web.">
            <FormGrid>
              <Field label="Nome azienda"><input name="name" required style={inputStyle()} /></Field>
              <Field label="Sito web"><input name="website" placeholder="https://azienda.it" style={inputStyle()} /></Field>
              <Field label="Email"><input name="email" type="email" style={inputStyle()} /></Field>
              <Field label="Telefono"><input name="phone" style={inputStyle()} /></Field>
              <Field label="Città"><input name="city" style={inputStyle()} /></Field>
              <Field label="Provincia"><input name="province" style={inputStyle()} /></Field>
              <Field label="Stato">
                <select name="status" defaultValue="lead" style={selectStyle()}>
                  {companyStatuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
                </select>
              </Field>
            </FormGrid>
            <Field label="Note sintetiche"><textarea name="notes_summary" style={textareaStyle()} /></Field>
            <ActionBar><PrimaryButton>Salva azienda</PrimaryButton></ActionBar>
          </FormCard>
        </form>
      </div>

      <section className="frost-card crm-surface">
        <div className="section-heading">
          <div>
            <h2>Aziende</h2>
            <p>Più contesto, più gerarchia visiva, meno effetto gestionale grezzo.</p>
          </div>
          <div className="section-utility">{items.length} risultati</div>
        </div>

        <div className="search-row search-row-stacked" style={{ marginBottom: 18 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, città o stato" />
          <div className="segmented segmented-wrap">
            {['all', 'lead', 'prospect', 'client', 'partner'].map((item) => (
              <button key={item} type="button" data-active={filter === item} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutte' : statusLabel(item)}
              </button>
            ))}
          </div>
        </div>

        <div className="crm-list-grid crm-list-grid-spacious">
          {items.map((company) => (
            <article key={company.id} className="crm-card crm-card-polished">
              <div className="crm-card-shell">
                <div className="crm-card-main">
                  <div className="crm-card-identity">
                    <CompanyAvatar name={company.name} website={company.website} size="lg" />
                    <div>
                      <div className="crm-title-row">
                        <div className="crm-title">{company.name}</div>
                        <span className={`badge ${companyBadge(company.status)}`}>{statusLabel(company.status)}</span>
                      </div>
                      <div className="crm-meta">{[company.city, company.province].filter(Boolean).join(', ') || 'Località non indicata'}</div>
                      <div className="crm-submeta">{company.website ? company.website.replace(/^https?:\/\//, '') : 'Sito non indicato'}</div>
                    </div>
                  </div>

                  <div className="crm-chip-row">
                    {company.email ? <span className="badge">{company.email}</span> : null}
                    {company.phone ? <span className="badge badge-soft">{company.phone}</span> : null}
                  </div>
                </div>

                <div className="crm-card-side">
                  <Link className="button-secondary button-tight" href={`/companies/${company.id}`}>Apri scheda</Link>
                  <form action={deleteCompany}>
                    <input type="hidden" name="id" value={company.id} />
                    <InlineDangerButton>Elimina</InlineDangerButton>
                  </form>
                </div>
              </div>

              <div className="crm-card-toolbar">
                <form action={updateCompanyStatus} className="inline-stack inline-stack-polished">
                  <input type="hidden" name="id" value={company.id} />
                  <label className="mini-field">
                    <span>Stato</span>
                    <select name="status" defaultValue={company.status} style={selectStyle()}>
                      {companyStatuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
                    </select>
                  </label>
                  <PrimaryButton>Aggiorna</PrimaryButton>
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
