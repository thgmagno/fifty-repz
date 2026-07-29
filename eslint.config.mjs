import { defineConfig, globalIgnores } from 'eslint/config'
import { configs, plugins } from 'eslint-config-airbnb-extended'
import prettierConfig from 'eslint-config-prettier/flat'
import unusedImports from 'eslint-plugin-unused-imports'

const eslintConfig = defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'lib/generated/**',
  ]),

  // Airbnb Style: base + React + Next.js + TypeScript
  plugins.stylistic,
  plugins.importX,
  plugins.react,
  plugins.reactHooks,
  plugins.reactA11y,
  plugins.next,
  plugins.typescriptEslint,
  ...configs.base.recommended,
  ...configs.react.recommended,
  ...configs.next.recommended,
  ...configs.base.typescript,
  ...configs.react.typescript,
  ...configs.next.typescript,

  // Desativa regras de formatação que conflitam com o Prettier
  prettierConfig,

  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // Sem ponto e vírgula: acusa "error" e remove no autofix/salvar
      '@stylistic/semi': ['error', 'never'],

      // Apóstrofo (') em vez de aspas duplas (")
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],

      // Quebra de linha na coluna 80
      '@stylistic/max-len': [
        'error',
        {
          code: 80,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],

      // Imports não utilizados são removidos automaticamente no autofix
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Convenções do projeto (Next.js App Router + shadcn/ui)
      'react/jsx-props-no-spreading': 'off',
      // defaultProps foi descontinuado no React 19; tipos TS já cobrem isso
      'react/require-default-props': 'off',
      // Arquivos de configuração podem importar devDependencies
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.config.{js,mjs,cjs,ts,mts}',
            '**/*.test.{js,ts,tsx}',
            '**/*.spec.{js,ts,tsx}',
          ],
        },
      ],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: ['function-declaration', 'arrow-function'],
          unnamedComponents: 'arrow-function',
        },
      ],
      'import-x/prefer-default-export': 'off',
    },
  },
])

export default eslintConfig
