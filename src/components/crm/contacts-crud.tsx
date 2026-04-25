'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createContact, deleteContact, updateContact } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { ContactAvatar } from '@/components/ui/contact-avatar'
import { CONTACT_METHOD_OPTIONS } from '@/lib/crm-options'
import { labelize } from '@/lib/crm-labels'

function preferredChannel(contact: any) {
  if (contact.preferred_contact_method) return labelize(contact.preferred_contact_method)
  if (contact.whatsapp) return 'WhatsApp'
  if (contact.email) return 'Email'
  if (contact.phone) return 'Telefono'
  return 'Da definire'
}

function bestReach(contact: any) {
  return contact.whatsapp || contact.email || contact.phone || 'Recapito non indicato'
}

export function ContactsCrud({ contacts, companies }: { contacts: any[]; companies: any[] }) {
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [companyFilter, setCompanyFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  const sortedCompanies = useMemo(
    () => [...companies].sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })),
    [companies],
  )

  const items = useMemo(() => {
    return contacts.filter((contact) => {
      const text = `${contact.first_name} ${contact.last_name} ${contact.role ?? ''} ${contact.email ?? ''} ${contact.phone ?? ''} ${contact.whatsapp ?? ''} ${contact.companies?.name ?? ''}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesCompany = companyFilter === 'all' ? true : contact.company_id === companyFilter
      const channel = (contact.preferred_contact_method || (contact.whatsapp ? 'whatsapp' : contact.email ? 'email' : contact.phone ? 'phone' : '')).toLowerCase()
      const matchesMethod = methodFilter === 'all' ? true : channel === methodFilter
      return matchesQuery && matchesCompany && matchesMethod
    })
  }, [companyFilter, contacts, methodFilter, query])

  const visibleItems = items.slice(0, 5)
  const hiddenItems = items.slice(5)

  const linkedCount = items.filter((contact) => contact.companies?.name).length
  const emailCount = items.filter((contact) => contact.email).length
  const whatsappCount = items.filter((contact) => contact.whatsapp).length
  const readyToReachCount = items.filter((contact) => contact.email || contact.whatsapp || contact.phone).length
  const topContact = items.find((contact) => contact.email || contact.whatsapp || contact.phone)

  return (
    <>
      <section className="panel-card page-section-card crm-entity-panel crm-entity-panel-contacts crm-v4-panel quiet-card">
        <div className="list-head">
          <div>
            <p className="page-eyebrow">Contatti</p>
            <h2>Rubrica utile, non lunga da scorrere</h2>
            <p>Devi capire subito chi sentire, con quale canale e dentro quale azienda si muove la relazione.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
            + Nuovo contatto
          </button>
        </div>

        <div className="entity-summary-row entity-summary-row-v3" aria-label="Panoramica contatti">
          <div className="entity-summary-pill"><span>Totale</span><strong>{items.length}</strong></div>
          <div className="entity-summary-pill"><span>Con azienda</span><strong>{linkedCount}</strong></div>
          <div className="entity-summary-pill"><span>Contattabili</span><strong>{readyToReachCount}</strong></div>
          <div className="entity-summary-pill"><span>WhatsApp</span><strong>{whatsappCount}</strong></div>
        </div>

        <section className="crm-focus-strip" aria-label="Lettura rapida contatti">
          <article className="crm-focus-card is-primary quiet-card">
            <span>Chi sentire</span>
            <strong>{topContact ? `${topContact.first_name} ${topContact.last_name}` : 'Nessun contatto pronto'}</strong>
            <p>{topContact ? `${preferredChannel(topContact)} · ${topContact.companies?.name || 'Azienda non assegnata'}` : 'Aggiungi almeno un recapito utile per rendere la rubrica operativa.'}</p>
          </article>
          <article className="crm-focus-card quiet-card">
            <span>Canale prevalente</span>
            <strong>{whatsappCount >= emailCount ? 'WhatsApp' : 'Email'}</strong>
            <p>{whatsappCount >= emailCount ? 'Ideale per riattivazioni rapide e uso quotidiano.' : 'Buono per recap, proposte e contatti più formali.'}</p>
          </article>
          <article className="crm-focus-card quiet-card">
            <span>Perché conta</span>
            <strong>{linkedCount === items.length && items.length ? 'Relazioni ordinate' : 'Da collegare meglio'}</strong>
            <p>{linkedCount === items.length && items.length ? 'Quasi tutti i contatti hanno già un contesto aziendale chiaro.' : 'Collegare i contatti alle aziende rende la scheda più leggibile e azionabile.'}</p>
          </article>
        </section>

        <div className="toolbar-row toolbar-row-v3">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, azienda, ruolo o recapito" />
          <div className="toolbar-row-inline toolbar-row-inline-double">
            <select className="field-control toolbar-select" value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)}>
              <option value="all">Tutte le aziende</option>
              {sortedCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
            <select className="field-control toolbar-select" value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
              <option value="all">Tutti i canali</option>
              {CONTACT_METHOD_OPTIONS.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
              <option value="phone">Telefono</option>
            </select>
          </div>
        </div>

        <div className="cards-stack cards-stack-v3">
          {visibleItems.map((contact) => (
            <article key={contact.id} className="entity-card entity-card-contact entity-card-v3 quiet-card">
              <Link href={`/contacts/${contact.id}`} className="entity-card-main entity-card-main-link quiet-card">
                <ContactAvatar firstName={contact.first_name} lastName={contact.last_name} />
                <div className="entity-card-copy stretch">
                  <div className="entity-card-top compact-gap">
                    <div>
                      <h3>{contact.first_name} {contact.last_name}</h3>
                      <p>{contact.role || 'Ruolo non indicato'} · {contact.companies?.name || 'Nessuna azienda'}</p>
                    </div>
                    <span className="tone-badge neutral">{preferredChannel(contact)}</span>
                  </div>
                  <div className="entity-glance-grid entity-glance-grid-contacts">
                    <div className="entity-glance-item"><span>Azienda</span><strong>{contact.companies?.name || 'Da collegare'}</strong></div>
                    <div className="entity-glance-item"><span>Canale</span><strong>{preferredChannel(contact)}</strong></div>
                    <div className="entity-glance-item"><span>Recapito</span><strong>{bestReach(contact)}</strong></div>
                    <div className="entity-glance-item"><span>Ruolo</span><strong>{contact.role || 'Da indicare'}</strong></div>
                  </div>
                </div>
              </Link>

              <details className="entity-more-details">
                <summary>Altri dettagli</summary>
                <div className="entity-inline-meta wrap">
                  {contact.email ? <span>{contact.email}</span> : null}
                  {contact.phone ? <span>{contact.phone}</span> : null}
                  {contact.whatsapp ? <span>{contact.whatsapp}</span> : null}
                  {contact.notes_summary ? <span>{contact.notes_summary}</span> : <span>Nessuna nota rapida</span>}
                </div>
              </details>

              <div className="entity-card-actions cleaner-actions">
                <Link href={`/contacts/${contact.id}`} className="secondary-button">Apri scheda</Link>
                <form action={updateContact} className="inline-mini-form compact-inline-form wide">
                  <input type="hidden" name="id" value={contact.id} />
                  <select name="company_id" defaultValue={contact.company_id ?? ''} className="field-control compact-control">
                    <option value="">Nessuna</option>
                    {sortedCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                  </select>
                  <input name="role" defaultValue={contact.role ?? ''} placeholder="Ruolo" className="field-control compact-control" />
                  <button className="ghost-button" type="submit">Aggiorna</button>
                </form>
                <form action={deleteContact}>
                  <input type="hidden" name="id" value={contact.id} />
                  <button className="ghost-button danger-ghost" type="submit">Elimina</button>
                </form>
              </div>
            </article>
          ))}
          {!items.length ? <div className="empty-state-box">Nessun contatto trovato.</div> : null}
        </div>
        {hiddenItems.length ? (
          <details className="crm-more-details">
            <summary>Apri altre {hiddenItems.length} voci</summary>
            <div className="cards-stack cards-stack-v3 crm-more-stack">
              {hiddenItems.map((contact) => (

            <article key={contact.id} className="entity-card entity-card-contact entity-card-v3 quiet-card">
              <Link href={`/contacts/${contact.id}`} className="entity-card-main entity-card-main-link quiet-card">
                <ContactAvatar firstName={contact.first_name} lastName={contact.last_name} />
                <div className="entity-card-copy stretch">
                  <div className="entity-card-top compact-gap">
                    <div>
                      <h3>{contact.first_name} {contact.last_name}</h3>
                      <p>{contact.role || 'Ruolo non indicato'} · {contact.companies?.name || 'Nessuna azienda'}</p>
                    </div>
                    <span className="tone-badge neutral">{preferredChannel(contact)}</span>
                  </div>
                  <div className="entity-glance-grid entity-glance-grid-contacts">
                    <div className="entity-glance-item"><span>Azienda</span><strong>{contact.companies?.name || 'Da collegare'}</strong></div>
                    <div className="entity-glance-item"><span>Canale</span><strong>{preferredChannel(contact)}</strong></div>
                    <div className="entity-glance-item"><span>Recapito</span><strong>{bestReach(contact)}</strong></div>
                    <div className="entity-glance-item"><span>Ruolo</span><strong>{contact.role || 'Da indicare'}</strong></div>
                  </div>
                </div>
              </Link>

              <details className="entity-more-details">
                <summary>Altri dettagli</summary>
                <div className="entity-inline-meta wrap">
                  {contact.email ? <span>{contact.email}</span> : null}
                  {contact.phone ? <span>{contact.phone}</span> : null}
                  {contact.whatsapp ? <span>{contact.whatsapp}</span> : null}
                  {contact.notes_summary ? <span>{contact.notes_summary}</span> : <span>Nessuna nota rapida</span>}
                </div>
              </details>

              <div className="entity-card-actions cleaner-actions">
                <Link href={`/contacts/${contact.id}`} className="secondary-button">Apri scheda</Link>
                <form action={updateContact} className="inline-mini-form compact-inline-form wide">
                  <input type="hidden" name="id" value={contact.id} />
                  <select name="company_id" defaultValue={contact.company_id ?? ''} className="field-control compact-control">
                    <option value="">Nessuna</option>
                    {sortedCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                  </select>
                  <input name="role" defaultValue={contact.role ?? ''} placeholder="Ruolo" className="field-control compact-control" />
                  <button className="ghost-button" type="submit">Aggiorna</button>
                </form>
                <form action={deleteContact}>
                  <input type="hidden" name="id" value={contact.id} />
                  <button className="ghost-button danger-ghost" type="submit">Elimina</button>
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
                <h3>Nuovo contatto</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setShowCreate(false)}>Chiudi</button>
            </div>
            <form action={createContact} className="sheet-form">
              <div className="form-grid two-col">
                <label className="field-stack"><span>Nome</span><input className="field-control" name="first_name" required /></label>
                <label className="field-stack"><span>Cognome</span><input className="field-control" name="last_name" required /></label>
                <label className="field-stack"><span>Azienda</span><select className="field-control" name="company_id" defaultValue=""><option value="">Nessuna</option>{sortedCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
                <label className="field-stack"><span>Ruolo</span><input className="field-control" name="role" /></label>
                <label className="field-stack"><span>Email</span><input className="field-control" name="email" type="email" /></label>
                <label className="field-stack"><span>Telefono</span><input className="field-control" name="phone" /></label>
                <label className="field-stack"><span>WhatsApp</span><input className="field-control" name="whatsapp" /></label>
                <label className="field-stack"><span>Metodo preferito</span><select className="field-control" name="preferred_contact_method" defaultValue=""><option value="">Seleziona</option>{CONTACT_METHOD_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              </div>
              <label className="field-stack"><span>Note</span><textarea className="field-control field-area" name="notes_summary" /></label>
              <div className="sheet-actions">
                <button className="secondary-button" type="button" onClick={() => setShowCreate(false)}>Annulla</button>
                <button className="primary-button" type="submit">Salva contatto</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
