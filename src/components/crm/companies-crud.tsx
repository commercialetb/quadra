'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createCompany, deleteCompany, updateCompanyStatus } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { CompanyAvatar } from '@/components/ui/company-avatar'

const companyStatuses = ['lead', 'prospect', 'client', 'partner', 'inactive']

function companyBadge(status: string) {
  if (status === 'client' || status === 'partner') return 'badge-success'
  if (status === 'inactive') return 'badge-danger'
  if (status === 'prospect') return 'badge-warning'
  return 'badge-accent'
}

function cleanWebsite(url?: string | null) {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export function CompaniesCrud({ companies }: { companies: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)

  const items = useMemo(() => {
    return companies.filter((company) => {
      const hay = `${company.name} ${company.city || ''} ${company.website || ''} ${company.status || ''}`.toLowerCase()
      return hay.includes(query.toLowerCase()) && (filter === 'all' || company.status === filter)
    })
  }, [companies, query, filter])

  return (
    <>
      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">Aziende</h2>
            <p className="section-copy">Lista pulita, card leggibili e creazione solo quando serve.</p>
          </div>
          <div className="section-actions">
            <button type="button" className="button-primary" onClick={() => setOpen(true)}>+ Nuova azienda</button>
          </div>
        </div>

        <div className="entity-toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, città o stato" />
          <div className="segmented">
            {['all', 'lead', 'prospect', 'client', 'partner'].map((item) => (
              <button key={item} type="button" data-active={filter === item} onClick={() => setFilter(item)}>
                {item === 'all' ? 'Tutte' : item}
              </button>
            ))}
          </div>
        </div>

        <div className="entity-list">
          {items.map((company) => (
            <article key={company.id} className="entity-card">
              <div className="entity-head">
                <div className="entity-identity">
                  <CompanyAvatar name={company.name} website={company.website} />
                  <div className="entity-copy">
                    <div className="badge-row">
                      <span className={`badge ${companyBadge(company.status)}`}>{company.status}</span>
                    </div>
                    <h3 className="entity-title">{company.name}</h3>
                    <p className="entity-subtitle">{[company.city, company.province].filter(Boolean).join(', ') || 'Località non indicata'}</p>
                    <div className="entity-summary">
                      {company.website ? <a className="entity-link" href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer">{cleanWebsite(company.website)}</a> : <span className="badge badge-soft">Sito non indicato</span>}
                      {company.email ? <span className="badge badge-soft">{company.email}</span> : null}
                      {company.phone ? <span className="badge badge-soft">{company.phone}</span> : null}
                    </div>
                  </div>
                </div>
                <div className="entity-actions">
                  <Link className="button-secondary" href={`/companies/${company.id}`}>Apri</Link>
                </div>
              </div>

              <details className="entity-details">
                <summary className="details-toggle">Gestisci azienda <span>+</span></summary>
                <div className="editor-grid">
                  <form action={updateCompanyStatus} className="actions-row" style={{ gridColumn: '1 / -1' }}>
                    <input type="hidden" name="id" value={company.id} />
                    <label className="field-label" style={{ minWidth: 220 }}>
                      <span>Stato</span>
                      <select name="status" defaultValue={company.status}>
                        {companyStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                    <button className="button-primary" type="submit">Aggiorna stato</button>
                  </form>
                  <form action={deleteCompany} className="actions-row" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
                    <input type="hidden" name="id" value={company.id} />
                    <button className="button-danger" type="submit">Elimina</button>
                  </form>
                </div>
              </details>
            </article>
          ))}
          {!items.length ? <div className="empty-state">Nessuna azienda trovata con questi filtri.</div> : null}
        </div>
      </section>

      {open ? (
        <div className="modal-layer" onClick={() => setOpen(false)}>
          <form id="new-company" action={createCompany} className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3 className="modal-title">Nuova azienda</h3>
                <p className="modal-copy">Inserisci solo l’essenziale. Il resto lo arricchiamo dopo.</p>
              </div>
              <button type="button" className="button-ghost" onClick={() => setOpen(false)}>Chiudi</button>
            </div>
            <div className="modal-grid">
              <label className="field-label"><span>Nome azienda</span><input name="name" required /></label>
              <label className="field-label"><span>Sito web</span><input name="website" placeholder="https://" /></label>
              <label className="field-label"><span>Email</span><input name="email" type="email" /></label>
              <label className="field-label"><span>Telefono</span><input name="phone" /></label>
              <label className="field-label"><span>Città</span><input name="city" /></label>
              <label className="field-label"><span>Provincia</span><input name="province" /></label>
              <label className="field-label"><span>Stato</span>
                <select name="status" defaultValue="lead">{companyStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              </label>
              <label className="field-label" style={{ gridColumn: '1 / -1' }}><span>Note sintetiche</span><textarea name="notes_summary" /></label>
            </div>
            <div className="modal-footer">
              <button type="button" className="button-ghost" onClick={() => setOpen(false)}>Annulla</button>
              <button type="submit" className="button-primary">Salva azienda</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}
