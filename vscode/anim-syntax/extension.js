// Colour swatches for named colours in anim scenes (.anim files and ```anim fences in Markdown).
// VS Code's own swatches only cover hex / rgb(); this adds the scene colour names after fill / stroke / colour.
const vscode = require('vscode')

// The site's dark-theme values (docs/_css/core/theme.css). In the browser these follow the theme.
const COLOURS = {
  red: '#e64848', orange: '#de8269', amber: '#e2ae47', yellow: '#d8dd47', green: '#6eb26d',
  teal: '#24b6a1', cyan: '#1bb0ce', blue: '#64a2e7', purple: '#9b92e5', pink: '#da7d9b',
  magenta: '#c384c9', theme: '#68bef8', muted: '#8a8d90', fg: '#ffffff', bg: '#1f2428',
  black: '#000000', white: '#ffffff',
}
const NAMED = new RegExp(`\\b(fill|stroke|colour)(\\s+)(${Object.keys(COLOURS).join('|')})(?![\\w-])`, 'g')
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
  context.subscriptions.push(vscode.languages.registerColorProvider([{ language: 'anim' }, { language: 'markdown' }], provider))
  // anim highlighting in the Markdown preview (see preview.js)
  return { extendMarkdownIt: require('./preview').extendMarkdownIt }
}

module.exports = { activate, deactivate() {} }
