/**
 * docsify-animation.js - Renders <animation>...</animation> blocks as step-by-step animated SVG
 * explanations: a drawing that changes between steps, with a Markdown caption for each step.
 *
 * Full syntax and design: docs/_plugins/visualisation/ANIMATION.md
 *
 * Usage in markdown (markers must be alone on their line; ignored inside code fences):
 *   <animation grid="16x9" debug>
 *   # Title               the first heading of step 1 stays fixed for the whole animation
 *   Caption text.
 *   ```scene
 *   a: rect "A" at 2 3    id: type, label and properties - creates a shape
 *   ```
 *   ---                   start a new step
 *   ## Step heading
 *   ```scene
 *   a: move 5 3 slow      id: properties - changes a shape (animated); `delay 1` waits a second first
 *   ```
 *   +++                   start a new beat (caption text and scene play one after another)
 *   Note:                 teacher notes, to the end of the step
 *   </animation>
 *
 * How it works: like slides.js, beforeEach rewrites the block into plain HTML wrappers with the
 * caption markdown left in place, so Docsify compiles it with the rest of the page and every
 * other plugin processes it too. Scene text is carried in data attributes. In doneEach the
 * scenes are compiled into one state per beat, and the widget replaces the source markup.
 * Registered last, so the other plugins' hooks have already run on the caption HTML.
 */

