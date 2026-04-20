import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeOpportunityReference, parseAnalysisCsvText, type ParsedOrderRow } from '@/lib/analysis/parser'

type OpportunityRow = {
  id: string
  title: string
  description: string | null
  stage: string
  value_estimate: number | null
  source: string | null
  expected_close_date?: string | null
  external_ref?: string | null
  external_ref_normalized?: string | null
}

type ExistingOrderRow = {
  id: string
  bega_order: string
  opportunity_id: string | null
  status: string | null
  external_ref_normalized?: string | null
}

type PreviewItem = {
  reference: string
  bega_order: string
  status: string
  total_eur: number
  action: 'create' | 'update' | 'skip'
  warning?: string
  matchedOpportunity?: string
  existingOrder?: boolean
}

type PreviewBuildOptions = {
  createMissing: boolean
  updateExisting: boolean
}

function readCheckbox(formData: FormData, key: string, fallback = false) {
  const value = formData.get(key)
  if (value === null) return fallback
  return value === 'on' || value === 'true' || value === '1'
}

function mapImportedStatusToStage(status: string) {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('annull')) return 'lost'
  if (normalized.includes('sped') || normalized.includes('conseg') || normalized.includes('evas')) return 'won'
  if (normalized.includes('offer') || normalized.includes('quot')) return 'proposal'
  if (normalized.includes('nego')) return 'negotiation'
  if (normalized.includes('attesa') || normalized.includes('pending')) return 'qualified'
  return 'qualified'
}

function buildImportNote(params: {
  companyName: string
  sourceType: string
  created: number
  updated: number
  skipped: number
  warnings: number
}) {
  const { companyName, sourceType, created, updated, skipped, warnings } = params
  return `${companyName} / ${sourceType} / create ${created} / update ${updated} / skip ${skipped} / warning ${warnings}`
}

function buildOpportunityLookup(existingOpportunities: OpportunityRow[]) {
  const normalized = new Map<string, OpportunityRow[]>()

  for (const opportunity of existingOpportunities) {
    const refs = new Set<string>()
    const externalRef = String(opportunity.external_ref || '').trim()
    const title = String(opportunity.title || '').trim()
    if (externalRef) refs.add(externalRef)
    if (title) refs.add(title)
    const storedNormalized = normalizeOpportunityReference(String(opportunity.external_ref_normalized || ''))
    if (storedNormalized) refs.add(storedNormalized)

    for (const ref of refs) {
      const normalizedRef = normalizeOpportunityReference(ref)
      if (!normalizedRef) continue
      const list = normalized.get(normalizedRef) ?? []
      list.push(opportunity)
      normalized.set(normalizedRef, list)
    }
  }

  return { normalized }
}

function buildOrderLookup(existingOrders: ExistingOrderRow[]) {
  const map = new Map<string, ExistingOrderRow>()
  for (const order of existingOrders) {
    const key = String(order.bega_order || '').trim()
    if (!key) continue
    map.set(key, order)
  }
  return map
}

function resolveOpportunity(reference: string, lookup: ReturnType<typeof buildOpportunityLookup>) {
  const normalizedRef = normalizeOpportunityReference(reference)
  if (!normalizedRef) {
    return { type: 'missing_reference' as const, matches: [] as OpportunityRow[] }
  }

  const candidates = lookup.normalized.get(normalizedRef) ?? []
  const uniqueCandidates = Array.from(new Map(candidates.map((candidate) => [candidate.id, candidate])).values())

  if (uniqueCandidates.length === 0) return { type: 'none' as const, matches: [] as OpportunityRow[] }
  if (uniqueCandidates.length > 1) return { type: 'ambiguous' as const, matches: uniqueCandidates }
  return { type: 'single' as const, matches: uniqueCandidates }
}

