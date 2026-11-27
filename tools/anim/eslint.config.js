// ESLint config for the animation engine and these tools (run by lint.js, from the repo root):
// names that aren't defined and names that aren't used. Style is left to the files' own conventions.

const RULES = {
  'no-undef': 'error',
  'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
}

// What the engine uses from the browser (it loads as plain scripts, sharing window.Anim)
const BROWSER = Object.fromEntries([
  'window', 'document', 'getComputedStyle', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback',
  'Node', 'CustomEvent', 'IntersectionObserver', 'AbortController', 'setTimeout', 'clearTimeout', 'console', 'structuredClone',
].map((name) => [name, 'readonly']))

const NODE = Object.fromEntries(['require', 'module', 'process', '__dirname', 'console', 'structuredClone', 'performance'].map((name) => [name, 'readonly']))

module.exports = [
  { files: ['docs/_plugins/visualisation/anim-*.js', 'docs/_plugins/visualisation/animation.js'], languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: BROWSER }, rules: RULES },
  { files: ['tools/anim/*.js'], languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs', globals: NODE }, rules: RULES },
]
