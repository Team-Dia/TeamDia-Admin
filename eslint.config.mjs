import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginReact from 'eslint-plugin-react'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import prettierConfig from 'eslint-config-prettier' // eslint-config-prettier import
import pluginPrettier from 'eslint-plugin-prettier' // eslint-plugin-prettier import

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
  {
    languageOptions: {
      globals: globals.browser, // globals.node 제거 (브라우저 환경 가정)
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      react: pluginReact,
      jsx_a11y: pluginJsxA11y,
      prettier: pluginPrettier, // eslint-plugin-prettier 플러그인 등록
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      // ... 기존 React 규칙 ...
      ...pluginJsxA11y.configs.recommended.rules,
      // ... jsx-a11y 규칙 ...
      'prettier/prettier': 'error', // Prettier 규칙 활성화 (에러 레벨로)
      'react/prop-types': 'warn', // 예시: 필요에 따라 추가 React 규칙 활성화
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'warn',
    },
  },
  prettierConfig, // eslint-config-prettier 추가 (맨 마지막에 위치!)
]
