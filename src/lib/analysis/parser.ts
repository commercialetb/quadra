export type ParsedOrderRow = {
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
}

function normalizeKey(key: string) {
  return key.replace(/\uFEFF/g, '').replace(/[’']/g, '').trim().toLowerCase()
}

function detectDelimiter(line: string) {
  const candidates = [',', ';', '\t', '|']
  let best = ','
  let bestCount = -1

  for (const delimiter of candidates) {
    const count = line.split(delimiter).length
    if (count > bestCount) {
      best = delimiter
      bestCount = count
    }
  }

  return best
}

function parseDelimited(text: string, delimiter: string) {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  const pushCell = () => {
    row.push(current.trim())
    current = ''
  }

  const pushRow = () => {
    if (row.length === 1 && row[0] === '' && rows.length > 0) {
      row = []
      return
    }
    rows.push(row)
    row = []
  }

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === delimiter) {
      pushCell()
      continue
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') index += 1
      pushCell()
      pushRow()
      continue
    }

    current += char
  }

  pushCell()
  if (row.length > 0) pushRow()

  return rows.filter((candidate) => candidate.some((value) => value !== ''))
}

function buildRowMap(row: Record<string, string>) {
  const map = new Map<string, string>()
  for (const [key, value] of Object.entries(row)) {
    map.set(normalizeKey(key), String(value ?? '').trim())
  }
  return map
}

function getValue(row: Record<string, string>, keys: string[]) {
  const rowMap = buildRowMap(row)
  for (const key of keys) {
    const hit = rowMap.get(normalizeKey(key))
    if (hit) return hit
  }
  return ''
}

function parseItalianDate(value: string): string {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const match = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/)
  if (!match) return ''

  const day = match[1].padStart(2, '0')
  const month = match[2].padStart(2, '0')
  const year = match[3].length === 2 ? `20${match[3]}` : match[3]

  return `${year}-${month}-${day}`
}

function parseNumber(value: string): number {
  const raw = String(value || '').trim()
  if (!raw) return 0

  const cleaned = raw.replace(/\s/g, '')
  if (cleaned.includes('.') && cleaned.includes(',')) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.')) || 0
  }
  if (cleaned.includes(',')) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.')) || 0
  }

  return Number(cleaned) || 0
}

export function parseAnalysisCsvText(text: string, account: string, sourceType: string): ParsedOrderRow[] {
  const sanitized = text.replace(/^\uFEFF/, '')
  const firstLine = sanitized.split(/\r?\n/).find((line) => line.trim().length > 0) ?? ''
  const delimiter = detectDelimiter(firstLine)
  const matrix = parseDelimited(sanitized, delimiter)

  if (matrix.length < 2) {
    return []
  }

  const columns = matrix[0].map((value, index) => value || `Colonna ${index + 1}`)
  const rows = matrix.slice(1).map((cells) => {
    const record: Record<string, string> = {}
    columns.forEach((column, index) => {
      record[column] = cells[index] ?? ''
    })
    return record
  })

  return rows
    .map((row) => {
      const orderDate = parseItalianDate(
        getValue(row, ['Data dell ordine', 'Data dell’ordine', "Data dell'ordine", 'order_date', 'Data ordine'])
      )
      const shipDate = parseItalianDate(
        getValue(row, ['Data di spedizione', 'Data di spedizione modificata il', 'ship_date'])
      )
      const begaOrder = getValue(row, ['Numero ordine BEGA', 'bega_order', 'Ordine BEGA'])
      const customerOrder = getValue(row, ['Il suo ordine', 'customer_order', 'Ordine cliente'])
      const status = getValue(row, ['Stato', 'status'])
      const positions = parseNumber(getValue(row, ['Posizioni', 'positions']))
      const total = parseNumber(getValue(row, ['Totale', 'total_eur', 'Importo']))

      return {
        account: account.trim() || 'Account non assegnato',
        source_type: sourceType.trim() || 'Completed',
        order_date: orderDate,
        customer_order: customerOrder,
        bega_order: begaOrder,
        status,
        ship_date: shipDate || null,
        positions,
        total_eur: total,
        month: orderDate.slice(0, 7),
      }
    })
    .filter((row) => row.order_date && row.bega_order)
}

export function normalizeAccountName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(srl|s\s*r\s*l|spa|s\s*p\s*a|srls|sas|snc|societa|soc|group|gruppo|studio)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeOpportunityReference(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^rif\.?\s*/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
