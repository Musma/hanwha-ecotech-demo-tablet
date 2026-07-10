/**
 * 디자인 토큰 하드코딩 감지기.
 *
 *  - ERROR : Tailwind arbitrary 색상값 `…-[#hex]` (색은 반드시 hw-* 토큰을 써야 한다)
 *  - WARN  : 정의된 토큰과 정확히 일치하는 typography/radius/spacing arbitrary 값
 *            (예: text-[12px] → text-xs). off-scale 값(text-[13px] 등)은 허용한다.
 *
 * 대상: src 의 .vue / .ts. 토큰 정의 파일(assets/css)·따옴표 raw hex(mapbox 등)는 제외.
 * 사용:
 *   node scripts/design-tokens/check-tokens.mjs            # 전체 스캔(CI/수동)
 *   node scripts/design-tokens/check-tokens.mjs <files...>  # 지정 파일만(lint-staged)
 *
 * 종료코드: ERROR 가 하나라도 있으면 1, 아니면 0(WARN 은 통과).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = process.cwd()
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git'])
const EXCLUDE_PATH = 'assets/css'
const EXTS = new Set(['.vue', '.ts'])

// px → 토큰 이름. theme.css 의 스케일과 일치해야 한다.
const TEXT = { 12: 'text-xs', 14: 'text-sm', 16: 'text-base', 18: 'text-lg', 20: 'text-xl', 24: 'text-2xl', 30: 'text-3xl', 36: 'text-4xl', 48: 'text-5xl', 60: 'text-6xl', 72: 'text-7xl', 96: 'text-8xl', 128: 'text-9xl' }
const RADIUS = { 2: 'rounded-xs', 6: 'rounded-sm', 8: 'rounded-md', 10: 'rounded-lg', 14: 'rounded-xl', 16: 'rounded-2xl', 24: 'rounded-3xl', 32: 'rounded-4xl' }
// spacing(--spacing: 4px) 의 표준 step. px → step
const SPACING_STEP = { 2: '0.5', 4: '1', 6: '1.5', 8: '2', 10: '2.5', 12: '3', 14: '3.5', 16: '4', 20: '5', 24: '6', 28: '7', 32: '8', 36: '9', 40: '10', 44: '11', 48: '12' }
const SPACING_PREFIXES = ['p', 'px', 'py', 'pt', 'pb', 'pl', 'pr', 'ps', 'pe', 'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr', 'gap', 'gap-x', 'gap-y', 'space-x', 'space-y', 'w', 'h', 'size', 'min-w', 'min-h', 'max-w', 'max-h', 'top', 'bottom', 'left', 'right', 'inset', 'inset-x', 'inset-y']

const COLOR_RE = /[\w:-]+-\[#[0-9a-fA-F]{3,8}\]/g
// prefix-[Npx] (variant chain 포함). 색이 아닌 길이값.
const PX_RE = /((?:[\w-]+:)*)([\w-]+)-\[(\d+)px\]/g

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

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length
}

// 인자로 파일이 주어지면 그 파일만, 아니면 src 전체.
const argFiles = process.argv.slice(2).filter((a) => !a.startsWith('--'))
let files
if (argFiles.length) {
  files = argFiles
    .map((f) => (f.startsWith('/') ? f : join(ROOT, f)))
    .filter((f) => EXTS.has(extname(f)) && !f.includes(EXCLUDE_PATH))
    .filter((f) => {
      try { return statSync(f).isFile() } catch { return false }
    })
} else {
  files = walk(join(ROOT, 'src'))
}

const errors = []
const warns = []

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  const rel = file.replace(ROOT + '/', '')

  for (const m of src.matchAll(COLOR_RE)) {
    errors.push({ rel, line: lineOf(src, m.index), text: m[0] })
  }

  for (const m of src.matchAll(PX_RE)) {
    const [full, variant, prefix, pxStr] = m
    const px = Number(pxStr)
    let suggestion = null
    if (prefix === 'text' && TEXT[px]) suggestion = TEXT[px]
    else if (prefix === 'rounded' && RADIUS[px]) suggestion = RADIUS[px]
    else if (SPACING_PREFIXES.includes(prefix) && SPACING_STEP[px]) suggestion = `${prefix}-${SPACING_STEP[px]}`
    if (suggestion) warns.push({ rel, line: lineOf(src, m.index), text: full, suggestion: variant + suggestion })
  }
}

if (warns.length) {
  console.log(`\n⚠️  토큰으로 대체 가능한 arbitrary 값 ${warns.length}건 (경고):`)
  for (const w of warns) console.log(`  ${w.rel}:${w.line}  ${w.text}  →  ${w.suggestion}`)
}

if (errors.length) {
  console.log(`\n❌ 색상 하드코딩 ${errors.length}건 — hw-* 토큰을 사용하세요(theme.css):`)
  for (const e of errors) console.log(`  ${e.rel}:${e.line}  ${e.text}`)
  console.log('')
  process.exit(1)
}

console.log(`✅ 색상 하드코딩 없음. (스캔 ${files.length}개, 경고 ${warns.length}건)`)
