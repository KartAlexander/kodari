const cleanGlobals = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !key.trim().includes(' '))
  );

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...cleanGlobals(globals.browser),
        ...cleanGlobals(globals.node),
        ...cleanGlobals(globals.es2021),
      },
    },
    plugins: {
      '@typescript-eslint': plugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
