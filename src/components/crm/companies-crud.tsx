'use client'

import Link from 'next/link'
import { useActionState, useEffect, useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  createCompany,
  deleteCompany,
  updateCompanyStatus,
  updateCompanyDetailsAction,
} from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { CompanyAvatar } from '@/components/ui/company-avatar'
import { COMPANY_INDUSTRY_OPTIONS } from '@/lib/crm-options'
import { labelize } from '@/lib/crm-labels'

type EditFormState = {
  ok: boolean
  message?: string
}

const companyStatuses = ['lead', 'prospect', 'client', 'partner', 'inactive']

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

function SaveButton({ idleLabel = 'Salva' }: { idleLabel?: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="ghost-button save-button" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Salvataggio...' : idleLabel}
    </button>
  )
}

export function CompaniesCrud({ companies }: { companies: any[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editingCompany, setEditingCompany] = useState<any | null>(null)

  const [editState, editFormAction] = useActionState<EditFormState, FormData>(
    updateCompanyDetailsAction,
    { ok: false, message: '' },
  )

  useEffect(() => {
    if (editState.ok) {
      setEditingCompany(null)
    }
  }, [editState.ok])

  const items = useMemo(() => {
    return companies.filter((company) => {
      const text = `${company.name} ${company.city ?? ''} ${company.website ?? ''} ${
        company.status ?? ''
      } ${company.industry ?? ''}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesFilter = filter === 'all' ? true : company.status === filter
      const matchesIndustry = industryFilter === 'all' ? true : company.industry === industryFilter
      return matchesQuery && matchesFilter && matchesIndustry
    })
  }, [companies, filter, industryFilter, query])

  const visibleItems = items.slice(0, 5)
  const hiddenItems = items.slice(5)

  const totalCount = items.length
  const clientCount = items.filter((company) => company.status === 'client').length
  const prospectCount = items.filter((company) => company.status === 'prospect').length
  const partnerCount = items.filter((company) => company.status === 'partner').length

  return (
    <>
      <section className="panel-card page-section-card crm-entity-panel crm-entity-panel-companies crm-v3-panel quiet-card">
        <div className="list-head">
          <div>
            <p className="page-eyebrow">Aziende</p>
            <h2>Account chiari, non schede rumorose</h2>
            <p>
              Qui devi capire subito chi è cliente, chi è da coltivare e quale account vale la pena
              aprire adesso.
            </p>
          </div>
          <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
            + Nuova azienda
          </button>
        </div>

        <div className="entity-summary-row entity-summary-row-v3" aria-label="Panoramica aziende">
          <div className="entity-summary-pill">
            <span>Totale</span>
            <strong>{totalCount}</strong>
          </div>
          <div className="entity-summary-pill">
            <span>Clienti</span>
            <strong>{clientCount}</strong>
          </div>
          <div className="entity-summary-pill">
            <span>Prospect</span>
            <strong>{prospectCount}</strong>
          </div>
          <div className="entity-summary-pill">
            <span>Partner</span>
            <strong>{partnerCount}</strong>
          </div>
        </div>

        <section className="crm-focus-strip" aria-label="Lettura rapida aziende">
          <article className="crm-focus-card is-primary quiet-card">
            <span>Chi aprire</span>
            <strong>{items[0]?.name || 'Nessuna azienda filtrata'}</strong>
            <p>
              {items[0]
                ? `${labelize(items[0].status)} · ${items[0].city || 'località non indicata'}`
                : 'Cambia ricerca o filtri per trovare un account da presidiare.'}
            </p>
          </article>
          <article className="crm-focus-card quiet-card">
            <span>Cosa stai guardando</span>
            <strong>{filter === 'all' ? 'Tutti gli stati' : labelize(filter)}</strong>
            <p>{industryFilter === 'all' ? 'Nessun settore filtrato' : industryFilter}</p>
          </article>
          <article className="crm-focus-card quiet-card">
            <span>Perché conta</span>
            <strong>{clientCount > prospectCount ? 'Presidio clienti' : 'Spinta prospect'}</strong>
            <p>
              {clientCount > prospectCount
                ? 'In questo set prevalgono aziende già calde o attive.'
                : 'Qui c’è più lavoro commerciale da attivare.'}
            </p>
          </article>
        </section>

        <div className="toolbar-row toolbar-row-v3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Cerca per nome, città, sito o settore"
          />
          <div className="toolbar-row-inline">
            <div className="segmented-control">
              {['all', 'lead', 'prospect', 'client', 'partner'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={filter === item ? 'is-active' : ''}
                  onClick={() => setFilter(item)}
                >
                  {item === 'all' ? 'Tutte' : labelize(item)}
                </button>
              ))}
            </div>
            <select
              className="field-control toolbar-select"
              value={industryFilter}
              onChange={(event) => setIndustryFilter(event.target.value)}
            >
              <option value="all">Tutti i settori</option>
              {COMPANY_INDUSTRY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="cards-stack cards-stack-v3">
          {visibleItems.map((company) => (
            <article
              key={company.id}
              className="entity-card entity-card-v3 company-card-v3 quiet-card"
            >
              <Link
                href={`/companies/${company.id}`}
                className="entity-card-main entity-card-main-link quiet-card"
              >
                <CompanyAvatar name={company.name} website={company.website} />
                <div className="entity-card-copy stretch">
                  <div className="entity-card-top">
                    <div>
                      <h3>{company.name}</h3>
                      <p>
                        {[company.city, company.province].filter(Boolean).join(', ') ||
                          'Località non indicata'}
                      </p>
                    </div>
                    <span className={`tone-badge ${badgeTone(company.status)}`}>
                      {labelize(company.status)}
                    </span>
                  </div>

                  <div className="entity-glance-grid">
                    <div className="entity-glance-item">
                      <span>Sito</span>
                      <strong>
                        {company.website ? sanitizeWebsite(company.website) : 'Non indicato'}
                      </strong>
                    </div>
                    <div className="entity-glance-item">
                      <span>Settore</span>
                      <strong>{company.industry || 'Non indicato'}</strong>
                    </div>
                    <div className="entity-glance-item">
                      <span>Email</span>
                      <strong>{company.email || 'Non indicata'}</strong>
                    </div>
                    <div className="entity-glance-item">
                      <span>Telefono</span>
                      <strong>{company.phone || 'Non indicato'}</strong>
                    </div>
                  </div>
                </div>
              </Link>

              <details className="entity-more-details">
                <summary>Altri dettagli</summary>
                <div className="entity-inline-meta wrap">
                  {company.address_line1 ? (
                    <span>{company.address_line1}</span>
                  ) : (
                    <span>Indirizzo non indicato</span>
                  )}
                  {company.vat_number ? <span>P.IVA {company.vat_number}</span> : null}
                  {company.notes_summary ? <span>{company.notes_summary}</span> : null}
                </div>
              </details>

              <div className="entity-card-actions cleaner-actions">
                <Link href={`/companies/${company.id}`} className="secondary-button">
                  Apri scheda
                </Link>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setEditingCompany(company)}
                >
                  Modifica
                </button>
                <form action={updateCompanyStatus} className="inline-mini-form compact-inline-form">
                  <input type="hidden" name="id" value={company.id} />
                  <select
                    name="status"
                    defaultValue={company.status}
                    className="field-control compact-control"
                  >
                    {companyStatuses.map((item) => (
                      <option key={item} value={item}>
                        {labelize(item)}
                      </option>
                    ))}
                  </select>
                  <SaveButton idleLabel="Aggiorna" />
                </form>
                <form action={deleteCompany}>
                  <input type="hidden" name="id" value={company.id} />
                  <button className="ghost-button danger-ghost" type="submit">
                    Elimina
                  </button>
                </form>
              </div>
            </article>
          ))}
          {!items.length ? (
            <div className="empty-state-box">Nessuna azienda trovata con questi filtri.</div>
          ) : null}
        </div>

        {hiddenItems.length ? (
          <details className="crm-more-details">
            <summary>Apri altre {hiddenItems.length} voci</summary>
            <div className="cards-stack cards-stack-v3 crm-more-stack">
              {hiddenItems.map((company) => (
                <article
                  key={company.id}
                  className="entity-card entity-card-v3 company-card-v3 quiet-card"
                >
                  <Link
                    href={`/companies/${company.id}`}
                    className="entity-card-main entity-card-main-link quiet-card"
                  >
                    <CompanyAvatar name={company.name} website={company.website} />
                    <div className="entity-card-copy stretch">
                      <div className="entity-card-top">
                        <div>
                          <h3>{company.name}</h3>
                          <p>
                            {[company.city, company.province].filter(Boolean).join(', ') ||
                              'Località non indicata'}
                          </p>
                        </div>
                        <span className={`tone-badge ${badgeTone(company.status)}`}>
                          {labelize(company.status)}
                        </span>
                      </div>

                      <div className="entity-glance-grid">
                        <div className="entity-glance-item">
                          <span>Sito</span>
                          <strong>
                            {company.website ? sanitizeWebsite(company.website) : 'Non indicato'}
                          </strong>
                        </div>
                        <div className="entity-glance-item">
                          <span>Settore</span>
                          <strong>{company.industry || 'Non indicato'}</strong>
                        </div>
                        <div className="entity-glance-item">
                          <span>Email</span>
                          <strong>{company.email || 'Non indicata'}</strong>
                        </div>
                        <div className="entity-glance-item">
                          <span>Telefono</span>
                          <strong>{company.phone || 'Non indicato'}</strong>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <details className="entity-more-details">
                    <summary>Altri dettagli</summary>
                    <div className="entity-inline-meta wrap">
                      {company.address_line1 ? (
                        <span>{company.address_line1}</span>
                      ) : (
                        <span>Indirizzo non indicato</span>
                      )}
                      {company.vat_number ? <span>P.IVA {company.vat_number}</span> : null}
                      {company.notes_summary ? <span>{company.notes_summary}</span> : null}
                    </div>
                  </details>

                  <div className="entity-card-actions cleaner-actions">
                    <Link href={`/companies/${company.id}`} className="secondary-button">
                      Apri scheda
                    </Link>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => setEditingCompany(company)}
                    >
                      Modifica
                    </button>
                    <form
                      action={updateCompanyStatus}
                      className="inline-mini-form compact-inline-form"
                    >
                      <input type="hidden" name="id" value={company.id} />
                      <select
                        name="status"
                        defaultValue={company.status}
                        className="field-control compact-control"
                      >
                        {companyStatuses.map((item) => (
                          <option key={item} value={item}>
                            {labelize(item)}
                          </option>
                        ))}
                      </select>
                      <SaveButton idleLabel="Aggiorna" />
                    </form>
                    <form action={deleteCompany}>
                      <input type="hidden" name="id" value={company.id} />
                      <button className="ghost-button danger-ghost" type="submit">
                        Elimina
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </details>
        ) : null}
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
              <button className="ghost-button" type="button" onClick={() => setShowCreate(false)}>
                Chiudi
              </button>
            </div>
            <form action={createCompany} className="sheet-form">
              <div className="form-grid two-col">
                <label className="field-stack">
                  <span>Nome azienda</span>
                  <input className="field-control" name="name" required />
                </label>
                <label className="field-stack">
                  <span>Settore</span>
                  <select className="field-control" name="industry" defaultValue="">
                    <option value="">Seleziona</option>
                    {COMPANY_INDUSTRY_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-stack">
                  <span>Stato</span>
                  <select className="field-control" name="status" defaultValue="lead">
                    {companyStatuses.map((item) => (
                      <option key={item} value={item}>
                        {labelize(item)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-stack">
                  <span>Città</span>
                  <input className="field-control" name="city" />
                </label>
                <label className="field-stack">
                  <span>Sito</span>
                  <input className="field-control" name="website" />
                </label>
                <label className="field-stack">
                  <span>Email</span>
                  <input className="field-control" name="email" type="email" />
                </label>
                <label className="field-stack">
                  <span>Telefono</span>
                  <input className="field-control" name="phone" />
                </label>
                <label className="field-stack">
                  <span>Indirizzo</span>
                  <input className="field-control" name="address_line1" />
                </label>
              </div>
              <label className="field-stack">
                <span>Note</span>
                <textarea className="field-control field-area" name="notes_summary" />
              </label>
              <div className="sheet-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setShowCreate(false)}
                >
                  Annulla
                </button>
                <SaveButton idleLabel="Salva azienda" />
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingCompany ? (
        <div className="overlay-shell" role="dialog" aria-modal="true">
          <div className="overlay-backdrop" onClick={() => setEditingCompany(null)} />
          <div className="sheet-card">
            <div className="sheet-head">
              <div>
                <p className="page-eyebrow">Modifica</p>
                <h3>{editingCompany.name || 'Modifica azienda'}</h3>
              </div>
              <button
                className="ghost-button"
                type="button"
                onClick={() => setEditingCompany(null)}
              >
                Chiudi
              </button>
            </div>

            {editState.message ? (
              <div className={editState.ok ? 'notice-success' : 'notice-error'}>
                {editState.message}
              </div>
            ) : null}

            <form action={editFormAction} className="sheet-form">
              <input type="hidden" name="id" value={editingCompany.id} />
              <div className="form-grid two-col">
                <label className="field-stack">
                  <span>Nome azienda</span>
                  <input
                    className="field-control"
                    name="name"
                    defaultValue={editingCompany.name ?? ''}
                    required
                  />
                </label>
                <label className="field-stack">
                  <span>Ragione sociale</span>
                  <input
                    className="field-control"
                    name="legal_name"
                    defaultValue={editingCompany.legal_name ?? ''}
                  />
                </label>
                <label className="field-stack">
                  <span>Sito web</span>
                  <input
                    className="field-control"
                    name="website"
                    defaultValue={editingCompany.website ?? ''}
                  />
                </label>
                <label className="field-stack">
                  <span>Email</span>
                  <input
                    className="field-control"
                    name="email"
                    type="email"
                    defaultValue={editingCompany.email ?? ''}
                  />
                </label>
                <label className="field-stack">
                  <span>Telefono</span>
                  <input
                    className="field-control"
                    name="phone"
                    defaultValue={editingCompany.phone ?? ''}
                  />
                </label>
                <label className="field-stack">
                  <span>Indirizzo</span>
                  <input
                    className="field-control"
                    name="address_line1"
                    defaultValue={editingCompany.address_line1 ?? ''}
                  />
                </label>
                <label className="field-stack">
                  <span>Città</span>
                  <input
                    className="field-control"
                    name="city"
                    defaultValue={editingCompany.city ?? ''}
                  />
                </label>
                <label className="field-stack">
                  <span>Provincia</span>
                  <input
                    className="field-control"
                    name="province"
                    defaultValue={editingCompany.province ?? ''}
                  />
                </label>
                <label className="field-stack">
                  <span>Settore</span>
                  <select
                    className="field-control"
                    name="industry"
                    defaultValue={editingCompany.industry ?? ''}
                  >
                    <option value="">Seleziona</option>
                    {COMPANY_INDUSTRY_OPTIONS.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-stack">
                  <span>Stato</span>
                  <select
                    className="field-control"
                    name="status"
                    defaultValue={editingCompany.status ?? 'lead'}
                  >
                    {companyStatuses.map((item) => (
                      <option key={item} value={item}>
                        {labelize(item)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field-stack">
                <span>Note</span>
                <textarea
                  className="field-control field-area"
                  name="notes_summary"
                  defaultValue={editingCompany.notes_summary ?? ''}
                />
              </label>
              <div className="sheet-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setEditingCompany(null)}
                >
                  Annulla
                </button>
                <SaveButton idleLabel="Salva modifiche" />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
