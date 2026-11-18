// Highlighting for the Markdown preview. The preview renders with markdown-it and highlights code
// with highlight.js, which has no anim language, so this adds one: ```anim fences are highlighted
// from the same grammar the editor uses (syntaxes/anim.tmLanguage.json), with highlight.js class
// names so the preview's theme colours them. ```markdown / ```md fences are highlighted as usual,
// except that any ```anim fences inside them are highlighted as anim.
const fs = require('fs')
const path = require('path')

const grammar = JSON.parse(fs.readFileSync(path.join(__dirname, 'syntaxes/anim.tmLanguage.json'), 'utf8'))

// TextMate scope -> highlight.js class (first prefix that matches)
const CLASSES = [
  ['comment', 'hljs-comment'],
  ['string', 'hljs-string'],
  ['constant.character.escape', 'hljs-string'],
  ['entity.name.tag', 'hljs-title'],
  ['keyword', 'hljs-keyword'],
  ['storage.type', 'hljs-keyword'],
  ['support.type.property-name', 'hljs-attr'],
  ['support.constant.property-value', 'hljs-literal'],
  ['constant.other.color', 'hljs-symbol'],
  ['support.constant.color', 'hljs-symbol'],
  ['constant.numeric', 'hljs-number'],
  ['variable', 'hljs-variable'],
]
const classOf = (scope) => CLASSES.find(([prefix]) => scope?.startsWith(prefix))?.[1]

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const span = (cls, html) => (cls ? `<span class="${cls}">${html}</span>` : html)

// The grammar's rules as sticky JavaScript regexes. The anim grammar only uses regex features
// JavaScript shares with TextMate's (lookbehind included); its one begin/end rule (strings) is
// matched as a whole quoted string.
function compile(rule) {
  if (rule.include) return compile(grammar.repository[rule.include.slice(1)])
  if (rule.patterns && !rule.match && !rule.begin) return { patterns: rule.patterns.map(compile) }
  if (rule.begin === '"') return { re: /"(?:[^"\\]|\\.)*"?/y, name: rule.name, escapes: true }
  return {
    re: new RegExp(rule.match, 'yd'),
    name: rule.name,
    captures: rule.captures && Object.fromEntries(Object.entries(rule.captures).map(([k, c]) => [k, { name: c.name, patterns: c.patterns?.map(compile) }])),
  }
}
const flatten = (rules) => rules.flatMap((r) => (r.patterns && !r.re ? flatten(r.patterns) : [r]))
const TOP = flatten(grammar.patterns.map(compile))

// Highlights text with a list of rules: at each position the first rule that matches there wins.
function tokenize(text, rules) {
  let out = ''
  let i = 0
  let plain = ''
  const flush = () => { out += escapeHtml(plain); plain = '' }
  while (i < text.length) {
    let hit = null
    for (const rule of rules) {
      rule.re.lastIndex = i
      const m = rule.re.exec(text)
      if (m && m[0].length) { hit = { rule, m }; break }
    }
    if (!hit) { plain += text[i++]; continue }
    flush()
    out += render(hit.rule, hit.m)
    i += hit.m[0].length
  }
  flush()
  return out
}

// One match: a plain token, a string (with escapes), or capture groups each with its own scope.
function render(rule, m) {
  if (rule.escapes) {
    return span(classOf(rule.name), m[0].split(/(\\.)/).map((part) => escapeHtml(part)).join(''))
  }
  if (!rule.captures) return span(classOf(rule.name), escapeHtml(m[0]))
  let html = ''
  let at = m.index
  const end = m.index + m[0].length
  const groups = Object.keys(rule.captures).map(Number).filter((g) => m.indices[g]).sort((a, b) => m.indices[a][0] - m.indices[b][0])
  for (const g of groups) {
    const [s, e] = m.indices[g]
    if (s < at) continue
    html += escapeHtml(m.input.slice(at, s))
    const cap = rule.captures[g]
    const text = m.input.slice(s, e)
    html += cap.patterns ? tokenize(text, flatten(cap.patterns)) : span(classOf(cap.name), escapeHtml(text))
    at = e
  }
  return html + escapeHtml(m.input.slice(at, end))
}

const highlightAnim = (code) => code.split('\n').map((line) => tokenize(line, TOP)).join('\n')

// Splits a Markdown example into the ```anim fences inside it and everything else.
function splitAnim(code) {
  const parts = []
  let rest = []
  let fence = null
  for (const line of code.split('\n')) {
    const m = line.match(/^(\s*)(`{3,}|~{3,})\s*(\S*)/)
    if (!fence && m && m[3].toLowerCase() === 'anim') {
      if (rest.length) parts.push({ md: rest.join('\n') })
      rest = []
      fence = { marker: m[2], open: line, body: [] }
    } else if (fence && m && m[2][0] === fence.marker[0] && m[2].length >= fence.marker.length && !m[3]) {
      parts.push({ anim: fence, close: line })
      fence = null
    } else if (fence) fence.body.push(line)
    else rest.push(line)
  }
  if (fence) parts.push({ anim: fence, close: null })
  if (rest.length) parts.push({ md: rest.join('\n') })
  return parts
}

// highlight.js's output for a chunk, without the preview's <div> (or <code><div>) wrapper.
const unwrap = (html) => html.replace(/^(?:<code>)?<div>([\s\S]*)<\/div>(?:<\/code>)?$/, '$1')

function extendMarkdownIt(md) {
  const fence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const lang = tokens[idx].info.trim().split(/\s+/)[0].toLowerCase()
    if (!['anim', 'markdown', 'md'].includes(lang)) return fence(tokens, idx, options, env, self)
    const base = options.highlight
    const highlight = (code, l, attrs) => {
      if (lang === 'anim') return `<div>${highlightAnim(code.replace(/\n$/, ''))}\n</div>`
      // Markdown chunks go through the preview's own highlighter (highlight.js)
      const plain = (text) => (text && base ? unwrap(base(text, l, attrs) || '') : '') || escapeHtml(text)
      const html = splitAnim(code).map((part) => {
        if (part.md !== undefined) return plain(part.md)
        const { open, body } = part.anim
        const fenceLine = (text) => span('hljs-code', escapeHtml(text))
        return [fenceLine(open), ...body.map((line) => tokenize(line, TOP)), ...(part.close !== null ? [fenceLine(part.close)] : [])].join('\n')
      })
      return `<div>${html.join('\n')}</div>`
    }
    // swap the highlighter in for this one fence only
    options.highlight = highlight
    try { return fence(tokens, idx, options, env, self) } finally { options.highlight = base }
  }
  return md
}

module.exports = { extendMarkdownIt, highlightAnim, splitAnim }
