export type ParsedImportFile = {
  fileName: string
  sheets: Array<{
    name: string
    columns: string[]
    rows: Record<string, string>[]
  }>
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

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
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
      if (char === '\r' && next === '\n') i += 1
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

export async function parseImportFile(file: File): Promise<ParsedImportFile> {
  const raw = await file.text()
  const text = raw.replace(/^\uFEFF/, '')
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? ''
  const delimiter = detectDelimiter(firstLine)
  const matrix = parseDelimited(text, delimiter)

  if (matrix.length < 2) {
    throw new Error('Il file deve contenere almeno una riga intestazione e una riga dati.')
  }

  const columns = matrix[0].map((value, index) => value || `Colonna ${index + 1}`)
  const rows = matrix.slice(1).map((cells) => {
    const record: Record<string, string> = {}
    columns.forEach((column, index) => {
      record[column] = cells[index] ?? ''
    })
    return record
  })

  return {
    fileName: file.name,
    sheets: [
      {
        name: file.name.replace(/\.[^.]+$/, '') || 'Foglio 1',
        columns,
        rows,
      },
    ],
  }
}
