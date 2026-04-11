'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createContact, deleteContact, updateContact } from '@/app/(app)/actions'
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives'
import { SearchInput } from '@/components/ui/search-input'
import { ContactAvatar } from '@/components/ui/contact-avatar'

export function ContactsCrud({ contacts, companies }: { contacts: any[]; companies: any[] }) {
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    return contacts.filter((contact) => {
      const text = `${contact.first_name} ${contact.last_name} ${contact.role ?? ''} ${contact.email ?? ''} ${contact.companies?.name ?? ''}`.toLowerCase()
      return text.includes(query.toLowerCase())
    })
  }, [contacts, query])

  return (
    <div className="dual-panel polished-dual-panel">
      <div className="sticky-panel">
        <form id="new-contact" action={createContact}>
          <FormCard title="Nuovo contatto" subtitle="Persone, ruoli e relazione con l’azienda in una scheda più pulita.">
            <FormGrid>
              <Field label="Nome"><input name="first_name" required style={inputStyle()} /></Field>
              <Field label="Cognome"><input name="last_name" required style={inputStyle()} /></Field>
              <Field label="Azienda">
                <select name="company_id" style={selectStyle()} defaultValue="">
                  <option value="">Nessuna</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </Field>
              <Field label="Ruolo"><input name="role" style={inputStyle()} /></Field>
              <Field label="Email"><input name="email" type="email" style={inputStyle()} /></Field>
              <Field label="Telefono principale"><input name="phone" style={inputStyle()} /></Field>
              <Field label="WhatsApp"><input name="whatsapp" style={inputStyle()} /></Field>
              <Field label="Contatto preferito"><input name="preferred_contact_method" placeholder="phone / email / whatsapp" style={inputStyle()} /></Field>
            </FormGrid>
            <Field label="Note sintetiche"><textarea name="notes_summary" style={textareaStyle()} /></Field>
            <ActionBar><PrimaryButton>Salva contatto</PrimaryButton></ActionBar>
          </FormCard>
        </form>
      </div>

      <section className="frost-card polished-list-shell">
        <div className="section-heading">
          <div>
            <h2>Contatti</h2>
            <p>Più identità visiva, meno rumore, più contesto utile a colpo d’occhio.</p>
          </div>
          <div className="section-utility">{items.length} risultati</div>
        </div>
        <div className="search-row" style={{ marginBottom: 18 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, azienda, email o ruolo" />
        </div>
        <div className="contact-list-v2">
          {items.map((contact) => (
            <article key={contact.id} className="entity-card-v2 contact-card-v2">
              <div className="entity-main-row">
                <div className="entity-identity">
                  <ContactAvatar firstName={contact.first_name} lastName={contact.last_name} />
                  <div className="entity-copy">
                    <div className="entity-title-row">
                      <div className="entity-title-block">
                        <div className="entity-title">{contact.first_name} {contact.last_name}</div>
                        <div className="entity-subtitle">{contact.role || 'Ruolo non indicato'} {contact.companies?.name ? `· ${contact.companies.name}` : '· Nessuna azienda'}</div>
                      </div>
                    </div>
                    <div className="entity-meta-row wrap">
                      {contact.email ? <span className="entity-chip">{contact.email}</span> : null}
                      {contact.whatsapp ? <span className="entity-chip">WhatsApp</span> : null}
                      {contact.preferred_contact_method ? <span className="entity-chip entity-chip-dark">{contact.preferred_contact_method}</span> : null}
                    </div>
                  </div>
                </div>
                <div className="entity-actions-top">
                  <Link className="button-secondary" href={`/contacts/${contact.id}`}>Apri scheda</Link>
                </div>
              </div>
              <div className="entity-bottom-row">
                <form action={updateContact} className="contact-inline-edit">
                  <input type="hidden" name="id" value={contact.id} />
                  <div className="compact-field-block">
                    <div className="compact-label">Azienda</div>
                    <select name="company_id" defaultValue={contact.company_id ?? ''} style={selectStyle()}>
                      <option value="">Nessuna</option>
                      {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                    </select>
                  </div>
                  <div className="compact-field-block">
                    <div className="compact-label">Ruolo</div>
                    <input name="role" defaultValue={contact.role ?? ''} placeholder="Ruolo" style={inputStyle()} />
                  </div>
                  <div className="compact-field-block">
                    <div className="compact-label">Email</div>
                    <input name="email" defaultValue={contact.email ?? ''} placeholder="Email" style={inputStyle()} />
                  </div>
                  <div className="compact-field-block">
                    <div className="compact-label">WhatsApp</div>
                    <input name="whatsapp" defaultValue={contact.whatsapp ?? ''} placeholder="WhatsApp" style={inputStyle()} />
                  </div>
                  <PrimaryButton>Aggiorna</PrimaryButton>
                </form>
                <form action={deleteContact}>
                  <input type="hidden" name="id" value={contact.id} />
                  <InlineDangerButton>Elimina</InlineDangerButton>
                </form>
              </div>
            </article>
          ))}
          {!items.length ? <div className="empty-copy">Nessun contatto trovato.</div> : null}
        </div>
      </section>
    </div>
  )
}
