'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createCompany, deleteCompany, updateCompanyStatus } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { CompanyAvatar } from '@/components/ui/company-avatar'
import { ConfirmDangerButton, PendingSubmitButton } from '@/components/ui/form-actions'

const companyStatuses = ['lead', 'prospect', 'client', 'partner', 'inactive'] as const
const companyStatusLabel: Record<string, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  client: 'Cliente',
  partner: 'Partner',
  inactive: 'Inattiva',
}

function sanitizeWebsite(url?: string | null) {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function badgeTone(status?: string) {
  if (status === 'client' || status === 'partner') return 'success'
  if (status === 'prospect') return 'warning'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}

export function CompaniesCrud({ companies }: { companies: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)

  const items = useMemo(() => {
    return companies.filter((company) => {
      const text = `${company.name} ${company.city ?? ''} ${company.website ?? ''} ${company.status ?? ''}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesFilter = filter === 'all' ? true : company.status === filter
      return matchesQuery && matchesFilter
    })
  }, [companies, query, filter])

  return (
    <>
      <section className="panel-card page-section-card">
        <div className="list-head">
          <div>
            <h2>Aziende</h2>
            <p>Lista pulita, riconoscibile e rapida da scorrere.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
            + Nuova azienda
          </button>
        </div>

        <div className="toolbar-row">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, città o stato" />
          <div className="segmented-control">
            {['all', 'lead', 'prospect', 'client', 'partner'].map((item) => (
              <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutte' : companyStatusLabel[item] ?? item}
              </button>
            ))}
          </div>
        </div>

        <div className="cards-stack">
          {items.map((company) => (
            <article key={company.id} className="entity-card">
              <div className="entity-card-main">
                <CompanyAvatar name={company.name} website={company.website} />
                <div className="entity-card-copy">
                  <div className="entity-card-top">
                    <div>
                      <h3>{company.name}</h3>
                      <p>{[company.city, company.province].filter(Boolean).join(', ') || 'Località non indicata'}</p>
                    </div>
                    <span className={`tone-badge ${badgeTone(company.status)}`}>{companyStatusLabel[company.status] ?? company.status}</span>
                  </div>
                  <div className="entity-inline-meta wrap">
                    {company.website ? (
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer">
                        {sanitizeWebsite(company.website)}
                      </a>
                    ) : (
                      <span>Sito non indicato</span>
                    )}
                    {company.email ? <span>{company.email}</span> : null}
                  </div>
                </div>
              </div>

              <div className="entity-card-actions">
                <Link href={`/companies/${company.id}`} className="secondary-button">Apri</Link>
                <form action={updateCompanyStatus} className="inline-mini-form">
                  <input type="hidden" name="id" value={company.id} />
                  <select name="status" defaultValue={company.status} className="field-control compact-control">
                    {companyStatuses.map((item) => (
                      <option key={item} value={item}>{companyStatusLabel[item] ?? item}</option>
                    ))}
                  </select>
                  <PendingSubmitButton />
                </form>
                <form action={deleteCompany}>
                  <input type="hidden" name="id" value={company.id} />
                  <ConfirmDangerButton confirmMessage={`Eliminare davvero ${company.name}?`} />
                </form>
              </div>
            </article>
          ))}
          {!items.length ? <div className="empty-state-box">Nessuna azienda trovata con questi filtri.</div> : null}
        </div>
      </section>

      {showCreate ? (
        <div className="overlay-shell" role="dialog" aria-modal="true">
          <div className="overlay-backdrop" onClick={() => setShowCreate(false)} />
          <div className="sheet-card">
            <div className="sheet-head">
              <div>
                <p className="page-eyebrow">Quick add</p>
                <h3>Nuova azienda</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setShowCreate(false)}>Chiudi</button>
            </div>
            <form action={createCompany} className="sheet-form">
              <div className="form-grid two-col">
                <label className="field-stack"><span>Nome azienda</span><input className="field-control" name="name" required /></label>
                <label className="field-stack"><span>Sito web</span><input className="field-control" name="website" placeholder="https://" /></label>
                <label className="field-stack"><span>Email</span><input className="field-control" name="email" type="email" /></label>
                <label className="field-stack"><span>Telefono</span><input className="field-control" name="phone" /></label>
                <label className="field-stack"><span>Città</span><input className="field-control" name="city" /></label>
                <label className="field-stack"><span>Provincia</span><input className="field-control" name="province" /></label>
                <label className="field-stack"><span>Stato</span><select className="field-control" name="status" defaultValue="lead">{companyStatuses.map((item) => <option key={item} value={item}>{companyStatusLabel[item] ?? item}</option>)}</select></label>
              </div>
              <label className="field-stack"><span>Note</span><textarea className="field-control field-area" name="notes_summary" /></label>
              <div className="sheet-actions">
                <button className="secondary-button" type="button" onClick={() => setShowCreate(false)}>Annulla</button>
                <PendingSubmitButton className="primary-button" idleLabel="Salva azienda" />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
