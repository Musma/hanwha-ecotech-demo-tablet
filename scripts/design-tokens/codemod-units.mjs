/**
 * 단위 codemod — 정의된 토큰과 정확히 일치하는 typography/radius/spacing arbitrary
 * 값을 토큰 유틸리티로 치환한다(check-tokens.mjs 의 WARN 과 동일 기준).
 *
 *   text-[12px]        → text-xs
 *   rounded-[8px]      → rounded-md
 *   px-[10px]          → px-2.5
 *   hover:gap-[8px]    → hover:gap-2
 *
 * off-scale(text-[13px], px-[9px] 등)은 토큰이 없으므로 건드리지 않는다.
 * 색상은 대상이 아니다(codemod.mjs 사용).
 *
 * 사용:
 *   node scripts/design-tokens/codemod-units.mjs            # 리포트
 *   node scripts/design-tokens/codemod-units.mjs --write     # 실제 치환
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = process.cwd()
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git'])
const EXCLUDE_PATH = 'assets/css'
const EXTS = new Set(['.vue', '.ts'])

const TEXT = { 12: 'text-xs', 14: 'text-sm', 16: 'text-base', 18: 'text-lg', 20: 'text-xl', 24: 'text-2xl', 30: 'text-3xl', 36: 'text-4xl', 48: 'text-5xl', 60: 'text-6xl', 72: 'text-7xl', 96: 'text-8xl', 128: 'text-9xl' }
const RADIUS = { 2: 'rounded-xs', 6: 'rounded-sm', 8: 'rounded-md', 10: 'rounded-lg', 14: 'rounded-xl', 16: 'rounded-2xl', 24: 'rounded-3xl', 32: 'rounded-4xl' }
const SPACING_STEP = { 2: '0.5', 4: '1', 6: '1.5', 8: '2', 10: '2.5', 12: '3', 14: '3.5', 16: '4', 20: '5', 24: '6', 28: '7', 32: '8', 36: '9', 40: '10', 44: '11', 48: '12' }
const SPACING_PREFIXES = new Set(['p', 'px', 'py', 'pt', 'pb', 'pl', 'pr', 'ps', 'pe', 'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr', 'gap', 'gap-x', 'gap-y', 'space-x', 'space-y', 'w', 'h', 'size', 'min-w', 'min-h', 'max-w', 'max-h', 'top', 'bottom', 'left', 'right', 'inset', 'inset-x', 'inset-y'])

const PX_RE = /((?:[\w-]+:)*)([\w-]+)-\[(\d+)px\]/g
const write = process.argv.includes('--write')

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) walk(join(dir, entry.name), out)
    } else if (EXTS.has(extname(entry.name))) {
      const full = join(dir, entry.name)
      if (!full.includes(EXCLUDE_PATH)) out.push(full)
    }
  }
  return out
}

function tokenFor(prefix, px) {
  if (prefix === 'text' && TEXT[px]) return TEXT[px]
  if (prefix === 'rounded' && RADIUS[px]) return RADIUS[px]
  if (SPACING_PREFIXES.has(prefix) && SPACING_STEP[px]) return `${prefix}-${SPACING_STEP[px]}`
  return null
}

const files = walk(join(ROOT, 'src'))
const changes = new Map() // "text-[12px]→text-xs" → count
const changedFiles = []

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  let touched = false
  const next = src.replace(PX_RE, (match, variant, prefix, pxStr) => {
    const token = tokenFor(prefix, Number(pxStr))
    if (!token) return match
    touched = true
    const key = `${prefix}-[${pxStr}px] → ${token}`
    changes.set(key, (changes.get(key) ?? 0) + 1)
    return `${variant}${token}`
  })
  if (touched && next !== src) {
    if (write) writeFileSync(file, next)
    changedFiles.push(file.replace(ROOT + '/', ''))
  }
}

const total = [...changes.values()].reduce((a, b) => a + b, 0)
console.log(`\n스캔 ${files.length}개 / 치환 ${total}건 / 영향 파일 ${changedFiles.length}개`)
for (const [k, n] of [...changes.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ×${String(n).padStart(3)}  ${k}`)
}
console.log(write ? '\n✅ 치환 완료.' : '\n(리포트 모드. 실제 치환하려면 --write)')
