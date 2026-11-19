// Error and warning marks (squiggles, and the Problems panel) for anim scenes: each <animation>
// block in a Markdown file (and a whole .anim file) is compiled by the animation engine itself,
// exactly as the page does, and each problem it finds is marked on its line. The engine is loaded
// from the dt-notes repo the file is in (docs/_plugins/visualisation), and reloaded when it
// changes; outside the repo there are no marks.
const vscode = require('vscode')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ENGINE = path.join('docs', '_plugins', 'visualisation')
// The engine's parts, in load order, as the site's page loads them (so a new part needs no change here)
const PAGE = path.join('..', '..', 'index.html') // from the engine's folder
const PART = /_plugins\/visualisation\/(anim-[\w-]+)\.js/g
const partsOf = (dir) => [...fs.readFileSync(path.join(dir, PAGE), 'utf8').matchAll(PART)].map((m) => m[1])
const WAIT_MS = 300 // after the last keystroke

// The engine's parts loaded into a sandbox with just enough of a browser to load: text is
// estimated rather than measured, and every icon name is accepted (Lucide isn't loaded).
const engines = new Map() // engine dir -> { stamp, Anim }
function loadEngine(dir) {
  const parts = partsOf(dir)
  const stamp = [PAGE, ...parts.map((part) => `${part}.js`)].map((file) => fs.statSync(path.join(dir, file)).mtimeMs).join('|')
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
  for (const part of parts) {
    const file = path.join(dir, `${part}.js`)
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file })
  }
  engines.set(dir, { stamp, Anim: sandbox.Anim })
  return sandbox.Anim
}

// The engine folder for a file: the nearest folder above it holding docs/_plugins/visualisation.
function engineDirFor(file) {
  for (let dir = path.dirname(file); ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, ENGINE)
    if (fs.existsSync(path.join(candidate, 'anim-compile.js'))) return candidate
    if (path.dirname(dir) === dir) return null
  }
}

// The range to mark on a line: the word the message is about (the last quoted word in the message
// that's on the line, e.g. "fill" in '"delete" only takes …, not "fill"'), or else the whole line.
function rangeFor(document, n, message) {
  const text = document.lineAt(n).text
  const quoted = [...message.matchAll(/"([^"]+)"/g)].map((m) => m[1]).reverse()
  for (const word of quoted) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const at = text.search(new RegExp(`(?<![\\w.-])${escaped}(?![\\w-])`, 'i'))
    if (at >= 0) return new vscode.Range(n, at, n, at + word.length)
  }
  const start = Math.max(0, text.search(/\S/))
  return new vscode.Range(n, start, n, text.length)
}

const mark = (document, n, message, error) => {
  const diagnostic = new vscode.Diagnostic(rangeFor(document, n, message), message, error ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning)
  diagnostic.source = 'anim'
  return diagnostic
}

// Compiles one block (its lines, the first of them on document line `first`) and marks its problems.
function checkBlock(Anim, document, block, first, found) {
  const opts = Anim.parseAttrs(block.attrs || '')
  const grid = typeof opts.grid === 'string' ? opts.grid : ''
  const steps = block.steps || Anim.splitBlock(block.lines)
  const fixed = grid !== 'fit' && Anim.viewBoxFor(grid, [], [])
  const centre = fixed && { x: fixed.x + fixed.w / 2, y: fixed.y + fixed.h / 2 }
  const { beats, issues } = Anim.compile(steps, { assets: new Map(), centre })
  for (const issue of issues) {
    const n = first + steps[issue.step].beats[issue.beat].sceneLines[issue.line]
    found.push(mark(document, n, issue.message, issue.error))
  }
  // a grid attribute that isn't CxR or fit: on the opening tag
  const gridWarnings = []
  Anim.viewBoxFor(grid, beats, gridWarnings)
  for (const warning of gridWarnings) found.push(mark(document, first - 1, warning, false))
}

function check(document, collection) {
  if (!['markdown', 'anim'].includes(document.languageId) || document.uri.scheme !== 'file') return
  const dir = engineDirFor(document.uri.fsPath)
  if (!dir) return collection.delete(document.uri)
  const found = []
  try {
    const Anim = loadEngine(dir)
    const lines = document.getText().split(/\r?\n/)
    if (document.languageId === 'anim') {
      // a whole .anim file is one beat's scene
      const steps = [{ beats: [{ scene: lines.join('\n'), sceneLines: lines.map((_, i) => i) }] }]
      checkBlock(Anim, document, { steps }, 0, found)
    } else {
      for (const block of Anim.findBlocks(lines)) {
        try {
          checkBlock(Anim, document, block, block.start + 1, found)
        } catch (error) {
          found.push(mark(document, block.start, `this animation couldn't be checked: ${error.message}`, true))
        }
      }
    }
  } catch (error) {
    found.push(mark(document, 0, `the animation engine couldn't be loaded from ${dir}: ${error.message}`, false))
  }
  collection.set(document.uri, found)
}

function activate(context) {
  const collection = vscode.languages.createDiagnosticCollection('anim')
  const timers = new Map() // document uri -> pending check
  const later = (document) => {
    const key = document.uri.toString()
    clearTimeout(timers.get(key))
    timers.set(key, setTimeout(() => { timers.delete(key); check(document, collection) }, WAIT_MS))
  }
  const checkAll = () => vscode.workspace.textDocuments.forEach((document) => check(document, collection))
  context.subscriptions.push(
    collection,
    vscode.workspace.onDidOpenTextDocument((document) => check(document, collection)),
    vscode.workspace.onDidChangeTextDocument((event) => later(event.document)),
    vscode.workspace.onDidCloseTextDocument((document) => collection.delete(document.uri)),
    // an edited engine is reloaded (by its files' times) and every open file checked again
    vscode.workspace.onDidSaveTextDocument((document) => { if (/[\\/]anim-[\w-]+\.js$/.test(document.fileName)) checkAll() }),
  )
  checkAll()
}

module.exports = { activate, check }
