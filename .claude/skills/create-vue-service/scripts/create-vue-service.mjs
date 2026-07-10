#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

const args = process.argv.slice(2)
const force = args.includes('--force')
const projectArg = args.find((arg) => !arg.startsWith('--'))

if (!projectArg) {
  console.error('Usage: create-vue-service.mjs <project-name-or-path> [--force]')
  process.exit(1)
}

const targetDir = resolve(projectArg)
const projectName = basename(targetDir) || 'vue-service'
const parentDir = dirname(targetDir)

if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
  if (!force) {
    console.error(`Target directory is not empty: ${targetDir}`)
    console.error('Re-run with --force only if overwriting is intended.')
    process.exit(1)
  }
  rmSync(targetDir, { recursive: true, force: true })
}

mkdirSync(parentDir, { recursive: true })

run('pnpm', ['create', 'vite@latest', projectName, '--template', 'vue-ts'], parentDir)
run('pnpm', ['add', 'pinia', 'vue-router@4', 'axios'], targetDir)
run(
  'pnpm',
  [
    'add',
    '-D',
    'sass',
    '@musma/eslint-config-vue',
    'prettier',
    'lint-staged',
  ],
  targetDir,
)

rmSync(join(targetDir, 'src'), { recursive: true, force: true })
rmSync(join(targetDir, 'README.md'), { force: true })

createDirectories(targetDir)
writeProjectFiles(targetDir, projectName)
updatePackageJson(targetDir)

run('pnpm', ['install'], targetDir)

console.log(`Created Vue service project at ${targetDir}`)
console.log('Next: cd into the project and run `pnpm lint` and `pnpm build`.')

