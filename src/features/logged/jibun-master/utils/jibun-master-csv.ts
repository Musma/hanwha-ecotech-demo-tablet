import type { Jibun } from '@/features/logged/jibun/types/jibun'

export interface ParseJibunsResult {
  jibuns?: Jibun[]
  error?: string
}

function parseCsvRows(text: string): string[][] {
  const s = String(text).replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < s.length; i += 1) {
    const c = s[i]
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }

  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''))
}

export function parseJibunsCsv(text: string): ParseJibunsResult {
  const rows = parseCsvRows(text)
  if (rows.length < 2) return { error: 'CSV에 데이터 행이 없습니다.' }

  const header = rows[0].map((h) => String(h).trim())
  const idx = (name: string) => header.indexOf(name)
  if (idx('ID') < 0 || idx('형상') < 0) {
    return {
      error:
        'CSV 헤더 형식이 올바르지 않습니다 (ID·형상 컬럼 필요). 다운로드한 CSV 형식을 사용해 주십시오.',
    }
  }

  const numOrNull = (v: string): number | null => {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : null
  }
  const intOrNull = (v: string): number | null => {
    if (v == null || String(v).trim() === '') return null
    const n = parseInt(v, 10)
    return Number.isFinite(n) ? n : null
  }
  const jibuns: Jibun[] = []
  const seen = new Set<number>()

  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r]
    const get = (name: string) => {
      const i = idx(name)
      return i >= 0 ? String(row[i] ?? '').trim() : ''
    }
    const id = intOrNull(get('ID'))
    if (id == null || seen.has(id)) continue

    seen.add(id)
    jibuns.push({
      id,
      parent: intOrNull(get('상위ID')),
      abbr: get('약어'),
      sabbr: get('단축'),
      name: get('명칭'),
      level: (intOrNull(get('Level')) ?? 0) as Jibun['level'],
      sphy: [
        numOrNull(get('시작물리X')) ?? 0,
        numOrNull(get('시작물리Y')) ?? 0,
      ],
      gap: [numOrNull(get('이격X')) ?? 0, numOrNull(get('이격Y')) ?? 0],
      indoor: get('옥내') || null,
      use: get('용도') || null,
      pave: get('포장') || null,
      maxL: numOrNull(get('최대L')),
      maxW: numOrNull(get('최대W')),
      maxH: numOrNull(get('최대H')),
      maxT: numOrNull(get('MaxT')),
      area: numOrNull(get('면적')),
      org: get('관리조직') || null,
      cost: numOrNull(get('물류원가')),
      poly: get('형상') || null,
      pcg: null,
      pcls: null,
      pstage: null,
      stackType: null,
      mgr: null,
    })
  }

  if (!jibuns.length)
    return { error: '유효한 지번 행이 없습니다 (ID 값을 확인해 주십시오).' }
  return { jibuns }
}

export function exportJibunsCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
): void {
  const escape = (v: unknown) => {
    if (v == null) return ''
    const s = String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const csv = [
    headers.map(escape).join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
