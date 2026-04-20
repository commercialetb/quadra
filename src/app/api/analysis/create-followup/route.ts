import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function buildDueAt(days = 2) {
  const target = new Date()
  target.setDate(target.getDate() + Math.max(1, Math.min(days, 14)))
  target.setHours(9, 0, 0, 0)
  return target.toISOString()
}

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
    const priority = String(body?.priority || 'medium').trim() || 'medium'
    const companyId = String(body?.companyId || '').trim() || null
    const opportunityId = String(body?.opportunityId || '').trim() || null
    const dueAt = String(body?.dueAt || '').trim() || buildDueAt(Number(body?.dueInDays || 2))

    if (!title) {
      return NextResponse.json({ error: 'Titolo obbligatorio.' }, { status: 400 })
    }

    if (!companyId && !opportunityId) {
      return NextResponse.json({ error: 'Serve almeno un collegamento azienda o opportunità.' }, { status: 400 })
    }

    const { data: existing, error: existingError } = await supabase
      .from('followups')
      .select('id')
      .eq('owner_id', auth.user.id)
      .eq('title', title)
      .eq('company_id', companyId)
      .in('status', ['pending', 'in_progress', 'overdue'])
      .limit(1)

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    if ((existing ?? []).length > 0) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        message: 'Esiste già un follow-up aperto simile.',
        openUrl: '/followups',
      })
    }

    const payload = {
      owner_id: auth.user.id,
      title,
      description,
      due_at: dueAt,
      status: 'pending',
      priority,
      created_by: auth.user.id,
      company_id: companyId,
      opportunity_id: opportunityId,
    }

    const { data: inserted, error } = await supabase.from('followups').insert(payload).select('id').single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/followups')
    revalidatePath('/dashboard')
    revalidatePath('/analysis')
    if (companyId) revalidatePath(`/companies/${companyId}`)
    return NextResponse.json({ ok: true, id: inserted?.id ?? null, openUrl: `/followups?created=${inserted?.id ?? ''}` })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Errore sconosciuto' }, { status: 500 })
  }
}
