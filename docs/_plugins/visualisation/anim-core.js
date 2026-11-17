/**
 * anim-core.js - Part of the animation plugin (animation.js): the constants, the keyword table
 * that every scene line is read against, geometry (text sizes, attachments, line ends, curves
 * and routes) and bounds. Shared by every other part through window.Anim.
 */

;(function () {
  window.Anim = window.Anim || {}

  const { escapeHtml } = window.DocsifyUtils

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  const CELL = 80                  // px per grid cell in SVG user units (16 x 9 cells = 1280 x 720)
  const STROKE = 3                 // normal stroke thickness
  const FONT = 30                  // normal font size
  const PLACE_GAP = 0.25 * CELL    // default gap for above / below / left-of / right-of
  const GRID_MARGIN = 0.2 * CELL   // drawn round a fixed grid (about 1rem at full width)
  const EDGE_GAP = 0.06 * CELL     // gap between a line end and the edge of its shape
  const HEAD = 0.2 * CELL          // arrowhead length at normal weight
  const CAPTION_MS = 500           // caption transition (kept snappy, whatever the shapes' speed)
  const PLAY_PAUSE = 1500          // pause between beats while playing

  // speed <word | seconds>: how long a line's change takes
  const SPEEDS = { instant: 0, vfast: 250, fast: 500, normal: 1000, slow: 2000, vslow: 4000 }
  const NORMAL_MS = SPEEDS.normal
  const EFFECTS = ['fade', 'pop', 'draw', 'slide', 'typed']
  const LAYERS = { back: 0, normal: 1, front: 2 }
  const PLACEMENTS = ['above', 'below', 'left-of', 'right-of']
  const ALIGNS = { left: 'left', centre: 'centre', center: 'centre', right: 'right' }
  const LINE_STYLES = ['solid', 'dashed', 'dotted']
  // Each pattern as a visible mark and gap, in multiples of the line's thickness (w):
  // dashed 3w:3w, dotted 1w:1w (a dot is a round cap as wide as the line)
  const PATTERNS = { dashed: { d: 4, g: 4 }, dotted: { d: 1, g: 1.5 } }
  const FLOWS = { flow: 'forward', 'flow-reverse': 'reverse', static: 'none' } // static: not flowing
  // Callout sides use the placement words (the bubble's side of the shape)
  const CALLOUT_SIDES = { above: 'above', below: 'below', 'left-of': 'left', 'right-of': 'right' }
  const HIGHLIGHTS = ['outline', 'inside', 'spotlight', 'arrow', 'glow', 'clear'] // and "number N" (see KEYWORDS.highlight)
  const EMPHASES = ['pulse', 'shake', 'wobble', 'bounce', 'glow']
  const SIGNALS = { signal: 'signal', 'signal-reverse': 'signal-reverse' } // one-off blips along a line
  const CALLOUT_CH = 24 // callout text wraps at about this many characters
  const FLOW_SPEED = 2 * 80 // px per second (two cells)
  const SHAPE_TYPES = ['rect', 'circle', 'diamond', 'text', 'line', 'arrow', 'curve']
  const RESOURCE_TYPES = ['image', 'icon']
  const LINE_TYPES = ['line', 'arrow', 'curve'] // a curve is a line bent through via points
  const LAYOUT_TYPES = ['row', 'column'] // a group of cells, laid out side by side or one under another

  // ease <name>: how a change speeds up and slows down (t: 0-1 of its time -> 0-1 of the way).
  // spring overshoots, then settles exactly on 1.
  const EASES = {
    'in-out': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    linear: (t) => t,
    in: (t) => t * t * t,
    out: (t) => 1 - Math.pow(1 - t, 3),
    spring: (t) => (t >= 1 ? 1 : 1 - Math.exp(-5 * t) * Math.cos(2.5 * Math.PI * t)),
  }

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
  const BOXED = ['rect', 'circle', 'diamond', 'text', 'image', 'icon']
  const APPLIES = {
    at: BOXED, x: BOXED, y: BOXED,
    from: LINE_TYPES, to: LINE_TYPES,
    size: ['rect', 'circle', 'diamond', 'image', 'icon'],
    radius: ['circle'],
    corner: ['rect'], // corner radius
    fill: ['rect', 'circle', 'diamond'],
    stroke: ['rect', 'circle', 'diamond', ...LINE_TYPES, 'image', 'icon'], colour: ALL, weight: ALL, font: ALL, bold: ALL, mono: ALL,
    width: ['rect', 'diamond', 'image', 'icon'], height: ['rect', 'diamond', 'image', 'icon'],
    angle: BOXED, scale: BOXED,
    align: ['text'],
    linestyle: ['rect', 'circle', 'diamond', ...LINE_TYPES, 'image'], // solid | dashed | dotted
    flow: ['rect', 'circle', 'diamond', ...LINE_TYPES, 'image'], // dashes/dots march along the stroke
    head: LINE_TYPES, // an arrowhead on the end
  }

  // Every word that can follow "id:" (or "defaults"), in one table. Each entry gives the prop it
  // sets (key) and the values that follow it:
  //   sigs   alternative value lists, tried longest first (sigs [[]]: a flag with no values)
  //   list   value lists repeated one after another, at least once (travel, highlight)
  //   build  turns the matched values into the prop (default: the first value)
  //   repeat the word can be given more than once, collecting an array (via)
  //   modes  only allowed in these line kinds (clear: in defaults)
  //   error  the word isn't allowed here, with a hint
  const POINT = [['num', 'num'], ['placement', 'id'], ['id']]
  const buildPoint = (v, sig) => (sig[0] === 'num' ? { kind: 'abs', x: v[0], y: v[1] }
    : sig[0] === 'placement' ? { kind: 'place', place: v[0], ref: v[1] } : { kind: 'ref', ref: v[0] })
  const at = { key: 'at', sigs: POINT, build: buildPoint, help: '"x,y", a shape id, or a placement and a shape id (e.g. "below a")' }
  const number = (key, help = 'a number') => ({ key, sigs: [['num']], help })
  const colour = (key) => ({ key, sigs: [['colour']], help: 'a colour (e.g. blue, #f80 or none)' })
  const fixed = (key, value, extra = {}) => ({ key, sigs: [[]], build: () => value, ...extra })
  const words = (list, key, what) => Object.fromEntries(list.map((w) => [w, fixed(key, w, { what })]))
  const buildStagger = (v, reverse) => {
    const gap = v.length ? v[0].v : 0.1
    if (gap < 0) throw new Error('"stagger" must be zero or more seconds')
    return { gap, reverse }
  }

  const KEYWORDS = {
    // position
    at, move: at, goto: at,
    ...Object.fromEntries(PLACEMENTS.map((place) => [place, { key: 'at', sigs: [['id']], build: (v) => ({ kind: 'place', place, ref: v[0] }), help: 'a shape id' }])),
    x: number('x'),
    y: number('y'),
    from: { key: 'from', sigs: [['num', 'num'], ['id']], build: buildPoint, help: '"x,y" or a shape id' },
    to: { key: 'to', sigs: [['num', 'num'], ['id']], build: buildPoint, help: '"x,y" or a shape id' },
    via: { ...at, key: 'via', repeat: true, help: '"x,y", a shape id, or a placement and a shape id (e.g. "via above b")' },
    gap: number('gap'),
    travel: { key: 'travel', list: [['num', 'num'], ['id']], build: buildPoint, help: 'shape ids and/or x,y points, e.g. "travel r1 r2 b"' },
    follow: { key: 'follow', sigs: [['id']], build: (v) => ({ ref: v[0], reverse: false }), help: 'a line or arrow id' },
    'follow-reverse': { key: 'follow', sigs: [['id']], build: (v) => ({ ref: v[0], reverse: true }), help: 'a line or arrow id', what: 'follow' },
    attach: { key: 'attach', sigs: [['placement', 'id'], ['id']], build: (v, sig) => (sig.length === 2 ? { side: v[0], ref: v[1] } : { side: 'centre', ref: v[0] }), help: 'a shape id, optionally after a side (e.g. "attach right-of a")' },
    detach: fixed('detach', true),
    // size and look
    size: { key: 'size', sigs: [['num', 'num'], ['num']], build: (v) => ({ w: v[0], h: v[1] || v[0], one: v.length === 1 }), help: '"w,h", "wxh" or one number' },
    width: number('width', 'a number of cells'),
    height: number('height', 'a number of cells'),
    radius: number('radius'),
    corner: number('corner', 'a number of cells'),
    fill: colour('fill'),
    stroke: colour('stroke'),
    colour: colour('colour'),
    weight: number('weight', 'a number (a multiple of the normal stroke thickness)'),
    font: number('font', 'a number (a multiple of the normal size)'),
    angle: number('angle', 'a number of degrees (clockwise, 0 = upright)'),
    scale: number('scale', 'a number (a multiple of the normal size)'),
    align: { key: 'align', sigs: [['align']], help: 'left, centre or right' },
    bold: fixed('bold', true),
    monospace: fixed('mono', true),
    // "arrow" here (not straight after the id, where it's the arrow shape) puts a head on a line
    arrow: fixed('head', true),
    ...words(LINE_STYLES, 'linestyle', 'line style'),
    ...words(Object.keys(FLOWS), 'flow', 'flow'),
    ...words(Object.keys(LAYERS), 'layer', 'layer'),
    // timing and effects
    speed: { key: 'speed', sigs: [['speed']], help: 'vslow, slow, normal, fast, vfast, instant or a number of seconds' },
    delay: number('delay', 'a number of seconds'),
    ease: { key: 'ease', sigs: [['ease']], help: 'in-out, linear, in, out or spring' },
    // a row's / column's / group's members start one after another (seconds apart, default 0.1)
    stagger: { key: 'stagger', sigs: [['num'], []], build: (v) => buildStagger(v, false), help: 'a number of seconds between members (or nothing, for 0.1)' },
    'stagger-reverse': { key: 'stagger', sigs: [['num'], []], build: (v) => buildStagger(v, true), help: 'a number of seconds between members (or nothing, for 0.1)', what: 'stagger' },
    ...words(EFFECTS, 'effect', 'effect'),
    ...Object.fromEntries(Object.keys(SPEEDS).filter((w) => w !== 'normal').map((w) => [w, { error: `"${w}" goes after speed, e.g. "speed ${w}"` }])),
    // emphasis, highlights and callouts
    ...words(EMPHASES, 'emphasis', 'emphasis'),
    ...words(Object.keys(SIGNALS), 'emphasis', 'emphasis'),
    wiggle: fixed('emphasis', 'wobble', { what: 'emphasis' }),
    highlight: {
      key: 'highlight', list: [['number', 'num'], ['highlight']],
      build: (v, sig) => (sig[0] === 'number' ? { number: v[1].v } : v[0]),
      help: 'outline, inside, spotlight, arrow, glow, number N or clear (pulse, shake, wobble, bounce and a one-off glow go on their own)',
    },
    callout: {
      key: 'callout', sigs: [['str', 'side'], ['str'], ['clear']],
      build: (v, sig) => (sig[0] === 'clear' ? { none: true } : { text: v[0], side: v[1] || 'above' }),
      help: 'quoted text (e.g. callout "Look!"), optionally then a side, or clear',
    },
    // defaults only
    clear: fixed('reset', true, { modes: ['defaults'] }),
    // camera only
    zoom: { ...number('zoom', 'a number (2 = twice as close)'), modes: ['camera'] },
    reset: fixed('reset', true, { modes: ['camera'] }),
  }
  for (const entry of Object.values(KEYWORDS)) for (const list of [entry.sigs, entry.list]) list?.sort((a, b) => b.length - a.length)

  // Words that start a line (after "id:") rather than describe it
  const LINE_STARTS = ['copy', 'group', 'ungroup', 'remove', 'swap']

  const RESERVED = new Set([
    ...SHAPE_TYPES, ...RESOURCE_TYPES, ...LAYOUT_TYPES, ...Object.keys(KEYWORDS), ...Object.keys(SPEEDS), ...LINE_STARTS, 'pause', 'auto', 'defaults', 'camera',
  ])

  // ---------------------------------------------------------------------------
  // Small helpers
  // ---------------------------------------------------------------------------

  const SVG_NS = 'http://www.w3.org/2000/svg'
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(SVG_NS, tag)
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
    return el
  }
  const lerp = (a, b, t) => a + (b - a) * t
  const clamp01 = (t) => Math.min(1, Math.max(0, t))
  const ease = EASES['in-out'] // the default
  const easeFn = (name) => EASES[name] || ease

  // One media query, made once (it's checked for every shape on every frame); .matches stays live
  const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  const reducedMotion = () => Boolean(motionQuery?.matches)

  function lucideIcon(name) {
    const pascal = name.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
    return window.lucide?.icons?.[pascal]
  }

  // ---------------------------------------------------------------------------
  // Geometry
  // ---------------------------------------------------------------------------

  const cellToPx = (c) => (c - 0.5) * CELL

  // The width of some text in the site's font, measured once with a hidden SVG <text> and cached
  // (falls back to an estimate when it can't be measured, e.g. before the page has a body).
  const textWidths = new Map()
  let measurer = null
  const MONO_FONT = 'var(--font-family-mono)'
  function textWidth(text, size, bold = false, mono = false) {
    const key = `${size}|${bold ? 'b' : ''}|${mono ? 'm' : ''}|${text}`
    if (textWidths.has(key)) return textWidths.get(key)
    if (!measurer && document.body) {
      const holder = svgEl('svg', { width: 0, height: 0, 'aria-hidden': 'true' })
      holder.style.cssText = 'position: absolute; left: -9999px; top: 0; visibility: hidden'
      measurer = holder.appendChild(svgEl('text'))
      measurer.style.fontFamily = 'var(--font-family)'
      document.body.appendChild(holder)
    }
    let width = 0
    if (measurer) {
      measurer.style.fontSize = `${size}px`
      measurer.style.fontWeight = bold ? '700' : ''
      measurer.style.fontFamily = mono ? MONO_FONT : 'var(--font-family)'
      measurer.textContent = text
      width = measurer.getComputedTextLength()
    }
    if (!width) width = 0.55 * size * text.length
    textWidths.set(key, width)
    return width
  }

  // Half-width and half-height of a shape's box (text is measured).
  function extents(shape) {
    switch (shape.type) {
      case 'circle': return { hw: shape.r, hh: shape.r, round: true }
      case 'diamond': return { hw: shape.w / 2, hh: shape.h / 2, diamond: true }
      case 'text': {
        const size = FONT * shape.font
        return { hw: Math.max(0.3 * size, textWidth(shape.label, size, shape.bold, shape.mono) / 2), hh: 0.6 * size }
      }
      default: return { hw: shape.w / 2, hh: shape.h / 2 }
    }
  }

  // Half-sizes after `scale` (still in the shape's own, unrotated frame).
  function sized(shape) {
    const e = extents(shape)
    const k = shape.scale ?? 1
    return { hw: e.hw * k, hh: e.hh * k, round: e.round, diamond: e.diamond }
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

  // Centre of a shape's box. A row / column is placed by its first cell (cx, cy: from there to the
  // middle); align left/right anchors text to that side of its cell.
  function boxCentre(shape) {
    if (shape.cx !== undefined) return { x: shape.x + shape.cx, y: shape.y + shape.cy }
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
    let p
    switch (place) {
      case 'above': p = { x: c.x, y: c.y - b.hh - gap - a.hh - labelBelow(self) }; break
      case 'below': p = { x: c.x, y: c.y + b.hh + labelBelow(other) + gap + a.hh }; break
      case 'left-of': p = { x: c.x - b.hw - gap - a.hw, y: c.y }; break
      default: p = { x: c.x + b.hw + gap + a.hw, y: c.y }
    }
    // the whole row / column goes there, so its first cell is off-centre
    return self.cx !== undefined ? { x: p.x - self.cx, y: p.y - self.cy } : p
  }

  // Where an attached shape sits: beside its ref (attach), or at a fixed offset (group member).
  function attachPos(shape, ref, spec) {
    if (spec.dx !== undefined) return { x: ref.x + spec.dx, y: ref.y + spec.dy }
    if (spec.side === 'centre') return boxCentre(ref)
    return placeNextTo(shape, ref, spec.side, spec.gap ?? PLACE_GAP)
  }

  // The one constraint resolver: places every attached shape and group member from its ref, refs
  // first (depth-first, so chains and nested groups need no repeated passes). Used when compiling
  // a scene and on every frame. specOf(shape) gives the shape's attachment (or null to leave it),
  // place(shape, pos) applies the position; line ends are resolved separately by resolveEnds.
  function resolveAttachments(byId, specOf = (shape) => shape.attach, place = (shape, pos) => Object.assign(shape, pos)) {
    const done = new Set()
    const visit = (shape, depth) => {
      if (!shape || done.has(shape.id) || depth > 16) return
      done.add(shape.id)
      const spec = specOf(shape)
      const ref = spec && byId.get(spec.ref)
      if (!ref) return
      visit(ref, depth + 1)
      place(shape, attachPos(shape, byId.get(spec.ref), spec))
    }
    for (const shape of [...byId.values()]) visit(shape, 0)
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
    const { hw, hh, round, diamond } = sized(shape)
    // Measure in the shape's own frame, so rotated boxes are trimmed at their real edge.
    const a = (-(shape.angle || 0) * Math.PI) / 180
    const lx = ux * Math.cos(a) - uy * Math.sin(a)
    const ly = ux * Math.sin(a) + uy * Math.cos(a)
    // a diamond's edges are where |x| / hw + |y| / hh = 1
    const dist = round ? hw
      : diamond ? 1 / Math.max(1e-9, Math.abs(lx) / Math.max(hw, 1e-9) + Math.abs(ly) / Math.max(hh, 1e-9))
        : Math.min(Math.abs(lx) > 1e-9 ? hw / Math.abs(lx) : Infinity, Math.abs(ly) > 1e-9 ? hh / Math.abs(ly) : Infinity)
    const d = Math.min(dist + EDGE_GAP, len / 2)
    return { x: c.x + ux * d, y: c.y + uy * d }
  }

  // Whether a point is inside a shape's outline, grown by EDGE_GAP all round.
  function inside(shape, p) {
    const c = boxCentre(shape)
    const a = (-(shape.angle || 0) * Math.PI) / 180
    const dx = p.x - c.x
    const dy = p.y - c.y
    const lx = Math.abs(dx * Math.cos(a) - dy * Math.sin(a))
    const ly = Math.abs(dx * Math.sin(a) + dy * Math.cos(a))
    const { hw, hh, round, diamond } = sized(shape)
    if (round) return Math.hypot(lx, ly) <= hw + EDGE_GAP
    if (diamond) {
      if (hw < 1e-6 || hh < 1e-6) return false
      const apothem = (hw * hh) / Math.hypot(hw, hh) // centre to edge, square on
      return lx / hw + ly / hh <= 1 + EDGE_GAP / apothem
    }
    return lx <= hw + EDGE_GAP && ly <= hh + EDGE_GAP
  }

  // Where a path (samples, from a shape's centre outwards) first leaves the shape, or null if it
  // never does. Found between samples by halving.
  function leavePoint(samples, shape) {
    for (let i = 1; i < samples.length; i++) {
      if (inside(shape, samples[i])) continue
      let p = samples[i - 1]
      let q = samples[i]
      for (let k = 0; k < 12; k++) {
        const m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }
        if (inside(shape, m)) p = m
        else q = m
      }
      return q
    }
    return null
  }

  // A line's two ends as points, trimmed to the edges of any shapes they are attached to, and a
  // curve's via points (a via on a shape is that shape's centre). A curve is worked out between
  // the shapes' centres and cut where it crosses their edges, so it meets each shape the way it
  // really arrives (falling back to the edge towards its nearest via point).
  function resolveEnds(line, byId) {
    const target = (end) => (end.ref && byId.get(end.ref)) || null
    const centre = (end) => { const s = target(end); return s ? boxCentre(s) : { x: end.x, y: end.y } }
    const a = centre(line.from)
    const b = centre(line.to)
    const vias = (line.via || []).map(centre)
    const fromShape = target(line.from)
    const toShape = target(line.to)
    let from = fromShape ? edgePoint(fromShape, vias[0] || b) : a
    let to = toShape ? edgePoint(toShape, vias[vias.length - 1] || a) : b
    if (vias.length && (fromShape || toShape)) {
      const path = buildPath([a, ...vias, b])
      if (fromShape) from = leavePoint(path, fromShape) || from
      if (toShape) to = leavePoint([...path].reverse(), toShape) || to
    }
    return { from, to, vias }
  }

  // The points a line is drawn through: its ends, or for a curve the smooth path through its vias.
  const linePoints = ({ from, to, vias }) => (vias?.length ? buildPath([from, ...vias, to]) : [from, to])

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

  // A route that eases from stop to stop (travel), each hop an equal share of the time: the point
  // a fraction `raw` (0-1, un-eased) of the way through it.
  function pointOnHops(stops, raw, easing = ease) {
    const hops = stops.length - 1
    if (hops < 1) return { ...stops[0] }
    const i = Math.min(hops - 1, Math.floor(raw * hops))
    const k = easing(raw * hops - i)
    return { x: lerp(stops[i].x, stops[i + 1].x, k), y: lerp(stops[i].y, stops[i + 1].y, k) }
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
  // Grid and bounds
  // ---------------------------------------------------------------------------

  // The one bounds function: a shape's world-space box (its rotated, scaled outline, plus the
  // label under an image or icon), a line's ends, or the union of a group's members. Used when
  // compiling and on every frame: `ends` gives a line's ends mid-blend, `dx` / `dy` a shake or
  // bounce offset.
  function bounds(shape, byId, { ends, dx = 0, dy = 0 } = {}, depth = 0) {
    if (LINE_TYPES.includes(shape.type)) {
      const pts = linePoints(ends || resolveEnds(shape, byId))
      const xs = pts.map((p) => p.x)
      const ys = pts.map((p) => p.y)
      return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
    }
    if (shape.type === 'group' && depth < 8) {
      const members = (shape.members || []).map((id) => byId.get(id)).filter(Boolean)
      if (members.length) return unionBounds(members, byId, depth + 1)
    }
    const c = boxCentre(shape)
    const { hw, hh } = outline(shape)
    return { x0: c.x - hw + dx, y0: c.y - hh + dy, x1: c.x + hw + dx, y1: c.y + hh + labelBelow(shape) + dy }
  }

  function unionBounds(list, byId, depth = 0) {
    const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
    for (const shape of list) {
      const b = bounds(shape, byId, {}, depth)
      box.x0 = Math.min(box.x0, b.x0); box.y0 = Math.min(box.y0, b.y0)
      box.x1 = Math.max(box.x1, b.x1); box.y1 = Math.max(box.y1, b.y1)
    }
    return box
  }

  function viewBoxFor(gridAttr, beats, warnings) {
    const fixed = String(gridAttr || '').trim().toLowerCase().match(/^(\d+)\s*x\s*(\d+)$/)
    if (gridAttr && gridAttr !== 'fit' && !fixed) warnings.push(`grid="${gridAttr}" isn't "CxR" or "fit", so 16x9 is used`)
    if (gridAttr !== 'fit') {
      // the grid, with a margin all round so shapes on (or just over) its edge aren't against the frame
      const cols = fixed ? Math.max(1, +fixed[1]) : 16
      const rows = fixed ? Math.max(1, +fixed[2]) : 9
      return { x: -GRID_MARGIN, y: -GRID_MARGIN, w: cols * CELL + 2 * GRID_MARGIN, h: rows * CELL + 2 * GRID_MARGIN, cols, rows }
    }
    const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
    beats.forEach(({ state }) => state.forEach((shape) => {
      const b = bounds(shape, state)
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
      if (shape.x < 0 || shape.y < 0 || shape.x > viewBox.cols * CELL || shape.y > viewBox.rows * CELL) {
        reported.add(shape.uid)
        const multi = beats.some((b) => b.step === step && b.beat > 0)
        warnings.push(`Step ${step + 1}${multi ? `, beat ${beat + 1}` : ''}: "${shape.id}" is outside the ${viewBox.cols}x${viewBox.rows} grid`)
      }
    }))
  }

  Object.assign(window.Anim, { ALIGNS, APPLIES, CALLOUT_CH, CALLOUT_SIDES, CAPTION_MS, CELL, COLOURS, EASES, FLOWS,
    FLOW_SPEED, FONT, HEAD, HIGHLIGHTS, KEYWORDS, LAYERS, LAYOUT_TYPES, LINE_STARTS, LINE_TYPES, NORMAL_MS,
    PATTERNS, PLACEMENTS, PLACE_GAP, PLAIN_FILLS, PLAY_PAUSE, RESERVED, RESOURCE_TYPES, SHAPE_TYPES,
    SIGNALS, SPEEDS, STROKE, attachPos, bounds, boxCentre, buildPath, buildPolyline, cellToPx, clamp01, ease, easeFn,
    escapeHtml, extents, lerp, linePoints, lucideIcon, MONO_FONT, placeNextTo, pointOnHops, pointOnPath, reducedMotion,
    resolveAttachments, resolveEnds, svgEl, textWidth, unionBounds, viewBoxFor, warnOutsideGrid })
})()