;(function () {
  const { escapeHtml } = window.DocsifyUtils

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  const CELL = 80                  // px per grid cell in SVG user units (16 x 9 cells = 1280 x 720)
  const STROKE = 3                 // normal stroke thickness
  const FONT = 30                  // normal font size
  const PLACE_GAP = 0.25 * CELL    // default gap for above / below / left-of / right-of
  const EDGE_GAP = 0.06 * CELL     // gap between a line end and the edge of its shape
  const HEAD = 0.2 * CELL          // arrowhead length at normal weight
  const CAPTION_MS = 500           // caption transition (kept snappy, whatever the shapes' speed)
  const PLAY_PAUSE = 1500          // pause between beats while playing

  // speed <word | seconds>: how long a line's change takes
  const SPEEDS = { vfast: 250, fast: 500, normal: 1000, slow: 2000, vslow: 4000 }
  const NORMAL_MS = SPEEDS.normal
  const EFFECTS = ['fade', 'pop', 'draw', 'slide']
  const LAYERS = { back: 0, normal: 1, front: 2 }
  const PLACEMENTS = ['above', 'below', 'left-of', 'right-of']
  const ALIGNS = { left: 'left', centre: 'centre', center: 'centre', right: 'right' }
  const FLAGS = ['bold']
  const LINE_STYLES = ['solid', 'dashed', 'dotted']
  // Each pattern as a visible mark and gap, in multiples of the line's thickness (w):
  // dashed 3w:3w, dotted 1w:1w (a dot is a round cap as wide as the line)
  const PATTERNS = { dashed: { d: 3, g: 3 }, dotted: { d: 1, g: 1 } }
  const FLOWS = { flow: 'forward', 'flow-reverse': 'reverse', static: 'none' } // static: not flowing
  // Callout sides use the placement words (the bubble's side of the shape)
  const CALLOUT_SIDES = { above: 'above', below: 'below', 'left-of': 'left', 'right-of': 'right' }
  const HIGHLIGHTS = ['box', 'spotlight', 'clear']
  const EMPHASES = ['pulse', 'shake'] // one-off effects on an existing shape
  const ACTIONS = ['copy', 'attach', 'detach', 'group', 'ungroup', 'travel', 'follow', 'follow-reverse', 'highlight', 'callout']
  const FLOW_SPEED = 2 * 80 // px per second (two cells)
  const SHAPE_TYPES = ['rect', 'circle', 'text', 'line', 'arrow']
  const RESOURCE_TYPES = ['image', 'icon']
  const LINE_TYPES = ['line', 'arrow']

  // Named colours map to the site's theme variables, so light and dark themes both work.
  const COLOURS = {
    red: 'var(--color-attention)',
    orange: 'var(--palette-color-3)',
    amber: 'var(--color-warning)',
    yellow: 'var(--color-important)',
    green: 'var(--palette-color-4)',
    teal: 'var(--palette-color-1)',
    cyan: 'var(--palette-color-8)',
    blue: 'var(--palette-color-5)',
    purple: 'var(--palette-color-2)',
    pink: 'var(--palette-color-6)',
    magenta: 'var(--palette-color-9)',
    theme: 'var(--theme-color)',
    muted: 'var(--color-mono-5)',
    fg: 'var(--anim-fg)',
    bg: 'var(--anim-bg)',
    black: '#000',
    white: '#fff',
    none: 'none',
  }
  // Named colours used as a fill are tinted towards the background, so labels stay readable.
  const PLAIN_FILLS = ['fg', 'bg', 'black', 'white', 'none']

  // Which properties each shape type accepts.
  const ALL = [...SHAPE_TYPES, ...RESOURCE_TYPES]
  const BOXED = ['rect', 'circle', 'text', 'image', 'icon']
  const APPLIES = {
    at: BOXED, x: BOXED, y: BOXED,
    from: LINE_TYPES, to: LINE_TYPES,
    size: ['rect', 'circle', 'image', 'icon'],
    radius: ['circle', 'rect'], // a rect's radius rounds its corners
    fill: ['rect', 'circle'],
    stroke: ALL, weight: ALL, font: ALL, bold: ALL,
    width: ['rect', 'image', 'icon'], height: ['rect', 'image', 'icon'],
    angle: BOXED, scale: BOXED,
    align: ['text'],
    linestyle: ['rect', 'circle', 'line', 'arrow', 'image'], // solid | dashed | dotted
    flow: ['rect', 'circle', 'line', 'arrow', 'image'], // dashes/dots march along the stroke
  }

  const point = (types) => [[...types, 'num', 'num'], [...types, 'id']]
  // Each keyword's signatures, tried longest first; `build` turns the matched values into a prop.
  const PROPS = {
    at: {
      sigs: [['num', 'num'], ['placement', 'id'], ['id']],
      help: '"x,y", a shape id, or a placement and a shape id (e.g. "below a")',
      build: (v, sig) => sig.length === 2 && sig[0] === 'num' ? { kind: 'abs', x: v[0], y: v[1] }
        : sig.length === 2 ? { kind: 'place', place: v[0], ref: v[1] } : { kind: 'ref', ref: v[0] },
    },
    x: { sigs: [['num']], help: 'a number' },
    y: { sigs: [['num']], help: 'a number' },
    from: { sigs: point([]), help: '"x,y" or a shape id', build: buildEnd },
    to: { sigs: point([]), help: '"x,y" or a shape id', build: buildEnd },
    size: { sigs: [['num', 'num'], ['num']], help: '"w,h", "wxh" or one number', build: (v) => ({ w: v[0], h: v[1] || v[0], one: v.length === 1 }) },
    radius: { sigs: [['num']], help: 'a number' },
    gap: { sigs: [['num']], help: 'a number' },
    delay: { sigs: [['num']], help: 'a number of seconds' },
    speed: { sigs: [['speed']], help: 'vslow, slow, normal, fast, vfast or a number of seconds', build: (v) => v[0] },
    via: {
      sigs: [['num', 'num'], ['placement', 'id'], ['id']],
      help: '"x,y", a shape id, or a placement and a shape id (e.g. "via above b")',
      build: (v, sig) => PROPS.at.build(v, sig),
    },
    fill: { sigs: [['colour']], help: 'a colour (e.g. blue, #f80 or none)' },
    stroke: { sigs: [['colour']], help: 'a colour (e.g. blue, #f80 or none)' },
    weight: { sigs: [['num']], help: 'a number (a multiple of the normal stroke thickness)' },
    width: { sigs: [['num']], help: 'a number of cells' },
    height: { sigs: [['num']], help: 'a number of cells' },
    font: { sigs: [['num']], help: 'a number (a multiple of the normal size)' },
    angle: { sigs: [['num']], help: 'a number of degrees (clockwise, 0 = upright)' },
    scale: { sigs: [['num']], help: 'a number (a multiple of the normal size)' },
    align: { sigs: [['align']], help: 'left, centre or right' },
  }
  const ALIASES = { move: 'at', goto: 'at' }
  Object.values(PROPS).forEach((prop) => prop.sigs.sort((a, b) => b.length - a.length))

  function buildEnd(v, sig) {
    return sig[0] === 'num' ? { kind: 'abs', x: v[0], y: v[1] } : { kind: 'ref', ref: v[0] }
  }

  const RESERVED = new Set([
    ...SHAPE_TYPES, ...RESOURCE_TYPES, ...Object.keys(PROPS), ...Object.keys(ALIASES), ...Object.keys(SPEEDS),
    ...EFFECTS, ...Object.keys(LAYERS), ...PLACEMENTS, ...FLAGS, ...LINE_STYLES, ...Object.keys(FLOWS), ...ACTIONS, ...EMPHASES, 'pause', 'auto', 'remove', 'defaults', 'clear',
  ])

  // ---------------------------------------------------------------------------
  // Markdown -> source markup (beforeEach)
  // ---------------------------------------------------------------------------

  const FENCE = /^[ \t]*(`{3,}|~{3,})(.*)$/
  const OPEN_TAG = /^[ \t]*<animation\b([^>]*)>[ \t]*$/i
  const CLOSE_TAG = /^[ \t]*<\/animation>[ \t]*$/i
  const MARKERS = { step: /^---[ \t]*$/, beat: /^\+\+\+[ \t]*$/, note: /^Note:[ \t]*$/ }
  const SOURCE_END = '<!-- /animation -->'
  const SOURCE_BLOCK = /<div class="anim-source"[\s\S]*?<!-- \/animation -->/g
  const HEADING_ANCHOR = /<(h[1-6]) id="[^"]*" tabindex="-1"><a href="[^"]*" data-id="[^"]*" class="anchor">([\s\S]*?)<\/a><\/\1>/g

  // Calls visit(line, inCode, fenceInfo) for each line; fence lines and lines inside a fence are code.
  function scanLines(lines, visit) {
    let fence = null
    let info = ''
    lines.forEach((line) => {
      const match = line.match(FENCE)
      const wasInFence = Boolean(fence)
      const opening = match && !fence
      const closing = match && fence && match[1][0] === fence[0] && match[1].length >= fence.length && !match[2].trim()
      if (opening) { fence = match[1]; info = match[2].trim() }
      visit(line, wasInFence || Boolean(match), { opening, closing, inside: wasInFence && !closing, info })
      if (closing) fence = null
    })
  }

  // Splits lines at whole-line markers outside code: n markers give n + 1 chunks of lines.
  function splitAtMarker(lines, marker) {
    const chunks = [[]]
    scanLines(lines, (line, inCode) => {
      if (!inCode && marker.test(line)) chunks.push([])
      else chunks[chunks.length - 1].push(line)
    })
    return chunks
  }

  // Removes ```scene fences from a beat, returning the caption lines and the scene text.
  function extractScene(lines) {
    const caption = []
    const scene = []
    let inScene = false
    scanLines(lines, (line, _inCode, fence) => {
      if (fence.opening && fence.info === 'scene') { inScene = true; return }
      if (inScene && fence.closing) { inScene = false; return }
      if (inScene) scene.push(line)
      else caption.push(line)
    })
    return { caption, scene: scene.join('\n') }
  }

  // Step headings are not page headings: keep them out of the sidebar's sub-menu.
  function excludeHeadingsFromToc(lines) {
    const out = []
    scanLines(lines, (line, inCode) => {
      out.push(!inCode && /^#{1,6}[ \t]+\S/.test(line) ? `${line.trimEnd()} {docsify-ignore}` : line)
    })
    return out
  }

  const wrap = (open, body, close) => `${open}\n\n${body}\n\n${close}`
  const attr = (value) => encodeURIComponent(value)

  // Tag attributes: bare flags (debug, autoplay, loop, loop-bounce) and name="value" pairs
  // (grid, hold, speed, controls).
  function parseAttrs(attrs) {
    const out = {}
    for (const m of attrs.matchAll(/([\w-]+)(?:\s*=\s*["']([^"']*)["'])?/g)) out[m[1].toLowerCase()] = m[2] ?? true
    return out
  }

  function buildSource(attrs, lines) {
    const opts = parseAttrs(attrs)
    const grid = typeof opts.grid === 'string' ? opts.grid : ''
    const debug = 'debug' in opts
    const playback = {
      autoplay: 'autoplay' in opts,
      loop: 'loop-bounce' in opts ? 'bounce' : 'loop' in opts ? 'loop' : null,
      hold: opts.hold ?? null,
      speed: opts.speed ?? null,
      controls: opts.controls ?? null,
    }
    const images = new Set()

    const steps = splitAtMarker(lines, MARKERS.step).map((stepLines) => {
      const [content, ...notes] = splitAtMarker(stepLines, MARKERS.note)
      const beats = splitAtMarker(content, MARKERS.beat).map((beatLines) => {
        const { caption, scene } = extractScene(beatLines)
        for (const match of scene.matchAll(/\bimage\(([^)]*)\)/g)) images.add(match[1].trim())
        return wrap(`<div class="anim-src-beat" data-scene="${attr(scene)}">`, excludeHeadingsFromToc(caption).join('\n').trim(), '</div>')
      })
      const notesBlock = notes.length ? wrap('<div class="anim-src-notes">', notes.flat().join('\n').trim(), '</div>') : ''
      return wrap('<div class="anim-src-step">', [...beats, notesBlock].filter(Boolean).join('\n\n'), '</div>')
    })

    // Images go through Docsify as Markdown images, so their paths resolve exactly as ![](…) does.
    const paths = [...images].filter(Boolean)
    const assets = paths.length
      ? wrap(`<div class="anim-src-assets" data-paths="${attr(JSON.stringify(paths))}">`, paths.map((p) => `![](${p})`).join('\n\n'), '</div>')
      : ''

    const open = `<div class="anim-source" data-grid="${escapeHtml(grid)}" data-playback="${attr(JSON.stringify(playback))}"${debug ? ' data-debug' : ''}>`
    return `\n\n${wrap(open, [...steps, assets].filter(Boolean).join('\n\n'), '</div>')}\n${SOURCE_END}\n\n`
  }

  // Rewrites every <animation> block that is outside a code fence.
  function rewriteBlocks(markdown) {
    const lines = markdown.split('\n')
    const out = []
    let block = null
    scanLines(lines, (line, inCode) => {
      if (block) {
        if (!inCode && CLOSE_TAG.test(line)) {
          out.push(buildSource(block.attrs, block.lines))
          block = null
        } else {
          block.lines.push(line)
        }
        return
      }
      const open = !inCode && line.match(OPEN_TAG)
      if (open) block = { attrs: open[1], lines: [] }
      else out.push(line)
    })
    if (block) out.push(buildSource(block.attrs, block.lines)) // unclosed: run to the end of the page
    return out.join('\n')
  }

  // Animation headings are not page anchors: drop the ids/anchor links Docsify adds.
  function stripHeadingAnchors(html) {
    return html.replace(SOURCE_BLOCK, (block) => block.replace(HEADING_ANCHOR, '<$1>$2</$1>'))
  }

  // ---------------------------------------------------------------------------
  // Scene parsing
  // ---------------------------------------------------------------------------

  const TOKEN = /"((?:[^"\\]|\\.)*)"|([A-Za-z][\w-]*)\(([^)]*)\)|("[^"]*$)|([^\s,]+)/g
  const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)$/
  const ID = /^[A-Za-z][\w.-]*$/
  const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

  function tokenize(text) {
    const tokens = []
    for (const m of text.matchAll(TOKEN)) {
      if (m[1] !== undefined) tokens.push({ kind: 'str', value: m[1].replace(/\\(.)/g, '$1') })
      else if (m[2] !== undefined) tokens.push({ kind: 'res', name: m[2].toLowerCase(), arg: m[3].trim() })
      else if (m[4] !== undefined) throw new Error('a label is missing its closing quote')
      else {
        // "2x1" (a size) is two numbers
        const pair = m[5].match(/^([+-]?(?:\d+\.?\d*|\.\d+))[x×]([+-]?(?:\d+\.?\d*|\.\d+))$/i)
        const words = pair ? [pair[1], pair[2]] : [m[5]]
        words.forEach((word) => tokens.push({ kind: 'word', value: word, lower: word.toLowerCase() }))
      }
    }
    return tokens
  }

  function parseAs(type, token, shapes) {
    if (!token || token.kind !== 'word') return undefined
    const word = token.lower
    switch (type) {
      case 'num': return NUMBER.test(word) ? { v: parseFloat(word), rel: /^[+-]/.test(word) } : undefined
      case 'id': return shapes.has(token.value) ? token.value : undefined
      case 'placement': return PLACEMENTS.includes(word) ? word : undefined
      case 'align': return ALIGNS[word]
      case 'colour': return COLOURS[word] !== undefined || HEX.test(word) ? word : undefined
      case 'speed': return word in SPEEDS ? SPEEDS[word] : NUMBER.test(word) && !/^[+-]/.test(word) ? parseFloat(word) * 1000 : undefined
    }
    return undefined
  }

  function matchProp(name, tokens, i, shapes) {
    const prop = PROPS[name]
    for (const sig of prop.sigs) {
      const values = sig.map((type, k) => parseAs(type, tokens[i + k], shapes))
      if (values.every((v) => v !== undefined)) {
        return { value: prop.build ? prop.build(values, sig) : values[0], next: i + sig.length }
      }
    }
    const next = tokens[i]
    const missing = next && next.kind === 'word' && ID.test(next.value) && !RESERVED.has(next.lower) && !COLOURS[next.lower]
      && prop.sigs.some((sig) => sig.includes('id'))
    throw new Error(`"${name}" expects ${prop.help}${missing ? `: no shape called "${next.value}"` : ''}`)
  }

  // The action keywords, each with its own values. Returns the index after them, or 0 if `word`
  // isn't one of them.
  function parseAction(word, tokens, i, shapes, set) {
    const idAt = (j, what) => {
      const ref = parseAs('id', tokens[j], shapes)
      if (!ref) throw new Error(`"${what}" expects a shape id${tokens[j] ? `: no shape called "${tokens[j].value}"` : ''}`)
      return ref
    }
    const wordAt = (j) => (tokens[j]?.kind === 'word' ? tokens[j].lower : '')
    switch (word) {
      case 'attach': {
        // attach [above | below | left-of | right-of] <id>; with no side, on top of it
        const side = PLACEMENTS.includes(wordAt(i + 1)) ? wordAt(i + 1) : null
        set('attach', { ref: idAt(i + (side ? 2 : 1), 'attach'), side: side || 'centre' })
        return i + (side ? 3 : 2)
      }
      case 'detach': set('detach', true); return i + 1
      case 'travel': {
        // a list of stops: shape ids and/or x,y points
        const stops = []
        let j = i + 1
        while (j < tokens.length) {
          const ref = parseAs('id', tokens[j], shapes)
          if (ref) { stops.push({ kind: 'ref', ref }); j++; continue }
          const x = parseAs('num', tokens[j], shapes)
          const y = parseAs('num', tokens[j + 1], shapes)
          if (x && y) { stops.push({ kind: 'abs', x, y }); j += 2; continue }
          break
        }
        if (!stops.length) throw new Error('"travel" expects shape ids and/or x,y points, e.g. "travel r1 r2 b"')
        set('travel', stops)
        return j
      }
      case 'follow':
      case 'follow-reverse': {
        // follow l: from the line's start to its end; follow-reverse l: from its end to its start
        set('follow', { ref: idAt(i + 1, word), reverse: word === 'follow-reverse' }, word)
        return i + 2
      }
      case 'highlight': {
        const words = []
        let j = i + 1
        while (HIGHLIGHTS.includes(wordAt(j))) words.push(wordAt(j++))
        if (!words.length) throw new Error('"highlight" expects box, spotlight or clear (pulse and shake go on their own)')
        set('highlight', words)
        return j
      }
      case 'callout': {
        const next = tokens[i + 1]
        if (next?.kind === 'word' && next.lower === 'clear') { set('callout', { none: true }); return i + 2 }
        if (next?.kind !== 'str') throw new Error('"callout" expects quoted text (e.g. callout "Look!") or clear')
        const side = CALLOUT_SIDES[wordAt(i + 2)]
        set('callout', { text: next.value, side: side || 'above' })
        return i + (side ? 3 : 2)
      }
    }
    return 0
  }

  // Reads the properties and flags of one line (everything after the id and any type word).
  function parseProps(tokens, i, mode, shapes) {
    const props = {}
    const set = (key, value, what = key) => {
      if (key in props) throw new Error(key === 'label' ? 'only one label (quoted text) per line' : `"${what}" is given twice`)
      props[key] = value
    }

    while (i < tokens.length) {
      const token = tokens[i]
      if (token.kind === 'str') { set('label', token.value); i++; continue }
      if (token.kind === 'res') throw new Error(`"${token.name}(…)" must come straight after the id`)

      const word = token.lower
      const name = ALIASES[word] || word
      const special = parseAction(word, tokens, i, shapes, set)
      if (special) { i = special; continue }
      if (PROPS[name]) {
        const { value, next } = matchProp(name, tokens, i + 1, shapes)
        if (name === 'via') props.via = [...(props.via || []), value] // repeatable
        else set(name, value, word)
        i = next
        continue
      }
      if (PLACEMENTS.includes(word)) {
        // A bare placement is short for "at <placement> <id>", e.g. `t: text "i" below a`
        const ref = parseAs('id', tokens[i + 1], shapes)
        if (!ref) throw new Error(`"${word}" expects a shape id${tokens[i + 1] ? `: no shape called "${tokens[i + 1].value}"` : ''}`)
        set('at', { kind: 'place', place: word, ref }, word)
        i += 2
        continue
      }
      if (word in SPEEDS) throw new Error(`"${word}" goes after speed, e.g. "speed ${word}"`)
      else if (EFFECTS.includes(word)) set('effect', word)
      else if (word in LAYERS) set('layer', word)
      else if (FLAGS.includes(word)) set(word, true)
      else if (LINE_STYLES.includes(word)) set('linestyle', word, 'line style')
      else if (word in FLOWS) set('flow', word, 'flow')
      else if (EMPHASES.includes(word)) set('emphasis', word)
      else if (word === 'clear' && mode === 'defaults') set('reset', true)
      else if (SHAPE_TYPES.includes(word) || word === 'remove') throw new Error(`"${word}" must come straight after the id`)
      else throw new Error(`unknown word "${token.value}"`)
      i++
    }

    if (props.gap && props.at?.kind !== 'place' && !props.attach) throw new Error('"gap" only works with above / below / left-of / right-of, or attach')
    if (props.at && (props.x || props.y)) throw new Error('the position is given twice (at/move and x/y)')
    return props
  }

  // ---------------------------------------------------------------------------
  // Geometry
  // ---------------------------------------------------------------------------

  const cellToPx = (c) => (c - 0.5) * CELL

  // Half-width and half-height of a shape's box (text is estimated from its label).
  function extents(shape) {
    switch (shape.type) {
      case 'circle': return { hw: shape.r, hh: shape.r, round: true }
      case 'text': {
        const size = FONT * shape.font
        return { hw: Math.max(0.3 * size, 0.3 * size * shape.label.length), hh: 0.6 * size }
      }
      default: return { hw: shape.w / 2, hh: shape.h / 2 }
    }
  }

  // Half-sizes after `scale` (still in the shape's own, unrotated frame).
  function sized(shape) {
    const e = extents(shape)
    const k = shape.scale ?? 1
    return { hw: e.hw * k, hh: e.hh * k, round: e.round }
  }

  // Half-sizes of the axis-aligned box around the rotated, scaled shape.
  function outline(shape) {
    const e = sized(shape)
    if (e.round || !shape.angle) return e
    const a = (shape.angle * Math.PI) / 180
    const cos = Math.abs(Math.cos(a))
    const sin = Math.abs(Math.sin(a))
    return { hw: e.hw * cos + e.hh * sin, hh: e.hw * sin + e.hh * cos }
  }

  // Centre of a text shape's box: align left/right anchors the text to that side of its cell.
  function boxCentre(shape) {
    if (shape.type !== 'text' || shape.align === 'centre') return { x: shape.x, y: shape.y }
    const { hw } = sized(shape)
    return { x: shape.align === 'left' ? shape.x - CELL / 2 + hw : shape.x + CELL / 2 - hw, y: shape.y }
  }

  // Extra height under an image or icon taken up by its label.
  const labelBelow = (shape) => (['image', 'icon'].includes(shape.type) && shape.label ? FONT * shape.font * 1.3 * (shape.scale ?? 1) : 0)

  function placeNextTo(self, other, place, gap) {
    const a = outline(self)
    const b = outline(other)
    const c = boxCentre(other)
    switch (place) {
      case 'above': return { x: c.x, y: c.y - b.hh - gap - a.hh - labelBelow(self) }
      case 'below': return { x: c.x, y: c.y + b.hh + labelBelow(other) + gap + a.hh }
      case 'left-of': return { x: c.x - b.hw - gap - a.hw, y: c.y }
      default: return { x: c.x + b.hw + gap + a.hw, y: c.y }
    }
  }

  // Where an attached shape sits: beside its ref (attach), or at a fixed offset (group member).
  function attachPos(shape, ref, spec) {
    if (spec.dx !== undefined) return { x: ref.x + spec.dx, y: ref.y + spec.dy }
    if (spec.side === 'centre') return boxCentre(ref)
    return placeNextTo(shape, ref, spec.side, spec.gap ?? PLACE_GAP)
  }

  // The point where a line from `shape`'s centre towards `toward` leaves the shape.
  function edgePoint(shape, toward) {
    const c = boxCentre(shape)
    const dx = toward.x - c.x
    const dy = toward.y - c.y
    const len = Math.hypot(dx, dy)
    if (len < 1e-6) return c
    const ux = dx / len
    const uy = dy / len
    const { hw, hh, round } = sized(shape)
    // Measure in the shape's own frame, so rotated boxes are trimmed at their real edge.
    const a = (-(shape.angle || 0) * Math.PI) / 180
    const lx = ux * Math.cos(a) - uy * Math.sin(a)
    const ly = ux * Math.sin(a) + uy * Math.cos(a)
    const dist = round ? hw : Math.min(Math.abs(lx) > 1e-9 ? hw / Math.abs(lx) : Infinity, Math.abs(ly) > 1e-9 ? hh / Math.abs(ly) : Infinity)
    const d = Math.min(dist + EDGE_GAP, len / 2)
    return { x: c.x + ux * d, y: c.y + uy * d }
  }

  // A line's two ends as points, trimmed to the edges of any shapes they are attached to.
  function resolveEnds(line, byId) {
    const target = (end) => (end.ref && byId.get(end.ref)) || null
    const centre = (end) => { const s = target(end); return s ? boxCentre(s) : { x: end.x, y: end.y } }
    const a = centre(line.from)
    const b = centre(line.to)
    const fromShape = target(line.from)
    const toShape = target(line.to)
    return {
      from: fromShape ? edgePoint(fromShape, b) : a,
      to: toShape ? edgePoint(toShape, a) : b,
    }
  }

  // An arc of the circle through a, b, c, from p to q, turning the way a -> b -> c goes.
  // Returns t (0-1) -> point, or null when the three points are in a straight line.
  function arcThrough(a, b, c, p, q) {
    const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y))
    if (Math.abs(d) < 1e-6) return null
    const sq = (pt) => pt.x * pt.x + pt.y * pt.y
    const cx = (sq(a) * (b.y - c.y) + sq(b) * (c.y - a.y) + sq(c) * (a.y - b.y)) / d
    const cy = (sq(a) * (c.x - b.x) + sq(b) * (a.x - c.x) + sq(c) * (b.x - a.x)) / d
    const r = Math.hypot(a.x - cx, a.y - cy)
    const ccw = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) > 0 // increasing angle
    const from = Math.atan2(p.y - cy, p.x - cx)
    let sweep = Math.atan2(q.y - cy, q.x - cx) - from
    if (ccw) while (sweep <= 0) sweep += 2 * Math.PI
    else while (sweep >= 0) sweep -= 2 * Math.PI
    return (t) => ({ x: cx + r * Math.cos(from + sweep * t), y: cy + r * Math.sin(from + sweep * t) })
  }

  // A smooth, rounded curve through points, sampled into a polyline with cumulative lengths so a
  // shape can move along it at an even speed. Each section between two points blends the circle
  // through its previous three points with the circle through its next three, so one via point
  // gives an exact circular arc and zig-zag via points give a sine-like wave.
  function buildPath(points) {
    const SAMPLES = 32
    const straight = (p, q) => (t) => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) })
    const samples = [{ ...points[0], at: 0 }]
    for (let i = 0; i < points.length - 1; i++) {
      const p = points[i]
      const q = points[i + 1]
      const left = i > 0 ? arcThrough(points[i - 1], p, q, p, q) || straight(p, q) : null
      const right = i + 2 < points.length ? arcThrough(p, q, points[i + 2], p, q) || straight(p, q) : null
      for (let k = 1; k <= SAMPLES; k++) {
        const t = k / SAMPLES
        let pt
        if (left && right) {
          const a = left(t)
          const b = right(t)
          pt = { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }
        } else {
          pt = (left || right || straight(p, q))(t)
        }
        const last = samples[samples.length - 1]
        samples.push({ ...pt, at: last.at + Math.hypot(pt.x - last.x, pt.y - last.y) })
      }
    }
    return samples
  }

  // A route of straight hops (travel, follow), as path samples for pointOnPath.
  function buildPolyline(points) {
    const samples = [{ ...points[0], at: 0 }]
    for (const pt of points.slice(1)) {
      const last = samples[samples.length - 1]
      const d = Math.hypot(pt.x - last.x, pt.y - last.y)
      if (d > 1e-6) samples.push({ x: pt.x, y: pt.y, at: last.at + d })
    }
    if (samples.length === 1) samples.push({ ...samples[0], at: 0 })
    return samples
  }

  // The point a fraction t (0-1) of the way along a path, by distance.
  function pointOnPath(samples, t) {
    const total = samples[samples.length - 1].at
    const target = Math.min(1, Math.max(0, t)) * total
    let i = 1
    while (i < samples.length - 1 && samples[i].at < target) i++
    const a = samples[i - 1]
    const b = samples[i]
    const k = b.at > a.at ? (target - a.at) / (b.at - a.at) : 0
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) }
  }

  // ---------------------------------------------------------------------------
  // Compiling scenes into one state per beat
  // ---------------------------------------------------------------------------

  function baseShape(type) {
    const shape = { type, label: '', stroke: 'fg', fill: 'none', weight: 1, font: 1, angle: 0, scale: 1, bold: false, linestyle: 'solid', flow: 'none', align: 'centre', layer: 'normal' }
    if (type === 'rect') Object.assign(shape, { w: CELL, h: CELL, r: 0, fill: 'bg' }) // r: corner radius
    if (type === 'circle') Object.assign(shape, { r: CELL / 2, fill: 'bg' })
    if (type === 'image') Object.assign(shape, { w: CELL, h: CELL, stroke: 'none' })
    if (type === 'icon') Object.assign(shape, { w: CELL, h: CELL })
    if (type === 'text') Object.assign(shape, { w: 0, h: 0 })
    return shape
  }

  const rel = (value, current, scale, creating) => (creating || !value.rel ? null : current + value.v * scale)

  function lucideIcon(name) {
    const pascal = name.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
    return window.lucide?.icons?.[pascal]
  }

  function createCompiler(context) {
    const shapes = new Map() // id -> current shape
    let defaults = {}
    let uid = 0

    const check = (shape, key, word = key) => {
      if (!APPLIES[key].includes(shape.type)) throw new Error(`"${word}" doesn't apply to ${shape.type === 'arrow' || shape.type === 'icon' || shape.type === 'image' ? 'an' : 'a'} ${shape.type}`)
    }

    // Applies parsed props to a shape (a fresh one when creating, a copy when changing).
    // Returns the curve's points (start, vias, end) when the line has `via`, otherwise null.
    function applyProps(shape, props, creating, warn, meta) {
      const isLine = LINE_TYPES.includes(shape.type)
      for (const ref of [props.at?.ref, props.from?.ref, props.to?.ref, props.attach?.ref, ...(props.via || []).map((v) => v.ref),
        ...(props.travel || []).map((v) => v.ref)]) {
        if (ref && LINE_TYPES.includes(shapes.get(ref).type)) throw new Error(`"${ref}" is a line, so it can't be used as a position`)
      }
      const num = (value, current, scale) => {
        const relative = rel(value, current, scale, creating)
        return relative ?? value.v * scale
      }

      if (props.label !== undefined) shape.label = props.label
      if (props.font) { check(shape, 'font'); shape.font = Math.max(0.1, num(props.font, shape.font, 1)) }
      // size: absolute, or one signed number on a change (both sides by that amount). A relative
      // pair (size +1x+0) isn't allowed: width / height change one side.
      if (props.size) {
        check(shape, 'size')
        const relative = !creating && (props.size.w.rel || props.size.h.rel)
        if (relative && !props.size.one) throw new Error('a relative size takes one number (e.g. "size +1"): use "width +1" / "height +1" to change one side')
        if (shape.type === 'circle') {
          if (!props.size.one) throw new Error('a circle takes one size (or use radius)')
          shape.r = Math.max(0, relative ? shape.r + (props.size.w.v * CELL) / 2 : (props.size.w.v * CELL) / 2)
        } else {
          shape.w = Math.max(0, relative ? shape.w + props.size.w.v * CELL : props.size.w.v * CELL)
          shape.h = Math.max(0, relative ? shape.h + props.size.h.v * CELL : props.size.h.v * CELL)
        }
      }
      if (props.size && (props.width || props.height)) throw new Error('give either "size" or "width" / "height", not both')
      if (props.width) { check(shape, 'width'); shape.w = Math.max(0, num(props.width, shape.w, CELL)) }
      if (props.height) { check(shape, 'height'); shape.h = Math.max(0, num(props.height, shape.h, CELL)) }
      if (props.radius) { check(shape, 'radius'); shape.r = Math.max(0, num(props.radius, shape.r, CELL)) }
      if (props.fill) { check(shape, 'fill'); shape.fill = props.fill }
      if (props.stroke) shape.stroke = props.stroke
      if (props.weight) {
        if (shape.type === 'text') warn('"weight" has no effect on text')
        shape.weight = Math.max(0, num(props.weight, shape.weight, 1))
      }
      if (props.align) { check(shape, 'align'); shape.align = props.align }
      if (props.angle) { check(shape, 'angle'); shape.angle = num(props.angle, shape.angle, 1) }
      if (props.scale) { check(shape, 'scale'); shape.scale = Math.max(0, num(props.scale, shape.scale, 1)) }
      if (props.bold) shape.bold = true
      if (props.linestyle) { check(shape, 'linestyle', props.linestyle); shape.linestyle = props.linestyle }
      if (props.flow) {
        check(shape, 'flow', props.flow)
        shape.flow = FLOWS[props.flow]
        if (shape.flow !== 'none' && shape.linestyle === 'solid') warn(`"${props.flow}" only shows on a dashed or dotted line`)
      }
      if (props.layer) shape.layer = props.layer

      // highlight: box / spotlight stay until clear
      if (props.highlight) {
        const hl = { box: false, spotlight: false, ...shape.hl }
        for (const word of props.highlight) {
          if (word === 'clear') { hl.box = false; hl.spotlight = false }
          else hl[word] = true
        }
        shape.hl = hl
      }
      // pulse / shake: one-off effects this beat, on an existing shape (and a group's members)
      if (props.emphasis) {
        if (creating) warn(`"${props.emphasis}" plays on a shape that already exists, so it does nothing here`)
        else for (const target of [shape, ...groupMembers(shape)]) meta.oneoff.set(target.uid, props.emphasis)
      }
      if (props.callout) shape.callout = props.callout.none ? null : { text: props.callout.text, side: props.callout.side }

      if (isLine && (props.travel || props.follow || props.attach)) throw new Error('a line has no single position, so it can\'t travel, follow or attach (its ends can follow shapes)')
      if (isLine) {
        if (props.x || props.y || props.at?.kind === 'ref' || props.at?.kind === 'place') throw new Error('a line has no single position: use from / to, or "move +x,+y" to shift it')
        if (props.at) {
          if (!props.at.x.rel || !props.at.y.rel || creating) throw new Error('a line has no single position: use from / to, or "move +x,+y" to shift it')
          const ends = resolveEnds(shape, shapes)
          shape.from = { x: ends.from.x + props.at.x.v * CELL, y: ends.from.y + props.at.y.v * CELL }
          shape.to = { x: ends.to.x + props.at.x.v * CELL, y: ends.to.y + props.at.y.v * CELL }
        }
        for (const key of ['from', 'to']) {
          const end = props[key]
          if (!end) continue
          if (end.kind === 'ref') { shape[key] = { ref: end.ref }; continue }
          const current = creating ? null : resolveEnds(shape, shapes)[key]
          shape[key] = {
            x: (current && rel(end.x, current.x, CELL, false)) ?? cellToPx(end.x.v),
            y: (current && rel(end.y, current.y, CELL, false)) ?? cellToPx(end.y.v),
          }
        }
        if (creating && (!shape.from || !shape.to)) throw new Error('a line needs both ends, e.g. "from 2,3 to 7,8" or "from a to b"')
        if (props.via) throw new Error('"via" moves a shape along a curve, so it can\'t be used on a line')
        return null
      }

      const positioned = props.at || props.x || props.y
      if (props.travel && props.follow) throw new Error('give either "travel" or "follow", not both')
      if ((props.travel || props.follow) && (positioned || props.via)) throw new Error('"travel" and "follow" set the route, so they can\'t go with at / move / x / y / via')
      if ((props.travel || props.follow) && creating) throw new Error('"travel" and "follow" only work when moving an existing shape')
      if (props.attach && (positioned || props.via || props.travel || props.follow)) throw new Error('"attach" sets the position, so it can\'t go with a move')
      if (props.via && creating) throw new Error('"via" only works when moving an existing shape')
      if (props.via && !props.at && !props.x && !props.y) throw new Error('"via" needs a move too, e.g. "move 9,3 via 5,1"')
      const start = { x: shape.x, y: shape.y }

      const pos = (value, current) => rel(value, current, CELL, creating) ?? cellToPx(value.v)
      const at = props.at
      if (at?.kind === 'abs') { shape.x = pos(at.x, shape.x); shape.y = pos(at.y, shape.y) }
      if (at?.kind === 'ref') Object.assign(shape, boxCentre(shapes.get(at.ref)))
      if (at?.kind === 'place') {
        const gap = props.gap ? props.gap.v * CELL : PLACE_GAP
        Object.assign(shape, placeNextTo(shape, shapes.get(at.ref), at.place, gap))
      }
      if (props.x) shape.x = pos(props.x, shape.x)
      if (props.y) shape.y = pos(props.y, shape.y)

      if (props.attach) {
        if (props.attach.ref === shape.id) throw new Error('a shape can\'t attach to itself')
        leaveGroup(shape)
        shape.attach = { ref: props.attach.ref, side: props.attach.side, gap: props.gap ? props.gap.v * CELL : PLACE_GAP }
        Object.assign(shape, attachPos(shape, shapes.get(props.attach.ref), shape.attach))
      }
      if (props.detach) {
        if (!shape.attach) warn('this shape isn\'t attached or in a group, so "detach" does nothing')
        leaveGroup(shape)
        shape.attach = null
      }
      if (creating && (shape.x === undefined || shape.y === undefined)) throw new Error('needs a position, e.g. "at 3,2"')

      // Moving an attached shape releases it; moving a group member keeps it in the group
      // (at its new place in it).
      const moved = positioned || props.via || props.travel || props.follow
      const keepOffset = () => {
        if (!moved || !shape.attach || props.attach) return
        if (shape.attach.dx === undefined) { shape.attach = null; return }
        const parent = shapes.get(shape.attach.ref)
        shape.attach.dx = shape.x - parent.x
        shape.attach.dy = shape.y - parent.y
      }

      if (props.travel) {
        // hop by hop through the stops; a signed stop is relative to the one before
        const points = [start]
        for (const stop of props.travel) {
          const prev = points[points.length - 1]
          points.push(stop.kind === 'ref' ? boxCentre(shapes.get(stop.ref)) : {
            x: rel(stop.x, prev.x, CELL, false) ?? cellToPx(stop.x.v),
            y: rel(stop.y, prev.y, CELL, false) ?? cellToPx(stop.y.v),
          })
        }
        Object.assign(shape, points[points.length - 1])
        keepOffset()
        return buildPolyline(points)
      }
      if (props.follow) {
        const line = shapes.get(props.follow.ref)
        if (!LINE_TYPES.includes(line.type)) throw new Error(`"${props.follow.ref}" isn't a line or arrow, so it can't be followed`)
        const ends = resolveEnds(line, shapes)
        const [a, b] = props.follow.reverse ? [ends.to, ends.from] : [ends.from, ends.to]
        Object.assign(shape, b)
        keepOffset()
        return buildPolyline([start, a, b])
      }
      keepOffset()
      if (!props.via) return null

      // Via points: signed numbers are relative to where the shape starts.
      const vias = props.via.map((via) => {
        if (via.kind === 'ref') return boxCentre(shapes.get(via.ref))
        if (via.kind === 'place') return placeNextTo(shape, shapes.get(via.ref), via.place, PLACE_GAP)
        return {
          x: rel(via.x, start.x, CELL, false) ?? cellToPx(via.x.v),
          y: rel(via.y, start.y, CELL, false) ?? cellToPx(via.y.v),
        }
      })
      return buildPath([start, ...vias, { x: shape.x, y: shape.y }])
    }

    // Copies the defaults that apply to this type onto a new shape.
    function applyDefaults(shape) {
      for (const [key, value] of Object.entries(defaults)) {
        if (['speed', 'effect'].includes(key)) continue
        if (APPLIES[key] && !APPLIES[key].includes(shape.type)) continue
        if (key === 'size' && shape.type === 'circle') { if (value.one) shape.r = (value.w.v * CELL) / 2; continue }
        if (key === 'size') { shape.w = value.w.v * CELL; shape.h = value.h.v * CELL; continue }
        if (key === 'radius') { shape.r = value.v * CELL; continue }
        if (key === 'width') { shape.w = value.v * CELL; continue }
        if (key === 'height') { shape.h = value.v * CELL; continue }
        if (['weight', 'font', 'angle', 'scale'].includes(key)) { shape[key] = value.v; continue }
        shape[key] = value
      }
    }

    // A group's members (recursively), as shapes.
    function groupMembers(shape) {
      if (shape.type !== 'group') return []
      return shape.members.flatMap((id) => { const m = shapes.get(id); return m ? [m, ...groupMembers(m)] : [] })
    }

    // Takes a shape out of the group it's in (if any).
    function leaveGroup(shape) {
      if (shape.attach?.dx === undefined) return
      const parent = shapes.get(shape.attach.ref)
      if (parent?.members) parent.members = parent.members.filter((id) => id !== shape.id)
      shape.attach = null
    }

    // After every line: put attached shapes and group members where their refs now are
    // (several passes, for chains), and fit each group's box round its members.
    function settle() {
      for (let pass = 0; pass < 8; pass++) {
        let changed = false
        for (const shape of shapes.values()) {
          if (!shape.attach) continue
          const ref = shapes.get(shape.attach.ref)
          if (!ref) { shape.attach = null; continue }
          const p = attachPos(shape, ref, shape.attach)
          if (Math.abs(p.x - shape.x) > 1e-6 || Math.abs(p.y - shape.y) > 1e-6) { Object.assign(shape, p); changed = true }
        }
        if (!changed) break
      }
      for (const group of shapes.values()) {
        if (group.type !== 'group' || !group.members.length) continue
        const b = unionBounds(group.members.map((id) => shapes.get(id)).filter(Boolean), shapes)
        group.w = 2 * Math.max(group.x - b.x0, b.x1 - group.x)
        group.h = 2 * Math.max(group.y - b.y0, b.y1 - group.y)
      }
    }

    // Line ends attached to a shape that is being removed stay where they were.
    function freezeEndsAttachedTo(id) {
      for (const shape of shapes.values()) {
        if (!LINE_TYPES.includes(shape.type)) continue
        if (shape.from.ref !== id && shape.to.ref !== id) continue
        const ends = resolveEnds(shape, shapes)
        if (shape.from.ref === id) shape.from = ends.from
        if (shape.to.ref === id) shape.to = ends.to
      }
    }

    // Seconds before a line's change starts (the longest delay wins if a shape changes twice in a beat).
    function setDelay(meta, uid, props) {
      if (!props.delay) return
      if (props.delay.v < 0) throw new Error('"delay" must be zero or more seconds')
      meta.delay.set(uid, Math.max(meta.delay.get(uid) || 0, props.delay.v * 1000))
    }

    function speedOf(props) {
      return props.speed ?? defaults.speed ?? NORMAL_MS
    }

    function runLine(text, meta, warn) {
      // `defaults …` has no id (and no colon), like pause and auto
      const defaultsLine = text.match(/^defaults(\s*:)?(?:\s+(.*))?$/i)
      if (defaultsLine?.[1]) throw new Error('"defaults" takes no colon, e.g. "defaults fill blue"')
      const match = defaultsLine ? ['', 'defaults', defaultsLine[2] || ''] : text.match(/^([^:\s]+)\s*:\s*(.*)$/)
      if (!match) throw new Error('expected "id: …" (or defaults, pause, auto)')
      const id = match[1]
      const tokens = tokenize(match[2])

      if (defaultsLine) {
        const props = parseProps(tokens, 0, 'defaults', shapes)
        for (const key of ['label', 'at', 'x', 'y', 'from', 'to', 'gap', 'delay', 'via']) {
          if (key in props) throw new Error(`"${key === 'label' ? 'quoted text' : key}" can't be a default`)
        }
        if (props.reset) { defaults = {}; delete props.reset }
        const before = JSON.stringify(defaults)
        defaults = { ...defaults, ...props }
        if (JSON.stringify(defaults) === before && !tokens.some((t) => t.lower === 'clear')) warn('this defaults line changes nothing')
        return
      }

      if (!ID.test(id)) throw new Error(`"${id}" isn't a valid id (letters, digits, _ - and ., starting with a letter)`)
      if (RESERVED.has(id.toLowerCase())) throw new Error(`"${id}" is a reserved word, so it can't be an id`)

      const first = tokens[0]
      const type = first && (first.kind === 'res' ? (RESOURCE_TYPES.includes(first.name) ? first.name : null) : (SHAPE_TYPES.includes(first.lower) ? first.lower : null))
      if (first?.kind === 'res' && !type) throw new Error(`unknown shape "${first.name}(…)"`)
      const existing = shapes.get(id)

      if (first?.kind === 'word' && first.lower === 'remove') {
        if (!existing) throw new Error(`no shape called "${id}"`)
        const props = parseProps(tokens, 1, 'remove', shapes)
        const extra = Object.keys(props).filter((key) => !['speed', 'effect', 'delay'].includes(key))
        if (extra.length) throw new Error(`"remove" only takes a speed, an effect and a delay, not "${extra[0]}"`)
        // Removing a group removes its members too
        const removeOne = (target) => {
          if (!target) return
          if (target.type === 'group') target.members.forEach((m) => removeOne(shapes.get(m)))
          leaveGroup(target)
          freezeEndsAttachedTo(target.id)
          shapes.delete(target.id)
          meta.exit.set(target.uid, props.effect || defaults.effect || 'fade')
          meta.dur.set(target.uid, speedOf(props))
          setDelay(meta, target.uid, props)
        }
        removeOne(existing)
        return
      }

      const firstWord = first?.kind === 'word' ? first.lower : ''
      if (firstWord === 'copy') {
        // An identical copy that starts on the original, so a move on the same line animates
        // away from it
        const srcId = parseAs('id', tokens[1], shapes)
        if (!srcId) throw new Error(`"copy" expects a shape id${tokens[1] ? `: no shape called "${tokens[1].value}"` : ''}`)
        const src = shapes.get(srcId)
        if (src.type === 'group') throw new Error('a group can\'t be copied: copy its shapes instead')
        const props = parseProps(tokens, 2, 'change', shapes)
        const fresh = { attach: null, hl: null, callout: null }
        const shape = { ...structuredClone(src), ...fresh, id, uid: ++uid }
        meta.from.set(shape.uid, { ...structuredClone(src), ...fresh, uid: shape.uid })
        const path = applyProps(shape, props, false, warn, meta)
        if (path) meta.path.set(shape.uid, path)
        if (existing) {
          warn(`"${id}" already exists, so it is replaced`)
          meta.exit.set(existing.uid, 'fade')
          meta.dur.set(existing.uid, speedOf(props))
        }
        shapes.set(id, shape)
        meta.enter.set(shape.uid, 'copy')
        meta.dur.set(shape.uid, speedOf(props))
        setDelay(meta, shape.uid, props)
        return
      }
      if (firstWord === 'group') {
        if (existing) throw new Error(`"${id}" already exists`)
        const members = []
        let j = 1
        for (let ref; (ref = parseAs('id', tokens[j], shapes)); j++) members.push(ref)
        if (!members.length) throw new Error('"group" expects the ids of the shapes to group, e.g. "g: group a b c"')
        const props = parseProps(tokens, j, 'change', shapes)
        if (props.at || props.x || props.y || props.via || props.travel || props.follow || props.attach) throw new Error('create the group first, then move it on the next line')
        const list = members.map((m) => shapes.get(m))
        for (const m of list) {
          if (LINE_TYPES.includes(m.type) && (!m.from.ref || !m.to.ref)) throw new Error(`"${m.id}" is a line with a free end: group the shapes it joins instead, and it follows them`)
        }
        const b = unionBounds(list, shapes)
        const group = { ...baseShape('group'), id, uid: ++uid, members, x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, w: b.x1 - b.x0, h: b.y1 - b.y0 }
        for (const m of list) {
          if (LINE_TYPES.includes(m.type)) continue // follows the shapes its ends are attached to
          leaveGroup(m)
          m.attach = { ref: id, dx: m.x - group.x, dy: m.y - group.y }
        }
        applyProps(group, props, false, warn, meta)
        shapes.set(id, group)
        meta.enter.set(group.uid, 'fade')
        meta.dur.set(group.uid, speedOf(props))
        return
      }
      if (firstWord === 'ungroup') {
        if (!existing) throw new Error(`no shape called "${id}"`)
        if (existing.type !== 'group') throw new Error(`"${id}" isn't a group`)
        if (tokens.length > 1) throw new Error('"ungroup" takes nothing after it')
        for (const m of existing.members) { const member = shapes.get(m); if (member?.attach?.ref === id) member.attach = null }
        shapes.delete(id)
        meta.exit.set(existing.uid, 'fade')
        return
      }

      if (type) {
        const props = parseProps(tokens, 1, 'create', shapes)
        const shape = { ...baseShape(type), id, uid: ++uid }
        applyDefaults(shape)
        if (type === 'image') {
          if (!first.arg) throw new Error('image needs a path, e.g. image(_assets/goat.svg)')
          shape.src = context.assets.get(first.arg) || first.arg
        }
        if (type === 'icon') {
          if (!first.arg) throw new Error('icon needs a name, e.g. icon(laptop)')
          if (!lucideIcon(first.arg)) throw new Error(`no Lucide icon called "${first.arg}"`)
          shape.icon = first.arg
        }
        applyProps(shape, props, true, warn, meta)
        shape.layer = props.layer || defaults.layer || 'normal'
        if (existing) {
          // Lines attached to the old shape attach to its replacement (same id).
          warn(`"${id}" already exists, so it is replaced`)
          meta.exit.set(existing.uid, 'fade')
          meta.dur.set(existing.uid, speedOf(props))
          setDelay(meta, existing.uid, props)
        }
        shapes.set(id, shape)
        meta.enter.set(shape.uid, props.effect || defaults.effect || 'fade')
        meta.dur.set(shape.uid, speedOf(props))
        setDelay(meta, shape.uid, props)
        return
      }

      if (!existing) {
        const word = first?.kind === 'word' ? first.lower : ''
        const known = !word || PROPS[ALIASES[word] || word] || RESERVED.has(word)
        throw new Error(known ? `no shape called "${id}" (to create one, put a type after the colon, e.g. "${id}: rect")` : `unknown shape type "${first.value}"`)
      }
      const props = parseProps(tokens, 0, 'change', shapes)
      if (props.effect) warn(`"${props.effect}" only applies when a shape is created or removed`)
      const shape = structuredClone(existing)
      const path = applyProps(shape, props, false, warn, meta)
      if (path) meta.path.set(shape.uid, path)
      else if (props.at || props.x || props.y) meta.path.delete(shape.uid) // a later straight move wins
      shapes.set(id, shape)
      meta.dur.set(shape.uid, Math.max(meta.dur.get(shape.uid) || 0, speedOf(props)))
      setDelay(meta, shape.uid, props)
    }

    return { shapes, runLine, settle }
  }

  // Timing lines (no id): `pause` waits for a click while playing, `pause n` holds n seconds,
  // `auto` goes straight on to the next beat when this one finishes. Returns true if handled.
  function runTimingLine(text, meta) {
    const match = text.match(/^(pause|auto)\b\s*(.*)$/i)
    if (!match) return false
    const [, word, rest] = match
    if (word.toLowerCase() === 'auto') {
      if (rest) throw new Error('"auto" takes nothing after it')
      meta.auto = true
      return true
    }
    if (!rest) { meta.pause = 'click'; return true }
    if (!NUMBER.test(rest) || /^[+-]/.test(rest)) throw new Error('"pause" takes nothing (wait for a click) or a number of seconds, e.g. "pause 2"')
    meta.pause = parseFloat(rest) * 1000
    return true
  }

  // Compiles every beat's scene into a snapshot of all shapes, plus how each change animates.
  function compile(steps, context) {
    const compiler = createCompiler(context)
    const beats = []
    const errors = []
    const warnings = []

    steps.forEach((step, si) => {
      step.beats.forEach((beat, bi) => {
        const meta = { dur: new Map(), delay: new Map(), path: new Map(), enter: new Map(), exit: new Map(), from: new Map(), oneoff: new Map(), pause: null, auto: false }
        const where = (li) => `Step ${si + 1}${step.beats.length > 1 ? `, beat ${bi + 1}` : ''}, line ${li + 1}`
        beat.scene.split('\n').forEach((raw, li) => {
          const text = raw.trim()
          if (!text || text.startsWith('//')) return
          const warn = (message) => warnings.push(`${where(li)}: ${message}`)
          try {
            if (runTimingLine(text, meta)) return
            compiler.runLine(text, meta, warn)
            compiler.settle()
          } catch (error) {
            errors.push(`${where(li)}: ${error.message} — "${text}"`)
          }
        })
        const state = new Map([...compiler.shapes].map(([id, shape]) => [id, structuredClone(shape)]))
        beats.push({ step: si, beat: bi, state, meta })
      })
    })

    return { beats, errors, warnings }
  }

  // ---------------------------------------------------------------------------
  // Grid and bounds
  // ---------------------------------------------------------------------------

  function shapeBounds(shape, byId) {
    if (LINE_TYPES.includes(shape.type)) {
      const { from, to } = resolveEnds(shape, byId)
      return { x0: Math.min(from.x, to.x), y0: Math.min(from.y, to.y), x1: Math.max(from.x, to.x), y1: Math.max(from.y, to.y) }
    }
    const c = boxCentre(shape)
    const { hw, hh } = outline(shape)
    return { x0: c.x - hw, y0: c.y - hh, x1: c.x + hw, y1: c.y + hh + labelBelow(shape) }
  }

  function unionBounds(list, byId) {
    const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
    for (const shape of list) {
      const b = shapeBounds(shape, byId)
      box.x0 = Math.min(box.x0, b.x0); box.y0 = Math.min(box.y0, b.y0)
      box.x1 = Math.max(box.x1, b.x1); box.y1 = Math.max(box.y1, b.y1)
    }
    return box
  }

  function viewBoxFor(gridAttr, beats, warnings) {
    const fixed = String(gridAttr || '').trim().toLowerCase().match(/^(\d+)\s*x\s*(\d+)$/)
    if (gridAttr && gridAttr !== 'fit' && !fixed) warnings.push(`grid="${gridAttr}" isn't "CxR" or "fit", so 16x9 is used`)
    if (gridAttr !== 'fit') {
      const cols = fixed ? Math.max(1, +fixed[1]) : 16
      const rows = fixed ? Math.max(1, +fixed[2]) : 9
      return { x: 0, y: 0, w: cols * CELL, h: rows * CELL, cols, rows }
    }
    const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
    beats.forEach(({ state }) => state.forEach((shape) => {
      const b = shapeBounds(shape, state)
      box.x0 = Math.min(box.x0, b.x0); box.y0 = Math.min(box.y0, b.y0)
      box.x1 = Math.max(box.x1, b.x1); box.y1 = Math.max(box.y1, b.y1)
    }))
    if (!Number.isFinite(box.x0)) return { x: 0, y: 0, w: 16 * CELL, h: 9 * CELL, cols: 16, rows: 9 }
    const margin = CELL / 2
    const x = box.x0 - margin
    const y = box.y0 - margin
    return { x, y, w: box.x1 - box.x0 + 2 * margin, h: box.y1 - box.y0 + 2 * margin }
  }

  function warnOutsideGrid(beats, viewBox, warnings) {
    if (!viewBox.cols) return
    const reported = new Set()
    beats.forEach(({ state, step, beat }) => state.forEach((shape) => {
      if (LINE_TYPES.includes(shape.type) || reported.has(shape.uid)) return
      if (shape.x < 0 || shape.y < 0 || shape.x > viewBox.w || shape.y > viewBox.h) {
        reported.add(shape.uid)
        const multi = beats.some((b) => b.step === step && b.beat > 0)
        warnings.push(`Step ${step + 1}${multi ? `, beat ${beat + 1}` : ''}: "${shape.id}" is outside the ${viewBox.cols}x${viewBox.rows} grid`)
      }
    }))
  }

  // ---------------------------------------------------------------------------
  // SVG rendering
  // ---------------------------------------------------------------------------

  const flowState = new WeakMap() // stroke element -> { key, anim } for flowing dashes
  const SVG_NS = 'http://www.w3.org/2000/svg'
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(SVG_NS, tag)
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
    return el
  }
  const lerp = (a, b, t) => a + (b - a) * t
  const clamp01 = (t) => Math.min(1, Math.max(0, t))
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

  // Parses a computed colour (rgb(), rgba() or color(srgb …)) to [r, g, b, a] (0-255, alpha 0-1).
  function parseColour(text) {
    const srgb = text.match(/color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.e-]+))?\)/)
    if (srgb) return [srgb[1] * 255, srgb[2] * 255, srgb[3] * 255, srgb[4] === undefined ? 1 : +srgb[4]]
    const rgb = text.match(/rgba?\(([^)]+)\)/)
    if (!rgb) return null
    const [r, g, b, a = 1] = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number)
    return [r, g, b, a]
  }

  function colourCss(name, role) {
    if (!name) return 'none'
    if (HEX.test(name)) return name
    const css = COLOURS[name.toLowerCase()] ?? 'none'
    if (role === 'fill' && !PLAIN_FILLS.includes(name.toLowerCase())) return `color-mix(in srgb, ${css} 45%, var(--anim-bg))`
    return css
  }

  function createRenderer(svg, viewBox, debug) {
    const layers = [0, 1, 2].map(() => svg.appendChild(svgEl('g')))
    const highlightLayer = svg.appendChild(svgEl('g', { class: 'anim-highlights' }))
    const calloutLayer = svg.appendChild(svgEl('g', { class: 'anim-callouts' }))
    const nodes = new Map() // uid -> node

    if (debug) drawDebugGrid(svg, viewBox)

    function makeNode(shape) {
      const g = svgEl('g', { class: `anim-shape anim-${shape.type}` })
      const node = { g, type: shape.type, uid: shape.uid }
      if (shape.type === 'rect') node.body = g.appendChild(svgEl('rect'))
      if (shape.type === 'circle') node.body = g.appendChild(svgEl('circle'))
      if (LINE_TYPES.includes(shape.type)) {
        node.body = g.appendChild(svgEl('line', { 'stroke-linecap': 'round' }))
        if (shape.type === 'arrow') node.head = g.appendChild(svgEl('polygon', { 'stroke-linejoin': 'round' }))
      }
      if (shape.type === 'image') {
        node.image = g.appendChild(svgEl('image', { href: shape.src, preserveAspectRatio: 'xMidYMid meet' }))
        node.body = g.appendChild(svgEl('rect', { fill: 'none' }))
      }
      if (shape.type === 'icon') {
        node.icon = window.lucide.createElement(lucideIcon(shape.icon))
        node.icon.setAttribute('class', 'no-zoom') // the zoom plugin also attaches to nested SVGs
        g.appendChild(node.icon)
      }
      node.label = g.appendChild(svgEl('text', { class: 'anim-label', 'dominant-baseline': 'central' }))
      if (['image', 'icon'].includes(shape.type)) {
        const title = g.appendChild(svgEl('title'))
        node.title = title
      }
      if (debug) node.debugId = g.appendChild(svgEl('text', { class: 'anim-debug-id' }))
      nodes.set(shape.uid, node)
      return node
    }

    // Colours are blended in JavaScript every frame, like positions: each CSS colour (theme
    // variables, color-mix tints) is resolved to RGBA once through a hidden probe and cached; the
    // cache is cleared when the theme changes.
    const probe = svg.appendChild(svgEl('rect', { width: 0, height: 0 }))
    probe.style.display = 'none'
    const colourCache = new Map()
    function rgba(css) {
      if (!css || css === 'none') return null
      if (!colourCache.has(css)) {
        probe.style.fill = css
        colourCache.set(css, parseColour(getComputedStyle(probe).fill))
      }
      return colourCache.get(css)
    }
    // A colour part-way from a to b (either may be null = none: it fades in or out)
    function mixColour(a, b, t) {
      if (!a && !b) return 'none'
      const from = a || [...b.slice(0, 3), 0]
      const to = b || [...a.slice(0, 3), 0]
      const [r, g, bl, al] = from.map((v, i) => lerp(v, to[i], t))
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(bl)}, ${al.toFixed(3)})`
    }
    const paint = (el, prop, value) => { if (el.style[prop] !== value) el.style[prop] = value }

    // Draws one shape: `s` is its (interpolated) geometry, `v` its visibility and effect values.
    function drawNode(node, s, v, colours, byId) {
      const { g } = node
      if (node.type === 'group') {
        // A group is invisible (its highlight box is drawn in drawOverlays)
        if (node.debugId) { node.debugId.setAttribute('x', s.x); node.debugId.setAttribute('y', s.y); node.debugId.textContent = s.id }
        return
      }
      const strokeWidth = STROKE * s.weight
      // Dash patterns use round caps, so each drawn dash is shortened (and gap lengthened) by the
      // stroke width to keep the visible lengths; a dash of 0 is a round dot. Scales with the weight.
      const k = STROKE * Math.max(s.weight, 0.5) // the line's thickness in px (w)
      const dashFor = (style) => {
        if (style === 'solid' || !PATTERNS[style]) return { dash: 'none', cap: '', dashLen: 0, gapLen: 0, plain: true }
        const dashLen = Math.max(0, PATTERNS[style].d * k - strokeWidth)
        const gapLen = PATTERNS[style].g * k + strokeWidth
        return { dash: `${dashLen} ${gapLen}`, cap: 'round', dashLen, gapLen, plain: false }
      }
      const { dash, cap, dashLen, gapLen, plain } = dashFor(s.linestyle)

      // A style change cross-fades: a copy of the stroke in the old style (the ghost) fades out on
      // top while the new style fades in. The ghost mirrors the stroke's geometry and colour.
      const fading = s.fromStyle && s.fromStyle !== s.linestyle && v.draw >= 1
      const syncGhost = (body) => {
        if (!fading) {
          node.ghost?.remove()
          node.ghost = null
          body.style.strokeOpacity = ''
          return
        }
        if (!node.ghost) node.ghost = body.cloneNode(false)
        const ghost = node.ghost
        for (const name of ['x', 'y', 'width', 'height', 'rx', 'ry', 'r', 'x1', 'y1', 'x2', 'y2']) {
          const value = body.getAttribute(name)
          if (value === null) ghost.removeAttribute(name)
          else ghost.setAttribute(name, value)
        }
        if (ghost.previousSibling !== body) body.after(ghost)
        const old = dashFor(s.fromStyle)
        ghost.style.cssText = ''
        Object.assign(ghost.style, {
          fill: 'none', stroke: body.style.stroke, strokeWidth: body.style.strokeWidth,
          strokeDasharray: old.dash, strokeLinecap: old.cap, strokeOpacity: String(1 - s.styleT),
        })
        body.style.strokeOpacity = String(s.styleT)
      }
      // Flow: a looping Web Animation moves the dash offset by one pattern period (seamless);
      // reverse runs it backwards. Restarted only when the period or direction changes.
      const setFlow = (el) => {
        const on = s.flow !== 'none' && !plain && v.draw >= 1 && !reducedMotion()
        const period = Math.round(dashLen + gapLen)
        const key = on ? `${period}|${s.flow}` : ''
        const state = flowState.get(el)
        if ((state?.key || '') === key) return
        state?.anim.cancel()
        flowState.delete(el)
        if (!on || !el.animate || !period) return
        const anim = el.animate([{ strokeDashoffset: '0px' }, { strokeDashoffset: `${-period}px` }], {
          duration: (period / FLOW_SPEED) * 1000, iterations: Infinity, direction: s.flow === 'reverse' ? 'reverse' : 'normal',
        })
        flowState.set(el, { key, anim })
      }
      g.style.opacity = v.opacity
      const fontSize = FONT * s.font
      node.label.style.fontSize = `${fontSize}px`
      node.label.style.fontWeight = s.bold ? '700' : ''
      node.label.style.opacity = v.labelOpacity
      if (node.label.textContent !== v.label) node.label.textContent = v.label

      if (LINE_TYPES.includes(node.type)) {
        let { from, to } = resolveEnds(s, byId)
        if (v.ends) ({ from, to } = v.ends)
        from = { x: from.x + v.dx, y: from.y + v.dy }
        to = { x: to.x + v.dx, y: to.y + v.dy }
        const len = Math.hypot(to.x - from.x, to.y - from.y)
        const ux = len ? (to.x - from.x) / len : 0
        const uy = len ? (to.y - from.y) / len : 0
        let end = to
        if (node.head) {
          const head = Math.min(HEAD * (0.6 + 0.4 * s.weight), len * 0.6)
          const back = { x: to.x - ux * head, y: to.y - uy * head }
          const half = head * 0.55
          const drawn = { x: from.x + (to.x - from.x) * v.draw, y: from.y + (to.y - from.y) * v.draw }
          const tip = v.draw < 1 ? drawn : to
          const base = v.draw < 1 ? { x: tip.x - ux * head, y: tip.y - uy * head } : back
          node.head.setAttribute('points', `${tip.x},${tip.y} ${base.x - uy * half},${base.y + ux * half} ${base.x + uy * half},${base.y - ux * half}`)
          node.head.style.opacity = clamp01(v.draw * 4 - 0.2)
          node.head.style.strokeWidth = strokeWidth
          paint(node.head, 'fill', colours.stroke)
          paint(node.head, 'stroke', colours.stroke)
          end = back
        }
        node.body.setAttribute('x1', from.x); node.body.setAttribute('y1', from.y)
        node.body.setAttribute('x2', end.x); node.body.setAttribute('y2', end.y)
        node.body.style.strokeWidth = strokeWidth
        if (v.draw < 1) {
          setFlow(node.body) // off while drawing in
          syncGhost(node.body)
          node.body.setAttribute('pathLength', '1')
          node.body.style.strokeDasharray = '1 1'
          node.body.style.strokeDashoffset = String(1 - v.draw)
        } else {
          node.body.removeAttribute('pathLength')
          node.body.style.strokeDasharray = dash
          node.body.style.strokeLinecap = cap
          node.body.style.strokeDashoffset = ''
          setFlow(node.body)
          syncGhost(node.body)
        }
        paint(node.body, 'stroke', colours.stroke)
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        node.label.setAttribute('x', mx); node.label.setAttribute('y', my)
        node.label.setAttribute('text-anchor', 'middle')
        node.label.classList.add('anim-halo')
        g.setAttribute('transform', v.scale === 1 ? '' : `translate(${mx} ${my}) scale(${v.scale}) translate(${-mx} ${-my})`)
        if (node.debugId) { node.debugId.setAttribute('x', from.x); node.debugId.setAttribute('y', from.y); node.debugId.textContent = s.id }
        return
      }

      const c = boxCentre(s)
      g.setAttribute('transform', `translate(${c.x + v.dx} ${c.y + v.dy}) rotate(${s.angle}) scale(${v.scale * s.scale})`)
      const { hw, hh } = extents(s)

      if (node.type === 'rect') {
        node.body.setAttribute('x', -hw); node.body.setAttribute('y', -hh)
        node.body.setAttribute('width', 2 * hw); node.body.setAttribute('height', 2 * hh)
        const corner = Math.max(0, Math.min(s.r || 0, hw, hh))
        node.body.setAttribute('rx', corner); node.body.setAttribute('ry', corner)
      }
      if (node.type === 'circle') node.body.setAttribute('r', s.r)
      if (['rect', 'circle'].includes(node.type)) {
        paint(node.body, 'fill', colours.fill)
        paint(node.body, 'stroke', s.weight ? colours.stroke : 'none')
        node.body.style.strokeWidth = strokeWidth
        node.body.style.strokeDasharray = dash
        node.body.style.strokeLinecap = cap
        setFlow(node.body)
        syncGhost(node.body)
      }
      if (node.type === 'image') {
        for (const el of [node.image, node.body]) {
          el.setAttribute('x', -hw); el.setAttribute('y', -hh)
          el.setAttribute('width', 2 * hw); el.setAttribute('height', 2 * hh)
        }
        paint(node.body, 'stroke', s.weight ? colours.stroke : 'none')
        node.body.style.strokeWidth = strokeWidth
        node.body.style.strokeDasharray = dash
        node.body.style.strokeLinecap = cap
        setFlow(node.body)
        syncGhost(node.body)
      }
      if (node.type === 'icon') {
        node.icon.setAttribute('x', -hw); node.icon.setAttribute('y', -hh)
        node.icon.setAttribute('width', 2 * hw); node.icon.setAttribute('height', 2 * hh)
        node.icon.setAttribute('stroke-width', 2 * s.weight)
        paint(node.icon, 'stroke', colours.stroke)
      }
      if (node.title && node.title.textContent !== s.label) node.title.textContent = s.label

      // Label: inside rect/circle, the content of text, under image/icon
      const label = node.label
      label.setAttribute('x', 0)
      label.setAttribute('text-anchor', 'middle')
      if (node.type === 'text') {
        const anchor = s.align === 'left' ? 'start' : s.align === 'right' ? 'end' : 'middle'
        label.setAttribute('text-anchor', anchor)
        label.setAttribute('x', anchor === 'start' ? -hw : anchor === 'end' ? hw : 0)
        label.setAttribute('y', 0)
        paint(label, 'fill', colours.stroke)
      } else if (['image', 'icon'].includes(node.type)) {
        label.setAttribute('y', hh + fontSize * 0.75)
      } else {
        label.setAttribute('y', 0)
      }
      if (node.debugId) { node.debugId.setAttribute('x', -hw); node.debugId.setAttribute('y', -hh - 4); node.debugId.textContent = s.id }
    }

    // Puts each node in its layer, in creation order.
    function order(list) {
      list.sort((a, b) => LAYERS[a.shape.layer] - LAYERS[b.shape.layer] || a.shape.uid - b.shape.uid)
      list.forEach(({ node, shape }) => layers[LAYERS[shape.layer]].appendChild(node.g))
    }

    function offscreenOffset(shape) {
      const c = shapeBounds(shape, new Map())
      const cx = (c.x0 + c.x1) / 2
      const cy = (c.y0 + c.y1) / 2
      const options = [
        { d: cx - viewBox.x, dx: -(c.x1 - viewBox.x) - CELL / 2, dy: 0 },
        { d: viewBox.x + viewBox.w - cx, dx: viewBox.x + viewBox.w - c.x0 + CELL / 2, dy: 0 },
        { d: cy - viewBox.y, dx: 0, dy: -(c.y1 - viewBox.y) - CELL / 2 },
        { d: viewBox.y + viewBox.h - cy, dx: 0, dy: viewBox.y + viewBox.h - c.y0 + CELL / 2 },
      ]
      return options.sort((a, b) => a.d - b.d)[0]
    }

    // Visibility for a shape that is appearing (t: 0 -> 1) or disappearing (t: 1 -> 0).
    function appear(effect, t, shape) {
      const v = { opacity: 1, scale: 1, draw: 1, dx: 0, dy: 0 }
      const isLine = LINE_TYPES.includes(shape.type)
      if (effect === 'pop') { v.scale = Math.max(0.001, t); v.opacity = clamp01(t * 3) }
      else if (effect === 'draw' && isLine) v.draw = t
      else if (effect === 'slide' && !isLine) {
        const off = offscreenOffset(shape)
        v.dx = off.dx * (1 - t); v.dy = off.dy * (1 - t)
      } else v.opacity = t
      return v
    }

    function interpolate(a, b, t) {
      const s = { ...b }
      for (const key of ['x', 'y', 'w', 'h', 'r', 'weight', 'font', 'angle', 'scale']) {
        if (typeof a[key] === 'number' && typeof b[key] === 'number') s[key] = lerp(a[key], b[key], t)
      }
      // A line style change cross-fades from the old style to the new (see syncGhost)
      if (a.linestyle !== b.linestyle && t < 1) {
        s.fromStyle = a.linestyle
        s.styleT = t
      }
      return s
    }

    // Shapes lit by a spotlight in a state (by id): spotlit shapes, the members of spotlit groups,
    // and lines whose ends are both on lit shapes. Null when nothing is spotlit.
    function litIds(state) {
      if (![...state.values()].some((s) => s.hl?.spotlight)) return null
      const lit = new Set()
      const isLit = (shape, depth = 0) => {
        if (!shape || depth > 8) return false
        if (shape.hl?.spotlight) return true
        if (shape.attach?.dx !== undefined) return isLit(state.get(shape.attach.ref), depth + 1)
        return false
      }
      for (const shape of state.values()) if (isLit(shape)) lit.add(shape.id)
      for (const shape of state.values()) {
        if (LINE_TYPES.includes(shape.type) && shape.from.ref && shape.to.ref && lit.has(shape.from.ref) && lit.has(shape.to.ref)) lit.add(shape.id)
      }
      return lit
    }

    const DIM = 0.2 // opacity of shapes outside the spotlight

    /**
     * Renders the transition between two consecutive states. progress(uid) gives each shape's
     * position from A (0) to B (1); `final` is the state the transition ends on (it supplies
     * the colours) and `ms(uid)` the colour transition time. `extra.beatT` is the whole beat's
     * progress from A to B (for the spotlight) and `extra.forward` its direction (one-off
     * highlight effects only play forwards).
     */
    function render(A, B, meta, progress, final, extra = { forward: true, beatT: 1 }) {
      const aByUid = new Map([...A.values()].map((s) => [s.uid, s]))
      const bByUid = new Map([...B.values()].map((s) => [s.uid, s]))
      const uids = new Set([...aByUid.keys(), ...bByUid.keys()])
      const items = []
      const now = new Map() // id -> interpolated shape, for attached line ends and shapes

      for (const uid of uids) {
        // A copy starts as its original, so it animates away from it
        const a = aByUid.get(uid) || (bByUid.has(uid) ? meta.from?.get(uid) : undefined)
        const b = bByUid.get(uid)
        const raw = clamp01(progress(uid))
        const t = ease(raw)
        let shape
        let v
        if (a && b) {
          shape = interpolate(a, b, t)
          if (meta.path.has(uid)) Object.assign(shape, pointOnPath(meta.path.get(uid), t))
          v = { opacity: 1, scale: 1, draw: 1, dx: 0, dy: 0 }
          const swap = a.label !== b.label
          v.label = swap && t < 0.5 ? a.label : b.label
          v.labelOpacity = swap ? Math.abs(2 * t - 1) : 1
          // One-off effects, forwards only (going back doesn't replay them)
          const oneoff = extra.forward && meta.oneoff?.get(uid)
          if (oneoff === 'pulse') v.scale = 1 + 0.25 * Math.sin(Math.PI * raw)
          if (oneoff === 'shake') v.dx = 0.15 * CELL * Math.sin(8 * Math.PI * raw) * (1 - raw)
        } else if (b) {
          shape = b
          v = appear(meta.enter.get(uid) || 'fade', t, b)
        } else {
          shape = a
          v = appear(meta.exit.get(uid) || 'fade', 1 - t, a)
        }
        v.label ??= shape.label
        v.labelOpacity ??= 1
        const node = nodes.get(uid) || makeNode(shape)
        items.push({ uid, shape, v, node, a, b, t })
        if (!LINE_TYPES.includes(shape.type) && (!now.has(shape.id) || b)) now.set(shape.id, { ...shape, x: shape.x + v.dx, y: shape.y + v.dy })
      }

      // Attached shapes and group members follow their ref's current (interpolated) place, so
      // they stay together along curves and routes. Several passes, for chains.
      for (let pass = 0; pass < 8; pass++) {
        let changed = false
        for (const item of items) {
          const spec = (item.b || item.a).attach
          if (!spec || LINE_TYPES.includes(item.shape.type)) continue
          const before = item.a?.attach
          const same = !item.a || !item.b || (before && before.ref === spec.ref && before.side === spec.side)
          const ref = now.get(spec.ref)
          if (!same || !ref) continue
          // a group member moved within its group glides to its new offset
          const offset = spec.dx !== undefined && before?.dx !== undefined
            ? { dx: lerp(before.dx, spec.dx, item.t), dy: lerp(before.dy, spec.dy, item.t) } : spec
          const p = attachPos(item.shape, ref, { ...spec, ...(spec.dx !== undefined ? offset : {}) })
          const x = p.x + item.v.dx
          const y = p.y + item.v.dy
          if (Math.abs(x - item.shape.x) > 1e-6 || Math.abs(y - item.shape.y) > 1e-6) {
            item.shape = { ...item.shape, x: p.x, y: p.y }
            now.set(item.shape.id, { ...item.shape, x, y })
            changed = true
          }
        }
        if (!changed) break
      }

      // Lines whose ends move between A and B (or swap between a shape and a point) blend the two.
      for (const item of items) {
        if (!LINE_TYPES.includes(item.shape.type) || !item.a || !item.b) continue
        const ea = resolveEnds(item.a, now)
        const eb = resolveEnds(item.b, now)
        item.v.ends = {
          from: { x: lerp(ea.from.x, eb.from.x, item.t), y: lerp(ea.from.y, eb.from.y, item.t) },
          to: { x: lerp(ea.to.x, eb.to.x, item.t), y: lerp(ea.to.y, eb.to.y, item.t) },
        }
      }
      for (const [uid, node] of nodes) {
        if (!uids.has(uid)) { node.g.remove(); node.box?.remove(); node.bubble?.remove(); nodes.delete(uid) }
      }

      // Spotlight: shapes outside it fade to DIM over the beat
      const litA = litIds(A)
      const litB = litIds(B)
      for (const item of items) {
        const dimA = litA && !litA.has(item.shape.id) ? 1 : 0
        const dimB = litB && !litB.has(item.shape.id) ? 1 : 0
        const dim = lerp(dimA, dimB, extra.beatT)
        if (dim) item.v.opacity *= 1 - (1 - DIM) * dim
      }

      const finalByUid = new Map([...final.values()].map((s) => [s.uid, s]))
      order(items.map(({ node, shape, uid }) => ({ node, shape: finalByUid.get(uid) || shape })))

      for (const item of items) {
        // colours: blended from A's to B's over the shape's progress (entering / leaving: their own)
        const from = item.a || item.b
        const to = item.b || item.a
        const t = item.a && item.b ? item.t : 1
        const colours = {
          fill: mixColour(rgba(colourCss(from.fill, 'fill')), rgba(colourCss(to.fill, 'fill')), t),
          stroke: mixColour(rgba(colourCss(from.stroke, 'stroke')), rgba(colourCss(to.stroke, 'stroke')), t),
        }
        drawNode(item.node, item.shape, item.v, colours, now)
        drawOverlays(item, now)
      }
    }

    // World-space bounds of a shape as drawn now: outline (rotated, scaled), a line's ends, or a
    // group's members.
    function liveBounds(item, now, depth = 0) {
      const s = item.shape
      if (LINE_TYPES.includes(s.type)) {
        const { from, to } = item.v.ends || resolveEnds(s, now)
        return { x0: Math.min(from.x, to.x), y0: Math.min(from.y, to.y), x1: Math.max(from.x, to.x), y1: Math.max(from.y, to.y) }
      }
      if (s.type === 'group' && depth < 8) {
        const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
        for (const id of s.members || []) {
          const m = now.get(id)
          if (!m) continue
          const b = liveBounds({ shape: m, v: {} }, now, depth + 1)
          box.x0 = Math.min(box.x0, b.x0); box.y0 = Math.min(box.y0, b.y0)
          box.x1 = Math.max(box.x1, b.x1); box.y1 = Math.max(box.y1, b.y1)
        }
        if (Number.isFinite(box.x0)) return box
      }
      const c = boxCentre(s)
      const dx = item.v.dx || 0
      const { hw, hh } = outline(s)
      return { x0: c.x - hw + dx, y0: c.y - hh, x1: c.x + hw + dx, y1: c.y + hh + labelBelow(s) }
    }

    // How much of a two-state feature shows: from A's value to B's over the shape's progress,
    // times the shape's own visibility (entering / leaving).
    const blend = (item, has) => lerp(item.a && has(item.a) ? 1 : 0, item.b && has(item.b) ? 1 : 0, item.a && item.b ? item.t : 1) * (item.a && item.b ? 1 : item.v.opacity)

    // The highlight box and the callout bubble, drawn above everything in world space.
    function drawOverlays(item, now) {
      const node = item.node
      const boxOpacity = blend(item, (s) => s.hl?.box) * Math.min(1, item.v.opacity / 1)
      const bubbleOpacity = blend(item, (s) => s.callout)
      if (!boxOpacity && !node.box && !bubbleOpacity && !node.bubble) return
      const b = liveBounds(item, now)

      if (boxOpacity || node.box) {
        if (!node.box) node.box = highlightLayer.appendChild(svgEl('rect', { class: 'anim-highlight-box' }))
        const pad = 0.15 * CELL
        Object.entries({ x: b.x0 - pad, y: b.y0 - pad, width: b.x1 - b.x0 + 2 * pad, height: b.y1 - b.y0 + 2 * pad, rx: 0.12 * CELL })
          .forEach(([k, val]) => node.box.setAttribute(k, val))
        node.box.style.opacity = boxOpacity
        if (!boxOpacity) { node.box.remove(); node.box = null }
      }

      if (bubbleOpacity || node.bubble) {
        // The text being shown: B's, or A's while A's callout fades out
        const callout = (item.b?.callout && (item.t >= 0.5 || !item.a?.callout)) ? item.b.callout : (item.a?.callout || item.b?.callout)
        if (!node.bubble) {
          node.bubble = calloutLayer.appendChild(svgEl('g', { class: 'anim-callout' }))
          node.bubblePath = node.bubble.appendChild(svgEl('path'))
          node.bubbleText = node.bubble.appendChild(svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }))
        }
        if (callout) drawBubble(node, callout, b)
        node.bubble.style.opacity = bubbleOpacity
        if (!bubbleOpacity) { node.bubble.remove(); node.bubble = null }
      }
    }

    // A speech bubble beside bounds `b`, with a tail pointing at it.
    function drawBubble(node, callout, b) {
      const size = FONT * 0.75
      const w = Math.max(CELL, callout.text.length * 0.55 * size + size * 1.4)
      const h = size * 2
      const tail = 0.3 * CELL
      const cx0 = (b.x0 + b.x1) / 2
      const cy0 = (b.y0 + b.y1) / 2
      let cx = cx0, cy = cy0, tip
      if (callout.side === 'below') { tip = { x: cx0, y: b.y1 + 4 }; cy = b.y1 + tail + h / 2 }
      else if (callout.side === 'left') { tip = { x: b.x0 - 4, y: cy0 }; cx = b.x0 - tail - w / 2 }
      else if (callout.side === 'right') { tip = { x: b.x1 + 4, y: cy0 }; cx = b.x1 + tail + w / 2 }
      else { tip = { x: cx0, y: b.y0 - 4 }; cy = b.y0 - tail - h / 2 }
      // Keep the bubble inside the drawing (the tail still points at the shape)
      const m = 4
      cx = Math.min(viewBox.x + viewBox.w - w / 2 - m, Math.max(viewBox.x + w / 2 + m, cx))
      cy = Math.min(viewBox.y + viewBox.h - h / 2 - m, Math.max(viewBox.y + h / 2 + m, cy))
      node.bubblePath.setAttribute('d', bubblePath(cx, cy, w, h, Math.min(10, h / 3), callout.side, tip))
      node.bubbleText.setAttribute('x', cx)
      node.bubbleText.setAttribute('y', cy)
      node.bubbleText.style.fontSize = `${size}px`
      if (node.bubbleText.textContent !== callout.text) node.bubbleText.textContent = callout.text
    }

    // A rounded rectangle with a tail on the side facing the shape.
    function bubblePath(cx, cy, w, h, r, side, tip) {
      const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2
      const half = Math.min(10, w / 4, h / 3)
      const tx = Math.min(x1 - r - half, Math.max(x0 + r + half, tip.x))
      const ty = Math.min(y1 - r - half, Math.max(y0 + r + half, tip.y))
      let d = `M ${x0 + r} ${y0}`
      if (side === 'below') d += ` L ${tx - half} ${y0} L ${tip.x} ${tip.y} L ${tx + half} ${y0}`
      d += ` L ${x1 - r} ${y0} Q ${x1} ${y0} ${x1} ${y0 + r}`
      if (side === 'left') d += ` L ${x1} ${ty - half} L ${tip.x} ${tip.y} L ${x1} ${ty + half}`
      d += ` L ${x1} ${y1 - r} Q ${x1} ${y1} ${x1 - r} ${y1}`
      if (side === 'above') d += ` L ${tx + half} ${y1} L ${tip.x} ${tip.y} L ${tx - half} ${y1}`
      d += ` L ${x0 + r} ${y1} Q ${x0} ${y1} ${x0} ${y1 - r}`
      if (side === 'right') d += ` L ${x0} ${ty + half} L ${tip.x} ${tip.y} L ${x0} ${ty - half}`
      return `${d} L ${x0} ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} Z`
    }

    return { render, clearColours: () => colourCache.clear() }
  }

  function drawDebugGrid(svg, vb) {
    const g = svg.appendChild(svgEl('g', { class: 'anim-debug-grid' }))
    const c0 = Math.floor(vb.x / CELL)
    const c1 = Math.ceil((vb.x + vb.w) / CELL)
    const r0 = Math.floor(vb.y / CELL)
    const r1 = Math.ceil((vb.y + vb.h) / CELL)
    for (let c = c0; c <= c1; c++) g.appendChild(svgEl('line', { x1: c * CELL, y1: vb.y, x2: c * CELL, y2: vb.y + vb.h }))
    for (let r = r0; r <= r1; r++) g.appendChild(svgEl('line', { x1: vb.x, y1: r * CELL, x2: vb.x + vb.w, y2: r * CELL }))
    for (let c = c0; c < c1; c++) {
      const label = g.appendChild(svgEl('text', { x: (c + 0.5) * CELL, y: vb.y + 14, 'text-anchor': 'middle' }))
      label.textContent = c + 1
    }
    for (let r = r0; r < r1; r++) {
      const label = g.appendChild(svgEl('text', { x: vb.x + 6, y: (r + 0.5) * CELL, 'dominant-baseline': 'central' }))
      label.textContent = r + 1
    }
  }

  // ---------------------------------------------------------------------------
  // Widget
  // ---------------------------------------------------------------------------

  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Transparent icon buttons styled like reveal.js's controls (animation.css): chevrons are drawn in
  // CSS, other icons use the shared --butt-icon-* masks. No type attribute: Docsify's core CSS
  // styles button[type].
  function createButton(className, label) {
    const button = document.createElement('button')
    button.className = `anim-ctrl ${className}`
    setButtonLabel(button, label)
    return button
  }

  function setButtonLabel(button, label) {
    button.setAttribute('aria-label', label)
    button.title = label
  }

  // The keyboard shortcuts summary (?), styled like reveal.js's help overlay.
  function buildHelp(widget, hasNotes) {
    const rows = [
      ['→ , N , Space', 'Next step'],
      ['← , P , Shift Space', 'Previous step'],
      ['Home', 'Back to the start'],
      ['End', 'Last step'],
      ['A', 'Play / pause'],
      ['F', 'Full screen'],
      ...(hasNotes ? [['S', 'Teacher notes']] : []),
      ['?', 'Show or hide these shortcuts'],
      ['Esc', 'Close this / exit full screen'],
    ]
    const help = widget.appendChild(document.createElement('div'))
    help.className = 'anim-help'
    help.hidden = true
    const close = help.appendChild(document.createElement('button'))
    close.className = 'anim-help-close'
    close.textContent = 'Esc'
    close.setAttribute('aria-label', 'Close keyboard shortcuts')
    close.addEventListener('click', () => { help.hidden = true; widget.focus() })
    const inner = help.appendChild(document.createElement('div'))
    inner.className = 'anim-help-inner'
    const title = inner.appendChild(document.createElement('div'))
    title.className = 'anim-help-title'
    title.textContent = 'Keyboard Shortcuts'
    const table = inner.appendChild(document.createElement('table'))
    table.innerHTML = `<thead><tr><th>Key</th><th>Action</th></tr></thead><tbody>${rows
      .map(([key, action]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(action)}</td></tr>`).join('')}</tbody>`
    return help
  }

  // Reads the compiled caption markup back out of the source element.
  function readSource(source) {
    const assets = new Map()
    const assetBlock = source.querySelector(':scope > .anim-src-assets')
    if (assetBlock) {
      const paths = JSON.parse(decodeURIComponent(assetBlock.dataset.paths || '%5B%5D'))
      const imgs = [...assetBlock.querySelectorAll('img')]
      paths.forEach((path, i) => imgs[i] && assets.set(path, imgs[i].getAttribute('src')))
    }

    const steps = [...source.querySelectorAll(':scope > .anim-src-step')].map((stepEl) => ({
      beats: [...stepEl.querySelectorAll(':scope > .anim-src-beat')].map((beatEl) => ({
        scene: decodeURIComponent(beatEl.dataset.scene || ''),
        caption: beatEl,
      })),
      notes: stepEl.querySelector(':scope > .anim-src-notes'),
    }))

    // The first heading of step 1 is the fixed title (if it's an h1); each step's leading heading is its heading.
    let title = null
    const firstCaption = steps[0]?.beats[0]?.caption
    if (firstCaption?.firstElementChild?.tagName === 'H1') title = firstCaption.firstElementChild
    title?.remove()
    steps.forEach((step) => {
      const first = step.beats[0]?.caption.firstElementChild
      step.heading = first && /^H[1-6]$/.test(first.tagName) ? first : null
      step.heading?.remove()
    })
    return { steps, title, assets }
  }

  function buildWidget(source) {
    const { steps, title, assets } = readSource(source)
    const debug = source.hasAttribute('data-debug')
    const { beats, errors, warnings } = compile(steps, { assets })
    const viewBox = viewBoxFor(source.dataset.grid, beats, warnings)
    if (debug) warnOutsideGrid(beats, viewBox, warnings)

    // Playback options from the tag: autoplay, loop / loop-bounce, hold="s", speed="x", controls="none"
    const opts = JSON.parse(decodeURIComponent(source.dataset.playback || '%7B%7D'))
    const positive = (value, name, fallback) => {
      if (value == null || value === true) return fallback
      const n = parseFloat(value)
      if (Number.isFinite(n) && n > 0) return n
      warnings.push(`${name}="${value}" isn't a positive number, so ${fallback} is used`)
      return fallback
    }
    const speed = positive(opts.speed, 'speed', 1)
    const holdMs = (opts.hold === '0' ? 0 : positive(opts.hold, 'hold', PLAY_PAUSE / 1000)) * 1000
    if (opts.controls != null && opts.controls !== 'none') warnings.push(`controls="${opts.controls}" isn't "none", so the controls are shown`)

    const widget = document.createElement('div')
    widget.className = 'animation anim-untouched' // until the first interaction (see CSS)
    widget.tabIndex = 0
    widget.setAttribute('role', 'region')
    widget.setAttribute('aria-label', title ? `Animation: ${title.textContent.trim()}` : 'Animation')

    if (title) {
      const titleBar = widget.appendChild(document.createElement('div'))
      titleBar.className = 'anim-title'
      titleBar.append(...title.childNodes)
    }

    const stage = widget.appendChild(document.createElement('div'))
    stage.className = 'anim-stage'
    const svg = stage.appendChild(svgEl('svg', { class: 'no-zoom', viewBox: `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`, role: 'img' }))
    if (title) svg.setAttribute('aria-label', title.textContent.trim())

    // Captions: one page per step, stacked in one grid cell so the panel keeps the tallest height.
    const caption = widget.appendChild(document.createElement('div'))
    caption.className = 'anim-caption'
    caption.setAttribute('aria-live', 'polite')
    const pages = steps.map((step) => {
      const page = caption.appendChild(document.createElement('div'))
      page.className = 'anim-page'
      const heading = page.appendChild(document.createElement('div'))
      heading.className = 'anim-heading'
      if (step.heading) heading.append(step.heading)
      const body = page.appendChild(document.createElement('div'))
      body.className = 'anim-body'
      const parts = step.beats.map(({ caption: beatEl }) => {
        const part = body.appendChild(document.createElement('div'))
        part.className = 'anim-part'
        part.append(...beatEl.childNodes)
        return part
      })
      return { page, heading, body, parts, headingText: step.heading?.textContent.trim() || '' }
    })
    if (!pages.some((p) => p.headingText || p.parts.some((part) => part.textContent.trim() || part.children.length))) caption.hidden = true

    // Controls, like reveal.js's: rewind, back, play and next floating in the bottom-right corner
    // over the content, and a progress bar (every step and beat) along the bottom edge. Notes (S),
    // full screen (F) and the shortcuts summary (?) are keyboard-only.
    const controls = widget.appendChild(document.createElement('div'))
    controls.className = 'anim-controls'
    const rewind = controls.appendChild(createButton('anim-rewind anim-chevron', 'Back to the start'))
    rewind.appendChild(document.createElement('span')).className = 'anim-chevron-bar'
    const prev = controls.appendChild(createButton('anim-prev anim-chevron', 'Back'))
    const play = controls.appendChild(createButton('anim-play anim-chevron', 'Play'))
    play.appendChild(document.createElement('span')).className = 'anim-chevron-bar'
    play.appendChild(document.createElement('span')).className = 'anim-chevron-bar anim-pause-bar'
    const next = controls.appendChild(createButton('anim-next anim-chevron', 'Next'))
    const hasNotes = steps.some((step) => step.notes)

    const progress = widget.appendChild(document.createElement('div'))
    progress.className = 'anim-progress'
    progress.setAttribute('role', 'progressbar')
    progress.setAttribute('aria-label', 'Progress')
    progress.setAttribute('aria-valuemin', '0')
    progress.setAttribute('aria-valuemax', String(Math.max(0, beats.length - 1)))
    const progressBar = progress.appendChild(document.createElement('span'))

    const notesPanel = widget.appendChild(document.createElement('div'))
    notesPanel.className = 'anim-notes'
    notesPanel.hidden = true
    // Each step's note nodes go straight into the panel (no wrapper, no whitespace-only text), so a
    // step without notes leaves the panel :empty.
    const notes = steps.map((step) => [...(step.notes?.childNodes || [])]
      .filter((node) => node.nodeType !== Node.TEXT_NODE || node.textContent.trim()))

    const messages = [...errors.map((m) => ['error', m]), ...(debug ? warnings.map((m) => ['warning', m]) : [])]
    if (messages.length) {
      const list = widget.appendChild(document.createElement('ul'))
      list.className = 'anim-messages'
      messages.forEach(([kind, message]) => {
        const item = list.appendChild(document.createElement('li'))
        item.className = `anim-${kind}`
        item.textContent = message
      })
    }

    if (debug) widget.classList.add('anim-debug')
    if (opts.controls === 'none') widget.classList.add('anim-no-controls')
    source.replaceWith(widget)

    // -------------------------------------------------------------------------
    // Playback
    // -------------------------------------------------------------------------

    const renderer = createRenderer(svg, viewBox, debug)
    const empty = new Map()
    const emptyMeta = { dur: new Map(), delay: new Map(), path: new Map(), enter: new Map(), exit: new Map(), from: new Map(), oneoff: new Map() }
    const last = beats.length - 1
    let current = 0
    let running = null // { finish }
    let playing = false
    let playTimer = 0
    let playDir = 1 // -1 while a loop-bounce plays backwards
    let waitingForClick = false // playing, but stopped at a `pause` until Next
    let navId = 0 // bumped by every navigation, so older auto chains and play steps stop

    function showStatic(index) {
      const state = beats[index]?.state || empty
      renderer.render(state, state, emptyMeta, () => 1, state)
    }

    function updateControls() {
      const step = beats[current]?.step ?? 0
      prev.disabled = current === 0
      rewind.disabled = current === 0
      next.disabled = current >= beats.length - 1
      progressBar.style.transform = `scaleX(${beats.length > 1 ? current / (beats.length - 1) : 1})`
      progress.setAttribute('aria-valuenow', String(current))
      progress.setAttribute('aria-valuetext', `Step ${step + 1} of ${steps.length}`)
      if (hasNotes) notesPanel.replaceChildren(...notes[step])
    }

    function animateEl(el, frames, ms) {
      if (!ms || !el.animate) return
      el.animate(frames, { duration: ms, easing: 'ease-in-out' })
    }

    function showCaption(from, to, animate) {
      const a = beats[from] || beats[0]
      const b = beats[to] || beats[0]
      if (!a || !b) return
      const ms = animate && !reducedMotion() ? CAPTION_MS / speed : 0
      const forward = to > from
      const pageA = pages[a.step]
      const pageB = pages[b.step]
      pages.forEach((p, i) => p.page.classList.toggle('is-active', i === b.step))
      pageB.parts.forEach((part, i) => part.classList.toggle('is-shown', i <= b.beat))

      if (a.step !== b.step) {
        const sameHeading = pageA.headingText === pageB.headingText
        const shift = forward ? '1.5em' : '-1.5em'
        const inTarget = sameHeading ? pageB.body : pageB.page
        animateEl(inTarget, [{ opacity: 0, transform: `translateX(${shift})` }, { opacity: 1, transform: 'none' }], ms)
        if (ms) {
          // The outgoing page stays visible while it fades out.
          const outTarget = sameHeading ? pageA.body : pageA.page
          pageA.page.classList.add('is-leaving')
          if (sameHeading) pageA.heading.style.visibility = 'hidden'
          const out = outTarget.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${forward ? '-1.5em' : '1.5em'})` }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' })
          out.onfinish = out.oncancel = () => {
            pageA.page.classList.remove('is-leaving')
            pageA.heading.style.visibility = ''
            out.cancel()
          }
        }
      } else if (a.beat !== b.beat) {
        const part = pageB.parts[Math.max(a.beat, b.beat)]
        if (forward) animateEl(part, [{ opacity: 0 }, { opacity: 1 }], ms)
        else if (ms) {
          part.classList.add('is-leaving')
          const out = part.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' })
          out.onfinish = out.oncancel = () => { part.classList.remove('is-leaving'); out.cancel() }
        }
      }
    }

    // Moves to beat `to`: neighbouring beats animate (backwards plays in reverse), jumps are instant.
    function goTo(to, { animate = true } = {}) {
      to = Math.max(0, Math.min(beats.length - 1, to))
      if (running) running.finish()
      const from = current
      if (to === from) return Promise.resolve()
      current = to
      updateControls()
      showCaption(from, to, animate && Math.abs(to - from) === 1)

      if (!animate || Math.abs(to - from) !== 1 || reducedMotion()) {
        showStatic(to)
        return Promise.resolve()
      }

      const k = Math.max(from, to)
      const A = beats[k - 1].state
      const B = beats[k].state
      const meta = beats[k].meta
      const forward = to > from
      const final = forward ? B : A
      // Each shape's change runs from its delay to delay + duration; backwards is the exact reverse.
      const durOf = (uid) => (meta.dur.get(uid) ?? 0) / speed
      const delayOf = (uid) => (meta.delay.get(uid) ?? 0) / speed
      const uids = new Set([...meta.dur.keys(), ...meta.delay.keys()])
      const total = Math.max(0, ...[...uids].map((uid) => delayOf(uid) + durOf(uid)))
      const forwardT = (uid, time) => {
        const d = durOf(uid)
        const after = time - delayOf(uid)
        return d ? Math.min(1, Math.max(0, after / d)) : after >= 0 ? 1 : 0
      }
      const start = performance.now()

      return new Promise((resolve) => {
        let frame = 0
        const draw = (elapsed) => {
          const progress = (uid) => (forward ? forwardT(uid, elapsed) : forwardT(uid, total - elapsed))
          const done = total ? Math.min(1, elapsed / total) : 1
          const beatT = ease(forward ? done : 1 - done)
          renderer.render(A, B, meta, progress, final, { forward, beatT })
        }
        const finish = () => {
          cancelAnimationFrame(frame)
          running = null
          showStatic(to)
          resolve()
        }
        const tick = () => {
          if (!widget.isConnected) { running = null; return resolve() }
          const elapsed = performance.now() - start
          if (elapsed >= total) return finish()
          draw(elapsed)
          frame = requestAnimationFrame(tick)
        }
        running = { finish }
        draw(0)
        frame = requestAnimationFrame(tick)
      })
    }

    // How long to wait after arriving at a beat while playing: its `pause` (Infinity = until Next),
    // or the hold. Holds and pauses scale with speed, like transitions.
    const holdAfter = (index) => {
      const pause = beats[index]?.meta.pause
      return pause === 'click' ? Infinity : (pause ?? holdMs) / speed
    }
    const atEnd = (dir) => (dir > 0 ? current >= last : current <= 0)

    // One step, following `auto` chains: arriving at a beat marked `auto` goes straight on in the
    // same direction, so one click plays a chain forwards and one click undoes it.
    function step(dir) {
      const token = ++navId
      const go = () => {
        const target = current + dir
        if (target < 0 || target > last) return Promise.resolve()
        return goTo(target).then(() => {
          if (token === navId && beats[current].meta.auto && !atEnd(dir)) return go()
        })
      }
      return go()
    }

    function jump(index) {
      ++navId
      return goTo(index, { animate: false })
    }

    function setWaiting(on) {
      waitingForClick = on
      widget.classList.toggle('is-waiting', on)
    }

    function stopPlaying() {
      playing = false
      setWaiting(false)
      clearTimeout(playTimer)
      widget.classList.remove('is-playing')
      setButtonLabel(play, 'Play')
    }

    function schedule(ms) {
      clearTimeout(playTimer)
      if (ms === Infinity) return setWaiting(true)
      playTimer = setTimeout(playNext, ms)
    }

    // Playing ends at the last beat, unless the tag says loop (jump back to the start) or
    // loop-bounce (play backwards to the start, then forwards again).
    function finished() {
      autoplayWanted = false
      stopPlaying()
    }

    function playNext() {
      if (!playing || !widget.isConnected) return stopPlaying()
      setWaiting(false)
      if (atEnd(playDir)) {
        if (opts.loop === 'loop' && last > 0) {
          playDir = 1
          jump(0)
          return schedule(holdAfter(0))
        }
        if (opts.loop === 'bounce' && last > 0) playDir = -playDir
        else return finished()
      }
      const token = ++navId
      goTo(current + playDir).then(() => {
        if (!playing || token !== navId) return
        if (beats[current].meta.auto && !atEnd(playDir)) return playNext() // straight on
        if (atEnd(playDir) && !opts.loop) return finished()
        schedule(holdAfter(current))
      })
    }

    function startPlaying({ waiting = false, holdFirst = false } = {}) {
      playing = true
      widget.classList.add('is-playing')
      setButtonLabel(play, 'Pause')
      if (waiting) return schedule(Infinity)
      if (holdFirst) return schedule(holdAfter(current)) // autoplay: show where it starts first
      if (opts.loop !== 'bounce') playDir = 1
      if (!opts.loop && current >= last) {
        jump(0)
        return schedule(holdAfter(0))
      }
      playNext()
    }

    // Autoplay: only while the animation is on screen and the tab is visible (resuming where it
    // left off), never for viewers who prefer reduced motion. Any user navigation turns it off.
    let autoplayWanted = Boolean(opts.autoplay) && !reducedMotion()
    let onScreen = false
    let suspendedWaiting = false
    function updateAutoplay() {
      if (!widget.isConnected) {
        observer?.disconnect()
        document.removeEventListener('visibilitychange', updateAutoplay)
        return
      }
      const visible = onScreen && !document.hidden
      if (visible && autoplayWanted && !playing) startPlaying({ waiting: suspendedWaiting, holdFirst: !suspendedWaiting })
      else if (!visible && playing && autoplayWanted) {
        suspendedWaiting = waitingForClick
        stopPlaying()
      }
    }
    const observer = autoplayWanted && 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; updateAutoplay() }, { threshold: 0.5 })
      : null
    if (autoplayWanted) {
      if (observer) observer.observe(widget)
      else onScreen = true
      document.addEventListener('visibilitychange', updateAutoplay)
    }

    // User actions turn autoplay off; Next at a `pause` carries on playing instead.
    const userStop = () => {
      autoplayWanted = false
      suspendedWaiting = false
      stopPlaying()
    }
    const userNext = () => {
      if (playing && waitingForClick) return playNext()
      userStop()
      step(1)
    }
    const userBack = () => { userStop(); step(-1) }
    const userJump = (index) => { userStop(); jump(index) }
    const userPlay = () => (playing ? userStop() : startPlaying())

    function toggleFullscreen() {
      if (document.fullscreenElement === widget) document.exitFullscreen?.()
      else widget.requestFullscreen?.().catch(() => {})
    }

    rewind.addEventListener('click', () => userJump(0))
    prev.addEventListener('click', userBack)
    next.addEventListener('click', userNext)
    play.addEventListener('click', userPlay)
    // The next/play nudge stops at the first interaction, as reveal.js's controls tutorial does
    const touched = () => widget.classList.remove('anim-untouched')
    controls.addEventListener('click', touched)
    widget.addEventListener('keydown', touched)

    // Clicking the progress bar jumps to that point (as in reveal.js)
    progress.addEventListener('click', (event) => {
      touched()
      const rect = progress.getBoundingClientRect()
      const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      userJump(Math.round(fraction * last))
    })
    const toggleNotes = () => { if (hasNotes) notesPanel.hidden = !notesPanel.hidden }
    const help = buildHelp(widget, hasNotes)

    // Keys, as on slides: → N Space next, ← P Shift+Space back, Home / End, A (play), F, S, ? and Esc.
    widget.addEventListener('keydown', (event) => {
      if (event.target.closest('input, textarea, select, [contenteditable], .CodeMirror')) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      const nextKey = key === 'ArrowRight' || key === 'n' || (key === ' ' && !event.shiftKey)
      const backKey = key === 'ArrowLeft' || key === 'p' || (key === ' ' && event.shiftKey)
      if (key === 'Escape' && !help.hidden) help.hidden = true
      else if (key === '?') help.hidden = !help.hidden
      else if (nextKey) userNext()
      else if (backKey) userBack()
      else if (key === 'Home') userJump(0)
      else if (key === 'End') userJump(last)
      else if (key === 'f') toggleFullscreen()
      else if (key === 's') toggleNotes()
      else if (key === 'a') userPlay()
      else return
      event.preventDefault()
    })

    // A theme change re-resolves the colours (theme variables) and redraws
    const onThemeChange = () => {
      if (!widget.isConnected) return window.removeEventListener('docsify-theme-change', onThemeChange)
      renderer.clearColours()
      if (!running) showStatic(current)
    }
    window.addEventListener('docsify-theme-change', onThemeChange)

    showStatic(0)
    showCaption(0, 0, false)
    updateControls()
  }

  function initAnimations() {
    document.querySelectorAll('.markdown-section .anim-source:not([data-anim-built])').forEach((source) => {
      source.setAttribute('data-anim-built', 'true')
      try {
        buildWidget(source)
      } catch (error) {
        console.error('animation: failed to build', error)
        window.DocsifyUtils.renderErrorBox(source, `Animation failed to build: ${error.message}`)
      }
    })
  }

  const docsifyAnimation = function (hook) {
    hook.beforeEach(rewriteBlocks)
    hook.afterEach(stripHeadingAnchors)
    hook.doneEach(initAnimations)
  }

  // Appended so every other plugin's hooks have processed the caption HTML first (as slides.js).
  window.DocsifyUtils.registerPlugin(docsifyAnimation, false)
})()
