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
    industry: nullable(formData, 'industry'),
    source: nullable(formData, 'source'),
    notes_summary: nullable(formData, 'notes_summary'),
  };

  if (!payload.name) throw new Error('Il nome azienda è obbligatorio');
  const { error } = await supabase.from('companies').insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath('/companies');
  revalidatePath('/dashboard');
}



export async function updateCompanyDetail(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const payload = {
    name: text(formData, 'name'),
    legal_name: nullable(formData, 'legal_name'),
    website: nullable(formData, 'website'),
    email: nullable(formData, 'email'),
    phone: nullable(formData, 'phone'),
    address_line1: nullable(formData, 'address_line1'),
    city: nullable(formData, 'city'),
    province: nullable(formData, 'province'),
    industry: nullable(formData, 'industry'),
    source: nullable(formData, 'source'),
    status: text(formData, 'status') || 'lead',
    notes_summary: nullable(formData, 'notes_summary'),
  };
  if (!id || !payload.name) throw new Error('ID e nome azienda sono obbligatori');
  const { error } = await supabase.from('companies').update(payload).eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/companies');
  revalidatePath(`/companies/${id}`);
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



export async function updateContactDetail(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const first_name = text(formData, 'first_name');
  const last_name = text(formData, 'last_name');
  if (!id || !first_name || !last_name) throw new Error('Nome e cognome sono obbligatori');

  const payload = {
    first_name,
    last_name,
    company_id: nullable(formData, 'company_id'),
    role: nullable(formData, 'role'),
    email: nullable(formData, 'email'),
    whatsapp: nullable(formData, 'whatsapp'),
    preferred_contact_method: nullable(formData, 'preferred_contact_method'),
    notes_summary: nullable(formData, 'notes_summary'),
  };
  const { error } = await supabase.from('contacts').update(payload).eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);

  const phone = text(formData, 'phone');
  const { data: existingPhone } = await supabase
    .from('contact_phones')
    .select('id')
    .eq('contact_id', id)
    .eq('is_primary', true)
    .maybeSingle();

  if (phone) {
    if (existingPhone?.id) {
      const { error: phoneError } = await supabase
        .from('contact_phones')
        .update({ phone_number: phone, label: 'mobile', is_primary: true })
        .eq('id', existingPhone.id);
      if (phoneError) throw new Error(phoneError.message);
    } else {
      const { error: phoneError } = await supabase.from('contact_phones').insert({
        contact_id: id,
        phone_number: phone,
        label: 'mobile',
        is_primary: true,
      });
      if (phoneError) throw new Error(phoneError.message);
    }
  } else if (existingPhone?.id) {
    const { error: phoneError } = await supabase.from('contact_phones').delete().eq('id', existingPhone.id);
    if (phoneError) throw new Error(phoneError.message);
  }

  revalidatePath('/contacts');
  revalidatePath(`/contacts/${id}`);
  revalidatePath('/dashboard');
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



export async function updateOpportunityDetail(formData: FormData) {
  const { supabase, user } = await getUserAndClient();
  const id = text(formData, 'id');
  const payload = {
    title: text(formData, 'title'),
    primary_contact_id: nullable(formData, 'primary_contact_id'),
    description: nullable(formData, 'description'),
    stage: text(formData, 'stage') || 'new_lead',
    value_estimate: text(formData, 'value_estimate') ? Number(text(formData, 'value_estimate')) : null,
    probability: text(formData, 'probability') ? Number(text(formData, 'probability')) : null,
    expected_close_date: nullable(formData, 'expected_close_date'),
    next_action: nullable(formData, 'next_action'),
    next_action_due_at: nullable(formData, 'next_action_due_at'),
    source: nullable(formData, 'source'),
  };
  if (!id || !payload.title) throw new Error('ID e titolo opportunità sono obbligatori');
  const { error } = await supabase.from('opportunities').update(payload).eq('id', id).eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/opportunities');
  revalidatePath(`/opportunities/${id}`);
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
