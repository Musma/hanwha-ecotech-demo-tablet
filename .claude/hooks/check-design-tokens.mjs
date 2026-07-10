#!/usr/bin/env node
/**
 * Claude Code PostToolUse 훅 — 파일 저장(Write/Edit/MultiEdit) 직후
 * 그 파일에 색상 하드코딩(`…-[#hex]`)이 있으면 에이전트에게 즉시 피드백한다.
 *
 * 기존 scripts/design-tokens/check-tokens.mjs 를 단일 파일에 대해 실행하고,
 * 색상 하드코딩이 감지되면(exit 1) stderr 로 내용을 넘기고 exit 2 로 종료한다.
 * (Claude Code 는 PostToolUse 훅의 exit 2 + stderr 를 에이전트에게 되먹임한다.)
 *
 * 커밋 게이트(husky pre-commit)와는 별개의 "편집 즉시" 계층이다.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { extname } from 'node:path'

const CHECKER = 'scripts/design-tokens/check-tokens.mjs'

// stdin(JSON) 읽기
let raw = ''
try {
  raw = await new Promise((resolve) => {
    let buf = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (c) => (buf += c))
    process.stdin.on('end', () => resolve(buf))
    process.stdin.on('error', () => resolve(buf))
  })
} catch {
  process.exit(0)
}

let payload
try {
  payload = JSON.parse(raw || '{}')
} catch {
  process.exit(0) // 파싱 실패 시 조용히 통과
}

const input = payload.tool_input ?? {}
const file = input.file_path ?? input.filePath ?? ''

// 대상 파일 판별: .vue/.ts 만, 토큰 정의 영역(assets/css)은 제외
if (!file || !['.vue', '.ts'].includes(extname(file)) || file.includes('assets/css') || !existsSync(file)) {
  process.exit(0)
}

try {
  execFileSync('node', [CHECKER, file], { stdio: 'pipe' })
  process.exit(0) // 색상 하드코딩 없음
} catch (err) {
  const out = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim()
  process.stderr.write(
    `[design-tokens] 색상 하드코딩이 감지되었습니다. hw-* 토큰(theme.css)을 사용하세요.\n${out}\n`,
  )
  process.exit(2) // 에이전트에게 되먹임
}
