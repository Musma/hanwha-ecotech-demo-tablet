#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { resolve, join } from 'node:path'

const args = process.argv.slice(2)
const cwdArg = readOption('--cwd') ?? process.cwd()
const cwd = resolve(cwdArg)

if (!existsSync(join(cwd, 'package.json'))) {
  console.error(`No package.json found in ${cwd}`)
  process.exit(1)
}

ensurePackageManager(cwd)

run(
  'pnpm',
  [
    'dlx',
    'shadcn-vue@latest',
    'init',
    '--template',
    'vite',
    '--no-src-dir',
    '--base',
    'reka',
    '--style',
    'vega',
    '--icon-library',
    'lucide',
    '--font',
    'inter',
    '--base-color',
    'neutral',
    '--yes',
  ],
  cwd,
)

patchComponentsJson(cwd)
migrateUtility(cwd)

run('pnpm', ['dlx', 'shadcn-vue@latest', 'add', 'button', 'input', '--yes'], cwd)

removeIfEmpty(join(cwd, 'components'))
removeIfEmpty(join(cwd, 'lib'))

console.log('shadcn-vue configured with shared/components/ui and shared/helpers/utils.ts')

function readOption(name) {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  return args[index + 1]
}

function run(command, commandArgs, commandCwd) {
  const shell = process.env.SHELL || '/bin/sh'
  const script = [command, ...commandArgs].map(shellQuote).join(' ')

  execFileSync(shell, ['-lc', script], {
    cwd: commandCwd,
    stdio: 'inherit',
  })
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`
}

function ensurePackageManager(root) {
  const packagePath = join(root, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))

  if (!pkg.packageManager) {
    pkg.packageManager = `pnpm@${getPnpmVersion()}`
    writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
  }
}

function getPnpmVersion() {
  return execFileSync(process.env.SHELL || '/bin/sh', ['-lc', 'pnpm --version'], {
    encoding: 'utf8',
  }).trim()
}

function patchComponentsJson(root) {
  const configPath = join(root, 'components.json')
  const config = JSON.parse(readFileSync(configPath, 'utf8'))

  config.tailwind = {
    ...(config.tailwind ?? {}),
    config: '',
    css: 'assets/tailwind.css',
    baseColor: 'neutral',
    cssVariables: true,
  }
  config.aliases = {
    ...(config.aliases ?? {}),
    components: '@/shared/components',
    ui: '@/shared/components/ui',
    utils: '@/shared/helpers/utils',
    lib: '@/shared/helpers',
    composables: '@/shared/composables',
  }

  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
}

function migrateUtility(root) {
  const from = join(root, 'lib/utils.ts')
  const to = join(root, 'shared/helpers/utils.ts')

  mkdirSync(join(root, 'shared/helpers'), { recursive: true })

  if (existsSync(from)) {
    cpSync(from, to)
    rmSync(from, { force: true })
    return
  }

  if (!existsSync(to)) {
    writeFileSync(
      to,
      `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`,
    )
  }
}

function removeIfEmpty(path) {
  if (!existsSync(path)) return
  try {
    rmSync(path, { recursive: true })
  } catch {
    // Leave non-empty or locked directories alone.
  }
}
