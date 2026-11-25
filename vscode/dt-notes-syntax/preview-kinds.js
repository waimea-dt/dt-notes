// The kinds of block the preview pane (preview-pane.js) can show. Each entry gives:
//   label      - the kind's short name in the pane's list of blocks
//   widget     - a selector for the built widget, which takes `preview-show` events and sends
//                `preview-position` ones (see the plugin's header)
//   scripts    - its plugin's files in docs/ (loaded in the site page's order, after utils.js)
//   styles     - its stylesheets in docs/
//   replays    - whether it can play into a position after an edit (the pane's "Replay edits")
//   attrs      - (optional) the tag's attributes as the pane renders them
//   positionAt(block, line, engineDir) - where in the block a document line is: any JSON value the
//                widget understands (a beat, a slide, a card and side), or null for nowhere
//   lineOf(block, position, engineDir) - the document line to put the cursor on for a position
// A block is { tag, attrs, start, end, lines }: start and end are its tag lines, lines those
// between them. A new kind is an entry here and the two events in its plugin.
const { loadEngine, partsOf } = require('./engine')

const FENCE = /^[ \t]*(`{3,}|~{3,})(.*)$/
const SLIDE = /^---[ \t]*$/ // a new slide (slides.js MARKERS.slide)
const ITEM = /^([ \t]*)[-*+][ \t]/ // a list item: a flash card
const FACE = /^[ \t]+---[ \t]*$/ // inside a card: front, then back

// Calls visit(line, inCode, i) for each line; fence lines and lines in a fence are code.
function scanLines(lines, visit) {
  let fence = null
  lines.forEach((line, i) => {
    const match = line.match(FENCE)
    const inFence = Boolean(fence)
    if (match && !fence) fence = match[1]
    else if (match && match[1][0] === fence[0] && match[1].length >= fence.length && !match[2].trim()) fence = null
    visit(line, inFence || Boolean(match), i)
  })
}

// The block's lines (indices in block.lines) that are a marker, outside code and inner blocks
// (whose plugins rewrite them first on the site), up to line `to`
function markersIn(block, marker, to = block.lines.length) {
  const found = []
  scanLines(block.lines.slice(0, to), (line, inCode, i) => {
    if (!inCode && !block.inner.has(i) && marker.test(line)) found.push(i)
  })
  return found
}

// Block line i as a document line, and the reverse
const docLine = (block, i) => block.start + 1 + i
const blockLine = (block, line) => line - block.start - 1

// The first line from i that isn't blank (else i), as a document line
function contentFrom(block, i) {
  let at = i
  while (at < block.lines.length && !block.lines[at].trim()) at++
  return docLine(block, at < block.lines.length ? at : i)
}

// Flash cards: the list items at the list's own indent, outside code
function cardsOf(block) {
  const starts = []
  let indent = null
  scanLines(block.lines, (line, inCode, i) => {
    const match = !inCode && !block.inner.has(i) && line.match(ITEM)
    if (!match) return
    indent ??= match[1]
    if (match[1] === indent) starts.push(i)
  })
  return starts
}

const KINDS = {
  animation: {
    label: 'anim',
    widget: '.animation',
    // scratch-blocks.js sets up the library its Scratch scripts are drawn with (DocsifyScratchBlocks)
    scripts: (engineDir) => [...partsOf(engineDir).map((part) => `_plugins/visualisation/${part}.js`), '_plugins/visualisation/animation.js', '_plugins/coding/scratch-blocks.js'],
    styles: ['_css/visualisation/animation.css', '_css/coding/scratch-blocks.css'],
    replays: true,
    // the beat: how many beats the block's lines up to the line make (the engine's own splitBlock)
    positionAt(block, line, engineDir) {
      const steps = loadEngine(engineDir).splitBlock(block.lines.slice(0, Math.max(0, line - block.start)))
      return steps.reduce((n, step) => n + step.beats.length, 0) - 1
    },
    // a beat's first scene line, or else the first line that's in it (a beat with only a caption)
    lineOf(block, beat, engineDir) {
      const scene = loadEngine(engineDir).splitBlock(block.lines).flatMap((step) => step.beats)[beat]?.sceneLines[0]
      if (scene != null) return docLine(block, scene)
      for (let line = block.start; line <= block.end; line++) if (this.positionAt(block, line, engineDir) >= beat) return line
      return block.start
    },
  },
  slides: {
    label: 'slides',
    widget: '.reveal.docsify-slide-deck',
    scripts: () => ['_plugins/interactive/slides.js'],
    styles: ['_css/interactive/slides.css'],
    positionAt: (block, line) => markersIn(block, SLIDE, blockLine(block, line) + 1).length,
    lineOf: (block, slide) => (slide ? contentFrom(block, markersIn(block, SLIDE)[slide - 1] + 1) : contentFrom(block, 0)),
  },
  flashcards: {
    label: 'flash',
    widget: 'ul.flash-cards',
    scripts: () => ['_plugins/interactive/flash-cards.js'],
    styles: ['_css/interactive/flash-cards.css'],
    attrs: (attrs) => attrs.replace(/\s*\bshuffle\b/i, ''), // in written order, to match the file
    // { card, back }: the card the line is in (from 0), and whether it's past the card's ---
    positionAt(block, line) {
      const at = blockLine(block, line)
      const starts = cardsOf(block)
      const card = starts.findLastIndex((start) => start <= at)
      if (card < 0) return null
      return { card, back: markersIn(block, FACE, at + 1).some((i) => i > starts[card]) }
    },
    lineOf(block, { card, back }) {
      const starts = cardsOf(block)
      const start = starts[card]
      if (start == null) return block.start
      const next = starts[card + 1] ?? Infinity
      const face = back ? markersIn(block, FACE).find((i) => i > start && i < next) : undefined
      return face === undefined ? docLine(block, start) : contentFrom(block, face + 1)
    },
  },
}

const TAGS = Object.keys(KINDS)
const OPEN = new RegExp(`^[ \\t]*<(${TAGS.join('|')})\\b([^>]*)>[ \\t]*$`, 'i')
const CLOSE = new RegExp(`^[ \\t]*</(${TAGS.join('|')})>[ \\t]*$`, 'i')

// Every block of a kind in a Markdown file's lines, outside code fences (inner ones too: an
// <animation> in a slide; `inner` is the set of a block's lines that are in one). An unclosed
// block runs to the end.
function findBlocks(lines) {
  const blocks = []
  const open = []
  scanLines(lines, (line, inCode, i) => {
    if (inCode) return
    const opening = line.match(OPEN)
    if (opening) return open.push({ tag: opening[1].toLowerCase(), attrs: opening[2], start: i })
    const closing = line.match(CLOSE)
    const at = closing && open.findLastIndex((b) => b.tag === closing[1].toLowerCase())
    if (closing && at >= 0) blocks.push({ ...open.splice(at, 1)[0], end: i })
  })
  blocks.push(...open.map((b) => ({ ...b, end: lines.length })))
  return blocks.sort((a, b) => a.start - b.start).map((b) => {
    const inner = new Set()
    for (const c of blocks) {
      if (c !== b && c.start > b.start && c.end < b.end) for (let line = c.start; line <= c.end; line++) inner.add(line - b.start - 1)
    }
    return { ...b, lines: lines.slice(b.start + 1, b.end), inner }
  })
}

// A block as the Markdown to render (closed, if it wasn't)
function markdownOf(block) {
  const attrs = KINDS[block.tag].attrs?.(block.attrs) ?? block.attrs
  return [`<${block.tag}${attrs}>`, ...block.lines, `</${block.tag}>`].join('\n')
}

// A block's name in the pane's list: its kind, then its name="..." attribute, else its first #
// heading (outside code and inner blocks, without Docsify's {...} flags), with its line; else just
// its line
const NAME = /\bname\s*=\s*(?:"([^"]*)"|'([^']*)')/i
const H1 = /^[ \t]*#[ \t]+(.*?)[ \t#]*$/
function nameOf(block) {
  const named = block.attrs.match(NAME)
  if (named) return (named[1] ?? named[2]).trim()
  const [i] = markersIn(block, H1)
  return i == null ? '' : block.lines[i].match(H1)[1].replace(/\s*\{[^}]*\}/g, '').trim()
}
function titleOf(block) {
  const name = nameOf(block)
  const line = block.start + 1
  return `${KINDS[block.tag].label}: ${name ? `${name} (line ${line})` : `Line ${line}`}`
}

module.exports = { KINDS, TAGS, findBlocks, markdownOf, titleOf }
