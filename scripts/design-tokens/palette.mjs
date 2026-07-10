/**
 * Design-system 색상 팔레트 — Figma(node 5145-17490 "02. Color")가 source of truth.
 * codemod 와 hardcoded-hex 감지기가 공유한다.
 *
 * - EXACT  : Figma Variables 와 hex 가 정확히 일치 → codemod 자동 치환, allowlist 포함
 * - SHADCN : Figma 에 없는 shadcn 기본 neutral → 손으로 검증한 최근접 Hanwha 토큰으로 흡수
 * - 그 외   : "미매칭(category 3)" → codemod 가 정지하고 사용자에게 보고
 */

/** Figma 팔레트. key = 소문자 hex(# 제외), value = 토큰 suffix(`hw-` 뒤). */
export const EXACT = {
  // Orange (*Primary)
  fbb584: 'hw-orange-lighter',
  f89b6c: 'hw-orange-light',
  f37321: 'hw-orange-main',
  ff6506: 'hw-orange-dark',
  a64e17: 'hw-orange-darker',
  // Blue (*Secondary)
  cce7f5: 'hw-blue-lighter',
  '1fd5da': 'hw-blue-light',
  '21a3e6': 'hw-blue-main',
  '0a72f2': 'hw-blue-dark',
  '3322f2': 'hw-blue-darker',
  // Gray
  dcdcdc: 'hw-gray-lighter',
  cccccc: 'hw-gray-light',
  '929292': 'hw-gray-main',
  '444648': 'hw-gray-dark',
  '1d1f21': 'hw-gray-darker',
  // White
  f4f6f9: 'hw-white-lighter',
  f9fafb: 'hw-white-light',
  ffffff: 'hw-white-main',
  eeeeee: 'hw-white-dark',
  eaeaea: 'hw-white-darker',
  // Red
  f5d4cc: 'hw-red-lighter',
  f24d22: 'hw-red-light',
  f22922: 'hw-red-main',
  e40c01: 'hw-red-dark',
  '940e0f': 'hw-red-darker',
  // Green
  ddefe4: 'hw-green-lighter',
  '5ecb5e': 'hw-green-light',
  '4a9d67': 'hw-green-main',
  '008233': 'hw-green-dark',
  '054522': 'hw-green-darker',
  // 그리드 밖 단일 토큰
  '262e38': 'hw-text-primary',
  '8b8b8b': 'hw-grey-2',
  e4e4e4: 'hw-btn-hover',
}

/** Figma 에 없는 shadcn 기본 neutral → 최근접 Hanwha 토큰(손 검증). */
export const SHADCN = {
  e7000b: 'hw-red-dark', // shadcn destructive red ≈ #e40c01
  fafafa: 'hw-white-light', // ≈ #f9fafb
  f5f5f5: 'hw-white-light', // ≈ #f9fafb
  e5e5e5: 'hw-white-darker', // ≈ #eaeaea
  '262626': 'hw-gray-darker', // ≈ #1d1f21
  '171717': 'hw-gray-darker', // ≈ #1d1f21
  a1a1a1: 'hw-gray-main', // ≈ #929292
  '737373': 'hw-gray-main', // ≈ #929292
}

/** 자동 치환 대상 전체 맵(EXACT + SHADCN). */
export const AUTO = { ...EXACT, ...SHADCN }

/** 6자리로 정규화(#fff → ffffff, #444 → 444444). */
export function normalizeHex(raw) {
  let h = raw.replace('#', '').toLowerCase()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length === 8) h = h.slice(0, 6) // 알파 채널은 무시(opacity 는 Tailwind /xx 로 표현)
  return h
}

/** 두 hex 사이 RGB 유클리드 거리(미매칭 색의 최근접 토큰 제안용). */
export function colorDistance(a, b) {
  const toRgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [r1, g1, b1] = toRgb(a)
  const [r2, g2, b2] = toRgb(b)
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

/** 미매칭 hex 에 대해 Figma 팔레트 중 가장 가까운 토큰과 거리를 돌려준다. */
export function nearestToken(hex) {
  let best = null
  for (const [pHex, token] of Object.entries(EXACT)) {
    const d = colorDistance(hex, pHex)
    if (!best || d < best.distance) best = { token, hex: pHex, distance: Math.round(d) }
  }
  return best
}
