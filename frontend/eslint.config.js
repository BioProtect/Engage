import antfu from '@antfu/eslint-config'

/**
 * Same setup as the main BioProtect frontend (../../frontend/eslint.config.js).
 * CRA's own ESLint 8 step is off (DISABLE_ESLINT_PLUGIN in package.json
 * scripts); this is the only lint, run with `npm run lint`.
 */
export default antfu({
  react: true,
  antislop: true,
  ignores: [
    'build',
    'public',
    '.agents',
    '**/*.html',
    '**/*.css',
  ],
}, {
  rules: {
    // Context files export their provider plus its hook (useAuth, ...).
    'react-refresh/only-export-components': [
      'error',
      {
        allowExportNames: ['useAuth', 'useMapContext', 'useMapStable'],
      },
    ],
    // ponytail: crashes on ESLint 10 ("AST is missing the tokens array"); re-enable once sonarjs supports it
    'sonarjs/no-commented-code': 'off',
    // closures referencing later consts are fine; same-scope (TDZ) uses are still reported
    'no-use-before-define': [
      'error',
      { functions: false, classes: false, variables: false },
    ],
  },
})
