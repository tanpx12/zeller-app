import { FlatCompat } from '@eslint/eslintrc'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['out/**', '.next/**', 'node_modules/**', 'src/api-client/**', 'coverage/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'warn',
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Use a hook in src/hooks/ that goes through the generated API client.',
        },
      ],
    },
  },
]
