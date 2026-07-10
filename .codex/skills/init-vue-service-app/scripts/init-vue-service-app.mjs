#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const projectArg = args.find((arg) => !arg.startsWith('--'))
const skillsRoot = readOption('--skills-root') ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..')

if (!projectArg) {
  console.error('Usage: init-vue-service-app.mjs <project-name-or-path> [--skills-root /path/to/.codex/skills] [--force]')
  process.exit(1)
}

const targetDir = resolve(projectArg)
const force = args.includes('--force')
const createScript = join(skillsRoot, 'create-vue-service/scripts/create-vue-service.mjs')

run('node', [createScript, targetDir, ...(force ? ['--force'] : [])])

console.log(`Initialized Vue service app at ${targetDir}`)

function readOption(name) {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  return args[index + 1]
}

function run(command, commandArgs) {
  execFileSync(command, commandArgs, {
    stdio: 'inherit',
  })
}