function buildPreview(
  parsedRows: ParsedOrderRow[],
  lookup: ReturnType<typeof buildOpportunityLookup>,
  orderLookup: ReturnType<typeof buildOrderLookup>,
  options: PreviewBuildOptions,
) {
  let createCount = 0
  let updateCount = 0
  let skipCount = 0
  let warningCount = 0
  const preview: PreviewItem[] = []
  const duplicateOrders = new Set<string>()

  for (const row of parsedRows) {
    const reference = row.customer_order.trim() || row.bega_order.trim()
    const begaOrder = row.bega_order.trim()
    const resolution = resolveOpportunity(reference, lookup)
    const existingOrder = orderLookup.get(begaOrder)

    if (begaOrder && duplicateOrders.has(begaOrder)) {
      skipCount += 1
      warningCount += 1
      preview.push({
        reference: reference || '(senza riferimento)',
        bega_order: begaOrder,
        status: row.status,
        total_eur: row.total_eur,
        action: 'skip',
        warning: 'Ordine BEGA duplicato nello stesso CSV: viene tenuta solo la prima riga.',
        existingOrder: Boolean(existingOrder),
      })
      continue
    }
    if (begaOrder) duplicateOrders.add(begaOrder)

    if (resolution.type === 'single') {
      if (!options.updateExisting) {
        skipCount += 1
        warningCount += 1
        preview.push({
          reference,
          bega_order: row.bega_order,
          status: row.status,
          total_eur: row.total_eur,
          action: 'skip',
          warning: 'Opportunità già presente: abilita “Aggiorna opportunità esistenti” per allinearla.',
          matchedOpportunity: resolution.matches[0].title,
          existingOrder: Boolean(existingOrder),
        })
        continue
      }

      updateCount += 1
      preview.push({
        reference,
        bega_order: row.bega_order,
        status: row.status,
        total_eur: row.total_eur,
        action: 'update',
        warning: existingOrder ? 'Ordine BEGA già presente: verrà aggiornato insieme all’opportunità.' : undefined,
        matchedOpportunity: resolution.matches[0].title,
        existingOrder: Boolean(existingOrder),
      })
      continue
    }

    if (resolution.type === 'ambiguous') {
      skipCount += 1
      warningCount += 1
      preview.push({
        reference,
        bega_order: row.bega_order,
        status: row.status,
        total_eur: row.total_eur,
        action: 'skip',
        warning: `Riferimento ambiguo: trovate ${resolution.matches.length} opportunità simili.`,
        existingOrder: Boolean(existingOrder),
      })
      continue
    }

    if (resolution.type === 'missing_reference') {
      skipCount += 1
      warningCount += 1
      preview.push({
        reference: '(senza riferimento)',
        bega_order: row.bega_order,
        status: row.status,
        total_eur: row.total_eur,
        action: 'skip',
        warning: 'Riga senza riferimento opportunità.',
        existingOrder: Boolean(existingOrder),
      })
      continue
    }

    if (!options.createMissing) {
      skipCount += 1
      warningCount += 1
      preview.push({
        reference,
        bega_order: row.bega_order,
        status: row.status,
        total_eur: row.total_eur,
        action: 'skip',
        warning: 'Opportunità non trovata: abilita “Crea opportunità mancanti” per inserirla.',
        existingOrder: Boolean(existingOrder),
      })
      continue
    }

    createCount += 1
    preview.push({
      reference,
      bega_order: row.bega_order,
      status: row.status,
      total_eur: row.total_eur,
      action: 'create',
      warning: existingOrder ? 'Ordine BEGA già presente: verrà riallineato e collegato al nuovo riferimento.' : undefined,
      existingOrder: Boolean(existingOrder),
    })
  }

  return {
    createCount,
    updateCount,
    skipCount,
    warningCount,
    preview,
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Utente non autenticato.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const companyId = String(formData.get('company_id') || '').trim()
  const sourceType = String(formData.get('source_type') || 'Completed').trim()
  const mode = String(formData.get('mode') || 'preview').trim().toLowerCase()
  const applyImportedOnly = readCheckbox(formData, 'apply_imported_only', true)
  const createMissing = readCheckbox(formData, 'create_missing', true)
  const updateExisting = readCheckbox(formData, 'update_existing', true)

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File CSV mancante.' }, { status: 400 })
  }

  if (!companyId) {
    return NextResponse.json({ error: 'Seleziona l’azienda a cui appartiene il CSV.' }, { status: 400 })
  }

  const { data: company, error: companyError } = await supabase.from('companies').select('id,name').eq('id', companyId).maybeSingle()
  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 })
  }
  if (!company) {
    return NextResponse.json({ error: 'Azienda non trovata.' }, { status: 404 })
  }

  const csvText = await file.text()
  const parsedRows = parseAnalysisCsvText(csvText, company.name, sourceType)
  if (parsedRows.length === 0) {
    return NextResponse.json({ error: 'Nessuna riga valida trovata nel CSV.' }, { status: 400 })
  }

  const begaOrders = Array.from(new Set(parsedRows.map((row) => row.bega_order.trim()).filter(Boolean)))

  const [opportunitiesRes, existingOrdersRes] = await Promise.all([
    supabase
      .from('opportunities')
      .select('id,title,description,stage,value_estimate,source,expected_close_date,external_ref,external_ref_normalized')
      .eq('company_id', companyId)
      .eq('owner_id', authData.user.id)
      .limit(500),
    supabase
      .from('orders')
      .select('id,bega_order,opportunity_id,status,external_ref_normalized')
      .eq('owner_id', authData.user.id)
      .in('bega_order', begaOrders),
  ])

  if (opportunitiesRes.error) {
    return NextResponse.json({ error: opportunitiesRes.error.message }, { status: 500 })
  }

  if (existingOrdersRes.error) {
    return NextResponse.json({ error: existingOrdersRes.error.message }, { status: 500 })
  }

  const lookup = buildOpportunityLookup((opportunitiesRes.data ?? []) as OpportunityRow[])
  const orderLookup = buildOrderLookup((existingOrdersRes.data ?? []) as ExistingOrderRow[])
  const summary = buildPreview(parsedRows, lookup, orderLookup, { createMissing, updateExisting })

  if (mode === 'preview') {
    return NextResponse.json({
      preview: summary.preview.slice(0, 18),
      totalRows: parsedRows.length,
      createCount: summary.createCount,
      updateCount: summary.updateCount,
      skipCount: summary.skipCount,
      warningCount: summary.warningCount,
      companyName: company.name,
      sourceType,
    })
  }

  const rowsToUpsert: Array<{
    owner_id: string
    company_id: string
    opportunity_id: string | null
    account: string
    source_type: string
    order_date: string
    customer_order: string
    bega_order: string
    status: string
    ship_date: string | null
    positions: number
    total_eur: number
    month: string
    external_ref: string
    external_ref_normalized: string
  }> = []

  let createdOpportunities = 0
  let updatedOpportunities = 0
  let skippedRows = 0
  let warningRows = 0
  const seenBegaOrders = new Set<string>()

  for (const row of parsedRows) {
    const reference = row.customer_order.trim() || row.bega_order.trim()
    const normalizedReference = normalizeOpportunityReference(reference)
    const begaOrder = row.bega_order.trim()
    const resolution = resolveOpportunity(reference, lookup)
    let linkedOpportunityId: string | null = null

    if (begaOrder && seenBegaOrders.has(begaOrder)) {
      skippedRows += 1
      warningRows += 1
      continue
    }
    if (begaOrder) seenBegaOrders.add(begaOrder)

    if (resolution.type === 'ambiguous' || resolution.type === 'missing_reference') {
      skippedRows += 1
      warningRows += 1
      continue
    }

    if (resolution.type === 'single') {
      const existing = resolution.matches[0]
      linkedOpportunityId = existing.id

      if (!updateExisting) {
        skippedRows += 1
        warningRows += 1
        continue
      }

      const descriptionLines = [
        existing.description,
        `Import ${sourceType}: ordine BEGA ${row.bega_order} · stato ${row.status} · spedizione ${row.ship_date ?? 'n/d'}`,
      ].filter(Boolean)

      const nextPayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        external_ref: reference,
        external_ref_normalized: normalizedReference,
        last_imported_order_at: row.order_date,
        import_source: `CSV ${sourceType}`,
      }

      if (applyImportedOnly) {
        nextPayload.stage = mapImportedStatusToStage(row.status)
        nextPayload.value_estimate = row.total_eur || existing.value_estimate
        nextPayload.expected_close_date = row.ship_date || row.order_date || existing.expected_close_date || null
        nextPayload.source = existing.source || `CSV ${sourceType}`
        nextPayload.description = descriptionLines.join('\n').slice(0, 4000)
      }

      const { error: updateError } = await supabase
        .from('opportunities')
        .update(nextPayload)
        .eq('id', existing.id)
        .eq('owner_id', authData.user.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      updatedOpportunities += 1
    } else if (createMissing && reference) {
      const { data: insertedOpportunity, error: insertError } = await supabase
        .from('opportunities')
        .insert({
          owner_id: authData.user.id,
          company_id: companyId,
          title: reference,
          description: `Creata da import ${sourceType}. Ordine BEGA ${row.bega_order}.`,
          stage: mapImportedStatusToStage(row.status),
          value_estimate: row.total_eur,
          expected_close_date: row.ship_date || row.order_date,
          source: `CSV ${sourceType}`,
          external_ref: reference,
          external_ref_normalized: normalizedReference,
          last_imported_order_at: row.order_date,
          import_source: `CSV ${sourceType}`,
        })
        .select('id,title,description,stage,value_estimate,source,expected_close_date,external_ref,external_ref_normalized')
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      const inserted = insertedOpportunity as OpportunityRow
      linkedOpportunityId = inserted.id
      const list = lookup.normalized.get(normalizedReference) ?? []
      list.push(inserted)
      lookup.normalized.set(normalizedReference, list)
      createdOpportunities += 1
    } else {
      skippedRows += 1
      warningRows += 1
      continue
    }

    rowsToUpsert.push({
      owner_id: authData.user.id,
      company_id: companyId,
      opportunity_id: linkedOpportunityId,
      account: company.name,
      source_type: row.source_type,
      order_date: row.order_date,
      customer_order: row.customer_order,
      bega_order: row.bega_order,
      status: row.status,
      ship_date: row.ship_date,
      positions: row.positions,
      total_eur: row.total_eur,
      month: row.month,
      external_ref: reference,
      external_ref_normalized: normalizedReference,
    })
  }

  if (rowsToUpsert.length > 0) {
    const { error: upsertError } = await supabase.from('orders').upsert(rowsToUpsert, { onConflict: 'owner_id,bega_order' })
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }
  }

  const { error: importError } = await supabase.from('analysis_imports').insert({
    owner_id: authData.user.id,
    company_id: companyId,
    filename: file.name,
    source_type: sourceType,
    rows_imported: rowsToUpsert.length,
    status: warningRows > 0 ? 'completed_with_warnings' : 'done',
    notes: buildImportNote({
      companyName: company.name,
      sourceType,
      created: createdOpportunities,
      updated: updatedOpportunities,
      skipped: skippedRows,
      warnings: warningRows,
    }),
    created_count: createdOpportunities,
    updated_count: updatedOpportunities,
    skipped_count: skippedRows,
    warning_count: warningRows,
  })

  if (importError) {
    return NextResponse.json({ error: importError.message }, { status: 500 })
  }

  return NextResponse.json({
    imported: rowsToUpsert.length,
    createdOpportunities,
    updatedOpportunities,
    skippedRows,
    warningRows,
  })
}
