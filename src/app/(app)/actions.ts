'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function nullable(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

async function getUserAndClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Utente non autenticato');
  return { supabase, user: data.user };
}


function normalizeLookup(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase()
}

function parseNumberValue(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '').trim()
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function parseDateValue(value: unknown, withTime = false) {
  if (typeof value !== 'string') return null
  const raw = value.trim()
  if (!raw) return null
  const isoCandidate = new Date(raw)
  if (!Number.isNaN(isoCandidate.getTime())) {
    return withTime ? isoCandidate.toISOString() : isoCandidate.toISOString().slice(0, 10)
  }
  const match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?$/)
  if (!match) return null
  const [, d, m, y, hh = '9', mm = '00'] = match
  const year = y.length === 2 ? `20${y}` : y
  const iso = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${hh.padStart(2, '0')}:${mm}:00`
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return null
  return withTime ? parsed.toISOString() : parsed.toISOString().slice(0, 10)
}

function normalizeCompanyStatus(value: unknown) {
  const key = normalizeLookup(typeof value === 'string' ? value : '')
  if (['lead', 'cliente potenziale'].includes(key)) return 'lead'
  if (['prospect', 'potenziale'].includes(key)) return 'prospect'
  if (['client', 'cliente'].includes(key)) return 'client'
  if (['partner'].includes(key)) return 'partner'
  if (['inactive', 'inattivo'].includes(key)) return 'inactive'
  return 'lead'
}

function normalizeOpportunityStage(value: unknown) {
  const key = normalizeLookup(typeof value === 'string' ? value : '')
  if (['new lead', 'new_lead', 'nuovo lead'].includes(key)) return 'new_lead'
  if (['contacted', 'contattata', 'contattato'].includes(key)) return 'contacted'
  if (['qualified', 'qualificata', 'qualificato'].includes(key)) return 'qualified'
  if (['proposal', 'proposta'].includes(key)) return 'proposal'
  if (['negotiation', 'negoziazione'].includes(key)) return 'negotiation'
  if (['won', 'vinta', 'chiusa vinta'].includes(key)) return 'won'
  if (['lost', 'persa', 'chiusa persa'].includes(key)) return 'lost'
  return 'new_lead'
}

function normalizeFollowupStatus(value: unknown) {
  const key = normalizeLookup(typeof value === 'string' ? value : '')
  if (['pending', 'da fare'].includes(key)) return 'pending'
  if (['in_progress', 'in corso'].includes(key)) return 'in_progress'
  if (['completed', 'completato', 'chiuso'].includes(key)) return 'completed'
  if (['cancelled', 'annullato'].includes(key)) return 'cancelled'
  if (['overdue', 'in ritardo'].includes(key)) return 'overdue'
  return 'pending'
}

function normalizeFollowupPriority(value: unknown) {
  const key = normalizeLookup(typeof value === 'string' ? value : '')
  if (['low', 'bassa'].includes(key)) return 'low'
  if (['high', 'alta'].includes(key)) return 'high'
  if (['urgent', 'urgente'].includes(key)) return 'urgent'
  return 'medium'
}

export async function importMappedRows(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const entityType = text(formData, 'entityType');
  const payload = text(formData, 'rows');
  const rows = JSON.parse(payload || '[]') as Array<Record<string, unknown>>;

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Nessuna riga pronta da importare.');
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  const { data: existingCompanies } = await supabase.from('companies').select('id,name').eq('owner_id', user.id);
  const companyMap = new Map((existingCompanies ?? []).map((item) => [normalizeLookup(item.name), item.id]));
  const { data: existingContacts } = await supabase.from('contacts').select('id,full_name,first_name,last_name').eq('owner_id', user.id);
  const contactMap = new Map<string, string>();
  for (const item of existingContacts ?? []) {
    const fullName = normalizeLookup((item as any).full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim());
    if (fullName) contactMap.set(fullName, item.id);
  }

  for (const row of rows) {
    try {
      if (entityType === 'companies') {
        const name = String(row.name ?? '').trim();
        if (!name) {
          skipped += 1;
          continue;
        }
        const lookup = normalizeLookup(name);
        if (companyMap.has(lookup)) {
          skipped += 1;
          continue;
        }
        const insertPayload: Record<string, unknown> = {
          owner_id: user.id,
          name,
          legal_name: row.legal_name || null,
          website: row.website || null,
          email: row.email || null,
          phone: row.phone || null,
          address_line1: row.address_line1 || null,
          city: row.city || null,
          province: row.province || null,
          postal_code: row.postal_code || null,
          country: row.country || null,
          industry: row.industry || null,
          source: row.source || null,
          status: normalizeCompanyStatus(row.status),
          notes_summary: row.notes_summary || null,
        };
        const { data, error } = await supabase.from('companies').insert(insertPayload).select('id').single();
        if (error) throw error;
        companyMap.set(lookup, data.id);
        imported += 1;
        continue;
      }

      if (entityType === 'contacts') {
        const firstName = String(row.first_name ?? '').trim();
        const lastName = String(row.last_name ?? '').trim();
        if (!firstName && !lastName) {
          skipped += 1;
          continue;
        }
        const fullName = normalizeLookup(`${firstName} ${lastName}`.trim());
        if (fullName && contactMap.has(fullName)) {
          skipped += 1;
          continue;
        }
        const companyId = companyMap.get(normalizeLookup(String(row.company_name ?? ''))) ?? null;
        const insertPayload = {
          owner_id: user.id,
          company_id: companyId,
          first_name: firstName || 'Sconosciuto',
          last_name: lastName || 'Contatto',
          role: row.role || null,
          email: row.email || null,
          whatsapp: row.whatsapp || row.mobile_phone || null,
          preferred_contact_method: row.preferred_contact_method || null,
          status: String(row.status || 'active'),
          notes_summary: row.notes_summary || null,
        };
        const { data, error } = await supabase.from('contacts').insert(insertPayload).select('id').single();
        if (error) throw error;
        const phone = String(row.phone || row.mobile_phone || '').trim();
        if (phone) {
          await supabase.from('contact_phones').insert({
            contact_id: data.id,
            phone_number: phone,
            label: row.mobile_phone ? 'mobile' : 'work',
            is_primary: true,
          });
        }
        if (fullName) contactMap.set(fullName, data.id);
        imported += 1;
        continue;
      }

      if (entityType === 'opportunities') {
        const title = String(row.title ?? '').trim();
        const companyId = companyMap.get(normalizeLookup(String(row.company_name ?? ''))) ?? null;
        if (!title || !companyId) {
          skipped += 1;
          continue;
        }
        const primaryContactId = contactMap.get(normalizeLookup(String(row.primary_contact_name ?? ''))) ?? null;
        const insertPayload = {
          owner_id: user.id,
          company_id: companyId,
          primary_contact_id: primaryContactId,
          title,
          description: row.notes || row.description || null,
          stage: normalizeOpportunityStage(row.stage),
          value_estimate: parseNumberValue(row.value_estimate),
          probability: parseNumberValue(row.probability),
          expected_close_date: parseDateValue(row.expected_close_date),
          next_action: row.next_action || null,
          next_action_due_at: parseDateValue(row.next_action_due_at || row.due_at, true),
          source: row.source || null,
        };
        const { error } = await supabase.from('opportunities').insert(insertPayload);
        if (error) throw error;
        imported += 1;
        continue;
      }

      if (entityType === 'followups') {
        const title = String(row.title ?? '').trim();
        const dueAt = parseDateValue(row.due_at, true);
        if (!title || !dueAt) {
          skipped += 1;
          continue;
        }
        const companyId = companyMap.get(normalizeLookup(String(row.company_name ?? ''))) ?? null;
        const contactId = contactMap.get(normalizeLookup(String(row.contact_name ?? ''))) ?? null;
        const insertPayload = {
          owner_id: user.id,
          company_id: companyId,
          contact_id: contactId,
          opportunity_id: null,
          title,
          description: row.description || null,
          due_at: dueAt,
          status: normalizeFollowupStatus(row.status),
          priority: normalizeFollowupPriority(row.priority),
          created_by: user.id,
        };
        const { error } = await supabase.from('followups').insert(insertPayload);
        if (error) throw error;
        imported += 1;
        continue;
      }

      skipped += 1;
    } catch (error: any) {
      skipped += 1;
      errors.push(error?.message || 'Errore sconosciuto');
    }
  }

  revalidatePath('/companies');
  revalidatePath('/contacts');
  revalidatePath('/opportunities');
  revalidatePath('/followups');
  revalidatePath('/dashboard');
  revalidatePath('/import');

  return {
    imported,
    skipped,
    errors: errors.slice(0, 10),
  };
}

export async function createCompany(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const payload = {
    owner_id: user.id,
    name: text(formData, 'name'),
    website: nullable(formData, 'website'),
    city: nullable(formData, 'city'),
    province: nullable(formData, 'province'),
    status: text(formData, 'status') || 'lead',
    phone: nullable(formData, 'phone'),
    email: nullable(formData, 'email'),
    notes_summary: nullable(formData, 'notes_summary'),
  };

  if (!payload.name) throw new Error('Il nome azienda è obbligatorio');
  const { error } = await supabase.from('companies').insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath('/companies');
  revalidatePath('/dashboard');
}

export async function updateCompanyStatus(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const status = text(formData, 'status');
  const { error } = await supabase.from('companies').update({ status }).eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/companies');
  revalidatePath('/dashboard');
}

export async function deleteCompany(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const { error } = await supabase.from('companies').delete().eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/companies');
  revalidatePath('/dashboard');
}

export async function createContact(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const payload = {
    owner_id: user.id,
    company_id: nullable(formData, 'company_id'),
    first_name: text(formData, 'first_name'),
    last_name: text(formData, 'last_name'),
    role: nullable(formData, 'role'),
    email: nullable(formData, 'email'),
    whatsapp: nullable(formData, 'whatsapp'),
    preferred_contact_method: nullable(formData, 'preferred_contact_method'),
    status: text(formData, 'status') || 'active',
    notes_summary: nullable(formData, 'notes_summary'),
  };
  if (!payload.first_name || !payload.last_name) throw new Error('Nome e cognome sono obbligatori');

  const { data, error } = await supabase.from('contacts').insert(payload).select('id').single();
  if (error) throw new Error(error.message);

  const primaryPhone = text(formData, 'phone');
  if (primaryPhone && data?.id) {
    const { error: phoneError } = await supabase.from('contact_phones').insert({
      contact_id: data.id,
      phone_number: primaryPhone,
      label: 'mobile',
      is_primary: true,
    });
    if (phoneError) throw new Error(phoneError.message);
  }

  revalidatePath('/contacts');
  revalidatePath('/dashboard');
}

export async function updateContact(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const payload = {
    company_id: nullable(formData, 'company_id'),
    role: nullable(formData, 'role'),
    email: nullable(formData, 'email'),
    whatsapp: nullable(formData, 'whatsapp'),
    preferred_contact_method: nullable(formData, 'preferred_contact_method'),
    notes_summary: nullable(formData, 'notes_summary'),
  };
  const { error } = await supabase.from('contacts').update(payload).eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/contacts');
}

export async function deleteContact(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const { error } = await supabase.from('contacts').delete().eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/contacts');
  revalidatePath('/dashboard');
}

export async function createOpportunity(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const value = text(formData, 'value_estimate');
  const probability = text(formData, 'probability');
  const payload = {
    owner_id: user.id,
    company_id: text(formData, 'company_id'),
    primary_contact_id: nullable(formData, 'primary_contact_id'),
    title: text(formData, 'title'),
    description: nullable(formData, 'description'),
    stage: text(formData, 'stage') || 'new_lead',
    value_estimate: value ? Number(value) : null,
    probability: probability ? Number(probability) : null,
    expected_close_date: nullable(formData, 'expected_close_date'),
    next_action: nullable(formData, 'next_action'),
    next_action_due_at: nullable(formData, 'next_action_due_at'),
    source: nullable(formData, 'source'),
  };
  if (!payload.company_id || !payload.title) throw new Error('Azienda e titolo sono obbligatori');
  const { error } = await supabase.from('opportunities').insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath('/opportunities');
  revalidatePath('/dashboard');
}

export async function updateOpportunityStage(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const stage = text(formData, 'stage');
  const { error } = await supabase.from('opportunities').update({ stage }).eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/opportunities');
  revalidatePath('/dashboard');
}

export async function deleteOpportunity(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const { error } = await supabase.from('opportunities').delete().eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/opportunities');
  revalidatePath('/dashboard');
}

export async function createFollowup(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const payload = {
    owner_id: user.id,
    company_id: nullable(formData, 'company_id'),
    contact_id: nullable(formData, 'contact_id'),
    opportunity_id: nullable(formData, 'opportunity_id'),
    title: text(formData, 'title'),
    description: nullable(formData, 'description'),
    due_at: text(formData, 'due_at'),
    status: text(formData, 'status') || 'pending',
    priority: text(formData, 'priority') || 'medium',
    created_by: user.id,
  };
  if (!payload.title || !payload.due_at) throw new Error('Titolo e scadenza sono obbligatori');
  const { error } = await supabase.from('followups').insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath('/followups');
  revalidatePath('/dashboard');
}

export async function updateFollowupStatus(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const status = text(formData, 'status');
  const completed_at = status === 'completed' ? new Date().toISOString() : null;
  const { error } = await supabase.from('followups').update({ status, completed_at }).eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/followups');
  revalidatePath('/dashboard');
}

export async function deleteFollowup(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const { error } = await supabase.from('followups').delete().eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/followups');
  revalidatePath('/dashboard');
}
