-- Quadra CRM demo seed for Supabase
-- Usa questo script DOPO aver eseguito lo schema principale.
-- 1) Recupera il tuo user id da Authentication > Users oppure con:
--    select id, email from profiles;
-- 2) Sostituisci l'UUID nella chiamata finale.

create or replace function seed_quadra_demo(p_owner_id uuid)
returns void
language plpgsql
as $$
declare
  v_company_1 uuid;
  v_company_2 uuid;
  v_company_3 uuid;
  v_contact_1 uuid;
  v_contact_2 uuid;
  v_contact_3 uuid;
  v_opportunity_1 uuid;
  v_opportunity_2 uuid;
  v_opportunity_3 uuid;
  v_project_1 uuid;
  v_tag_hot uuid;
  v_tag_architecture uuid;
begin
  if not exists (select 1 from profiles where id = p_owner_id) then
    raise exception 'Profile % non trovato. Fai prima login e verifica che profiles sia popolata.', p_owner_id;
  end if;

  if exists (select 1 from companies where owner_id = p_owner_id) then
    raise exception 'Per questo owner esistono gia dati. Usa un owner diverso o svuota prima le tabelle.';
  end if;

  insert into companies (
    owner_id, name, legal_name, vat_number, website, email, phone,
    address_line1, city, province, postal_code, country, industry, status, source, notes_summary
  ) values
    (p_owner_id, 'Edilnova', 'Edilnova Srl', 'IT01234567890', 'https://edilnova.it', 'info@edilnova.it', '+39 02 111111', 'Via Roma 14', 'Milano', 'MI', '20100', 'Italia', 'Edilizia', 'prospect', 'Referral', 'Cliente interessante, buona propensione all acquisto')
  returning id into v_company_1;

  insert into companies (
    owner_id, name, legal_name, vat_number, website, email, phone,
    address_line1, city, province, postal_code, country, industry, status, source, notes_summary
  ) values
    (p_owner_id, 'Studio Forma', 'Studio Forma Associati', 'IT09876543210', 'https://studioforma.it', 'hello@studioforma.it', '+39 06 222222', 'Viale Europa 8', 'Roma', 'RM', '00144', 'Italia', 'Architettura', 'client', 'Website', 'Studio molto attivo, contatti frequenti'),
    (p_owner_id, 'Cantieri Blu', 'Cantieri Blu Spa', 'IT01111111111', 'https://cantieriblu.it', 'contatti@cantieriblu.it', '+39 081 333333', 'Via Marina 2', 'Napoli', 'NA', '80100', 'Italia', 'Contractor', 'lead', 'Fiera', 'Lead recente da qualificare')
  returning id into v_company_2;

  select id into v_company_3 from companies where owner_id = p_owner_id and name = 'Cantieri Blu' limit 1;

  insert into contacts (
    owner_id, company_id, first_name, last_name, role, email, whatsapp,
    preferred_contact_method, status, notes_summary
  ) values
    (p_owner_id, v_company_1, 'Mario', 'Rossi', 'Direttore Acquisti', 'm.rossi@edilnova.it', '+39 333 1000001', 'phone', 'active', 'Persona concreta, risponde meglio al telefono'),
    (p_owner_id, v_company_2, 'Laura', 'Bianchi', 'Architetto', 'laura@studioforma.it', '+39 333 1000002', 'email', 'active', 'Molto rapida via email'),
    (p_owner_id, v_company_3, 'Giuseppe', 'Verdi', 'Titolare', 'g.verdi@cantieriblu.it', '+39 333 1000003', 'whatsapp', 'active', 'Primo contatto da richiamare')
  returning id into v_contact_1;

  select id into v_contact_2 from contacts where owner_id = p_owner_id and email = 'laura@studioforma.it' limit 1;
  select id into v_contact_3 from contacts where owner_id = p_owner_id and email = 'g.verdi@cantieriblu.it' limit 1;

  insert into contact_phones (contact_id, phone_number, label, is_primary) values
    (v_contact_1, '+39 333 1000001', 'mobile', true),
    (v_contact_2, '+39 333 1000002', 'mobile', true),
    (v_contact_3, '+39 333 1000003', 'mobile', true);

  insert into opportunities (
    owner_id, company_id, primary_contact_id, title, description, stage,
    value_estimate, probability, source, expected_close_date, next_action, next_action_due_at
  ) values
    (p_owner_id, v_company_1, v_contact_1, 'Fornitura serramenti Milano', 'Richiesta per nuova fornitura su cantiere residenziale', 'negotiation', 24000, 70, 'Referral', current_date + 21, 'Chiamare per allineamento finale', now() + interval '2 day'),
    (p_owner_id, v_company_2, v_contact_2, 'Restyling showroom Roma', 'Opportunita legata a progetto retail', 'proposal', 18000, 55, 'Website', current_date + 14, 'Inviare revisione offerta', now() + interval '1 day'),
    (p_owner_id, v_company_3, v_contact_3, 'Primo incontro qualificazione', 'Lead da qualificare dopo fiera', 'contacted', 8000, 25, 'Fiera', current_date + 30, 'Richiamare e fissare meeting', now() + interval '3 day')
  returning id into v_opportunity_1;

  select id into v_opportunity_2 from opportunities where owner_id = p_owner_id and title = 'Restyling showroom Roma' limit 1;
  select id into v_opportunity_3 from opportunities where owner_id = p_owner_id and title = 'Primo incontro qualificazione' limit 1;

  insert into projects (
    owner_id, company_id, opportunity_id, title, description, status, budget, start_date, end_date, priority, project_manager
  ) values
    (p_owner_id, v_company_2, v_opportunity_2, 'Showroom Roma - fase esecutiva', 'Progetto operativo collegato alla proposta in corso', 'active', 15000, current_date - 5, current_date + 60, 'high', 'Antonio');

  select id into v_project_1 from projects where owner_id = p_owner_id and title = 'Showroom Roma - fase esecutiva' limit 1;

  insert into activities (
    owner_id, company_id, contact_id, opportunity_id, project_id, kind, subject, content, happened_at, created_by
  ) values
    (p_owner_id, v_company_1, v_contact_1, v_opportunity_1, null, 'call', 'Call iniziale', 'Cliente interessato, richiede tempi di consegna certi', now() - interval '6 day', p_owner_id),
    (p_owner_id, v_company_1, v_contact_1, v_opportunity_1, null, 'meeting', 'Incontro tecnico', 'Confermate specifiche principali e range budget', now() - interval '3 day', p_owner_id),
    (p_owner_id, v_company_2, v_contact_2, v_opportunity_2, v_project_1, 'email', 'Invio proposta', 'Inviata proposta economica aggiornata', now() - interval '2 day', p_owner_id),
    (p_owner_id, v_company_3, v_contact_3, v_opportunity_3, null, 'whatsapp', 'Primo contatto', 'Scambiato messaggio, disponibile a sentirci la prossima settimana', now() - interval '1 day', p_owner_id);

  insert into followups (
    owner_id, company_id, contact_id, opportunity_id, project_id, title, description,
    due_at, status, priority, reminder_at, created_by
  ) values
    (p_owner_id, v_company_1, v_contact_1, v_opportunity_1, null, 'Richiamo finale trattativa', 'Verificare feedback economico e tempi', now() + interval '1 day', 'pending', 'high', now() + interval '20 hour', p_owner_id),
    (p_owner_id, v_company_2, v_contact_2, v_opportunity_2, v_project_1, 'Invio revisione proposta', 'Mandare variante con tempi aggiornati', now() + interval '6 hour', 'in_progress', 'urgent', now() + interval '5 hour', p_owner_id),
    (p_owner_id, v_company_3, v_contact_3, v_opportunity_3, null, 'Fissare call di qualificazione', 'Portare il lead a meeting conoscitivo', now() - interval '4 hour', 'pending', 'medium', now() - interval '6 hour', p_owner_id);

  insert into notes (owner_id, entity_type, entity_id, title, body, created_by) values
    (p_owner_id, 'company', v_company_1, 'Impressione generale', 'Azienda seria, valore potenziale alto.', p_owner_id),
    (p_owner_id, 'contact', v_contact_2, 'Stile comunicazione', 'Predilige email concise con allegati chiari.', p_owner_id),
    (p_owner_id, 'opportunity', v_opportunity_1, 'Punto critico', 'Sensibili ai tempi di consegna.', p_owner_id),
    (p_owner_id, 'project', v_project_1, 'Nota progetto', 'Serve coordinamento piu stretto con lo studio.', p_owner_id);

  insert into tags (owner_id, name, color) values
    (p_owner_id, 'Hot', '#ef4444'),
    (p_owner_id, 'Architettura', '#2563eb')
  returning id into v_tag_hot;

  select id into v_tag_architecture from tags where owner_id = p_owner_id and name = 'Architettura' limit 1;

  insert into entity_tags (owner_id, entity_type, entity_id, tag_id) values
    (p_owner_id, 'company', v_company_1, v_tag_hot),
    (p_owner_id, 'opportunity', v_opportunity_1, v_tag_hot),
    (p_owner_id, 'company', v_company_2, v_tag_architecture),
    (p_owner_id, 'project', v_project_1, v_tag_architecture);

  perform mark_overdue_followups();
end;
$$;

-- ESEMPIO:
-- select seed_quadra_demo('00000000-0000-0000-0000-000000000000');
