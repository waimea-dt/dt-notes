// Builds syntaxes/anim.tmLanguage.json from its template (anim.tmLanguage.src.json) and the
// animation engine's tables, so the grammar's words are always the engine's. Each {{NAME}} in the
// template becomes a list of words (a|b|c, longest first). Runs before packaging (vscode:prepublish).
const fs = require('fs')
const path = require('path')
const { loadEngine } = require('./engine')

const ENGINE = path.join(__dirname, '..', '..', 'docs', '_plugins', 'visualisation')
const SOURCE = path.join(__dirname, 'syntaxes', 'anim.tmLanguage.src.json')
const OUT = path.join(__dirname, 'syntaxes', 'anim.tmLanguage.json')

const A = loadEngine(ENGINE)
// Words coloured as commands though they aren't verbs: the turning-off words
const COMMANDS = ['detach', 'clear', 'reset']
// Words that stand in for a value (the grammar's literal rule), not params
const LITERALS = [A.EDIT_WORDS.end]

const keys = (table) => Object.keys(table)
const LISTS = {
  TYPES: [...A.SHAPE_TYPES, ...A.LAYOUT_TYPES, 'var'],
  VERBS: keys(A.LINES).filter((kind) => A.LINES[kind].verb),
  COMMANDS,
  PARAMS: [...keys(A.KEYWORDS).filter((word) => !A.KEYWORDS[word].error && !COMMANDS.includes(word) && !LITERALS.includes(word)), A.EDIT_WORDS.into],
  MARKS: keys(A.END_MARKS),
  ANCHORS: keys(A.ANCHORS),
  EASES: keys(A.EASES),
  SPEEDS: keys(A.SPEEDS),
  EDGES: [...keys(A.ANCHORS), 'centre'],
  DIRECTIONS: keys(A.DIRECTIONS),
  HIGHLIGHTS: keys(A.HIGHLIGHT_KINDS),
  RESOURCES: A.RESOURCE_TYPES,
  COLOUR_FUNCTIONS: keys(A.COLOUR_FUNCTIONS),
  COLOURS: [...keys(A.COLOURS), ...keys(A.COLOUR_PICKS)],
}

const escape = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const alternation = (words) => [...new Set(words)].sort((a, b) => b.length - a.length || a.localeCompare(b)).map(escape).join('|')

const source = fs.readFileSync(SOURCE, 'utf8')
const built = source.replace(/\{\{([A-Z_]+)\}\}/g, (m, name) => {
  if (!LISTS[name]) throw new Error(`build-grammar: no list called ${name}`)
  // in JSON, a regex's backslashes are doubled
  return alternation(LISTS[name]).replace(/\\/g, '\\\\')
})
const grammar = JSON.parse(built)
grammar.$comment = `Built by build-grammar.js from anim.tmLanguage.src.json and the engine's tables: edit those, not this. ${grammar.$comment}`
fs.writeFileSync(OUT, `${JSON.stringify(grammar, null, 2)}\n`)
console.log(`built ${path.relative(__dirname, OUT)}`)
