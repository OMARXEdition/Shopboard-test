import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.husky/_/**',
      '.agents/**',
      '.codex/**',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: { globals: globals.node },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    files: ['assets/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
  prettier,
]
