// Colour swatches for named colours in anim scenes (.anim files and ```anim fences in Markdown).
// VS Code's own swatches only cover hex / rgb(); this adds the scene colour names after fill / stroke / colour / track.
const vscode = require('vscode')

// The site's dark-theme values (docs/_css/core/theme.css). In the browser these follow the theme.
const COLOURS = {
  red: '#e64848', orange: '#de8269', amber: '#e2ae47', yellow: '#d8dd47', green: '#6eb26d',
  teal: '#24b6a1', cyan: '#1bb0ce', blue: '#64a2e7', purple: '#9b92e5', pink: '#da7d9b',
  magenta: '#c384c9', theme: '#68bef8', muted: '#8a8d90', fg: '#ffffff', bg: '#1f2428', 'bg-shape': '#171b1e',
  black: '#000000', white: '#ffffff',
}
// The hues' variants (COLOUR_VARIANTS in anim-core.js), as a close guide: bright's saturation scaled
// (the page scales it in oklch, so the swatch is near but not exact), muted mixed with the background
const VARIANTS = { bright: (hex) => saturate(hex, 1.4), muted: (hex) => mixHex(hex, COLOURS.bg, 0.55) }
const UNVARIED = ['muted', 'fg', 'bg', 'bg-shape', 'black', 'white']
for (const hue of Object.keys(COLOURS).filter((name) => !UNVARIED.includes(name))) {
  for (const [variant, make] of Object.entries(VARIANTS)) COLOURS[`${hue}-${variant}`] = make(COLOURS[hue])
}

// Two hex colours mixed, keeping `keep` (0-1) of the first
function mixHex(a, b, keep) {
  const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
  const [p, q] = [rgb(a), rgb(b)]
  return `#${p.map((v, i) => Math.round(v * keep + q[i] * (1 - keep)).toString(16).padStart(2, '0')).join('')}`
}

// A hex colour with its saturation (HSL) scaled by k
function saturate(hex, k) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const grey = max - min
  const s = grey ? grey / (1 - Math.abs(2 * l - 1)) : 0
  const h = !grey ? 0 : max === r ? ((g - b) / grey + 6) % 6 : max === g ? (b - r) / grey + 2 : (r - g) / grey + 4
  const c = (1 - Math.abs(2 * l - 1)) * Math.min(1, s * k)
  const x = c * (1 - Math.abs((h % 2) - 1))
  const [r1, g1, b1] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h) % 6]
  const to = (v) => Math.round((v + l - c / 2) * 255).toString(16).padStart(2, '0')
  return `#${to(r1)}${to(g1)}${to(b1)}`
}
// the words a colour follows (the engine's colour props: KEYWORDS in anim-core.js)
const NAMED = new RegExp(`\\b(fill|stroke|colour|track)(\\s+)(${Object.keys(COLOURS).join('|')})(?![\\w-])`, 'g')
const FENCE = /^\s*(`{3,}|~{3,})\s*([\w-]*)/

// Blanks out quoted labels and # comments (keeping columns), so names in them aren't matched.
function codeOnly(line) {
  let out = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"' && line[i - 1] !== '\\') { quoted = !quoted; out += ' '; continue }
    if (!quoted && ch === '#' && (i + 1 === line.length || /\s/.test(line[i + 1]))) return out + ' '.repeat(line.length - i)
    out += quoted ? ' ' : ch
  }
  return out
}

function toColour(hex) {
  const n = parseInt(hex.slice(1), 16)
  return new vscode.Color(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1)
}

const provider = {
  provideDocumentColors(document) {
    const found = []
    const markdown = document.languageId === 'markdown'
    let fence = null // open fence in Markdown: { marker, anim }
    for (let n = 0; n < document.lineCount; n++) {
      const line = document.lineAt(n).text
      if (markdown) {
        const m = line.match(FENCE)
        if (m && !fence) { fence = { marker: m[1], anim: m[2].toLowerCase() === 'anim' }; continue }
        if (m && fence && m[1][0] === fence.marker[0] && m[1].length >= fence.marker.length && !m[2]) { fence = null; continue }
        if (!fence?.anim) continue
      }
      for (const match of codeOnly(line).matchAll(NAMED)) {
        const start = match.index + match[1].length + match[2].length
        const range = new vscode.Range(n, start, n, start + match[3].length)
        found.push(new vscode.ColorInformation(range, toColour(COLOURS[match[3]])))
      }
    }
    return found
  },
  // Picking a new colour in the swatch's picker writes it as a hex code
  provideColorPresentations(colour) {
    const hex = (v) => Math.round(v * 255).toString(16).padStart(2, '0')
    return [new vscode.ColorPresentation(`#${hex(colour.red)}${hex(colour.green)}${hex(colour.blue)}`)]
  },
}

function activate(context) {
  // What the extension does and any part that fails to start: View > Output > DT Notes Syntax
  const log = vscode.window.createOutputChannel('DT Notes Syntax')
  context.subscriptions.push(log)
  // Each part starts on its own, so one that fails doesn't stop the others
  const start = (name, fn) => {
    try { fn() } catch (error) { log.appendLine(`${name} failed to start: ${error.stack || error}`) }
  }
  start('colour swatches', () => context.subscriptions.push(vscode.languages.registerColorProvider([{ language: 'anim' }, { language: 'markdown' }], provider)))
  // a background tint on plugin blocks in Markdown (see shading.js)
  start('block shading', () => require('./shading').activate(context, log))
  // error and warning marks from the animation engine (see diagnostics.js)
  start('error marks', () => require('./diagnostics').activate(context))
  // a live preview of the animation at the cursor (see preview-pane.js)
  start('animation preview', () => require('./preview-pane').activate(context, log))
  log.appendLine('started')
  // anim highlighting in the Markdown preview (see preview.js)
  return { extendMarkdownIt: require('./preview').extendMarkdownIt }
}

module.exports = { activate, deactivate() {} }
