'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createContact, deleteContact, updateContact } from '@/app/(app)/actions'
import { SearchInput } from '@/components/ui/search-input'
import { ContactAvatar } from '@/components/ui/contact-avatar'

export function ContactsCrud({ contacts, companies }: { contacts: any[]; companies: any[] }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const items = useMemo(() => {
    return contacts.filter((contact) => {
      const hay = `${contact.first_name} ${contact.last_name} ${contact.role || ''} ${contact.email || ''} ${contact.companies?.name || ''}`.toLowerCase()
      return hay.includes(query.toLowerCase())
    })
  }, [contacts, query])

  return (
    <>
      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">Contatti</h2>
            <p className="section-copy">Persone chiare, azienda leggibile e azioni nascoste finché non servono.</p>
          </div>
          <div className="section-actions">
            <button type="button" className="button-primary" onClick={() => setOpen(true)}>+ Nuovo contatto</button>
          </div>
        </div>

        <div className="entity-toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, azienda, email o ruolo" />
        </div>

        <div className="entity-list">
          {items.map((contact) => (
            <article key={contact.id} className="entity-card">
              <div className="entity-head">
                <div className="entity-identity">
                  <ContactAvatar firstName={contact.first_name} lastName={contact.last_name} />
                  <div className="entity-copy">
                    <h3 className="entity-title">{contact.first_name} {contact.last_name}</h3>
                    <p className="entity-subtitle">{contact.role || 'Ruolo non indicato'} · {contact.companies?.name || 'Nessuna azienda'}</p>
                    <div className="entity-summary">
                      {contact.email ? <span className="badge badge-soft">{contact.email}</span> : null}
                      {contact.whatsapp ? <span className="badge badge-soft">WhatsApp</span> : null}
                      {contact.preferred_contact_method ? <span className="badge badge-soft">{contact.preferred_contact_method}</span> : null}
                    </div>
                  </div>
                </div>
                <div className="entity-actions">
                  <Link className="button-secondary" href={`/contacts/${contact.id}`}>Apri</Link>
                </div>
              </div>

              <details className="entity-details">
                <summary className="details-toggle">Gestisci contatto <span>+</span></summary>
                <form action={updateContact} className="editor-grid">
                  <input type="hidden" name="id" value={contact.id} />
                  <label className="field-label"><span>Azienda</span>
                    <select name="company_id" defaultValue={contact.company_id ?? ''}>
                      <option value="">Nessuna</option>
                      {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                    </select>
                  </label>
                  <label className="field-label"><span>Ruolo</span><input name="role" defaultValue={contact.role ?? ''} /></label>
                  <label className="field-label"><span>Email</span><input name="email" defaultValue={contact.email ?? ''} /></label>
                  <label className="field-label"><span>WhatsApp</span><input name="whatsapp" defaultValue={contact.whatsapp ?? ''} /></label>
                  <label className="field-label" style={{ gridColumn: '1 / -1' }}><span>Contatto preferito</span><input name="preferred_contact_method" defaultValue={contact.preferred_contact_method ?? ''} /></label>
                  <div className="actions-row" style={{ gridColumn: '1 / -1' }}>
                    <button className="button-primary" type="submit">Aggiorna</button>
                  </div>
                </form>
                <form action={deleteContact} className="actions-row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
                  <input type="hidden" name="id" value={contact.id} />
                  <button className="button-danger" type="submit">Elimina</button>
                </form>
              </details>
            </article>
          ))}
          {!items.length ? <div className="empty-state">Nessun contatto trovato.</div> : null}
        </div>
      </section>

      {open ? (
        <div className="modal-layer" onClick={() => setOpen(false)}>
          <form id="new-contact" action={createContact} className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3 className="modal-title">Nuovo contatto</h3>
                <p className="modal-copy">Una scheda semplice: persona, ruolo e legame con l’azienda.</p>
              </div>
              <button type="button" className="button-ghost" onClick={() => setOpen(false)}>Chiudi</button>
            </div>
            <div className="modal-grid">
              <label className="field-label"><span>Nome</span><input name="first_name" required /></label>
              <label className="field-label"><span>Cognome</span><input name="last_name" required /></label>
              <label className="field-label"><span>Azienda</span>
                <select name="company_id" defaultValue=""><option value="">Nessuna</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select>
              </label>
              <label className="field-label"><span>Ruolo</span><input name="role" /></label>
              <label className="field-label"><span>Email</span><input name="email" type="email" /></label>
              <label className="field-label"><span>Telefono principale</span><input name="phone" /></label>
              <label className="field-label"><span>WhatsApp</span><input name="whatsapp" /></label>
              <label className="field-label"><span>Contatto preferito</span><input name="preferred_contact_method" placeholder="phone / email / whatsapp" /></label>
              <label className="field-label" style={{ gridColumn: '1 / -1' }}><span>Note sintetiche</span><textarea name="notes_summary" /></label>
            </div>
            <div className="modal-footer">
              <button type="button" className="button-ghost" onClick={() => setOpen(false)}>Annulla</button>
              <button type="submit" className="button-primary">Salva contatto</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}
