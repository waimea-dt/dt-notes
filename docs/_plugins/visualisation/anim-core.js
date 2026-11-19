/**
 * anim-core.js - Part of the animation plugin (animation.js): the constants, the keyword table
 * that every scene line is read against, geometry (text sizes, attachments, line ends, curves
 * and routes) and bounds. Shared by every other part through window.Anim.
 * The tables here (SHAPES, LOOKS, LINES, ENTRANCES, …) and how to extend them: docs/_plugins/PLUGIN_ANIMATION.md
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

  // How a row's / column's edits and a value on the move play out. Times are shares of the line's
  // speed; distances are shares of a cell's size.
  const CHOREOGRAPHY = {
    then: 0.6,        // insert / remove are two moves in turn: the second starts this far in
    aside: 1.2,       // a cell slides in from / out to this far below a row (left of a column)
    swapLift: { near: 0.6, far: 1.1 }, // how far a swapped cell bows out (neighbours / further apart)
    arrive: 1,        // a value copied to a var or cell (v1: a.1) lands after this
    arriveOut: 1.2,   // a cell removed into a var drops out, then lands after this
    flyMove: 0.8,     // a flyer moves for this share of its time, then fades out where it landed
    crossfade: 0.5,   // the value it brings crossfades in over this, centred on its landing
    slotFade: 0.15,   // a slot fades in or out over this share of its time
    fitSplit: 0.5,    // a fitted box (SHAPES: fitted) widens over this share of a change, then its text changes; or its text changes, then it narrows
    panelFade: 0.15,  // a code block's panel (and name, line numbers) fades in this share of a typed speed, before the typing
    spanPad: 0.16,    // a span's box is this much bigger than its cells all round (in cells), so an outline goes round them
  }
  // How a shape comes in or goes (the effect words; rendered by FRAMES in anim-render.js):
  //   applies  whether it works on a shape; when it doesn't, the shape fades, with the warning
  //            unless(noun) gives (noun: the shape's name, nounOf)
  //   quiet    plays no intro of its own on the first beat (see animation.js)
  //   internal not a word an author types: a cell a flyer brings in is there from the start
  //            (appear), one a flyer takes away goes at once (vanish)
  const isLine = (shape) => Boolean(SHAPES[shape.type]?.line)
  const ENTRANCES = {
    fade: { quiet: true },
    pop: {},
    draw: { applies: isLine, unless: (noun) => `"draw" only draws lines and arrows, so this ${noun} fades instead` },
    slide: { applies: (shape) => !isLine(shape), unless: (noun) => `"slide" doesn't move lines, so this ${noun} fades instead` },
    typed: { applies: (shape) => Boolean(shape.label), unless: (noun) => `"typed" types out a shape's text, and this ${noun} has none, so it fades instead` },
    appear: { quiet: true, internal: true },
    vanish: { quiet: true, internal: true },
  }
  const EFFECTS = Object.keys(ENTRANCES).filter((name) => !ENTRANCES[name].internal)
  // The entrance a shape really gets: its own, or a fade where that doesn't apply
  const entranceFor = (effect, shape) => (ENTRANCES[effect]?.applies?.(shape) === false ? 'fade' : effect)
  const LAYERS = { back: 0, normal: 1, front: 2 }
  const PLACEMENTS = ['above', 'below', 'left-of', 'right-of']
  const ALIGNS = { left: 'left', centre: 'centre', right: 'right' }
  const LINE_STYLES = ['solid', 'dashed', 'dotted']
  // Each pattern as a visible mark and gap, in multiples of the line's thickness (w):
  // dashed 3w:3w, dotted 1w:1w (a dot is a round cap as wide as the line)
  const PATTERNS = { dashed: { d: 4, g: 4 }, dotted: { d: 1, g: 1.5 } }
  const FLOWS = { flow: 'forward', 'flow-reverse': 'reverse', static: 'none' } // static: not flowing
  // Callout sides use the placement words (the bubble's side of the shape)
  const CALLOUT_SIDES = { above: 'above', below: 'below', 'left-of': 'left', 'right-of': 'right' }
  // The highlights (highlight <kind>), each on until "highlight clear". Drawn by OVERLAYS in
  // anim-render.js (glow and spotlight change the shape itself).
  //   off      its value when off (default false); valued: it takes a value ("number 5")
  //   applies  whether it fits a shape, with refuse(shape) the message when it doesn't
  const HIGHLIGHT_KINDS = {
    outline: { applies: (shape) => !isLine(shape), refuse: () => '"highlight outline" doesn\'t fit a line: try glow or signal' },
    inside: {
      applies: (shape) => Boolean(SHAPES[shape.type]?.inside),
      refuse: (shape) => {
        const types = Object.keys(SHAPES).filter((type) => SHAPES[type].inside && !SHAPES[type].internal)
        const what = shape.type === 'group' ? shape.layout || 'group' : shape.type
        return `"highlight inside" needs a shape with an inside (${types.slice(0, -1).join(', ')} or ${types[types.length - 1]}), not ${article(what)} ${what}`
      },
    },
    // a band behind a shape's text, in the highlight colour (shapes with a band: SHAPES)
    line: {
      applies: (shape) => Boolean(SHAPES[shape.type]?.band),
      refuse: () => {
        const nouns = Object.keys(SHAPES).filter((type) => SHAPES[type].band).map((type) => `${article(nounOf({ type }))} ${nounOf({ type })}`)
        return `"highlight line" is for ${nouns.join(' or ')} (e.g. "c.2: highlight line", on a code block's line 2)`
      },
    },
    spotlight: {},
    arrow: {},
    glow: {},
    number: { off: null, valued: true },
  }
  // The words after "highlight" (number, which takes a value, is matched on its own: KEYWORDS)
  const HIGHLIGHTS = [...Object.keys(HIGHLIGHT_KINDS).filter((kind) => !HIGHLIGHT_KINDS[kind].valued), 'clear']
  // One-off emphasis on an existing shape (rendered by EMPHASIS_FRAMES in anim-render.js); along:
  // it runs along a line, arrow or curve (on a group: each of its lines). aliases: other words for it.
  const EMPHASES = {
    pulse: {},
    shake: {},
    wobble: { aliases: ['wiggle'] },
    bounce: {},
    glow: {},
    signal: { along: true },
    'signal-reverse': { along: true },
  }
  const CALLOUT_CH = 24 // callout text wraps at about this many characters
  const FLOW_SPEED = 2 * 80 // px per second (two cells)
  // Every shape type, in one place:
  //   takes     the props it takes (APPLIES, prop -> types, is worked out from these)
  //   defaults  its own starting values, on top of every shape's (baseShape)
  //   outline   its edge, for line ends, highlights and bounds: 'box' (a rect, rounded by its
  //             corner if it takes one), 'round' (radius r) or 'diamond'
  //   label     where its label goes: 'centre', 'content' (text: the label is the shape, measured),
  //             'below' (image, icon: it adds to the shape's height) or 'along' (lines). A bar
  //             (BAR_DRAWS: label) can put it elsewhere: 'top' or 'right', inside that edge of the box
  //   inside    it has an inside to highlight (highlight inside)
  //   line      it runs from / to (a curve is a line bent through via points); head: an arrowhead
  //   resource  written type(arg): image(path), icon(name)
  //   internal  not a word an author types: a code block's lines (codeline) are made by "code"
  //   noun      its name in messages, when that isn't its type ("a code line")
  //   band      it takes "highlight line", a band behind its text: pad, the band's extra width
  //             each side, and corner (both × the font size; corner null: the shape's own corner)
  //   fitted    its box is sized by its layout (LAYOUTS: fit): it widens before its text changes
  //             and narrows after (CHOREOGRAPHY: fitSplit), so the text never sticks out
  //   pre       its text is code: spaces kept and highlighted by its lang (anim-render.js); height,
  //             its box's height, and pad, the margin each side of the text (× the font size)
  //   owned     its place and size come from what it belongs to (a span: its row's places), so it
  //             can't be moved or attached: the hint the message gives instead
  //   hug       it's already a padded marker, so a highlight outline sits on its own edge (no gap)
  //             and goes round it alone, leaving its name outside
  const COMMON_PROPS = ['colour', 'weight', 'font', 'bold', 'mono']
  const BOXED_PROPS = [...COMMON_PROPS, 'at', 'x', 'y', 'angle', 'scale']
  const LINE_PROPS = [...COMMON_PROPS, 'from', 'to', 'stroke', 'linestyle', 'flow', 'head']
  const SHAPES = {
    rect: {
      takes: [...BOXED_PROPS, 'size', 'width', 'height', 'corner', 'fill', 'stroke', 'linestyle', 'flow', 'bar', 'max', 'track'],
      defaults: { w: CELL, h: CELL, corner: 0, fill: 'bg-shape' }, outline: 'box', label: 'centre', inside: true,
    },
    circle: {
      takes: [...BOXED_PROPS, 'size', 'radius', 'fill', 'stroke', 'linestyle', 'flow'],
      defaults: { r: CELL / 2, fill: 'bg-shape' }, outline: 'round', label: 'centre', inside: true,
    },
    diamond: {
      takes: [...BOXED_PROPS, 'size', 'width', 'height', 'fill', 'stroke', 'linestyle', 'flow'],
      defaults: { w: CELL, h: CELL, fill: 'bg-shape' }, outline: 'diamond', label: 'centre', inside: true,
    },
    text: { takes: [...BOXED_PROPS, 'align'], defaults: { w: 0, h: 0 }, outline: 'box', label: 'content', band: { pad: 0.2, corner: 0.15 } },
    image: {
      takes: [...BOXED_PROPS, 'size', 'width', 'height', 'stroke', 'linestyle', 'flow'],
      defaults: { w: CELL, h: CELL, stroke: 'none' }, outline: 'box', label: 'below', inside: true, resource: true,
    },
    icon: {
      takes: [...BOXED_PROPS, 'size', 'width', 'height', 'stroke'],
      defaults: { w: CELL, h: CELL }, outline: 'box', label: 'below', inside: true, resource: true,
    },
    line: { takes: LINE_PROPS, label: 'along', line: true },
    arrow: { takes: LINE_PROPS, label: 'along', line: true, head: true },
    curve: { takes: LINE_PROPS, label: 'along', line: true },
    // a line of a code block: mono text, highlighted (lang), left-aligned in a box that a fill or
    // its highlight shows as a band. Its box is sized to the block (fitLines in anim-compile.js).
    codeline: {
      takes: [...BOXED_PROPS, 'align', 'fill', 'stroke', 'corner', 'linestyle', 'flow', 'lang'],
      defaults: { w: 0, h: 0, fill: 'none', stroke: 'none', mono: true, align: 'left' }, outline: 'box', label: 'code', inside: true,
      internal: true, noun: 'code line', fitted: true, band: { pad: 0, corner: null }, pre: { height: 1.4, pad: 0.3 },
    },
    // some of a row's / column's / code block's places as one ("s: span arr 0 2"): a box round them
    // (fitSpans in anim-compile.js), invisible unless given a fill or stroke, for highlights, a
    // callout and a name. Made by the span verb (LINES).
    span: {
      takes: ['fill', 'stroke', 'linestyle', 'flow', 'corner', 'weight'],
      defaults: { w: 0, h: 0, fill: 'none', stroke: 'none', corner: 0.15 * CELL, layer: 'back' }, outline: 'box', label: 'centre',
      internal: true, hug: true, owned: 'it goes round its cells, so to cover others, span it again (e.g. "s: span arr 2 4")',
    },
  }
  const typesWhere = (test) => Object.keys(SHAPES).filter((type) => test(SHAPES[type]))
  const SHAPE_TYPES = typesWhere((kind) => !kind.resource && !kind.internal) // written as a word after "id:"
  const RESOURCE_TYPES = typesWhere((kind) => kind.resource)
  const LINE_TYPES = typesWhere((kind) => kind.line)
  // A shape's name in messages: its noun, or its type
  const nounOf = (shape) => SHAPES[shape.type]?.noun || shape.type

  // Every layout: a group of cells (the type after "id:"), in one place:
  //   noun        its name in messages; item, what its cells are called ("line", "cell")
  //   cell        the shape type of its cells
  //   across      cells side by side (a row), or one under another
  //   base        the number of its first cell: 0 like indices, or 1 like line numbers
  //   name        the side its name goes, unless one is given
  //   lines       its values are "quoted" lines: one alone, or in [ ] (no count of empty cells),
  //               and it's as big as they are (no size)
  //   fit         every cell takes the size of the biggest, refitted as they change (fitCode); its
  //               box is fitted like its cells' (SHAPES: fitted)
  //   typeInTurn  typed (and delete typed) types its cells one after another
  //   slide       insert / remove slide a cell in and out from beside it (or it fades in place)
  //   slot        a muted outline marks the space a cell leaves or lands in
  //   bow         how far a swapped cell bows out: 'own' (its size across) or 'cell' (a grid cell)
  //   numbers     its indices keep to its cells' font size
  //   panel       a background behind it (and its indices): pad and corner, in cells
  //   spanName    the side a span's name goes (beside its places, away from the indices)
  const LAYOUTS = {
    row: { noun: 'row', item: 'cell', cell: 'rect', across: true, base: 0, name: 'left-of', spanName: 'above', slide: true, slot: true, bow: 'own' },
    column: { noun: 'column', item: 'cell', cell: 'rect', across: false, base: 0, name: 'above', spanName: 'right-of', slide: true, slot: true, bow: 'own' },
    code: {
      noun: 'code block', item: 'line', cell: 'codeline', across: false, base: 1, name: 'above', spanName: 'right-of', lines: true, fit: true, typeInTurn: true,
      slide: false, slot: false, bow: 'cell', numbers: true, panel: { pad: 0.12, corner: 0.1 },
    },
  }
  const LAYOUT_TYPES = Object.keys(LAYOUTS)

  // ease <name>: how a change speeds up and slows down (t: 0-1 of its time -> 0-1 of the way).
  // spring overshoots, then settles exactly on 1.
  const EASES = {
    'in-out': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    linear: (t) => t,
    in: (t) => t * t * t,
    out: (t) => 1 - Math.pow(1 - t, 3),
    spring: (t) => (t >= 1 ? 1 : 1 - Math.exp(-5 * t) * Math.cos(2.5 * Math.PI * t)),
  }

  // lang: a language Prism hasn't loaded shows as plain code. Without Prism (in the editor), any
  // language is taken. Each language is listed once, by its first name (aliases share a grammar).
  function langWarning(lang) {
    const languages = window.Prism?.languages
    if (!languages || languages[lang]) return null
    const seen = new Set()
    const known = Object.keys(languages).filter((name) => {
      const grammar = languages[name]
      if (typeof grammar !== 'object' || seen.has(grammar)) return false
      seen.add(grammar)
      return true
    })
    return `no highlighting for "${lang}", so it shows as plain code (the site has: ${known.join(', ')})`
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
    'bg-shape': 'var(--anim-shape)', // a shape's default fill: a little darker than the backdrop (bg)
    black: '#000',
    white: '#fff',
    none: 'none',
  }
  // Named colours used as a fill are tinted towards the background, so labels stay readable: a fill
  // keeps FILL_MIX % of its colour (a variant: its own fillMix). These are never tinted.
  const PLAIN_FILLS = ['fg', 'bg', 'bg-shape', 'black', 'white', 'none']
  const FILL_MIX = 45

  // Variants of each hue, written <hue>-<variant> (red-bright, blue-muted), added to COLOURS. Each
  // is made one of two ways:
  //   chroma   its saturation scaled, as a multiple of the hue's own (oklch, so its lightness is
  //            kept); a browser without relative colours shows the hue itself
  //   keep     mixed with the background, keeping this % of the hue, as a fill is (FILL_MIX): darker
  //            and dimmer on a dark theme, paler on a light one
  // and fillMix is the % of it a fill keeps (in place of FILL_MIX).
  // The greys and none (UNVARIED) have no variants: there's nothing to saturate.
  const COLOUR_VARIANTS = {
    bright: { chroma: 1.4, fillMix: 70 },
    muted: { keep: 55, fillMix: 45 },
  }
  const UNVARIED = [...PLAIN_FILLS, 'muted']
  const RELATIVE_COLOURS = Boolean(window.CSS?.supports?.('color', 'oklch(from red l c h)'))
  // A colour mixed towards the background, keeping `keep` % of it (a muted variant, and every tinted
  // fill: colourCss in anim-render.js). A hue as a variant: that, or its saturation scaled.
  const towardsBg = (css, keep) => `color-mix(in srgb, ${css} ${keep}%, ${COLOURS.bg})`
  const variantOf = (css, { chroma, keep }) => (keep !== undefined ? towardsBg(css, keep)
    : RELATIVE_COLOURS ? `oklch(from ${css} l calc(c * ${chroma}) h)` : css)
  const FILL_MIXES = Object.fromEntries(Object.keys(COLOURS).filter((name) => !PLAIN_FILLS.includes(name)).map((name) => [name, FILL_MIX]))
  for (const hue of Object.keys(COLOURS).filter((name) => !UNVARIED.includes(name))) {
    for (const [variant, spec] of Object.entries(COLOUR_VARIANTS)) {
      COLOURS[`${hue}-${variant}`] = variantOf(COLOURS[hue], spec)
      FILL_MIXES[`${hue}-${variant}`] = spec.fillMix
    }
  }

  // Which shape types each prop applies to (from SHAPES' takes)
  const APPLIES = {}
  for (const [type, kind] of Object.entries(SHAPES)) for (const key of kind.takes) (APPLIES[key] ||= []).push(type)

  // How each look prop is applied to a shape (applyLook, in this order, after size):
  //   field  the shape field it sets
  //   unit   for a number: CELL (given in cells) or 1 (a multiplier); min, its least value
  //   map    for a word: the value it stores (flow-reverse -> reverse)
  //   hints  a message for a type it doesn't apply to, pointing at the prop that does
  //   quiet  types it has no effect on (a warning, not an error)
  //   cell   part of a row's / column's look, given to its cells
  //   kept   taken along by a value on the move with keep-style
  //   check  check(value, shape): a warning when the value can't be shown as asked (null if it can);
  //          shape is left out on a defaults line
  //   default  its value on a shape that hasn't been given one (read where it's used)
  // bar: a var's or cell's value shown as the share of its shape that its value is of max (a value
  // over max shows full, below 0 empty). The kinds of bar (BARS: drawn by BAR_DRAWS in
  // anim-render.js), each for the outlines it fits (SHAPES: outline); a shape it doesn't fit shows
  // its value plainly, with a warning.
  //   default  the kind "bar" on its own gives (the others are written after it: "bar <kind>")
  //   outlines the outlines it can be drawn in
  //   slot     false: a row's / column's insert and remove show no slot (LAYOUTS: slot) for its cells,
  //            where an empty outline would look like a bar
  // (where its value goes is its drawer's choice, BAR_DRAWS: label, as it depends on the shape's size)
  const BARS = {
    // a box filled part-way: up from the bottom of a box taller than it is wide, otherwise from the left
    linear: { default: true, outlines: ['box'], slot: false },
  }
  const BAR_DEFAULT = Object.keys(BARS).find((kind) => BARS[kind].default)
  const BAR_KINDS = Object.keys(BARS).filter((kind) => !BARS[kind].default) // written after "bar"
  // Whether a shape's bar can be drawn: it has one, holds a value, and the kind fits its outline
  const barFits = (kind, shape) => Boolean(BARS[kind]?.outlines.includes(SHAPES[shape.type]?.outline))
  function barCheck(kind, shape) {
    if (!shape || !BARS[kind]) return null
    if (!shape.holds) return '"bar" shows the value of a var or a row\'s / column\'s cell, and this has none'
    if (!barFits(kind, shape)) return `this bar doesn't fit ${article(nounOf(shape))} ${nounOf(shape)}, so its value shows plainly`
    return null
  }
  const maxCheck = (value) => (!value.rel && value.v <= 0 ? '"max" must be more than 0, so the bar stays empty' : null)
  const LOOKS = {
    font: { field: 'font', unit: 1, min: 0.1, cell: true },
    width: { field: 'w', unit: CELL, min: 0 },
    height: { field: 'h', unit: CELL, min: 0 },
    radius: { field: 'r', unit: CELL, min: 0, hints: { rect: '"radius" is for circles: use corner for a rect\'s corners' } },
    corner: { field: 'corner', unit: CELL, min: 0, cell: true },
    fill: { field: 'fill', cell: true, kept: true },
    stroke: { field: 'stroke', cell: true, kept: true, hints: { text: '"stroke" doesn\'t apply to text: use colour' } },
    colour: { field: 'colour', cell: true, kept: true },
    weight: { field: 'weight', unit: 1, min: 0, cell: true, quiet: ['text'] },
    align: { field: 'align' },
    angle: { field: 'angle', unit: 1 },
    scale: { field: 'scale', unit: 1, min: 0 },
    bold: { field: 'bold', cell: true },
    mono: { field: 'mono', cell: true },
    lang: { field: 'lang', cell: true, check: langWarning }, // a code block's language (Prism's name for it)
    head: { field: 'head' },
    linestyle: { field: 'linestyle', cell: true },
    flow: { field: 'flow', map: FLOWS, cell: true },
    layer: { field: 'layer' },
    // a var's or cell's value as a bar (bar clear: back to a plain box)
    bar: { field: 'bar', map: { clear: false }, cell: true, check: barCheck }, // a kind (BARS), or false
    // a full bar's value (a row's or column's: its biggest when its bar is turned on, unless given)
    max: { field: 'max', unit: 1, min: 0, cell: true, check: maxCheck, default: 100 },
    track: { field: 'track', cell: true },
  }
  const looksWith = (flag) => Object.keys(LOOKS).filter((key) => LOOKS[key][flag])
  // A row's or column's look, given to each of its cells (when made, and on a change to it)
  const CELL_STYLE = looksWith('cell')
  // What a value on the move takes with it (keep-style): not its size, or highlights
  const KEPT_STYLE = looksWith('kept')
  // The shape fields that blend between beats: its place, and every number in its look
  const LERPED = ['x', 'y', ...new Set(Object.values(LOOKS).filter((look) => look.unit).map((look) => look.field))]

  // "a" or "an" before a word (a rect, an image)
  const article = (word) => (/^[aeiou]/i.test(word) ? 'an' : 'a')

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
  const colour = (key) => ({ key, sigs: [['colour']], help: `a colour (e.g. blue, ${Object.keys(COLOUR_VARIANTS).map((variant) => `blue-${variant}`).join(', ')}, #f80 or none)` })
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
    mono: fixed('mono', true), // a monospace font
    lang: { key: 'lang', sigs: [['lang']], help: 'a language, e.g. "lang python" or "lang js"' },
    // a var's or cell's value as a bar, max its full value, track the colour of the rest
    // (a kind of bar, BARS, other than the default, goes after it: "bar <kind>")
    bar: { key: 'bar', sigs: [['clear'], ['bar'], []], build: (v) => v[0] ?? BAR_DEFAULT, help: `nothing (show the value as a bar)${BAR_KINDS.map((kind) => `, ${kind}`).join('')} or clear` },
    max: number('max', 'a number (the value of a full bar)'),
    track: colour('track'),
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
    ...words(Object.keys(EMPHASES), 'emphasis', 'emphasis'),
    ...Object.fromEntries(Object.entries(EMPHASES).flatMap(([name, e]) => (e.aliases || []).map((alias) => [alias, fixed('emphasis', name, { what: 'emphasis' })]))),
    highlight: {
      key: 'highlight', list: [['number', 'num'], ['number'], ['highlight']],
      // number with no value: the next in the sequence (null until compiled)
      build: (v, sig) => (sig[0] === 'number' ? { number: sig.length === 2 ? v[1].v : null } : v[0]),
      help: 'outline, inside, line, spotlight, arrow, glow, number (N) or clear (pulse, shake, wobble, bounce and a one-off glow go on their own)',
    },
    callout: {
      key: 'callout', sigs: [['str', 'side'], ['str'], ['clear']],
      build: (v, sig) => (sig[0] === 'clear' ? { none: true } : { text: v[0], side: v[1] || 'above' }),
      help: 'quoted text (e.g. callout "Look!"), optionally then a side, or clear',
    },
    // a var's / row's / column's name tag (a text shape that goes with it), and a row's / column's
    // cell numbers
    name: {
      key: 'name', sigs: [['str', 'placement'], ['str'], ['clear']],
      build: (v, sig) => (sig[0] === 'clear' ? { none: true } : { text: v[0], side: v[1] || null }),
      help: 'quoted text (e.g. name "total"), optionally then a side (above, below, left-of, right-of), or clear',
    },
    indices: { key: 'indices', sigs: [['clear'], []], build: (v) => !v.length, help: 'nothing (show them) or clear' },
    numbered: { key: 'indices', sigs: [['clear'], []], build: (v) => !v.length, help: 'nothing (show them) or clear', what: 'indices' },
    // a value copied or moved (v1: a.1, insert v1, remove … into v1) takes its fill, stroke and colour
    // with it, rather than taking on the look of where it goes
    'keep-style': fixed('keepStyle', true, { modes: ['insert', 'remove', 'assign', 'defaults'], where: 'on a value being copied or moved: "v1: a.1", "insert v1 at …" or "remove … into v1"' }),
    null: { error: '"null" is a value: it goes in a var (v: null) or a row\'s / column\'s cell (arr.2: null)' },
    // defaults only (elsewhere, clear goes after highlight, callout, name or indices)
    clear: fixed('reset', true, { modes: ['defaults'], where: 'after highlight, callout, name or indices (e.g. "highlight clear"), or on its own on a defaults line' }),
    // camera only
    zoom: { ...number('zoom', 'a number (2 = twice as close)'), modes: ['camera'], where: 'on a camera line, e.g. "camera zoom 2"' },
    reset: fixed('reset', true, { modes: ['camera'], where: 'on a camera line, "camera reset"' }),
  }
  for (const entry of Object.values(KEYWORDS)) for (const list of [entry.sigs, entry.list]) list?.sort((a, b) => b.length - a.length)

  // The word an author types for a prop, for messages: "quoted text" for a label, the word itself
  // for a one-word prop given its value (dashed, pop, …), otherwise the keyword that sets it.
  function wordFor(key, value) {
    if (key === 'label') return 'quoted text'
    if (typeof value === 'string' && KEYWORDS[value]?.key === key) return value
    if (KEYWORDS[key]?.key === key) return key
    return Object.keys(KEYWORDS).find((word) => KEYWORDS[word].key === key) || key
  }

  // A list of props for a message: "a speed, a delay and an ease"
  const ARTICLES = { speed: 'a speed', delay: 'a delay', ease: 'an ease', effect: 'an effect', stagger: 'a stagger' }
  function listProps(keys) {
    const words = keys.map((key) => ARTICLES[key] || wordFor(key))
    return words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : words[0] || 'nothing'
  }

  const TIMING = ['speed', 'delay', 'ease']

  // Every kind of scene line and the props it can have, checked as its props are read (parseProps).
  //   verb     typed straight after "id:" (the others are known by the line's shape)
  //   takes    the props it takes (left out: any), with `what` naming it in the message
  //   refuses  props it doesn't take, with `refuse(word)` the message
  const LINES = {
    create: {}, // "a: rect …"
    change: {}, // "a: fill red …"
    copy: { verb: true }, // "b: copy a …", then any change
    group: {
      verb: true,
      refuses: ['at', 'x', 'y', 'via', 'travel', 'follow', 'attach'],
      refuse: () => 'create the group first, then move it on the next line',
    },
    ungroup: { verb: true, takes: [] },
    delete: { verb: true, takes: [...TIMING, 'effect', 'stagger'] }, // a shape
    swap: { verb: true, takes: TIMING }, // two of a row's / column's cells
    insert: { verb: true, takes: [...TIMING, 'keepStyle'] }, // a cell into a row / column
    remove: { verb: true, takes: [...TIMING, 'keepStyle'] }, // a cell out of one
    assign: { takes: [...TIMING, 'keepStyle'], what: 'copying a value' }, // "v1: a.1"
    span: { // "s: span arr 0 2": a box round some of a row's / column's / code block's places
      verb: true, takes: [...SHAPES.span.takes, 'layer', 'highlight', 'callout', 'name', 'effect', ...TIMING],
      refuse: (word) => `"${word}" doesn't apply to a span: it's a box round its cells, for a fill, stroke, highlight, callout or name`,
    },
    range: { // some of a row's / column's cells, "arr: range 0 3 fill red": how they look, not where they are
      verb: true, takes: [...CELL_STYLE, 'highlight', 'emphasis', 'callout', ...TIMING, 'stagger'],
      refuse: (word) => `"range" changes how cells look, so it doesn't go with "${word}"`,
    },
    layout: { // "arr: row [5 3 8] …" (a label is taken so its own message can say where values go)
      takes: ['label', 'at', 'x', 'y', 'gap', 'size', 'width', 'height', ...CELL_STYLE, 'layer', ...TIMING, 'stagger', 'effect', 'highlight', 'callout', 'name', 'indices'],
      refuse: (word) => `"${word}" doesn't apply to a row or column`,
    },
    camera: { takes: ['at', 'x', 'y', 'travel', 'zoom', 'reset', ...TIMING] },
    defaults: {
      refuses: ['label', 'at', 'x', 'y', 'from', 'to', 'gap', 'delay', 'via', 'name', 'indices'],
      refuse: (word) => `"${word}" can't be a default`,
    },
  }

  // Words that start a line (after "id:") rather than describe it: the verbs, and var
  const LINE_STARTS = [...Object.keys(LINES).filter((kind) => LINES[kind].verb), 'var']
  // Words inside a row edit: "insert 7 at end", "remove 2 into v1"
  const EDIT_WORDS = ['end', 'into']

  const RESERVED = new Set([
    ...SHAPE_TYPES, ...RESOURCE_TYPES, ...LAYOUT_TYPES, ...Object.keys(KEYWORDS), ...Object.keys(SPEEDS), ...LINE_STARTS, ...EDIT_WORDS, ...BAR_KINDS, 'pause', 'auto', 'defaults', 'camera',
  ])

  // ---------------------------------------------------------------------------
  // Small helpers
  // ---------------------------------------------------------------------------

  const SVG_NS = 'http://www.w3.org/2000/svg'
  const XML_NS = 'http://www.w3.org/XML/1998/namespace' // xml:space
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
  // `pre` keeps runs of spaces (a code line's indent), which other text collapses.
  function textWidth(text, size, bold = false, mono = false, pre = false) {
    const key = `${size}|${bold ? 'b' : ''}|${mono ? 'm' : ''}|${pre ? 'p' : ''}|${text}`
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
      if (pre) measurer.setAttributeNS(XML_NS, 'xml:space', 'preserve')
      else measurer.removeAttributeNS(XML_NS, 'space')
      measurer.textContent = text
      width = measurer.getComputedTextLength()
    }
    if (!width) width = 0.55 * size * text.length
    textWidths.set(key, width)
    return width
  }

  // A shape's type entry (a group, or a point to place beside, has none: it's a plain box)
  const kindOf = (shape) => SHAPES[shape.type] || {}

  // Half-width and half-height of a shape's box, with its outline (round, diamond) for the edge
  // maths. A shape whose label is its content (text) is as big as the text, measured.
  function extents(shape) {
    const kind = kindOf(shape)
    if (kind.outline === 'round') return { hw: shape.r, hh: shape.r, round: true }
    if (kind.label === 'content') {
      const size = FONT * shape.font
      return { hw: Math.max(0.3 * size, textWidth(shape.label, size, shape.bold, shape.mono) / 2), hh: 0.6 * size }
    }
    return { hw: shape.w / 2, hh: shape.h / 2, diamond: kind.outline === 'diamond' || undefined }
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
    if (!APPLIES.align.includes(shape.type) || shape.align === 'centre') return { x: shape.x, y: shape.y }
    const { hw } = sized(shape)
    return { x: shape.align === 'left' ? shape.x - CELL / 2 + hw : shape.x + CELL / 2 - hw, y: shape.y }
  }

  // Extra height taken up by a label below its shape (an image or icon).
  const labelBelow = (shape) => (kindOf(shape).label === 'below' && shape.label ? FONT * shape.font * 1.3 * (shape.scale ?? 1) : 0)

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

  // A shape's attachment (shape.attach), one of two kinds:
  //   beside  next to its ref (side: a placement word, or 'centre' on top of it, and a gap): attach,
  //           and a var's / row's name
  //   offset  at a fixed offset from its ref (dx, dy): a group's members (a row's cells too), and a
  //           row's index labels
  const besideOf = (ref, side, gap) => ({ kind: 'beside', ref, side, gap })
  const offsetFrom = (ref, dx, dy) => ({ kind: 'offset', ref, dx, dy })

  // Where an attached shape sits, from its ref and its attachment.
  function attachPos(shape, ref, spec) {
    if (spec.kind === 'offset') return { x: ref.x + spec.dx, y: ref.y + spec.dy }
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

  // Points with the distance along to each (`at`), as path samples.
  function measure(points) {
    let at = 0
    return points.map((p, i) => ({ x: p.x, y: p.y, at: (at += i ? Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y) : 0) }))
  }

  // The point a distance d along a path (samples with `at`), held to its ends.
  function pointAt(samples, d) {
    const total = samples[samples.length - 1].at
    const target = Math.min(total, Math.max(0, d))
    let i = 1
    while (i < samples.length - 1 && samples[i].at < target) i++
    const a = samples[i - 1]
    const b = samples[i] || a
    const k = b.at > a.at ? (target - a.at) / (b.at - a.at) : 0
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) }
  }

  // The point a fraction t (0-1) of the way along a path, by distance.
  const pointOnPath = (samples, t) => pointAt(samples, clamp01(t) * samples[samples.length - 1].at)

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

  // The box round several boxes (none: an empty, infinite-inside-out box).
  function mergeBoxes(boxes) {
    const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
    for (const b of boxes) {
      box.x0 = Math.min(box.x0, b.x0); box.y0 = Math.min(box.y0, b.y0)
      box.x1 = Math.max(box.x1, b.x1); box.y1 = Math.max(box.y1, b.y1)
    }
    return box
  }

  const unionBounds = (list, byId, depth = 0) => mergeBoxes(list.map((shape) => bounds(shape, byId, {}, depth)))

  function viewBoxFor(gridAttr, beats, warnings) {
    const fixed = String(gridAttr || '').trim().toLowerCase().match(/^(\d+)\s*x\s*(\d+)$/)
    if (gridAttr && gridAttr !== 'fit' && !fixed) warnings.push(`grid="${gridAttr}" isn't "CxR" or "fit", so 16x9 is used`)
    if (gridAttr !== 'fit') {
      // the grid, with a margin all round so shapes on (or just over) its edge aren't against the frame
      const cols = fixed ? Math.max(1, +fixed[1]) : 16
      const rows = fixed ? Math.max(1, +fixed[2]) : 9
      return { x: -GRID_MARGIN, y: -GRID_MARGIN, w: cols * CELL + 2 * GRID_MARGIN, h: rows * CELL + 2 * GRID_MARGIN, cols, rows }
    }
    const box = mergeBoxes(beats.map(({ state }) => unionBounds([...state.values()], state)))
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

  Object.assign(window.Anim, { SHAPES, kindOf, ALIGNS, APPLIES, BARS, BAR_KINDS, barFits, CALLOUT_CH, CALLOUT_SIDES, CAPTION_MS, CELL, CELL_STYLE, CHOREOGRAPHY, COLOURS, COLOUR_VARIANTS, FILL_MIXES, towardsBg, EASES, FLOWS,
    LAYOUTS, nounOf, XML_NS, FLOW_SPEED, FONT, HEAD, HIGHLIGHTS, HIGHLIGHT_KINDS, KEPT_STYLE, KEYWORDS, LAYERS, LAYOUT_TYPES, LERPED, LINES, LINE_STARTS, LINE_TYPES, listProps,
    LOOKS, NORMAL_MS, TIMING, article, wordFor,
    PATTERNS, PLACEMENTS, PLACE_GAP, PLAIN_FILLS, PLAY_PAUSE, RESERVED, RESOURCE_TYPES, SHAPE_TYPES,
    EMPHASES, ENTRANCES, entranceFor, SPEEDS, STROKE, attachPos, besideOf, bounds, boxCentre, offsetFrom, buildPath, buildPolyline, cellToPx, clamp01, ease, easeFn,
    escapeHtml, extents, lerp, linePoints, lucideIcon, measure, mergeBoxes, MONO_FONT, placeNextTo, pointAt, pointOnHops, pointOnPath, reducedMotion,
    resolveAttachments, resolveEnds, svgEl, textWidth, unionBounds, viewBoxFor, warnOutsideGrid })
})()
