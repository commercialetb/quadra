'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createContact, deleteContact, updateContact } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { ContactAvatar } from '@/components/ui/contact-avatar'
import { CrmHero, CrmScene } from '@/components/crm/crm-scene'
import { CONTACT_METHOD_OPTIONS } from '@/lib/crm-options'
import { labelize } from '@/lib/crm-labels'

export function ContactsCrud({ contacts, companies }: { contacts: any[]; companies: any[] }) {
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const items = useMemo(() => {
    return contacts.filter((contact) => {
      const text = `${contact.first_name} ${contact.last_name} ${contact.role ?? ''} ${contact.email ?? ''} ${contact.companies?.name ?? ''}`.toLowerCase()
      return text.includes(query.toLowerCase())
    })
  }, [contacts, query])

  const sortedCompanies = useMemo(() => [...companies].sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })), [companies])

  const linkedCount = items.filter((contact) => contact.companies?.name).length
  const emailCount = items.filter((contact) => contact.email).length
  const whatsappCount = items.filter((contact) => contact.whatsapp).length

  return (
    <>
      <CrmScene className="crm-scene-contacts">
        <CrmHero
          eyebrow="Contatti"
          title="Relationship workspace"
          description="Rubrica viva, contatti chiave e segnali immediati per riprendere una relazione senza rumore."
          spotlight={{ kicker: 'Con azienda', value: String(linkedCount), note: `${whatsappCount} raggiungibili anche via WhatsApp` }}
          stats={[
            { label: 'Totale', value: items.length, note: 'contatti visibili' },
            { label: 'Con azienda', value: linkedCount, note: 'account già collegati' },
            { label: 'Con email', value: emailCount, note: 'pronti per outreach' },
            { label: 'WhatsApp', value: whatsappCount, note: 'canale rapido' },
          ]}
          links={[
            { href: '/companies', label: 'Apri aziende', tone: 'ghost' },
            { href: '/dashboard', label: 'Torna alla dashboard', tone: 'primary' },
          ]}
        />

      <section className="panel-card page-section-card crm-entity-panel crm-entity-panel-contacts">
        <div className="list-head">
          <div>
            <h2>Rubrica</h2>
            <p>Contatti chiave, canali e relazioni da riattivare subito.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
            + Nuovo contatto
          </button>
        </div>

        <div className="entity-summary-row" aria-label="Panoramica contatti">
          <div className="entity-summary-pill"><span>Totale</span><strong>{items.length}</strong></div>
          <div className="entity-summary-pill"><span>Con azienda</span><strong>{items.filter((contact) => contact.companies?.name).length}</strong></div>
          <div className="entity-summary-pill"><span>Con email</span><strong>{items.filter((contact) => contact.email).length}</strong></div>
          <div className="entity-summary-pill"><span>WhatsApp</span><strong>{items.filter((contact) => contact.whatsapp).length}</strong></div>
        </div>

        <div className="toolbar-row single">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, azienda, email o ruolo" />
        </div>

        <div className="cards-stack">
          {items.map((contact) => (
            <article key={contact.id} className="entity-card entity-card-contact">
              <Link href={`/contacts/${contact.id}`} className="entity-card-main entity-card-main-link">
                <ContactAvatar firstName={contact.first_name} lastName={contact.last_name} />
                <div className="entity-card-copy stretch">
                  <div className="entity-card-top compact-gap">
                    <div>
                      <h3>{contact.first_name} {contact.last_name}</h3>
                      <p>{contact.role || 'Ruolo non indicato'} · {contact.companies?.name || 'Nessuna azienda'}</p>
                    </div>
                  </div>
                  <div className="entity-inline-meta wrap">
                    {contact.email ? <span>{contact.email}</span> : null}
                    {contact.whatsapp ? <span>WhatsApp disponibile</span> : null}
                    {contact.preferred_contact_method ? <span>{labelize(contact.preferred_contact_method)}</span> : null}
                  </div>
                </div>
              </Link>

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
      </section>
      </CrmScene>

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