function run(command, commandArgs, cwd = process.cwd()) {
  const shell = process.env.SHELL || '/bin/sh'
  const script = [command, ...commandArgs].map(shellQuote).join(' ')

  execFileSync(shell, ['-lc', script], {
    cwd,
    stdio: 'inherit',
  })
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`
}

function createDirectories(root) {
  const dirs = [
    'public',
    '.vscode',
    'src/assets/images',
    'src/assets/lottie',
    'src/layouts',
    'src/pages',
    'src/plugins',
    'src/features/logged/example/api',
    'src/features/logged/example/composables',
    'src/features/logged/example/components',
    'src/features/logged/example/types',
    'src/features/logged/example/constants',
    'src/features/logged/example/utils',
    'src/features/public/api',
    'src/features/public/composables',
    'src/features/public/components',
    'src/features/public/types',
    'src/features/public/constants',
    'src/features/public/utils',
    'src/models',
    'src/swagger',
    'src/shared/api',
    'src/shared/composables',
    'src/shared/components',
    'src/shared/helpers',
    'src/shared/types',
    'src/shared/constants',
    'src/shared/workers',
    'src/shared/stores',
  ]

  for (const dir of dirs) {
    mkdirSync(join(root, dir), { recursive: true })
  }

  const gitkeepDirs = [
    'public',
    'src/assets/images',
    'src/assets/lottie',
    'src/plugins',
    'src/features/logged/example/api',
    'src/features/logged/example/composables',
    'src/features/logged/example/components',
    'src/features/logged/example/types',
    'src/features/logged/example/constants',
    'src/features/logged/example/utils',
    'src/features/public/api',
    'src/features/public/composables',
    'src/features/public/components',
    'src/features/public/types',
    'src/features/public/constants',
    'src/features/public/utils',
    'src/models',
    'src/swagger',
    'src/shared/composables',
    'src/shared/components',
    'src/shared/helpers',
    'src/shared/types',
    'src/shared/constants',
    'src/shared/workers',
  ]

  for (const dir of gitkeepDirs) {
    writeFileSync(join(root, dir, '.gitkeep'), '')
  }
}

function writeProjectFiles(root, name) {
  write(root, '.env.example', 'VITE_API_BASE_URL=/api\n')
  write(
    root,
    'index.html',
    `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
  )
  write(
    root,
    'src/main.ts',
    `import { createApp } from 'vue'

import App from '@/app.vue'
import router from '@/router'
import { createAppPinia } from '@/shared/stores/pinia'
import '@/assets/main.scss'
import '@/assets/theme.scss'
import '@/assets/typography.scss'

const app = createApp(App)

app.use(createAppPinia())
app.use(router)

app.mount('#app')
`,
  )
  write(
    root,
    'src/app.vue',
    `<script setup lang="ts">
import { RouterView } from 'vue-router'

import DefaultLayout from '@/layouts/default.vue'
</script>

<template>
  <DefaultLayout>
    <RouterView />
  </DefaultLayout>
</template>
`,
  )
  write(
    root,
    'src/router.ts',
    `import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/pages/index.vue') },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
`,
  )
  write(
    root,
    'vite.config.ts',
    `import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
})
`,
  )
  write(
    root,
    'eslint.config.js',
    `import musmaVueConfig from '@musma/eslint-config-vue'

const eslintConfig = musmaVueConfig.map((config) => {
  const prettierRule = config.rules?.['prettier/prettier']

  if (!Array.isArray(prettierRule)) {
    return config
  }

  const [severity, options, ...rest] = prettierRule

  if (!options || typeof options !== 'object') {
    return config
  }

  const { plugins: _plugins, ...prettierOptions } = options

  return {
    ...config,
    rules: {
      ...config.rules,
      'prettier/prettier': [severity, prettierOptions, ...rest],
    },
  }
})

export default eslintConfig
`,
  )
  write(
    root,
    'tsconfig.json',
    `{
  "compilerOptions": {
    "ignoreDeprecations": "6.0",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
`,
  )
  write(
    root,
    'tsconfig.app.json',
    `{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["src/**/*.ts", "src/**/*.vue", "src/vite-env.d.ts"],
  "exclude": ["dist", "node_modules"],
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "ignoreDeprecations": "6.0",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
`,
  )
  write(
    root,
    'tsconfig.node.json',
    `{
  "include": ["vite.config.*", "eslint.config.*"],
  "compilerOptions": {
    "noEmit": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"]
  }
}
`,
  )
  write(root, 'src/vite-env.d.ts', '/// <reference types="vite/client" />\n')
  write(root, 'src/assets/main.scss', '/* Global SCSS entry point. */\n')
  write(root, 'src/assets/theme.scss', '/* Project design tokens. */\n')
  write(root, 'src/assets/typography.scss', '/* Project typography rules. */\n')
  write(
    root,
    'src/layouts/default.vue',
    `<template>
  <slot />
</template>
`,
  )
  write(
    root,
    'src/layouts/default-layout.vue',
    `<template>
  <div class="default-layout">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.default-layout {
  min-height: 100vh;
  background-color: #ffffff;
  color: #020617;
}
</style>
`,
  )
  write(
    root,
    'src/pages/index.vue',
    `<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useAppStore } from '@/shared/stores/app'

const appStore = useAppStore()
const { initialized } = storeToRefs(appStore)
</script>

<template>
  <main class="home-page">
    <p class="home-page__eyebrow">Vue service</p>
    <h1 class="home-page__title">Ready to build</h1>
    <p class="home-page__description">
      Vite, Vue 3, Pinia, Vue Router, SCSS, axios, ESLint, and lint-staged are
      configured.
    </p>
    <p class="home-page__status">Initialized: {{ initialized }}</p>
  </main>
</template>

<style scoped lang="scss">
.home-page {
  display: flex;
  min-height: 100vh;
  max-width: 64rem;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.home-page__eyebrow,
.home-page__status {
  font-size: 0.875rem;
  color: #64748b;
}

.home-page__eyebrow {
  font-weight: 500;
}

.home-page__title {
  margin: 0.75rem 0 0;
  color: #020617;
  font-size: 2.25rem;
  font-weight: 600;
}

.home-page__description {
  max-width: 42rem;
  margin: 1rem 0 0;
  color: #475569;
  font-size: 1rem;
  line-height: 1.75;
}

.home-page__status {
  margin: 1.5rem 0 0;
}
</style>
`,
  )
  write(
    root,
    'src/pages/not-found.vue',
    `<template>
  <main class="not-found-page">
    <p class="not-found-page__eyebrow">404</p>
    <h1 class="not-found-page__title">Page not found</h1>
  </main>
</template>

<style scoped lang="scss">
.not-found-page {
  display: flex;
  min-height: 100vh;
  max-width: 64rem;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.not-found-page__eyebrow {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.not-found-page__title {
  margin: 0.75rem 0 0;
  color: #020617;
  font-size: 2.25rem;
  font-weight: 600;
}
</style>
`,
  )
  write(
    root,
    'src/shared/stores/pinia.ts',
    `import { createPinia } from 'pinia'

export function createAppPinia() {
  return createPinia()
}
`,
  )
  write(
    root,
    'src/shared/stores/app.ts',
    `import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    initialized: true,
  }),
})
`,
  )
  write(
    root,
    'src/shared/api/http.ts',
    `import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
})
`,
  )
  write(root, 'src/shared/api/index.ts', `export { http } from './http'\n`)
  write(root, '.vscode/settings.json', `{}\n`)
  write(root, '.vscode/mcp.json', `{}\n`)
}

function updatePackageJson(root) {
  const packagePath = join(root, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))

  pkg.scripts = {
    dev: 'vite --host 0.0.0.0 --port 5173',
    build: 'vue-tsc --noEmit && vite build',
    preview: 'vite preview --host 0.0.0.0 --port 5173',
    lint: 'eslint "**/*.{ts,vue}" --fix',
    'lint:staged': 'lint-staged',
    'type-check': 'vue-tsc --noEmit',
  }
  pkg['lint-staged'] = {
    '*.{js,jsx,ts,tsx,vue}': 'eslint --fix',
    '*.{css,scss,html,json,md,yml,yaml}': 'prettier --write',
  }
  pkg.packageManager = `pnpm@${getPnpmVersion()}`

  writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
}

function getPnpmVersion() {
  return execFileSync(process.env.SHELL || '/bin/sh', ['-lc', 'pnpm --version'], {
    encoding: 'utf8',
  }).trim()
}

function write(root, path, content) {
  writeFileSync(join(root, path), content)
}
