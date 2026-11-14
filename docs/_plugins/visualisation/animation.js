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
  const HEAD = 0.2 * CELL          // arrowhead length at normal width
  const CAPTION_MS = 500           // caption transition (the normal speed)
  const PLAY_PAUSE = 1500          // pause between beats while playing

  const SPEEDS = { instant: 0, fast: 250, slow: 1000 }
  const NORMAL_MS = 500
  const EFFECTS = ['fade', 'pop', 'draw', 'slide']
  const LAYERS = { back: 0, normal: 1, front: 2 }
  const PLACEMENTS = ['above', 'below', 'left-of', 'right-of']
  const ALIGNS = { left: 'left', centre: 'centre', center: 'centre', right: 'right' }
  const FLAGS = ['bold', 'dashed']
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
    radius: ['circle'],
    fill: ['rect', 'circle'],
    stroke: ALL, width: ALL, font: ALL, bold: ALL,
    angle: BOXED, scale: BOXED,
    align: ['text'],
    dashed: ['rect', 'circle', 'line', 'arrow', 'image'],
  }

  const point = (types) => [[...types, 'num', 'num'], [...types, 'id']]
  // Each keyword's signatures, tried longest first; `build` turns the matched values into a prop.
  const PROPS = {
    at: {
      sigs: [['num', 'num'], ['placement', 'id'], ['id']],
      help: '"x y", a shape id, or a placement and a shape id (e.g. "below a")',
      build: (v, sig) => sig.length === 2 && sig[0] === 'num' ? { kind: 'abs', x: v[0], y: v[1] }
        : sig.length === 2 ? { kind: 'place', place: v[0], ref: v[1] } : { kind: 'ref', ref: v[0] },
    },
    x: { sigs: [['num']], help: 'a number' },
    y: { sigs: [['num']], help: 'a number' },
    from: { sigs: point([]), help: '"x y" or a shape id', build: buildEnd },
    to: { sigs: point([]), help: '"x y" or a shape id', build: buildEnd },
    size: { sigs: [['num', 'num'], ['num']], help: '"w h" or one number', build: (v) => ({ w: v[0], h: v[1] || v[0], one: v.length === 1 }) },
    radius: { sigs: [['num']], help: 'a number' },
    gap: { sigs: [['num']], help: 'a number' },
    delay: { sigs: [['num']], help: 'a number of seconds' },
    via: {
      sigs: [['num', 'num'], ['placement', 'id'], ['id']],
      help: '"x y", a shape id, or a placement and a shape id (e.g. "via above b")',
      build: (v, sig) => PROPS.at.build(v, sig),
    },
    fill: { sigs: [['colour']], help: 'a colour (e.g. blue, #f80 or none)' },
    stroke: { sigs: [['colour']], help: 'a colour (e.g. blue, #f80 or none)' },
    width: { sigs: [['num']], help: 'a number (a multiple of the normal thickness)' },
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
    ...EFFECTS, ...Object.keys(LAYERS), ...PLACEMENTS, ...FLAGS, 'remove', 'defaults', 'reset',
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

  function buildSource(attrs, lines) {
    const grid = (attrs.match(/\bgrid\s*=\s*["']([^"']*)["']/i) || [])[1] || ''
    const debug = /(^|\s)debug(\s|=|$)/i.test(attrs)
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

    const open = `<div class="anim-source" data-grid="${escapeHtml(grid)}"${debug ? ' data-debug' : ''}>`
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
      else tokens.push({ kind: 'word', value: m[5], lower: m[5].toLowerCase() })
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
      if (word in SPEEDS) set('speed', word)
      else if (EFFECTS.includes(word)) set('effect', word)
      else if (word in LAYERS) set('layer', word)
      else if (FLAGS.includes(word)) set(word, true)
      else if (word === 'reset' && mode === 'defaults') set('reset', true)
      else if (SHAPE_TYPES.includes(word) || word === 'remove') throw new Error(`"${word}" must come straight after the id`)
      else throw new Error(`unknown word "${token.value}"`)
      i++
    }

    if (props.gap && props.at?.kind !== 'place') throw new Error('"gap" only works with above / below / left-of / right-of')
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

  // A smooth curve through points (Catmull-Rom spline), sampled into a polyline with cumulative
  // lengths so a shape can move along it at an even speed.
  function buildPath(points) {
    const SAMPLES = 24
    const p = (i) => points[Math.max(0, Math.min(points.length - 1, i))]
    const curve = (a, b, c, d, t) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t)
    const samples = [{ ...points[0], at: 0 }]
    for (let i = 0; i < points.length - 1; i++) {
      for (let k = 1; k <= SAMPLES; k++) {
        const t = k / SAMPLES
        const pt = {
          x: curve(p(i - 1).x, p(i).x, p(i + 1).x, p(i + 2).x, t),
          y: curve(p(i - 1).y, p(i).y, p(i + 1).y, p(i + 2).y, t),
        }
        const last = samples[samples.length - 1]
        samples.push({ ...pt, at: last.at + Math.hypot(pt.x - last.x, pt.y - last.y) })
      }
    }
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
    const shape = { type, label: '', stroke: 'fg', fill: 'none', width: 1, font: 1, angle: 0, scale: 1, bold: false, dashed: false, align: 'centre', layer: 'normal' }
    if (type === 'rect') Object.assign(shape, { w: CELL, h: CELL, fill: 'bg' })
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

    const check = (shape, key) => {
      if (!APPLIES[key].includes(shape.type)) throw new Error(`"${key}" doesn't apply to ${shape.type === 'arrow' || shape.type === 'icon' || shape.type === 'image' ? 'an' : 'a'} ${shape.type}`)
    }

    // Applies parsed props to a shape (a fresh one when creating, a copy when changing).
    // Returns the curve's points (start, vias, end) when the line has `via`, otherwise null.
    function applyProps(shape, props, creating, warn) {
      const isLine = LINE_TYPES.includes(shape.type)
      for (const ref of [props.at?.ref, props.from?.ref, props.to?.ref, ...(props.via || []).map((v) => v.ref)]) {
        if (ref && LINE_TYPES.includes(shapes.get(ref).type)) throw new Error(`"${ref}" is a line, so it can't be used as a position`)
      }
      const num = (value, current, scale) => {
        const relative = rel(value, current, scale, creating)
        return relative ?? value.v * scale
      }

      if (props.label !== undefined) shape.label = props.label
      if (props.font) { check(shape, 'font'); shape.font = Math.max(0.1, num(props.font, shape.font, 1)) }
      if (props.size) {
        check(shape, 'size')
        if (shape.type === 'circle') {
          if (!props.size.one) throw new Error('a circle takes one size (or use radius)')
          shape.r = Math.max(0, num(props.size.w, shape.r * 2, CELL) / 2)
        } else {
          shape.w = Math.max(0, num(props.size.w, shape.w, CELL))
          shape.h = Math.max(0, num(props.size.h, shape.h, CELL))
        }
      }
      if (props.radius) { check(shape, 'radius'); shape.r = Math.max(0, num(props.radius, shape.r, CELL)) }
      if (props.fill) { check(shape, 'fill'); shape.fill = props.fill }
      if (props.stroke) shape.stroke = props.stroke
      if (props.width) {
        if (shape.type === 'text') warn('"width" has no effect on text')
        shape.width = Math.max(0, num(props.width, shape.width, 1))
      }
      if (props.align) { check(shape, 'align'); shape.align = props.align }
      if (props.angle) { check(shape, 'angle'); shape.angle = num(props.angle, shape.angle, 1) }
      if (props.scale) { check(shape, 'scale'); shape.scale = Math.max(0, num(props.scale, shape.scale, 1)) }
      if (props.bold) shape.bold = true
      if (props.dashed) { check(shape, 'dashed'); shape.dashed = true }
      if (props.layer) shape.layer = props.layer

      if (isLine) {
        if (props.x || props.y || props.at?.kind === 'ref' || props.at?.kind === 'place') throw new Error('a line has no single position: use from / to, or "move +x +y" to shift it')
        if (props.at) {
          if (!props.at.x.rel || !props.at.y.rel || creating) throw new Error('a line has no single position: use from / to, or "move +x +y" to shift it')
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
        if (creating && (!shape.from || !shape.to)) throw new Error('a line needs both ends, e.g. "from 2 3 to 7 8" or "from a to b"')
        if (props.via) throw new Error('"via" moves a shape along a curve, so it can\'t be used on a line')
        return null
      }

      if (props.via && creating) throw new Error('"via" only works when moving an existing shape')
      if (props.via && !props.at && !props.x && !props.y) throw new Error('"via" needs a move too, e.g. "move 9 3 via 5 1"')
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
      if (creating && (shape.x === undefined || shape.y === undefined)) throw new Error('needs a position, e.g. "at 3 2"')
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
        if (['width', 'font', 'angle', 'scale'].includes(key)) { shape[key] = value.v; continue }
        shape[key] = value
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
      const speed = props.speed || defaults.speed
      return speed ? SPEEDS[speed] : NORMAL_MS
    }

    function runLine(text, meta, warn) {
      const match = text.match(/^([^:\s]+)\s*:\s*(.*)$/)
      if (!match) throw new Error('expected "id: …"')
      const id = match[1]
      const tokens = tokenize(match[2])

      if (id === 'defaults') {
        const props = parseProps(tokens, 0, 'defaults', shapes)
        for (const key of ['label', 'at', 'x', 'y', 'from', 'to', 'gap', 'delay', 'via']) {
          if (key in props) throw new Error(`"${key === 'label' ? 'quoted text' : key}" can't be a default`)
        }
        if (props.reset) { defaults = {}; delete props.reset }
        const before = JSON.stringify(defaults)
        defaults = { ...defaults, ...props }
        if (JSON.stringify(defaults) === before && !tokens.some((t) => t.lower === 'reset')) warn('this defaults line changes nothing')
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
        freezeEndsAttachedTo(id)
        shapes.delete(id)
        meta.exit.set(existing.uid, props.effect || defaults.effect || 'fade')
        meta.dur.set(existing.uid, speedOf(props))
        setDelay(meta, existing.uid, props)
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
        applyProps(shape, props, true, warn)
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
      const path = applyProps(shape, props, false, warn)
      if (path) meta.path.set(shape.uid, path)
      else if (props.at || props.x || props.y) meta.path.delete(shape.uid) // a later straight move wins
      shapes.set(id, shape)
      meta.dur.set(shape.uid, Math.max(meta.dur.get(shape.uid) || 0, speedOf(props)))
      setDelay(meta, shape.uid, props)
    }

    return { shapes, runLine }
  }

  // Compiles every beat's scene into a snapshot of all shapes, plus how each change animates.
  function compile(steps, context) {
    const compiler = createCompiler(context)
    const beats = []
    const errors = []
    const warnings = []

    steps.forEach((step, si) => {
      step.beats.forEach((beat, bi) => {
        const meta = { dur: new Map(), delay: new Map(), path: new Map(), enter: new Map(), exit: new Map() }
        const where = (li) => `Step ${si + 1}${step.beats.length > 1 ? `, beat ${bi + 1}` : ''}, line ${li + 1}`
        beat.scene.split('\n').forEach((raw, li) => {
          const text = raw.trim()
          if (!text || text.startsWith('//')) return
          const warn = (message) => warnings.push(`${where(li)}: ${message}`)
          try {
            compiler.runLine(text, meta, warn)
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

  const SVG_NS = 'http://www.w3.org/2000/svg'
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(SVG_NS, tag)
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
    return el
  }
  const lerp = (a, b, t) => a + (b - a) * t
  const clamp01 = (t) => Math.min(1, Math.max(0, t))
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

  function colourCss(name, role) {
    if (!name) return 'none'
    if (HEX.test(name)) return name
    const css = COLOURS[name.toLowerCase()] ?? 'none'
    if (role === 'fill' && !PLAIN_FILLS.includes(name.toLowerCase())) return `color-mix(in srgb, ${css} 45%, var(--anim-bg))`
    return css
  }

  function createRenderer(svg, viewBox, debug) {
    const layers = [0, 1, 2].map(() => svg.appendChild(svgEl('g')))
    const nodes = new Map() // uid -> node

    if (debug) drawDebugGrid(svg, viewBox)

    function makeNode(shape) {
      const g = svgEl('g', { class: `anim-shape anim-${shape.type}` })
      const node = { g, type: shape.type, uid: shape.uid, colours: new Map(), colourAnims: new Map() }
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

    // Sets a colour, animating from the old one with the Web Animations API when `timing` has a
    // duration or delay (backwards fill holds the old colour during the delay). `timing` is null on
    // later frames of a transition (nothing to change) and { ms: 0, delay: 0 } for static renders,
    // which cancel any colour animation still running.
    function setColour(node, el, prop, value, timing) {
      const set = node.colours.get(el) || {}
      const running = node.colourAnims.get(el) || []
      if (timing && !timing.ms && !timing.delay && running.length) {
        running.forEach((anim) => anim.cancel())
        node.colourAnims.delete(el)
      }
      const old = set[prop]
      if (old === value) return
      set[prop] = value
      node.colours.set(el, set)
      el.style[prop] = value
      if (timing && (timing.ms || timing.delay) && old !== undefined && el.animate) {
        const anim = el.animate([{ [prop]: old }, { [prop]: value }], {
          duration: Math.max(1, timing.ms), delay: timing.delay, easing: 'ease-in-out', fill: 'backwards',
        })
        node.colourAnims.set(el, [...(node.colourAnims.get(el) || []), anim])
      }
    }

    // Draws one shape: `s` is its (interpolated) geometry, `v` its visibility and effect values.
    function drawNode(node, s, v, colours, ms, byId) {
      const { g } = node
      const strokeWidth = STROKE * s.width
      const dash = s.dashed ? `${STROKE * 4 * Math.max(s.width, 0.5)} ${STROKE * 3 * Math.max(s.width, 0.5)}` : 'none'
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
          const head = Math.min(HEAD * (0.6 + 0.4 * s.width), len * 0.6)
          const back = { x: to.x - ux * head, y: to.y - uy * head }
          const half = head * 0.55
          const drawn = { x: from.x + (to.x - from.x) * v.draw, y: from.y + (to.y - from.y) * v.draw }
          const tip = v.draw < 1 ? drawn : to
          const base = v.draw < 1 ? { x: tip.x - ux * head, y: tip.y - uy * head } : back
          node.head.setAttribute('points', `${tip.x},${tip.y} ${base.x - uy * half},${base.y + ux * half} ${base.x + uy * half},${base.y - ux * half}`)
          node.head.style.opacity = clamp01(v.draw * 4 - 0.2)
          node.head.style.strokeWidth = strokeWidth
          setColour(node, node.head, 'fill', colours.stroke, ms)
          setColour(node, node.head, 'stroke', colours.stroke, ms)
          end = back
        }
        node.body.setAttribute('x1', from.x); node.body.setAttribute('y1', from.y)
        node.body.setAttribute('x2', end.x); node.body.setAttribute('y2', end.y)
        node.body.style.strokeWidth = strokeWidth
        if (v.draw < 1) {
          node.body.setAttribute('pathLength', '1')
          node.body.style.strokeDasharray = '1 1'
          node.body.style.strokeDashoffset = String(1 - v.draw)
        } else {
          node.body.removeAttribute('pathLength')
          node.body.style.strokeDasharray = dash
          node.body.style.strokeDashoffset = ''
        }
        setColour(node, node.body, 'stroke', colours.stroke, ms)
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
      }
      if (node.type === 'circle') node.body.setAttribute('r', s.r)
      if (['rect', 'circle'].includes(node.type)) {
        setColour(node, node.body, 'fill', colours.fill, ms)
        setColour(node, node.body, 'stroke', s.width ? colours.stroke : 'none', ms)
        node.body.style.strokeWidth = strokeWidth
        node.body.style.strokeDasharray = dash
      }
      if (node.type === 'image') {
        for (const el of [node.image, node.body]) {
          el.setAttribute('x', -hw); el.setAttribute('y', -hh)
          el.setAttribute('width', 2 * hw); el.setAttribute('height', 2 * hh)
        }
        setColour(node, node.body, 'stroke', s.width ? colours.stroke : 'none', ms)
        node.body.style.strokeWidth = strokeWidth
        node.body.style.strokeDasharray = dash
      }
      if (node.type === 'icon') {
        node.icon.setAttribute('x', -hw); node.icon.setAttribute('y', -hh)
        node.icon.setAttribute('width', 2 * hw); node.icon.setAttribute('height', 2 * hh)
        node.icon.setAttribute('stroke-width', 2 * s.width)
        setColour(node, node.icon, 'stroke', colours.stroke, ms)
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
        setColour(node, label, 'fill', colours.stroke, ms)
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
      for (const key of ['x', 'y', 'w', 'h', 'r', 'width', 'font', 'angle', 'scale']) {
        if (typeof a[key] === 'number' && typeof b[key] === 'number') s[key] = lerp(a[key], b[key], t)
      }
      return s
    }

    /**
     * Renders the transition between two consecutive states. progress(uid) gives each shape's
     * position from A (0) to B (1); `final` is the state the transition ends on (it supplies
     * the colours, which CSS transitions animate) and `ms(uid)` the colour transition time.
     */
    function render(A, B, meta, progress, final, ms) {
      const aByUid = new Map([...A.values()].map((s) => [s.uid, s]))
      const bByUid = new Map([...B.values()].map((s) => [s.uid, s]))
      const uids = new Set([...aByUid.keys(), ...bByUid.keys()])
      const items = []
      const now = new Map() // id -> interpolated shape, for attached line ends

      for (const uid of uids) {
        const a = aByUid.get(uid)
        const b = bByUid.get(uid)
        const t = ease(clamp01(progress(uid)))
        let shape
        let v
        if (a && b) {
          shape = interpolate(a, b, t)
          if (meta.path.has(uid)) Object.assign(shape, pointOnPath(meta.path.get(uid), t))
          v = { opacity: 1, scale: 1, draw: 1, dx: 0, dy: 0 }
          const swap = a.label !== b.label
          v.label = swap && t < 0.5 ? a.label : b.label
          v.labelOpacity = swap ? Math.abs(2 * t - 1) : 1
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
        if (!uids.has(uid)) { node.g.remove(); nodes.delete(uid) }
      }

      const finalByUid = new Map([...final.values()].map((s) => [s.uid, s]))
      order(items.map(({ node, shape, uid }) => ({ node, shape: finalByUid.get(uid) || shape })))

      for (const item of items) {
        const finalShape = finalByUid.get(item.uid) || item.shape
        const colours = { fill: colourCss(finalShape.fill, 'fill'), stroke: colourCss(finalShape.stroke, 'stroke') }
        drawNode(item.node, item.shape, item.v, colours, ms(item.uid), now)
      }
    }

    return { render }
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

  // Icon-only buttons from the site's shared button styles (buttons.css): the btn-* class sets the
  // icon, and an empty button gets the icon-only size. No type attribute: Docsify's core CSS
  // styles button[type], which would override buttons.css.
  function createButton(className, label) {
    const button = document.createElement('button')
    button.className = `anim-btn btn-compact ${className}`
    setButtonLabel(button, label)
    return button
  }

  function setButtonLabel(button, label) {
    button.setAttribute('aria-label', label)
    button.title = label
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

    const widget = document.createElement('div')
    widget.className = 'animation'
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

    // Controls
    const controls = widget.appendChild(document.createElement('div'))
    controls.className = 'anim-controls'
    const rewind = controls.appendChild(createButton('anim-rewind btn-rewind', 'Back to the start'))
    const prev = controls.appendChild(createButton('anim-prev btn-prev', 'Back'))
    const dots = controls.appendChild(document.createElement('div'))
    dots.className = 'anim-dots'
    const dotButtons = steps.map((_, i) => {
      const dot = dots.appendChild(document.createElement('button'))
      dot.className = 'anim-dot'
      dot.setAttribute('aria-label', `Step ${i + 1}`)
      dot.title = `Step ${i + 1}`
      return dot
    })
    const next = controls.appendChild(createButton('anim-next btn-next', 'Next'))
    const play = controls.appendChild(createButton('anim-play btn-go', 'Play'))
    const spacer = controls.appendChild(document.createElement('div'))
    spacer.className = 'anim-spacer'
    const hasNotes = steps.some((step) => step.notes)
    const notesButton = hasNotes ? controls.appendChild(createButton('anim-notes-btn btn-notes', 'Teacher notes')) : null
    const fullscreen = controls.appendChild(createButton('anim-fullscreen btn-fullscreen', 'Full screen'))

    const notesPanel = widget.appendChild(document.createElement('div'))
    notesPanel.className = 'anim-notes'
    notesPanel.hidden = true
    const notes = steps.map((step) => {
      const panel = document.createElement('div')
      if (step.notes) panel.append(...step.notes.childNodes)
      return panel
    })

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
    source.replaceWith(widget)

    // -------------------------------------------------------------------------
    // Playback
    // -------------------------------------------------------------------------

    const renderer = createRenderer(svg, viewBox, debug)
    const empty = new Map()
    const emptyMeta = { dur: new Map(), delay: new Map(), path: new Map(), enter: new Map(), exit: new Map() }
    let current = 0
    let running = null // { finish }
    let playing = false
    let playTimer = 0

    function showStatic(index) {
      const state = beats[index]?.state || empty
      renderer.render(state, state, emptyMeta, () => 1, state, () => ({ ms: 0, delay: 0 }))
    }

    function updateControls() {
      const step = beats[current]?.step ?? 0
      prev.disabled = current === 0
      rewind.disabled = current === 0
      next.disabled = current >= beats.length - 1
      dotButtons.forEach((dot, i) => {
        dot.classList.toggle('is-current', i === step)
        dot.setAttribute('aria-current', i === step ? 'step' : 'false')
      })
      if (notesButton) notesPanel.replaceChildren(notes[step])
    }

    function animateEl(el, frames, ms) {
      if (!ms || !el.animate) return
      el.animate(frames, { duration: ms, easing: 'ease-in-out' })
    }

    function showCaption(from, to, animate) {
      const a = beats[from] || beats[0]
      const b = beats[to] || beats[0]
      if (!a || !b) return
      const ms = animate && !reducedMotion() ? CAPTION_MS : 0
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
      const durOf = (uid) => meta.dur.get(uid) ?? 0
      const delayOf = (uid) => meta.delay.get(uid) ?? 0
      const uids = new Set([...meta.dur.keys(), ...meta.delay.keys()])
      const total = Math.max(0, ...[...uids].map((uid) => delayOf(uid) + durOf(uid)))
      const forwardT = (uid, time) => {
        const d = durOf(uid)
        const after = time - delayOf(uid)
        return d ? Math.min(1, Math.max(0, after / d)) : after >= 0 ? 1 : 0
      }
      const colourTiming = (uid) => ({
        ms: durOf(uid),
        delay: forward ? delayOf(uid) : Math.max(0, total - delayOf(uid) - durOf(uid)),
      })
      const start = performance.now()

      return new Promise((resolve) => {
        let frame = 0
        let colourSet = false
        const draw = (elapsed) => {
          const progress = (uid) => (forward ? forwardT(uid, elapsed) : forwardT(uid, total - elapsed))
          renderer.render(A, B, meta, progress, final, (uid) => (colourSet ? null : colourTiming(uid)))
          colourSet = true
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

    function stopPlaying() {
      playing = false
      clearTimeout(playTimer)
      play.classList.remove('playing')
      setButtonLabel(play, 'Play')
    }

    function playNext() {
      if (!playing || !widget.isConnected) return stopPlaying()
      if (current >= beats.length - 1) return stopPlaying()
      goTo(current + 1).then(() => {
        if (!playing) return
        if (current >= beats.length - 1) return stopPlaying()
        playTimer = setTimeout(playNext, PLAY_PAUSE)
      })
    }

    function startPlaying() {
      playing = true
      play.classList.add('playing')
      setButtonLabel(play, 'Pause')
      if (current >= beats.length - 1) {
        goTo(0, { animate: false })
        playTimer = setTimeout(playNext, PLAY_PAUSE)
      } else {
        playNext()
      }
    }

    function toggleFullscreen() {
      if (document.fullscreenElement === widget) document.exitFullscreen?.()
      else widget.requestFullscreen?.().catch(() => {})
    }

    rewind.addEventListener('click', () => { stopPlaying(); goTo(0, { animate: false }) })
    prev.addEventListener('click', () => { stopPlaying(); goTo(current - 1) })
    next.addEventListener('click', () => { stopPlaying(); goTo(current + 1) })
    play.addEventListener('click', () => (playing ? stopPlaying() : startPlaying()))
    dotButtons.forEach((dot, i) => dot.addEventListener('click', () => {
      stopPlaying()
      goTo(beats.findIndex((b) => b.step === i), { animate: false })
    }))
    fullscreen.addEventListener('click', toggleFullscreen)
    notesButton?.addEventListener('click', () => {
      notesPanel.hidden = !notesPanel.hidden
      notesButton.classList.toggle('is-on', !notesPanel.hidden)
    })
    widget.addEventListener('fullscreenchange', () => {
      const on = document.fullscreenElement === widget
      fullscreen.classList.toggle('is-fullscreen', on)
      setButtonLabel(fullscreen, on ? 'Exit full screen' : 'Full screen')
    })
    widget.addEventListener('keydown', (event) => {
      if (event.target.closest('input, textarea, select, [contenteditable], .CodeMirror')) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'ArrowRight') { stopPlaying(); goTo(current + 1); event.preventDefault() }
      else if (event.key === 'ArrowLeft') { stopPlaying(); goTo(current - 1); event.preventDefault() }
      else if (event.key === 'Home') { stopPlaying(); goTo(0, { animate: false }); event.preventDefault() }
      else if (event.key === 'f' || event.key === 'F') { toggleFullscreen(); event.preventDefault() }
    })

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
