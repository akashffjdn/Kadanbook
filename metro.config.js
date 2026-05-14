const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package.json `exports` resolution but force CJS-friendly conditions.
// Without this, Metro picks the `import` (ESM) entry of packages like
// zustand, ky, etc. — those .mjs files use `import.meta.env` which the
// browser rejects when the bundle is loaded as a classic <script>, producing
// "Cannot use 'import.meta' outside a module".
//
// Order matters: the first matching condition wins. We put `react-native`
// first so packages that ship a hand-tuned RN entry get used, then fall back
// to `require` (CJS) and `browser`. Crucially we exclude `import`.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'require', 'browser'];

module.exports = config;
