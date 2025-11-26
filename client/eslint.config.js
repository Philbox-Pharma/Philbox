import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Global ignores (converted from .eslintignore)
  globalIgnores([
    // Dependencies
    'node_modules',
    'package-lock.json',
    'yarn.lock',

    // Build outputs
    'build',
    'dist',
    '.next',
    'out',
    'coverage',

    // Environment files
    '.env',
    '.env.local',
    '.env.production',
    '.env.development',

    // Misc
    '.DS_Store',
    '*.log',
    'public',
  ]),

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
