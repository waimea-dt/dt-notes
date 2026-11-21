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
  const GRID_MARGIN = 0.12 * CELL  // round a fixed grid: room for the strokes and highlight outlines of
                                   // shapes on its edge (none when cropped; the stage's CSS padding frames it)
  const FIT_MARGIN = CELL / 2      // round a fitted drawing's shapes (none when cropped)
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
    scriptRoom: 0.4,  // a script edit's blocks make room (or close up) in this share of its time: a new block fades in after it, one going out fades out before it
    scriptAside: 1,   // a new script block slides in from this far to its right as it fades in, and a gone one slides out as far (in cells)
    scriptReshape: 0, // a C block whose inside grows or shrinks and can't morph (blockMorph) swaps to its new shape halfway through making room, crossfading over this share of it (0: at once)
  }
  // How a shape comes in or goes (the effect words; rendered by FRAMES in anim-render.js):
  //   applies  whether it works on a shape; when it doesn't, the shape fades, with the warning
  //            unless(noun) gives (noun: the shape's name, nounOf)
  //   quiet    plays no intro of its own on the first beat (see animation.js)
  //   internal not a word an author types: a cell a flyer brings in is there from the start
  //            (appear), one a flyer takes away goes at once (vanish)
  //   default  the one a shape gets when none is given (on its line or a defaults line)
  //   inTurn   a layout that types in turn (LAYOUTS: typeInTurn) brings its cells in one after another
  const isLine = (shape) => Boolean(SHAPES[shape.type]?.line)
  const ENTRANCES = {
    fade: { quiet: true, default: true },
    pop: {},
    draw: { applies: isLine, unless: (noun) => `"draw" only draws lines and arrows, so this ${noun} fades instead` },
    slide: { applies: (shape) => !isLine(shape), unless: (noun) => `"slide" doesn't move lines, so this ${noun} fades instead` },
    typed: { inTurn: true, applies: (shape) => Boolean(shape.label) && !SHAPES[shape.type]?.script, unless: (noun) => `"typed" types out a shape's text, so this ${noun} fades instead` },
    appear: { quiet: true, internal: true },
    vanish: { quiet: true, internal: true },
  }
  const EFFECTS = Object.keys(ENTRANCES).filter((name) => !ENTRANCES[name].internal)
  const DEFAULT_EFFECT = Object.keys(ENTRANCES).find((name) => ENTRANCES[name].default)
  // The entrance a shape really gets: its own, or a fade where that doesn't apply
  const entranceFor = (effect, shape) => (ENTRANCES[effect]?.applies?.(shape) === false ? 'fade' : effect)
  const LAYERS = { back: 0, normal: 1, front: 2 }
  // How an image fills its box (its SVG preserveAspectRatio): contain, all of it inside the box;
  // cover, filling the box, cropped to it (e.g. a backdrop of another shape than the grid)
  const IMAGE_FITS = { contain: 'xMidYMid meet', cover: 'xMidYMid slice' }
  const PLACEMENTS = ['above', 'below', 'left-of', 'right-of']
  const ALIGNS = { left: 'left', centre: 'centre', right: 'right' }
  // Angles: clockwise degrees from as drawn, which faces right (as sprites do). The direction words
  // for "angle", as degrees; a shape turns to one the short way (numberValue: turn)
  const DIRECTIONS = { right: 0, down: 90, left: 180, up: -90 }
  const FULL_TURN = 360
  const LINE_STYLES = ['solid', 'dashed', 'dotted']
  // Each pattern as a visible mark and gap, in multiples of the line's thickness (w):
  // dashed 3w:3w, dotted 1w:1w (a dot is a round cap as wide as the line)
  const PATTERNS = { dashed: { d: 4, g: 4 }, dotted: { d: 1, g: 1.5 } }
  const FLOWS = { flow: 'forward', 'flow-reverse': 'reverse', static: 'none' } // static: not flowing
  // Callout sides use the placement words (the bubble's side of the shape)
  const CALLOUT_SIDES = { above: 'above', below: 'below', 'left-of': 'left', 'right-of': 'right' }
  // The highlights (highlight <kind>), each on until "highlight clear". Drawn by OVERLAYS in
  // anim-render.js (glow and spotlight change the shape itself).
  //   off      its value when off (default false); valued: it takes a number ("number 5")
  //   next     a valued one given no number takes the next (number); bare: with none, it's just on
  //            (line); with neither, a number is needed
  //   applies  applies(shape, n): whether it fits a shape (n: its number, if it has one), with
  //            refuse(shape, n) the message when it doesn't
  //   check    check(shape, n): an error message when a valued one's number doesn't fit the shape
  const HIGHLIGHT_KINDS = {
    outline: { applies: (shape) => !isLine(shape), refuse: () => '"highlight outline" doesn\'t fit a line: try glow or signal' },
    inside: {
      applies: (shape) => Boolean(SHAPES[shape.type]?.inside),
      refuse: (shape) => {
        const types = Object.keys(SHAPES).filter((type) => SHAPES[type].inside && !SHAPES[type].internal)
        const what = isGroup(shape) ? shape.layout || GROUP : shape.type
        return `"highlight inside" needs a shape with an inside (${types.slice(0, -1).join(', ')} or ${types[types.length - 1]}), not ${article(what)} ${what}`
      },
    },
    // with no number, a band behind a shape's text, in the highlight colour (shapes with a band:
    // SHAPES); with one, a script's line (from 1): the block it starts stays lit and the others dim,
    // as outside a spotlight (a C block's inner blocks too)
    line: {
      valued: true, bare: true,
      applies: (shape, n) => Boolean(n == null ? SHAPES[shape.type]?.band : SHAPES[shape.type]?.script),
      refuse: (shape, n) => {
        if (n != null) return `"highlight line ${n}" lights a line of ${nounList(typesWhere((kind) => kind.script).map((type) => nounOf({ type })))}, e.g. "s: highlight line 2" (a code block's line: "c.2: highlight line")`
        const nouns = Object.keys(SHAPES).filter((type) => SHAPES[type].band).map((type) => `${article(nounOf({ type }))} ${nounOf({ type })}`)
        return `"highlight line" is for ${nouns.join(' or ')}, e.g. "c.2: highlight line" (a code block's line 2)`
      },
      check: (shape, n) => blockOnLine(scriptOf(shape), shape.label.split('\n'), n, shape.id, 'lit').problem || null,
    },
    spotlight: {},
    arrow: {},
    glow: {},
    number: { off: null, valued: true, next: true },
  }
  // The words after "highlight" (those that take a number are matched on their own: KEYWORDS)
  const HIGHLIGHTS = [...Object.keys(HIGHLIGHT_KINDS).filter((kind) => !HIGHLIGHT_KINDS[kind].valued), 'clear']
  const VALUED_HIGHLIGHTS = Object.keys(HIGHLIGHT_KINDS).filter((kind) => HIGHLIGHT_KINDS[kind].valued)
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
  //             'below' (image, icon: it adds to the shape's height), 'along' (lines) or 'script'
  //             (the label is the shape's script, drawn to fit its box: see script). A bar
  //             (BAR_DRAWS: label) can put it elsewhere: 'top' or 'right', inside that edge of the box
  //   inside    it has an inside to highlight (highlight inside)
  //   line      it runs from / to; head: it has an arrowhead; bends: it's bent through via points
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
  //   script    its label is a script, drawn by this SCRIPTS entry (label place 'script') and sized
  //             by it unless given a size (scriptSize). A change to it fades the old one out and
  //             the new one in, as a label does
  //   lines     its label can be given as "quoted" lines in [ ], where the label would go
  //   anchor    it's placed by a corner (ANCHORS), not its centre: at x,y puts that corner of its
  //             box at that corner of the cell, and it stays put as its size changes (centreShift)
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
      takes: [...BOXED_PROPS, 'size', 'width', 'height', 'stroke', 'linestyle', 'flow', 'fit'],
      defaults: { w: CELL, h: CELL, stroke: 'none' }, outline: 'box', label: 'below', inside: true, resource: true,
    },
    icon: {
      takes: [...BOXED_PROPS, 'size', 'width', 'height', 'stroke'],
      defaults: { w: CELL, h: CELL }, outline: 'box', label: 'below', inside: true, resource: true,
    },
    // a Scratch script (SCRIPTS: scratch), as big as it is (× its font) or fitted in the size given
    scratch: {
      takes: ['font', 'at', 'x', 'y', 'angle', 'scale', 'size', 'width', 'height'],
      defaults: { w: CELL, h: CELL }, outline: 'box', label: 'script', noun: 'scratch script', script: 'scratch', lines: true, anchor: 'top-left',
    },
    line: { takes: LINE_PROPS, label: 'along', line: true },
    arrow: { takes: LINE_PROPS, label: 'along', line: true, head: true },
    curve: { takes: LINE_PROPS, label: 'along', line: true, bends: true },
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
      internal: true, hug: true, owned: 'it goes round its cells, so to cover others, span it again, e.g. "s: span arr 2 4"',
    },
  }
  const typesWhere = (test) => Object.keys(SHAPES).filter((type) => test(SHAPES[type]))
  const SHAPE_TYPES = typesWhere((kind) => !kind.resource && !kind.internal) // written as a word after "id:"
  const RESOURCE_TYPES = typesWhere((kind) => kind.resource)
  const LINE_TYPES = typesWhere((kind) => kind.line)
  // A shape's name in messages: its noun, or its type
  const nounOf = (shape) => SHAPES[shape.type]?.noun || shape.type

  // How each kind of script (SHAPES: script) is drawn, by a library loaded when an animation has one
  // (animation.js). Until it has loaded, or if it can't, a script shows as plain text.
  //   library  its name in DocsifyUtils.loadLibrary
  //   ready    whether the library has loaded
  //   render   render(text): { svg, blocks }, an <svg> of the script (with its own width and height)
  //            and its blocks' elements in order, each with its own shape first
  //   syntax   which of its lines aren't blocks (skip), which start a C block (opens), divide one
  //            (middle) and end one (closes), and the indent of a C block's inside: scriptBlocksIn
  //            finds its blocks in the text with them, as render lists them, so compiling (lit
  //            lines, edits) never needs the library
  //   scale    its size beside the animation's text, as a multiple of the size it's drawn at
  const SCRIPTS = {
    scratch: {
      library: 'scratchblocks',
      ready: () => Boolean(window.scratchblocks?.render),
      render: (text) => {
        const lib = window.scratchblocks
        setUpScratch(lib)
        const view = lib.newView(lib.parse(text, { languages: ['en'] }), { style: 'scratch3' })
        const svg = view.render()
        svg.classList.add('scratchblocks-style-scratch3') // as scratchblocks.render does
        return { svg, blocks: scratchBlocks(view).map((block) => block.el) }
      },
      syntax: {
        skip: /^\s*(\/\/.*)?$/, // a blank line or a comment
        opens: /^\s*(forever|repeat\b.*|if\b.*\bthen)\s*$/i, // not "if on edge, bounce"
        middle: /^\s*else\s*$/i,
        closes: /^\s*end\s*$/i,
        indent: '    ',
      },
      scale: 1.5,
    },
  }
  // Once: scratchblocks' styles, and its blocks keep the element each draws (el), so a block can be
  // found in the drawing (its views keep only sizes). Drawing is unchanged.
  let scratchSetUp = false
  function setUpScratch(lib) {
    if (scratchSetUp) return
    scratchSetUp = true
    lib.appendStyles()
    const probe = lib.newView(lib.parse('move (1) steps'), { style: 'scratch3' }).scripts[0].blocks[0]
    const blockView = Object.getPrototypeOf(probe)
    const draw = blockView.draw
    blockView.draw = function (...args) { return (this.el = draw.apply(this, args)) }
  }
  // A scratchblocks view's blocks in order: each script's, and inside a C block, its scripts' (a
  // reporter in an input isn't one)
  const scratchBlocks = (view) => view.scripts.flatMap(function inScript(script) {
    return script.blocks.flatMap((block) => [block, ...(block.children || []).filter((child) => child.blocks).flatMap(inScript)])
  })
  const scriptOf = (shape) => SCRIPTS[kindOf(shape).script]
  // A script's blocks in its lines, in order (SCRIPTS: syntax): each { at, to }, the lines it takes
  // (a C block's go to its end; one with no end, to the last line)
  function scriptBlocksIn(script, lines) {
    const { skip, opens, middle, closes } = script.syntax
    const blocks = []
    const open = []
    lines.forEach((line, i) => {
      if (closes.test(line)) { const block = open.pop(); if (block) block.to = i; return }
      if (skip.test(line) || middle.test(line)) return
      const block = { at: i, to: i }
      blocks.push(block)
      if (opens.test(line)) open.push(block)
    })
    for (const block of open) block.to = lines.length - 1
    return blocks
  }
  // The block that starts on line n (from 1) of a script's lines, or why there's none: a message
  // naming the line (done: what it can't be, "lit")
  function blockOnLine(script, lines, n, id, done) {
    if (!Number.isInteger(n) || n < 1 || n > lines.length) return { problem: `"${id}" has ${lines.length} line${lines.length === 1 ? '' : 's'}, so there's no line ${n}` }
    const block = scriptBlocksIn(script, lines).find((b) => b.at === n - 1)
    return block ? { block } : { problem: `line ${n} of "${id}" isn't a block (it's blank, a comment, or a C block's else or end), so it can't be ${done}` }
  }
  // The libraries the scripts in some compiled beats need that haven't loaded
  const scriptLibraries = (beats) => [...new Set(beats.flatMap((beat) => [...beat.state.values()])
    .map(scriptOf).filter((script) => script && !script.ready()).map((script) => script.library))]

  // The parts a shape can have: shapes made and placed by it that go with it (shape.part, its
  // owner's id; shape.role, which of these). Each goes when its owner does, and is lit with it.
  //   outline  an outline round its owner goes round it too (highlight outline)
  //   bound    its owner lays it out and holds its members, so it can't be moved, deleted, grouped
  //            or edited on its own
  const PARTS = {
    name: { outline: true }, // a var's, layout's or span's name tag
    index: { outline: true }, // a layout's cell, row or column number
    view: { bound: true }, // a grid's row or column, or a table's heading (LAYOUTS: views)
    span: {}, // a box round some of a layout's places (SHAPES: span)
  }

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
  //   arrange     how its cells are arranged: 'line', one line of them, each place a number; or
  //               'grid', lines of them (see views), each place "row.column". Laid out and read
  //               by ARRANGE in anim-layout.js, and edited by EDITS in anim-edit.js
  //   index       where an index goes beside what it numbers: side, and gap (in cells)
  //   views       its values are rows, in [ ] ([[1 2] [3 4]]), laid out in a grid of cells: g.1.2 is
  //               row 1's cell 2. Its rows and columns are views: groups of its cells that don't own
  //               them (the grid does): row, its lines across; col, its columns. Each: layout, the
  //               layout it acts as; word, what goes before its number in its id (g.col.2; none:
  //               g.1, and the one an edit takes with no word); and index, where its indices go. A
  //               place in it is written "row.column" (span g 1.2 3.4).
  //   head        its first row is its headings, a view of its own (t.head; word, its id's last
  //               part), not counted with the rows (t.0 is the first row after it) or numbered;
  //               look, the props its cells start with
  const INDEX_BELOW = { side: 'below', gap: 0.1 }
  const INDEX_LEFT = { side: 'left-of', gap: 0.2 }
  const GRID_VIEWS = {
    row: { layout: 'row', index: INDEX_LEFT }, // numbered down the left, as a column's cells are
    col: { layout: 'column', word: 'col', index: INDEX_BELOW }, // numbered along the bottom, as a row's cells are
  }
  const LAYOUTS = {
    row: { noun: 'row', item: 'cell', cell: 'rect', across: true, base: 0, name: 'left-of', spanName: 'above', slide: true, slot: true, arrange: 'line', bow: 'own', index: INDEX_BELOW },
    column: { noun: 'column', item: 'cell', cell: 'rect', across: false, base: 0, name: 'above', spanName: 'right-of', slide: true, slot: true, arrange: 'line', bow: 'own', index: INDEX_LEFT },
    code: {
      noun: 'code block', item: 'line', cell: 'codeline', across: false, base: 1, name: 'above', spanName: 'right-of', lines: true, fit: true, typeInTurn: true,
      arrange: 'line', slide: false, slot: false, bow: 'cell', numbers: true, panel: { pad: 0.12, corner: 0.1 }, index: INDEX_LEFT,
    },
    grid: { noun: 'grid', item: 'cell', cell: 'rect', base: 0, name: 'above', spanName: 'above', arrange: 'grid', slide: true, slot: true, bow: 'own', views: GRID_VIEWS },
    table: {
      noun: 'table', item: 'cell', cell: 'rect', base: 0, name: 'above', spanName: 'above', arrange: 'grid', slide: true, slot: true, bow: 'own', views: GRID_VIEWS,
      head: { word: 'head', look: { bold: true } },
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
    layer: { field: 'layer', default: 'normal' },
    fit: { field: 'fit', default: 'contain' }, // an image's fit in its box (IMAGE_FITS)
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

  // Words as a list for messages, with "a" or "an" before the first: "a row, column or group"
  const nounList = (nouns) => `${article(nouns[0])} ${nouns.length > 1 ? `${nouns.slice(0, -1).join(', ')} or ` : ''}${nouns[nouns.length - 1]}`
  // The layouts' names: "a row, column, code block, grid or table"
  const LAYOUT_NAMES = LAYOUT_TYPES.map((layout) => LAYOUTS[layout].noun)
  const LAYOUT_NOUNS = nounList(LAYOUT_NAMES)
  // What [ ] can follow: the layouts, and shapes whose label is lines (SHAPES: lines)
  const BRACKET_NOUNS = nounList([...LAYOUT_NAMES, ...typesWhere((kind) => kind.lines).map((type) => nounOf({ type }))])

  // A group of shapes: a group, a layout, or a grid's row or column (it has no SHAPES entry, and
  // isn't drawn)
  const GROUP = 'group'
  const isGroup = (shape) => shape?.type === GROUP

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
  const at = { key: 'at', sigs: POINT, build: buildPoint, help: '"x,y", a shape id, or a placement and a shape id, e.g. "below a"' }
  const number = (key, help = 'a number') => ({ key, sigs: [['num']], help })
  const colour = (key) => ({ key, sigs: [['colour']], help: `a colour, e.g. blue, ${Object.keys(COLOUR_VARIANTS).map((variant) => `blue-${variant}`).join(', ')}, #f80 or none` })
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
    via: { ...at, key: 'via', repeat: true, help: '"x,y", a shape id, or a placement and a shape id, e.g. "via above b"' },
    gap: number('gap'),
    travel: { key: 'travel', list: [['num', 'num'], ['id']], build: buildPoint, help: 'shape ids and/or x,y points, e.g. "travel r1 r2 b"' },
    follow: { key: 'follow', sigs: [['id']], build: (v) => ({ ref: v[0], reverse: false }), help: 'a line or arrow id' },
    'follow-reverse': { key: 'follow', sigs: [['id']], build: (v) => ({ ref: v[0], reverse: true }), help: 'a line or arrow id', what: 'follow' },
    attach: { key: 'attach', sigs: [['placement', 'id'], ['id']], build: (v, sig) => (sig.length === 2 ? { side: v[0], ref: v[1] } : { side: 'centre', ref: v[0] }), help: 'a shape id, optionally after a side, e.g. "attach right-of a"' },
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
    angle: { key: 'angle', sigs: [['num'], ['direction']], help: `a number of degrees (clockwise, 0 = facing right, as drawn) or a direction: ${Object.keys(DIRECTIONS).join(', ')}` },
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
    ...words(Object.keys(IMAGE_FITS), 'fit', 'image fit'),
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
      key: 'highlight', list: [['valued', 'num'], ['valued'], ['highlight']],
      // one that takes a number: { kind: n }, n null when not given (number: the next in the sequence)
      build: (v, sig) => (sig[0] === 'valued' ? { [v[0]]: sig.length === 2 ? v[1].v : null } : v[0]),
      help: `${[...HIGHLIGHTS.slice(0, -1), ...VALUED_HIGHLIGHTS.map((kind) => `${kind} (N)`)].join(', ')} or clear (pulse, shake, wobble, bounce and a one-off glow go on their own)`,
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
  //   on       on(shape): a verb only on such a shape (elsewhere its word is read as usual)
  //   takesOut a row edit that takes cells out (remove), rather than putting them in (insert)
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
    remove: { verb: true, takesOut: true, takes: [...TIMING, 'keepStyle'] }, // a cell out of one
    assign: { takes: [...TIMING, 'keepStyle'], what: 'copying a value' }, // "v1: a.1"
    span: { // "s: span arr 0 2": a box round some of a row's / column's / code block's places
      verb: true, takes: [...SHAPES.span.takes, 'layer', 'highlight', 'callout', 'name', 'effect', ...TIMING],
      refuse: (word) => `"${word}" doesn't apply to a span: it's a box round its cells, for a fill, stroke, highlight, callout or name`,
    },
    // "s: line 3 "…"": a script's line, replaced (on a script only: elsewhere "line" makes a line)
    line: { verb: true, on: (shape) => Boolean(SHAPES[shape?.type]?.script), takes: TIMING },
    range: { // some of a row's / column's cells, "arr: range 0 3 fill red": how they look, not where they are
      verb: true, takes: [...CELL_STYLE, 'highlight', 'emphasis', 'callout', ...TIMING, 'stagger'],
      refuse: (word) => `"range" changes how cells look, so it doesn't go with "${word}"`,
    },
    layout: { // "arr: row [5 3 8] …" (a label is taken so its own message can say where values go)
      takes: ['label', 'at', 'x', 'y', 'gap', 'size', 'width', 'height', ...CELL_STYLE, 'layer', ...TIMING, 'stagger', 'effect', 'highlight', 'callout', 'name', 'indices'],
      refuse: (word) => `"${word}" doesn't apply to ${LAYOUT_NOUNS}`,
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
  const EDIT_WORDS = { end: 'end', into: 'into' }

  const RESERVED = new Set([
    ...SHAPE_TYPES, ...RESOURCE_TYPES, ...LAYOUT_TYPES, ...Object.keys(KEYWORDS), ...Object.keys(SPEEDS), ...LINE_STARTS, ...Object.keys(EDIT_WORDS), ...BAR_KINDS, 'pause', 'auto', 'defaults', 'camera',
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

  // The width of some text in the site's font, measured on a canvas and cached (falls back to an
  // estimate when it can't be measured, e.g. outside a browser). A canvas measures without laying
  // out the page, as reading an SVG text's length would. Each font (bold, mono) is resolved once
  // through a hidden SVG <text>, as a label would show it, and again after a theme change (some
  // themes change the font). Widths are cached at one size and scaled, so text whose size is
  // changing is measured once.
  const MONO_FONT = 'var(--font-family-mono)'
  const MEASURE_SIZE = 100 // px: the size widths are measured and cached at
  const textWidths = new Map() // font|text -> width at MEASURE_SIZE
  const fonts = new Map() // bold|mono -> canvas font
  let measurer = null // { text, ctx }
  function fontFor(bold, mono) {
    const key = `${bold ? 'b' : ''}|${mono ? 'm' : ''}`
    if (fonts.has(key)) return fonts.get(key)
    const { text } = measurer
    text.style.fontWeight = bold ? '700' : ''
    text.style.fontFamily = mono ? MONO_FONT : 'var(--font-family)'
    const style = getComputedStyle(text)
    const font = `${style.fontStyle} ${style.fontWeight} ${MEASURE_SIZE}px ${style.fontFamily}`
    fonts.set(key, font)
    return font
  }
  // `pre` keeps runs of spaces (a code line's indent), which other text collapses, as SVG does.
  function textWidth(text, size, bold = false, mono = false, pre = false) {
    if (!measurer && document.body) {
      const holder = svgEl('svg', { width: 0, height: 0, 'aria-hidden': 'true' })
      holder.style.cssText = 'position: absolute; left: -9999px; top: 0; visibility: hidden'
      const ctx = document.createElement('canvas').getContext?.('2d')
      if (ctx) measurer = { text: holder.appendChild(svgEl('text')), ctx }
      if (ctx) document.body.appendChild(holder)
    }
    const shown = pre ? text : text.replace(/\s+/g, ' ').trim()
    if (!measurer) return 0.55 * size * shown.length
    const font = fontFor(bold, mono)
    const key = `${font}|${shown}`
    if (!textWidths.has(key)) {
      measurer.ctx.font = font
      textWidths.set(key, measurer.ctx.measureText(shown).width)
    }
    return (textWidths.get(key) * size) / MEASURE_SIZE || 0.55 * size * shown.length
  }
  window.addEventListener?.('docsify-theme-change', () => fonts.clear())
  // text measured before its web font loaded (in a fallback font) is measured again once it has
  document.fonts?.addEventListener?.('loadingdone', () => textWidths.clear())

  // A shape's type entry (a group, or a point to place beside, has none: it's a plain box)
  const kindOf = (shape) => SHAPES[shape.type] || {}

  // A script shape's size at font 1 (SHAPES: script): the drawn script's own size × its scale, or,
  // before its library has loaded (or outside a browser), the size of its lines as plain text, in
  // the mono font with a margin round them (SCRIPT_TEXT: its font, × the normal font size, about
  // the size of a drawn script's text; its line height and margin, × its font). Cached by text.
  const SCRIPT_TEXT = { font: 0.6, height: 1.4, pad: 0.3 }
  const scriptSizes = new Map() // ready|kind|text -> { w, h }
  // A script's lines as plain text, at font 1 (drawn so by anim-render.js)
  function scriptTextSize(text) {
    const lines = text.split('\n')
    const size = SCRIPT_TEXT.font * FONT
    const pad = 2 * SCRIPT_TEXT.pad * size
    return { w: Math.max(...lines.map((line) => textWidth(line, size, false, true, true))) + pad, h: lines.length * SCRIPT_TEXT.height * size + pad }
  }
  function scriptSize(shape) {
    const script = scriptOf(shape)
    const ready = script.ready()
    const key = `${ready}|${kindOf(shape).script}|${shape.label}`
    if (!scriptSizes.has(key)) {
      let size
      if (ready) {
        const { svg } = script.render(shape.label)
        size = { w: +svg.getAttribute('width') * script.scale, h: +svg.getAttribute('height') * script.scale }
      } else size = scriptTextSize(shape.label)
      scriptSizes.set(key, size)
    }
    const { w, h } = scriptSizes.get(key)
    return { w: w * shape.font, h: h * shape.font }
  }
  document.fonts?.addEventListener?.('loadingdone', () => scriptSizes.clear()) // estimates, as textWidths

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

  // The edges a shape can be placed by: a corner (SHAPES: anchor), or for a shape that takes align,
  // a side (ALIGN_EDGES). Each says which side of its cell the box's edge is on (-1: left / top,
  // 1: right / bottom, 0: its middle on the cell's).
  const ANCHORS = { 'top-left': { x: -1, y: -1 } }
  const ALIGN_EDGES = { left: -1, centre: 0, right: 1 }
  const edgeOf = (shape) => ANCHORS[kindOf(shape).anchor] || (APPLIES.align.includes(shape.type) ? { x: ALIGN_EDGES[shape.align] ?? 0, y: 0 } : null)

  // How far a shape's box's centre is from the point it's placed by (its x, y): a row / column is
  // placed by its first cell (cx, cy: from there to its middle), and a shape placed by an edge
  // (edgeOf) by that edge of its cell; any other by its centre. Worked out from its size as it is,
  // so that edge stays put as its size changes.
  function centreShift(shape) {
    if (shape.cx !== undefined) return { x: shape.cx, y: shape.cy }
    const edge = edgeOf(shape)
    if (!edge?.x && !edge?.y) return { x: 0, y: 0 }
    const { hw, hh } = sized(shape)
    return { x: edge.x * (CELL / 2 - hw), y: edge.y * (CELL / 2 - hh) }
  }

  // Centre of a shape's box (centreShift from the point it's placed by)
  function boxCentre(shape) {
    const shift = centreShift(shape)
    return { x: shape.x + shift.x, y: shape.y + shift.y }
  }
  // The point a shape is placed by, for its box's centre to be at p
  function placeFor(shape, p) {
    const shift = centreShift(shape)
    return { x: p.x - shift.x, y: p.y - shift.y }
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
    // its box goes there: a row / column's first cell, or an aligned shape's side, is off-centre
    return placeFor(self, p)
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
    if (spec.side === 'centre') return placeFor(shape, boxCentre(ref))
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
    if (isGroup(shape) && depth < 8) {
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

  // The drawing's area: a fixed grid, or (grid="fit") the shapes' bounds, with a margin all round so
  // shapes on (or just over) its edge aren't against the frame. Cropped (the crop attribute): no
  // margin, as nothing outside the area is drawn (the widget clips to it).
  function viewBoxFor(gridAttr, beats, warnings, { crop = false } = {}) {
    const fixed = String(gridAttr || '').trim().toLowerCase().match(/^(\d+)\s*x\s*(\d+)$/)
    if (gridAttr && gridAttr !== 'fit' && !fixed) warnings.push(`grid="${gridAttr}" isn't "CxR" or "fit", so 16x9 is used`)
    const around = (box, margin) => ({ x: box.x0 - margin, y: box.y0 - margin, w: box.x1 - box.x0 + 2 * margin, h: box.y1 - box.y0 + 2 * margin })
    if (gridAttr !== 'fit') {
      const cols = fixed ? Math.max(1, +fixed[1]) : 16
      const rows = fixed ? Math.max(1, +fixed[2]) : 9
      return { ...around({ x0: 0, y0: 0, x1: cols * CELL, y1: rows * CELL }, crop ? 0 : GRID_MARGIN), cols, rows }
    }
    const box = mergeBoxes(beats.map(({ state }) => unionBounds([...state.values()], state)))
    if (!Number.isFinite(box.x0)) return { x: 0, y: 0, w: 16 * CELL, h: 9 * CELL, cols: 16, rows: 9 }
    return around(box, crop ? 0 : FIT_MARGIN)
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

  Object.assign(window.Anim, { SHAPES, kindOf, SCRIPTS, SCRIPT_TEXT, scriptOf, scriptBlocksIn, blockOnLine, scriptSize, scriptTextSize, scriptLibraries, BRACKET_NOUNS, ALIGNS, DIRECTIONS, FULL_TURN, APPLIES, BARS, BAR_KINDS, barFits, CALLOUT_CH, CALLOUT_SIDES, CAPTION_MS, CELL, CELL_STYLE, CHOREOGRAPHY, COLOURS, COLOUR_VARIANTS, FILL_MIXES, towardsBg, EASES, FLOWS,
    LAYOUTS, LAYOUT_NAMES, LAYOUT_NOUNS, nounList, GROUP, isGroup, DEFAULT_EFFECT, EDIT_WORDS, nounOf, XML_NS, FLOW_SPEED, FONT, HEAD, HIGHLIGHTS, HIGHLIGHT_KINDS, VALUED_HIGHLIGHTS, KEPT_STYLE, KEYWORDS, IMAGE_FITS, LAYERS, LAYOUT_TYPES, LERPED, LINES, LINE_STARTS, LINE_TYPES, listProps,
    LOOKS, NORMAL_MS, PARTS, TIMING, article, wordFor,
    PATTERNS, PLACEMENTS, PLACE_GAP, PLAIN_FILLS, PLAY_PAUSE, RESERVED, RESOURCE_TYPES, SHAPE_TYPES,
    EMPHASES, ENTRANCES, entranceFor, SPEEDS, STROKE, attachPos, besideOf, bounds, boxCentre, placeFor, edgeOf, offsetFrom, buildPath, buildPolyline, cellToPx, clamp01, ease, easeFn,
    escapeHtml, extents, lerp, linePoints, lucideIcon, measure, mergeBoxes, MONO_FONT, placeNextTo, pointAt, pointOnHops, pointOnPath, reducedMotion,
    resolveAttachments, resolveEnds, svgEl, textWidth, unionBounds, viewBoxFor, warnOutsideGrid })
})()
