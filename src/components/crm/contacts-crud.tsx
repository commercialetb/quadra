'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { createContact, deleteContact, updateContact } from '@/app/(app)/actions'
import { ActionBar, Field, FormCard, FormGrid, InlineDangerButton, PrimaryButton, inputStyle, selectStyle, textareaStyle } from '@/components/forms/form-primitives'
import { SearchInput } from '@/components/ui/search-input'

export function ContactsCrud({ contacts, companies }: { contacts: any[]; companies: any[] }) {
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    return contacts.filter((contact) => {
      const text = `${contact.first_name} ${contact.last_name} ${contact.role ?? ''} ${contact.email ?? ''} ${contact.companies?.name ?? ''}`.toLowerCase()
      return text.includes(query.toLowerCase())
    })
  }, [contacts, query])

  return (
    <div className="dual-panel">
      <div className="sticky-panel">
        <form id="new-contact" action={createContact}>
          <FormCard title="Nuovo contatto" subtitle="Crea un referente pulito, già collegato all’azienda giusta.">
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

      <section className="frost-card">
        <div className="section-heading">
          <div>
            <h2>Contatti</h2>
            <p>Persone, contesto e prossime relazioni in una vista più elegante.</p>
          </div>
          <div className="section-utility">{items.length} risultati</div>
        </div>
        <div className="search-row" style={{ marginBottom: 18 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Cerca per nome, azienda, email o ruolo" />
        </div>
        <div className="crm-list-grid">
          {items.map((contact) => (
            <article key={contact.id} className="crm-card">
              <div className="crm-card-header">
                <div>
                  <div className="crm-title">{contact.first_name} {contact.last_name}</div>
                  <div className="crm-meta">{contact.role || 'Ruolo non indicato'} · {contact.companies?.name ?? 'Nessuna azienda'}</div>
                  <div className="crm-tags">
                    {contact.email ? <span className="badge">{contact.email}</span> : null}
                    {contact.whatsapp ? <span className="badge">WhatsApp</span> : null}
                    {contact.preferred_contact_method ? <span className="badge badge-dark">{contact.preferred_contact_method}</span> : null}
                  </div>
                </div>
                <Link className="button-secondary" href={`/contacts/${contact.id}`}>Apri scheda</Link>
              </div>
              <div className="crm-card-footer">
                <form action={updateContact} className="inline-stack" style={{ width: '100%' }}>
                  <input type="hidden" name="id" value={contact.id} />
                  <select name="company_id" defaultValue={contact.company_id ?? ''} style={selectStyle()}>
                    <option value="">Nessuna</option>
                    {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                  </select>
                  <input name="role" defaultValue={contact.role ?? ''} placeholder="Ruolo" style={inputStyle()} />
                  <input name="email" defaultValue={contact.email ?? ''} placeholder="Email" style={inputStyle()} />
                  <input name="whatsapp" defaultValue={contact.whatsapp ?? ''} placeholder="WhatsApp" style={inputStyle()} />
                  <PrimaryButton>Aggiorna</PrimaryButton>
                </form>
                <form action={deleteContact}>
                  <input type="hidden" name="id" value={contact.id} />
                  <InlineDangerButton>Elimina</InlineDangerButton>
                </form>
              </div>
            </article>
          ))}
          {!items.length ? <div className="empty-copy">Nessun contatto trovato per questa ricerca.</div> : null}
        </div>
      </section>
    </div>
  )
}
