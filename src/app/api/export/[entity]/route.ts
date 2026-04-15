import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'

type Row = Record<string, unknown>

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function toCsv(rows: Row[]) {
  if (!rows.length) return ''
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const escape = (input: string) => {
    const normalized = input.replace(/\r?\n/g, ' ')
    return /[",;]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized
  }

  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((header) => escape(stringifyValue(row[header]))).join(','))
  }
  return lines.join('\n')
}

const config = {
  companies: {
    table: 'companies',
    select: 'id,name,status,city,province,website,email,phone,industry,source,created_at',
    filename: 'quadra-companies.csv',
  },
  contacts: {
    table: 'contacts',
    select: 'id,first_name,last_name,email,phone,role,company_id,linkedin_url,primary_channel,created_at',
    filename: 'quadra-contacts.csv',
  },
  opportunities: {
    table: 'opportunities',
    select: 'id,title,stage,value_estimate,probability,expected_close_date,next_action,next_action_due_at,company_id,primary_contact_id,created_at',
    filename: 'quadra-opportunities.csv',
  },
  followups: {
    table: 'followups',
    select: 'id,title,status,priority,due_at,company_id,contact_id,opportunity_id,created_at',
    filename: 'quadra-followups.csv',
  },
} as const

export async function GET(_request: Request, context: { params: Promise<{ entity: string }> }) {
  const { supabase } = await requireUser()
  const { entity } = await context.params
  const entry = config[entity as keyof typeof config]

  if (!entry) {
    return NextResponse.json({ error: 'Export non supportato' }, { status: 404 })
  }

  const query = (supabase as any)
    .from(entry.table as string)
    .select(entry.select as string)
    .order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const csv = toCsv((data as Row[]) || [])
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${entry.filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
