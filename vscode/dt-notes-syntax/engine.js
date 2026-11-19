// The animation engine, as the site loads it: found in the dt-notes repo a file is in
// (docs/_plugins/visualisation), its parts read from the site's page (docs/index.html) in load order,
// so a new part needs no change here. Used by the error marks (diagnostics.js), which run it in a
// Node sandbox, and the preview pane (preview-pane.js), which loads the same files into a webview.
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ENGINE = path.join('docs', '_plugins', 'visualisation')
const PAGE = path.join('..', '..', 'index.html') // from the engine's folder
const PART = /_plugins\/visualisation\/(anim-[\w-]+)\.js/g

const pageOf = (dir) => path.join(dir, PAGE)
const partsOf = (dir) => [...fs.readFileSync(pageOf(dir), 'utf8').matchAll(PART)].map((m) => m[1])
// The engine's files and the site's page, by their last-modified times: changes when any is edited
const stampOf = (dir) => [PAGE, ...partsOf(dir).map((part) => `${part}.js`)]
  .map((file) => fs.statSync(path.join(dir, file)).mtimeMs).join('|')

// The engine folder for a file: the nearest folder above it holding docs/_plugins/visualisation.
function engineDirFor(file) {
  for (let dir = path.dirname(file); ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, ENGINE)
    if (fs.existsSync(path.join(candidate, 'anim-compile.js'))) return candidate
    if (path.dirname(dir) === dir) return null
  }
}

// The engine's parts loaded into a sandbox with just enough of a browser to load: text is
// estimated rather than measured, and every icon name is accepted (Lucide isn't loaded).
const engines = new Map() // engine dir -> { stamp, Anim }
function loadEngine(dir) {
  const stamp = stampOf(dir)
  const cached = engines.get(dir)
  if (cached?.stamp === stamp) return cached.Anim
  const element = () => ({ setAttribute() {}, appendChild: (child) => child, style: {} })
  const sandbox = {
    console,
    structuredClone,
    document: { body: null, createElementNS: element, createElement: element },
    DocsifyUtils: { escapeHtml: (s) => String(s) },
    lucide: { icons: new Proxy({}, { get: () => ({}) }) },
  }
  sandbox.window = sandbox
  vm.createContext(sandbox)
  for (const part of partsOf(dir)) {
    const file = path.join(dir, `${part}.js`)
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file })
  }
  engines.set(dir, { stamp, Anim: sandbox.Anim })
  return sandbox.Anim
}

// An edited engine file (a part, or the widget animation.js)
const isEngineFile = (file) => /[\\/]anim(-[\w-]+|ation)\.(js|css)$/.test(file)

module.exports = { engineDirFor, loadEngine, pageOf, partsOf, stampOf, isEngineFile }
