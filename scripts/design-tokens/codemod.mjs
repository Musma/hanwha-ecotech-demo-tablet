/**
 * 빅뱅 codemod — Tailwind arbitrary 색상값 `…-[#hex]` 을 Figma 색 토큰 유틸로 치환한다.
 *
 *   bg-[#f37321]              → bg-hw-orange-main
 *   focus-visible:ring-[#a1a1a1]/50 → focus-visible:ring-hw-gray-main/50   (opacity 보존)
 *
 * 대상: src 의 .vue / .ts 중 bracket 형식 색상값(따옴표 raw hex·mapbox 색은 제외).
 * 정책: EXACT·SHADCN 은 토큰으로, 그 외 미매칭 색은 Figma 팔레트 중 최근접 토큰으로
 *       스냅한다(2026-06-22 결정). 스냅된 색은 Δ(거리)와 함께 리포트한다.
 *
 * 사용:
 *   node scripts/design-tokens/codemod.mjs            # 리포트(스냅 미리보기) only
 *   node scripts/design-tokens/codemod.mjs --write     # 실제 치환
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join, extname } from 'node:path'

import { AUTO, EXACT, SHADCN, normalizeHex, nearestToken } from './palette.mjs'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git'])
const EXCLUDE_PATH = 'assets/css' // 토큰 정의 파일은 건드리지 않는다
const EXTS = new Set(['.vue', '.ts'])

// 색상 arbitrary value: `prefix-[#hex]`. prefix 는 variant chain(focus-visible:, hover:, dark: 등) 포함.
const COLOR_RE = /([\w:-]+)-\[#([0-9a-fA-F]{3,8})\]/g

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

const files = walk(SRC)
const snapped = new Map() // hex → { count, token, distance, files:Set }
const changedFiles = []

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  let touched = false
  const next = src.replace(COLOR_RE, (match, prefix, rawHex) => {
    const hex = normalizeHex(rawHex)
    let token = AUTO[hex]
    if (!token) {
      // 미매칭 → Figma 팔레트 중 최근접 토큰으로 스냅
      const near = nearestToken(hex)
      token = near.token
      const rel = file.replace(ROOT + '/', '')
      const rec = snapped.get(hex) ?? { count: 0, token: near.token, distance: near.distance, files: new Set() }
      rec.count += 1
      rec.files.add(rel)
      snapped.set(hex, rec)
    }
    touched = true
    return `${prefix}-${token}`
  })
  if (touched && next !== src) {
    if (write) writeFileSync(file, next)
    changedFiles.push(file.replace(ROOT + '/', ''))
  }
}

// ── 리포트 ──────────────────────────────────────────────
console.log(`\n스캔 파일: ${files.length}개`)
console.log(`자동 치환 토큰: EXACT ${Object.keys(EXACT).length} + SHADCN ${Object.keys(SHADCN).length}`)
console.log(`치환 영향 파일: ${changedFiles.length}개`)

if (snapped.size > 0) {
  console.log(`\nↆ  최근접 토큰으로 스냅된 미매칭 색 ${snapped.size}종 (Δ=RGB 거리):`)
  const sorted = [...snapped.entries()].sort((a, b) => b[1].count - a[1].count)
  for (const [hex, rec] of sorted) {
    const fileList = [...rec.files].slice(0, 3).join(', ')
    console.log(
      `  #${hex.padEnd(6)} ×${String(rec.count).padStart(3)}  → ${rec.token} (Δ${rec.distance})  | ${fileList}${rec.files.size > 3 ? ' …' : ''}`,
    )
  }
}

if (!write) {
  console.log('\n(리포트 모드. 실제 치환하려면 --write)')
} else {
  console.log(`\n✅ ${changedFiles.length}개 파일 치환 완료.`)
}
