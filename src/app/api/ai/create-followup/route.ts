import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: auth, error: authError } = await supabase.auth.getUser()
    if (authError || !auth.user) {
      return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })
    }

    const body = await request.json()
    const title = String(body?.title || '').trim()
    const description = String(body?.description || '').trim() || null
    const dueAt = String(body?.dueAt || '').trim()
    const priority = String(body?.priority || 'medium').trim() || 'medium'

    if (!title || !dueAt) {
      return NextResponse.json({ error: 'Titolo e scadenza sono obbligatori.' }, { status: 400 })
    }

    const payload = {
      owner_id: auth.user.id,
      title,
      description,
      due_at: dueAt,
      status: 'pending',
      priority,
      created_by: auth.user.id,
      company_id: body?.companyId || null,
      contact_id: body?.contactId || null,
      opportunity_id: body?.opportunityId || null,
    }

    const { error } = await supabase.from('followups').insert(payload)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/followups')
    revalidatePath('/dashboard')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Errore sconosciuto' }, { status: 500 })
  }
}
