/**
 * anim-compile.js - Part of the animation plugin (animation.js): compiling each beat's scene
 * lines into a snapshot of every shape, plus how each change animates (tweens) and the camera.
 */

;(function () {
  const { CELL, cellToPx, APPLIES, LINE_TYPES, resolveEnds, boxCentre, PLACE_GAP, placeBeside, placeAlong,
    attachPos, buildPolyline, buildPath, resolveAttachments, unionBounds, NORMAL_MS, parseProps,
    tokenize, bounds, ID, REF, canonicalRef, KNOWN_WORDS, RESOURCE_TYPES, SHAPE_TYPES, LAYOUT_TYPES, EMPHASES, ENTRANCES,
    entranceFor, parseAs, lucideIcon, KEYWORDS, NUMBER, linePoints, besideOf, offsetFrom, CELL_STYLE, STYLE, digitLooks, rotateAbout,
    LINES, wordFor, LOOKS, article, SHAPES, kindOf, HIGHLIGHT_KINDS, LAYOUTS, nounOf, PARTS, isGroup,
    DEFAULT_EFFECT, nounList, LAYOUT_NAMES, GROUP, LAYOUT_NOUNS, EDIT_WORDS, FULL_TURN, scriptSize, placeFor, isLoop,
    NUMBERINGS, DIRECTIONS, orList, roundBar, COLOUR_FUNCTIONS, fieldsOf, refPoint, LINE_ENDS, AXES, REPEATS, LERPED } = window.Anim

  // The ids of the shapes that go with a var, row or column: numbered places in [ ], named parts
  // after a dot. A row's / column's cells (id[0], id[1], …; a code block's lines from id[1]), their
  // numbers (NUMBERINGS: id.index[0], …) and the name (id.name). Cells are numbered from the
  // layout's base (LAYOUTS): `k` is a cell's number as written, and its place in the row is k - base.
  // A grid's / table's (LAYOUTS: views) rows and columns are named like a row's cells, after the
  // view's word if it has one (G[1], G.col[2]), and its heading T.head; their cells like a row's
  // (G[1][2], T.head[2]). Their indices take the same last parts (G.index[1], G.index.col[2]).
  // These are the ids as written (canonicalRef).
  const cellId = (id, k) => `${id}[${k}]`
  const viewKey = (view, k) => (view.word ? `.${view.word}[${k}]` : `[${k}]`)
  const markId = (id, numbering, key) => `${id}.${numbering.part}${typeof key === 'number' ? `[${key}]` : key}`
  const indexId = (id, k) => markId(id, NUMBERINGS.indices, k)
  const nameId = (id) => `${id}.name`
  const decimalId = (id) => `${id}.decimal` // a number's value, written out (LAYOUTS: decimal)
  const trailId = (id) => `${id}.trail` // where a shape has been (SHAPES: trail)
  const viewId = (id, view, k) => `${id}${viewKey(view, k)}`
  const headId = (id, head) => `${id}.${head.word}`
  const baseOf = (layout) => LAYOUTS[layout]?.base || 0
  const cellRange = (row, n) => (n ? `${cellId(row.id, baseOf(row.layout))} to ${cellId(row.id, baseOf(row.layout) + n - 1)}` : 'none')

  const pick = (props, keys) => Object.fromEntries(Object.entries(props).filter(([key]) => keys.includes(key)))

  // ---------------------------------------------------------------------------
  // Compiling scenes into one state per beat
  // ---------------------------------------------------------------------------

  function baseShape(type) {
    const shape = { type, label: '', stroke: 'fg', ink: 'fg', fill: 'none', weight: 1, font: 1, angle: 0, scale: 1, opacity: 1, bold: false, linestyle: 'solid', flow: 'none', layer: 'normal' }
    return Object.assign(shape, SHAPES[type]?.defaults)
  }

  // What a resource type does with the argument in its ( ): image(path), icon(name)
  const RESOURCES = {
    image: (shape, arg, context) => {
      if (!arg) throw new Error('image needs a path, e.g. image(_assets/goat.svg)')
      shape.src = context.assets.get(arg) || arg
    },
    icon: (shape, arg) => {
      if (!arg) throw new Error('icon needs a name, e.g. icon(laptop)')
      if (!lucideIcon(arg)) throw new Error(`no Lucide icon called "${arg}"`)
      shape.icon = arg
    },
  }

  // The one rule for numbers. The parser keeps a number's sign as `rel`; here a signed number is
  // relative to `current` (when there is one: changing a shape, the stop before, a line's end), and
  // anything else is absolute. `unit` scales cells (CELL) or leaves multipliers (1); `coord` makes
  // an absolute value a grid coordinate (the centre of that cell). `turn` (an angle's direction
  // word): absolute, but the way round nearest `current`, so a shape turns the short way to face it.
  function numberValue(n, current, { unit = 1, coord = false } = {}) {
    const known = current !== undefined && current !== null
    if (n.turn && known) return n.v * unit + FULL_TURN * Math.round((current - n.v * unit) / FULL_TURN)
    if (n.rel && known) return current + n.v * unit
    return coord ? cellToPx(n.v) : n.v * unit
  }

  function createCompiler(context) {
    const shapes = new Map() // id -> current shape
    const defaults = {} // changed in place: the compiler's parts share it
    let camera = { x: null, y: null, zoom: 1 } // centre in px (null: the drawing's centre)
    let uid = 0
    const newUid = () => ++uid
    let lastNumber = 0 // "highlight number": the last number given, so a bare one takes the next

    // A prop that doesn't apply to this shape's type is an error (with a hint where there's a
    // prop that does)
    const check = (shape, key, word = key) => {
      const hint = LOOKS[key]?.hints?.[shape.type]
      if (hint) throw new Error(hint)
      if (APPLIES[key] && !APPLIES[key].includes(shape.type)) throw new Error(`"${word}" doesn't apply to ${article(nounOf(shape))} ${nounOf(shape)}`)
      const round = LOOKS[key]?.side && roundBar(shape)
      if (round) throw new Error(`${article(round)} ${round} is round, so it takes one size (e.g. "size 2"), not "${word}"`)
    }

    // Applies a shape's look (size, then LOOKS): absolute when creating; on a change, a signed
    // number is relative to the current value. creating: false on a change; making a shape, the id
    // the line makes (a look can follow its value, though it isn't there yet: linkNumber), or true.
    function applyLook(shape, props, creating, warn) {
      const now = (value) => (creating ? undefined : value)
      const cells = (n, current) => numberValue(n, now(current), { unit: CELL })
      const setLooks = (early) => {
        for (const [key, look] of Object.entries(LOOKS)) {
          const value = props[key]
          if (value === undefined || Boolean(look.early) !== early) continue
          const word = wordFor(key, value)
          check(shape, key, word)
          if (look.quiet?.includes(shape.type)) warn(`"${word}" has no effect on ${shape.type}`)
          const problem = look.check?.(value, shape)
          if (problem) warn(problem)
          unlink(shape, key) // a look given again no longer follows any values
          if (value === 'reset') resetLook(shape, key)
          else if (COLOUR_FUNCTIONS[value?.fn]) linkColour(shape, key, value, warn, creating) // "rgb(R G B)"
          else if (value?.bind) linkNumber(shape, key, value, warn, creating) // "weight {V1}", "angle {V1 * 2}", "x V1" (once)
          else if (look.unit) for (const field of fieldsOf(look)) shape[field] = Math.min(look.max ?? Infinity, Math.max(look.min ?? -Infinity, numberValue(value, now(shape[field]), { unit: look.unit })))
          else shape[look.field] = look.map && value in look.map ? look.map[value] : value
          // a digit given a look no longer takes that look from its value
          if (value !== 'reset' && shape.auto?.includes(key)) shape.auto = shape.auto.filter((field) => field !== key)
        }
      }
      if (props.style) STYLE.forEach((key) => resetLook(shape, key))
      setLooks(true)
      // size: absolute, or one signed number on a change (both sides by that amount). A relative
      // pair (size +1x+0) isn't allowed: width / height change one side.
      if (props.size) {
        check(shape, 'size')
        const relative = !creating && (props.size.w.rel || props.size.h.rel)
        if (relative && !props.size.one) throw new Error('a relative size takes one number (e.g. "size +1"): use "width +1" / "height +1" to change one side')
        const round = roundBar(shape)
        if (round && !props.size.one) throw new Error(`${article(round)} ${round} takes one size`)
        shape.w = Math.max(0, cells(props.size.w, shape.w))
        shape.h = Math.max(0, cells(props.size.h, shape.h))
      }
      if (props.size && (props.width || props.height)) throw new Error('give either "size" or "width" / "height", not both')
      setLooks(false)
      // a round bar's shape is square, at its shorter side
      if (roundBar(shape)) shape.w = shape.h = Math.min(shape.w, shape.h)
      // flow only shows on a dashed or dotted line
      if (props.linestyle === 'solid' && shape.flow !== 'none' && !props.flow) warn('this line is still flowing, but flow only shows on a dashed or dotted line (add static to stop it)')
      if (props.flow && shape.flow !== 'none' && shape.linestyle === 'solid') warn(`"${props.flow}" only shows on a dashed or dotted line`)
    }

    // A grid coordinate (the centre of a cell), absolute, or relative to `current` when signed
    const coord = (n, current) => numberValue(n, current, { unit: CELL, coord: true })

    // Applies parsed props to a shape (a fresh one when creating, a copy when changing).
    // Returns the route it moves along (a curve through via points, travel's hops, a followed
    // line), or null for a straight move.
    // creating: as applyLook's (false, true, or the id the line makes)
    // round: which time round a repeated line this is (repeat: from 0)
    function applyProps(shape, props, creating, warn, meta, round = 0) {
      for (const ref of [props.at?.ref, props.from?.ref, props.to?.ref, props.attach?.ref, props.about?.ref, ...(props.via || []).map((v) => v.ref),
        ...(props.travel || []).map((v) => v.ref)]) {
        if (ref && LINE_TYPES.includes(shapes.get(ref).type)) throw new Error(`"${ref}" is a line, so it can't be used as a position`)
      }
      if (props.label !== undefined) {
        if (shape.digit) checkDigit(shape.digit, { label: props.label })
        shape.label = props.label
        if (shape.nil) shape.nil = false
        linkText(shape, warn, creating) // "Total: {V1}"
      }
      if (props.points) setPoints(shape, props.points) // before its look, so a size given with them stretches them
      // a turn about a point sets the angle itself (turnAbout), so it isn't a look here
      const turn = props.about ? turnOf(shape, props, creating) : null
      applyLook(shape, turn ? pick(props, Object.keys(props).filter((key) => key !== 'angle')) : props, creating, warn)
      if (kindOf(shape).script) fitScript(shape, props)
      // a script given new text has no map of where its blocks went (an edit gives one: editScript)
      if (kindOf(shape).script && props.label !== undefined && meta) tween(meta, shape.uid).script = null
      if (props.highlight) applyHighlight(shape, props.highlight)
      if (props.emphasis) applyEmphasis(shape, props, creating, warn, meta)
      if (props.callout) shape.callout = props.callout.none ? null : { text: props.callout.text, side: props.callout.side }
      const route = LINE_TYPES.includes(shape.type) ? placeLine(shape, props, creating, warn) : placeShape(shape, props, creating, warn)
      if (turn) turnAbout(shape, turn, props, meta, false, round)
      return route
    }

    // "A: angle +90 about 5,5": how far a shape turns (by, in degrees: an absolute angle turns it
    // by the difference, as a direction word turns it the short way) and the point it turns about
    // (a shape's centre, or a point: signed, from the shape's own centre, or a line's start)
    function turnOf(shape, props, creating) {
      const example = `e.g. "${shape.id}: angle +90 about 5,5"`
      if (creating) throw new Error(`"about" turns a shape that's already there, ${example}`)
      if (!props.angle) throw new Error(`"about" goes with an angle, ${example}`)
      if (props.angle.bind) throw new Error(`"about" turns by a number of degrees, not one that follows values, ${example}`)
      const layout = LAYOUTS[shape.layout]
      if (layout) throw new Error(`${article(layout.noun)} ${layout.noun} can't be turned`)
      if (props.at || props.x || props.y || props.via || props.travel || props.follow || props.attach || props.from || props.to) {
        throw new Error('"about" sets the route, so it can\'t go with at / move / x / y / via / travel / follow / attach / from / to')
      }
      const by = numberValue(props.angle, shape.angle) - shape.angle
      const { about } = props
      const own = LINE_TYPES.includes(shape.type) ? resolveEnds(shape, shapes).from : boxCentre(shape)
      const pivot = about.kind === 'ref' ? refPoint(about, shapes) : { x: coord(about.x, own.x), y: coord(about.y, own.y) }
      return { by, pivot }
    }

    // Turns a shape rigidly by `by` degrees about the pivot: a boxed shape goes round it and turns
    // with it; a line's free ends and via points go round it (those on shapes stay on them); a
    // group's members all turn as one (carried: the turn is its group's). Each records the turn,
    // so it plays as an arc, not a straight move; a repeated line's later rounds (round) add to it.
    function turnAbout(shape, { by, pivot }, props, meta, carried = false, round = 0) {
      const turned = (p) => rotateAbout(p, pivot, by)
      if (LINE_TYPES.includes(shape.type)) {
        const free = [shape.from, shape.to, ...(shape.via || [])].some((p) => !p.ref)
        if (!free && !carried) throw new Error(`"${shape.id}" has its ends on shapes, so it turns with them: turn the shapes`)
        for (const key of Object.keys(LINE_ENDS)) if (!shape[key].ref) shape[key] = turned(shape[key])
        if (shape.via) shape.via = shape.via.map((p) => (p.ref ? p : turned(p)))
      } else if (shape.attach?.kind === 'offset' && carried) {
        // a member rides on its group at its offset, which turns with it
        const offset = rotateAbout({ x: shape.attach.dx, y: shape.attach.dy }, null, by)
        shape.attach = { ...shape.attach, dx: offset.x, dy: offset.y }
      } else {
        Object.assign(shape, placeFor(shape, turned(boxCentre(shape))))
      }
      shape.angle += by
      const record = tween(meta, shape.uid)
      const earlier = round && record.turn // this line's turn so far (its pivot is fixed: checkRepeat)
      Object.assign(record, { path: null, turn: { pivot, by: (earlier ? earlier.by : 0) + by, carried } })
      if (!isGroup(shape)) return
      for (const id of shape.members) {
        const member = shapes.get(id)
        if (!member) continue
        const changed = structuredClone(member)
        turnAbout(changed, { by, pivot }, props, meta, true, round)
        shapes.set(id, changed)
        schedule(meta, changed.uid, props)
      }
    }

    // highlight: each kind (HIGHLIGHT_KINDS) stays until clear. One that takes a number is
    // { kind: n }: with no number, "number" takes the next (next); the others need one. A script's
    // lit line is { line: n } too (runScriptLine).
    function applyHighlight(shape, items) {
      const none = Object.fromEntries(Object.entries(HIGHLIGHT_KINDS).map(([kind, h]) => [kind, 'off' in h ? h.off : false]))
      const hl = { ...none, ...shape.hl }
      for (const item of items) {
        const name = typeof item === 'object' ? Object.keys(item)[0] : item
        const n = typeof item === 'object' ? item[name] : null
        const kind = HIGHLIGHT_KINDS[name]
        if (kind?.applies && !kind.applies(shape, n)) throw new Error(kind.refuse(shape, n))
        if (item === 'clear') Object.assign(hl, none)
        else if (typeof item === 'object') hl[name] = valuedHighlight(shape, name, n)
        else hl[item] = true
      }
      shape.hl = hl
    }
    function valuedHighlight(shape, name, n) {
      const kind = HIGHLIGHT_KINDS[name]
      if (n === null && !kind.next) throw new Error(`"highlight ${name}" needs a number, e.g. "${shape.id}: highlight ${name} 2"`)
      if (n === null) n = lastNumber + 1
      const problem = kind.check?.(shape, n)
      if (problem) throw new Error(problem)
      if (kind.next) lastNumber = n
      return n
    }

    // pulse / shake / wobble / bounce / glow: one-off effects this beat, on an existing shape (and
    // a group's members, and the shapes it covers: a span's cells). signal / signal-reverse: a blip
    // along a line (a group's lines).
    function applyEmphasis(shape, props, creating, warn, meta) {
      const signal = EMPHASES[props.emphasis].along
      if (signal && !LINE_TYPES.includes(shape.type) && !isGroup(shape)) throw new Error(`"${props.emphasis}" travels along a line, arrow or curve`)
      const covered = (shape.covers || []).map((id) => shapes.get(id)).filter(Boolean)
      // a grid's row or column covers its members too, so each is taken once
      const targets = [...new Set([shape, ...groupMembers(shape), ...covered])].filter((target) => !signal || LINE_TYPES.includes(target.type))
      if (creating) warn(`"${props.emphasis}" plays on a shape that already exists, so it does nothing here`)
      else if (!targets.length) warn(`"${shape.id}" has no lines in it, so "${props.emphasis}" does nothing`)
      else {
        for (const target of targets) schedule(meta, target.uid, props).effect = props.emphasis // a group's members (a span's cells) play it too
      }
    }

    // A point of a line kept on a shape, which it follows: its centre, or the point on its edge an
    // anchor names (A.top)
    const onShape = (p) => ({ ref: p.ref, ...(p.anchor ? { anchor: p.anchor } : {}) })

    // A line's ends (from / to, or the whole line shifted by a relative move) and its via points
    // (a curve's bends, a line's corners). A line has no route of its own, so this returns null.
    function placeLine(shape, props, creating, warn) {
      const owned = kindOf(shape).owned
      if (owned && (props.at || props.from || props.to || props.via || props.bend)) throw new Error(`${article(nounOf(shape))} ${nounOf(shape)} can't be moved: ${owned}`)
      if (props.angle && !props.about && !kindOf(shape).loop) throw new Error(`a line's angle turns it about a point, e.g. "${shape.id}: angle +90 about 5,5" (a loop's angle is a curve's)`)
      if (props.travel || props.follow || props.attach) throw new Error('a line has no single position, so it can\'t travel, follow or attach (its ends can follow shapes)')
      if (props.x || props.y || props.at?.kind === 'ref') throw new Error('a line has no single position: use from / to, or "move +x,+y" to shift it')
      if (props.at) {
        if (!props.at.x.rel || !props.at.y.rel || creating) throw new Error('a line has no single position: use from / to, or "move +x,+y" to shift it')
        const ends = resolveEnds(shape, shapes)
        shape.from = { x: coord(props.at.x, ends.from.x), y: coord(props.at.y, ends.from.y) }
        shape.to = { x: coord(props.at.x, ends.to.x), y: coord(props.at.y, ends.to.y) }
        // its free via points move with it (vias on shapes stay on them)
        if (shape.via) shape.via = shape.via.map((p) => (p.ref ? p : { x: coord(props.at.x, p.x), y: coord(props.at.y, p.y) }))
      }
      for (const key of Object.keys(LINE_ENDS)) {
        const end = props[key]
        if (!end) continue
        if (end.kind === 'ref') { shape[key] = onShape(end); continue }
        const current = creating ? undefined : resolveEnds(shape, shapes)[key]
        shape[key] = { x: coord(end.x, current?.x), y: coord(end.y, current?.y) }
      }
      if (creating && (!shape.from || !shape.to)) throw new Error(`${article(nounOf(shape))} ${nounOf(shape)} needs both ends, e.g. "from 2,3 to 7,8" or "from A to B"`)
      if (props.via && props.bend) throw new Error('give either "via" or "bend", not both: a curve bends through its via points, or by its bend when it has none')
      if (props.bend) shape.via = null // bends by its bend from now on
      if (props.via) {
        // Via points (replacing any it had): a shape id (or a point on its edge) stays on that shape
        // where it is now, and a signed number is relative to the point before.
        const ends = resolveEnds({ ...shape, via: [] }, shapes)
        let prev = ends.from
        shape.via = props.via.map((via) => {
          let p
          if (via.kind === 'ref') { p = onShape(via); prev = refPoint(via, shapes); return p }
          p = { x: coord(via.x, prev.x), y: coord(via.y, prev.y) }
          prev = p
          return { x: p.x, y: p.y }
        })
      }
      const loops = isLoop(shape)
      if (creating && kindOf(shape).bends && !shape.via?.length && !loops && !props.bend) warn('a curve with no "via" points or "bend" is a straight line')
      if (props.bend && loops) warn('"bend" has no effect on a loop: its angle and size shape it')
      if (kindOf(shape).loop?.props.some((key) => props[key]) && !loops) {
        warn('angle and size shape a loop: a curve from a shape to itself with no "via" points, e.g. "curve from A to A angle up"')
      }
      return null
    }

    // A boxed shape's place: where it goes (at, x, y), what it's attached to, and the route it
    // takes there (travel, follow, via), which it returns.
    function placeShape(shape, props, creating, warn) {
      checkMove(shape, props, creating)
      const start = { x: shape.x, y: shape.y }
      setPosition(shape, props, creating, warn)
      if (props.attach || props.detach || (props.gap && shape.attach?.kind === 'beside')) attachShape(shape, props, warn) // "Lock: gap 0": a new gap
      else if (props.gap && props.at?.kind !== 'ref' && !props.via?.some((via) => via.anchor)) warn('"gap" goes with a point on a shape\'s edge ("at B.right gap 0.5", "via B.top gap 0.5") or an attached shape, so it does nothing here')
      if (creating && (shape.x === undefined || shape.y === undefined)) throw new Error('needs a position, e.g. "at 3,2"')
      const route = routeOf(shape, props, start)
      keepOffset(shape, props)
      return route
    }

    // The ways a shape is moved that can't go together, or can't be used on it
    function checkMove(shape, props, creating) {
      const positioned = props.at || props.x || props.y
      // a shape placed by what it belongs to (SHAPES: owned), or a grid's row or column (a view),
      // laid out in its grid, can't be moved on its own
      const owned = kindOf(shape).owned
      if ((owned || bound(shape)) && (positioned || props.via || props.travel || props.follow || props.attach || props.detach || props.about)) {
        throw new Error(bound(shape) ? `"${shape.id}" is laid out in "${shape.part}", so it can't be moved on its own: move "${shape.part}"`
          : `${article(nounOf(shape))} ${nounOf(shape)} can't be moved: ${owned}`)
      }
      if (props.travel && props.follow) throw new Error('give either "travel" or "follow", not both')
      if ((props.travel || props.follow) && (positioned || props.via)) throw new Error('"travel" and "follow" set the route, so they can\'t go with at / move / x / y / via')
      if ((props.travel || props.follow) && creating) throw new Error('"travel" and "follow" only work when moving an existing shape')
      if (props.attach && (positioned || props.via || props.travel || props.follow)) throw new Error('"attach" sets the position, so it can\'t go with a move')
      if (props.via && creating) throw new Error('"via" only works when moving an existing shape')
      if (props.via && !props.at && !props.x && !props.y) throw new Error('"via" needs a move too, e.g. "move 9,3 via 5,1"')
    }

    // at / x / y: a point, a shape's centre, or beside a shape (relative values need something to
    // be relative to: never when creating)
    function setPosition(shape, props, creating, warn) {
      const now = (value) => (creating ? undefined : value)
      const { at } = props
      // a new place no longer follows values; "x V1": x (or y) follows one (KEYWORDS: bound)
      const placed = at || props.travel || props.follow || props.attach || props.about
      for (const axis of AXES) if (placed || props[axis]) unlink(shape, axis)
      for (const axis of AXES) if (props[axis]?.bind) linkNumber(shape, axis, props[axis], warn, creating)
      if (at?.kind === 'abs') { shape.x = coord(at.x, now(shape.x)); shape.y = coord(at.y, now(shape.y)) }
      // "at B.right": on that point; with a gap, beside that side or corner ("at B.right gap 0.5")
      if (at?.kind === 'ref' && props.gap?.v !== undefined) {
        if (!at.anchor) throw new Error(`"gap" puts a shape beside a side or corner of "${at.ref}", e.g. "at ${at.ref}.right gap 0.5"`)
        Object.assign(shape, placeBeside(shape, shapes.get(at.ref), at.anchor, props.gap.v * CELL))
      } else if (at?.kind === 'ref') Object.assign(shape, placeFor(shape, refPoint(at, shapes)))
      if (props.x && !props.x.bind) shape.x = coord(props.x, now(shape.x))
      if (props.y && !props.y.bind) shape.y = coord(props.y, now(shape.y))
    }

    // attach (beside or on top of another shape) / detach
    function attachShape(shape, props, warn) {
      if (props.attach) {
        if (props.attach.ref === shape.id) throw new Error('a shape can\'t attach to itself')
        leaveGroup(shape)
        const gap = props.gap?.v !== undefined ? props.gap.v * CELL : null
        if (gap !== null && !props.attach.anchor) throw new Error(`"gap" puts a shape beside a side or corner of "${props.attach.ref}", e.g. "attach ${props.attach.ref}.right gap 0.5"`)
        shape.attach = besideOf(props.attach.ref, props.attach.anchor, gap)
        Object.assign(shape, attachPos(shape, shapes.get(props.attach.ref), shape.attach))
      } else if (props.gap && shape.attach?.kind === 'beside') {
        // "Lock: gap 0.5" / "Lock: gap clear": further beside, or back on the point
        const { ref, anchor } = shape.attach
        if (!anchor && !props.gap.none) throw new Error(`"gap" puts a shape beside a side or corner of "${ref}", e.g. "attach ${ref}.right gap 0.5"`)
        shape.attach = besideOf(ref, anchor, props.gap.none ? null : props.gap.v * CELL)
        Object.assign(shape, attachPos(shape, shapes.get(ref), shape.attach))
      }
      if (props.detach) {
        if (!shape.attach) warn('this shape isn\'t attached or in a group, so "detach" does nothing')
        leaveGroup(shape)
        shape.attach = null
      }
    }

    // The route a moving shape takes from `start`, ending where it now is (travel and follow set
    // that): travel's hops (a signed stop is relative to the one before), along a followed line, or
    // a curve through via points (signed: relative to where it starts). Null for a straight move.
    // Its points are where it's placed by: its box goes through a shape's centre, or along a line.
    function routeOf(shape, props, start) {
      const onto = (p) => placeFor(shape, p)
      if (props.travel) {
        const points = [start]
        for (const stop of props.travel) {
          const prev = points[points.length - 1]
          points.push(stop.kind === 'ref' ? onto(refPoint(stop, shapes)) : { x: coord(stop.x, prev.x), y: coord(stop.y, prev.y) })
        }
        Object.assign(shape, points[points.length - 1])
        const path = buildPolyline(points)
        path.hops = points // eased hop by hop at playback (pointOnHops)
        return path
      }
      if (props.follow) {
        const line = shapes.get(props.follow.ref)
        if (!LINE_TYPES.includes(line.type)) throw new Error(`"${props.follow.ref}" isn't a line or arrow, so it can't be followed`)
        // along the line (a curve's whole path), from the end it starts at
        const along = linePoints(resolveEnds(line, shapes)).map(onto)
        if (props.follow.reverse) along.reverse()
        // The line stops short of a shape at its far end, so finish on that shape's centre (as
        // the route starts from wherever the shape is); one on a point of its edge ends there
        const farEnd = props.follow.reverse ? line.from : line.to
        if (farEnd?.ref && !farEnd.anchor && shapes.has(farEnd.ref)) along.push(onto(boxCentre(shapes.get(farEnd.ref))))
        Object.assign(shape, along[along.length - 1])
        return buildPolyline([start, ...along])
      }
      if (!props.via) return null
      const vias = props.via.map((via) => {
        // "via B.bottom gap 0.25": beside that side or corner, as a gap puts every edge point on the line
        if (via.kind === 'ref' && via.anchor && props.gap?.v !== undefined) return placeBeside(shape, shapes.get(via.ref), via.anchor, props.gap.v * CELL)
        if (via.kind === 'ref') return onto(refPoint(via, shapes))
        return { x: coord(via.x, start.x), y: coord(via.y, start.y) }
      })
      return buildPath([start, ...vias, { x: shape.x, y: shape.y }])
    }

    // Moving an attached shape releases it; moving a group member keeps it in the group (at its
    // new place in it)
    function keepOffset(shape, props) {
      const moved = props.at || props.x || props.y || props.via || props.travel || props.follow || props.about
      if (!moved || !shape.attach || props.attach) return
      if (shape.attach.kind !== 'offset') { shape.attach = null; return }
      offsetInGroup(shape)
    }
    // A group member's offset from its group, as it is now
    function offsetInGroup(shape) {
      const parent = shapes.get(shape.attach.ref)
      shape.attach.dx = shape.x - parent.x
      shape.attach.dy = shape.y - parent.y
    }

    // "fill reset" / "style reset": a look (STYLE) back to how the shape started (its type's look,
    // with the defaults when it was made: applyDefaults). A digit takes it from its value again.
    function resetLook(shape, key) {
      unlink(shape, key)
      shape[key] = (shape.start || baseShape(shape.type))[key]
      if (shape.auto) shape.auto = digitLooks(shape.digit).filter((field) => field === key || shape.auto.includes(field))
    }

    // Gives a new shape the default look (defaults …) that applies to its type, as if written on
    // its line. The line's timing defaults (speed, effect, ease, stagger, keep-style) are read
    // where they're used.
    function applyDefaults(shape) {
      const fits = (key) => !APPLIES[key] || APPLIES[key].includes(shape.type)
      const look = pick(defaults, ['size', ...Object.keys(LOOKS)].filter(fits))
      if (roundBar(shape, look.bar ?? shape.bar)) { // a round bar takes one size
        if (look.size && !look.size.one) delete look.size
        for (const key of Object.keys(look)) if (LOOKS[key]?.side) delete look[key]
      }
      applyLook(shape, look, true, () => {})
      shape.start = pick(shape, STYLE)
    }

    // "highlight number" with no value on a row, column or group numbers its shapes in turn rather
    // than the group itself. Takes it out of props; true if there was one.
    function takeBareNumber(props) {
      if (!props.highlight?.some((item) => item?.number === null)) return false
      props.highlight = props.highlight.filter((item) => item?.number !== null)
      if (!props.highlight.length) delete props.highlight
      return true
    }

    // Numbers each of a group's direct members (not lines: they number the shapes they join), in
    // order. Changed in place: past beats are snapshots.
    function numberEach(members, props, meta, warn) {
      for (const member of members) {
        if (!member || LINE_TYPES.includes(member.type)) continue
        applyProps(member, { highlight: [{ number: null }] }, false, warn, meta)
        schedule(meta, member.uid, props)
      }
    }

    // A group's members (recursively), as shapes.
    function groupMembers(shape) {
      if (!isGroup(shape)) return []
      return shape.members.flatMap((id) => { const m = shapes.get(id); return m ? [m, ...groupMembers(m)] : [] })
    }

    // What a line's shape comes in (or goes) with, and its layer: given, a default, or the usual
    const effectOf = (props) => props.effect || defaults.effect || DEFAULT_EFFECT
    const layerOf = (props) => props.layer || defaults.layer || LOOKS.layer.default
    // Whether a layout that types in turn does here (ENTRANCES: inTurn)
    const inTurn = (props) => Boolean(ENTRANCES[props.effect || defaults.effect]?.inTurn)
    // Messages given in many places
    const noShape = (id) => new Error(`no shape called "${id}"`)
    // A script shape (SHAPES: script) is as big as its script, unless it's been given a size (then
    // its script is fitted in that). Before placing it, so a placement beside it fits round it.
    function fitScript(shape, props) {
      if (props.size || props.width || props.height) shape.sized = true
      if (!shape.sized) Object.assign(shape, scriptSize(shape))
    }

    // A line's props, read from tokens[i]. A shape whose label is lines (SHAPES: lines) can have
    // them in [ ] where its label would go: "S: scratch [ "…" "…" ] at 2,1", "S: [ "…" ]". making: the id
    // of the shape the line makes, if it makes one (parseProps)
    function propsOf(type, tokens, i, kind, making) {
      // a polygon's points: straight after its type, or alone on a change ("P: [ … ]")
      if (SHAPES[type]?.points && (making || tokens[i]?.kind === 'bracket')) {
        const { points, next } = readPoints(tokens, i, type)
        return { ...parseProps(tokens, next, kind, shapes, making), points }
      }
      if (!SHAPES[type]?.lines || tokens[i]?.kind !== 'bracket' || tokens[i].value !== '[') return parseProps(tokens, i, kind, shapes, making)
      const noun = nounOf({ type })
      const example = `e.g. "${type} ["…" "…"] at 2,1"`
      const { values, next } = readLines(tokens, i, { noun, item: 'line', example })
      const props = parseProps(tokens, next, kind, shapes, making)
      if (props.label !== undefined) throw new Error(`a ${noun} takes one "quoted" line, or its lines in [ ], ${example}`)
      props.label = values.join('\n')
      return props
    }

    const MIN_POINTS = 3 // the fewest a polygon has
    // A polygon's points (SHAPES: points) in [ ] from tokens[i]: pairs of numbers, offsets in cells
    // from where it's placed ("[0,-1 1,1 -1,1]", commas optional), at least three. Returns them as
    // { x, y } and the token after the "]".
    function readPoints(tokens, i, type) {
      const example = `e.g. "P: ${type} [0,-1 1,1 -1,1] at 5,4"`
      if (tokens[i]?.kind !== 'bracket' || tokens[i].value !== '[') throw new Error(`${article(type)} ${type}'s points go in [ ] straight after "${type}", ${example}`)
      const numbers = []
      let j = i + 1
      for (; j < tokens.length && tokens[j].kind !== 'bracket'; j++) {
        if (tokens[j].kind !== 'word' || !NUMBER.test(tokens[j].value)) throw new Error(`${article(type)} ${type}'s points are x,y numbers, not "${tokens[j].value ?? tokens[j].name}" (is a "]" missing?)`)
        numbers.push(parseFloat(tokens[j].value))
      }
      if (tokens[j]?.value !== ']') throw new Error(`the "[" of ${article(type)} ${type}'s points has no closing "]"`)
      if (numbers.length % 2) throw new Error(`${article(type)} ${type}'s points are x,y pairs, and ${numbers.length} numbers isn't pairs, ${example}`)
      if (numbers.length < 2 * MIN_POINTS) throw new Error(`${article(type)} ${type} needs at least ${MIN_POINTS} points, ${example}`)
      const points = []
      for (let k = 0; k < numbers.length; k += 2) points.push({ x: numbers[k], y: numbers[k + 1] })
      return { points, next: j + 1 }
    }
    // Gives a polygon its points (in cells, from where it's placed): its box goes round them, each
    // kept as its share across the box (u, v: -0.5 to 0.5), so a size stretches them; it's placed
    // by their 0,0 (cx, cy: from there to the box's middle).
    function setPoints(shape, points) {
      const xs = points.map((p) => p.x * CELL)
      const ys = points.map((p) => p.y * CELL)
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
      const [w, h] = [x1 - x0, y1 - y0]
      Object.assign(shape, { w, h, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 })
      shape.points = points.map((p, k) => ({ u: w ? (xs[k] - shape.cx) / w : 0, v: h ? (ys[k] - shape.cy) / h : 0 }))
    }

    const notAnId = (id) => new Error(`"${id}" isn't an id: an id starts with a capital letter, then letters, digits, _ or -`)
    const replaced = (id, warn) => warn(`"${id}" already exists, so it is replaced`)
    // "a row, column, code block, grid, table or group": what stagger works on
    const GROUPS = nounList([...LAYOUT_NAMES, GROUP])

    // Parts that go with their owner itself (PARTS: follows): when an edit has given the owner
    // another id, each such part takes its owner's new id in place of the old at the front of its
    // own (all at once, as two swapped cells trade ids). An owner replaced (a new uid) is found by
    // the id instead, and followed from then on.
    function followOwners() {
      const byUid = new Map([...shapes.values()].map((shape) => [shape.uid, shape]))
      const followers = [...shapes.values()].filter((shape) => PARTS[shape.role]?.follows)
      for (const part of followers) if (!byUid.has(part.owner) && shapes.has(part.part)) part.owner = shapes.get(part.part).uid
      const moving = followers.filter((part) => byUid.has(part.owner) && byUid.get(part.owner).id !== part.part)
      for (const part of moving) shapes.delete(part.id)
      for (const part of moving) {
        const owner = byUid.get(part.owner)
        part.id = owner.id + part.id.slice(part.part.length)
        part.part = owner.id
        shapes.set(part.id, part)
      }
    }

    // A shape's parts (PARTS), or those of one role
    const partsOf = (owner, role) => [...shapes.values()].filter((s) => s.part === owner.id && (!role || s.role === role))
    // Whether a shape is a part its owner lays out and holds the members of (PARTS: bound)
    const bound = (shape) => Boolean(PARTS[shape.role]?.bound)

    // Takes a shape out of the group it's in (if any).
    function leaveGroup(shape) {
      if (shape.attach?.kind !== 'offset') return
      const parent = shapes.get(shape.attach.ref)
      if (parent?.members) parent.members = parent.members.filter((id) => id !== shape.id)
      shape.attach = null
    }

    // After every line: colours worked out from values follow them, put attached shapes and group
    // members where their refs now are (several passes, for chains), and fit each group's box
    // round its members.
    function settle(meta, warn) {
      followOwners()
      fitCode(meta)
      fitSpans(meta)
      fitNumbers(meta)
      fitLinks(meta, warn)
      for (const shape of shapes.values()) if (shape.attach && !shapes.has(shape.attach.ref)) shape.attach = null
      resolveAttachments(shapes)
      for (const group of shapes.values()) {
        if (!isGroup(group)) continue
        // a row / column emptied by remove: nothing, at its first cell's place
        if (!group.members.length) { if (group.layout) Object.assign(group, { w: 0, h: 0, cx: 0, cy: 0 }); continue }
        const members = group.members.map((id) => shapes.get(id)).filter(Boolean)
        // a layout with a panel (LAYOUTS) takes its indices in too: the panel goes behind them
        const panel = LAYOUTS[group.layout]?.panel
        const indices = panel ? partsOf(group, 'index') : []
        if (!boxStale(group, [...members, ...indices], meta)) continue
        const b = unionBounds([...members, ...indices], shapes)
        if (group.layout) {
          // a row / column is placed by its first cell: its box is its cells' (cx, cy: to its middle)
          const before = [group.w, group.h, group.cx, group.cy].join()
          Object.assign(group, { w: b.x1 - b.x0, h: b.y1 - b.y0, cx: (b.x0 + b.x1) / 2 - group.x, cy: (b.y0 + b.y1) / 2 - group.y })
          // its panel grows and shrinks with it, in the time its cells take
          if (panel && meta && [group.w, group.h, group.cx, group.cy].join() !== before) retime(meta, group.uid, busiest(meta, members))
        } else {
          group.w = 2 * Math.max(group.x - b.x0, b.x1 - group.x)
          group.h = 2 * Math.max(group.y - b.y0, b.y1 - group.y)
        }
        boxedFrom.set(group, { ids: group.members.join(' '), at: stampNow() })
      }
    }

    // A group's box is worked out from its shapes after every line (settle), but only needs working
    // out again when they could have changed: its members aren't the ones it was worked out from
    // (boxedFrom: their ids), or it, a shape in it (in a group in it too), or a shape a line in it
    // has an end on has changed since (every change goes through a tween record: stampOf)
    const boxedFrom = new WeakMap() // group -> { ids: its member ids, at: when }, as its box was worked out
    function boxStale(group, inside, meta) {
      const done = boxedFrom.get(group)
      if (done?.ids !== group.members.join(' ')) return true
      const changed = (shape) => stampOf(meta, shape.uid) > done.at
      const endsOf = (line) => [line.from, line.to, ...(line.via || [])].map((p) => p?.ref && shapes.get(p.ref)).filter(Boolean)
      return [group, ...inside.flatMap((m) => [m, ...groupMembers(m)])]
        .some((shape) => changed(shape) || (LINE_TYPES.includes(shape.type) && endsOf(shape).some(changed)))
    }

    // Line ends attached to a shape that is being removed stay where they were.
    function freezeEndsAttachedTo(id) {
      for (const shape of shapes.values()) {
        if (!LINE_TYPES.includes(shape.type)) continue
        if (shape.from.ref !== id && shape.to.ref !== id && !shape.via?.some((p) => p.ref === id)) continue
        const ends = resolveEnds(shape, shapes)
        if (shape.from.ref === id) shape.from = ends.from
        if (shape.to.ref === id) shape.to = ends.to
        if (shape.via) shape.via = shape.via.map((p, i) => (p.ref === id ? ends.vias[i] : p))
      }
    }

    // An entrance or exit that doesn't apply to the shape (ENTRANCES) fades instead: say why
    function warnEffect(shape, effect, warn) {
      if (isGroup(shape)) return // its members show it (or say why not)
      if (entranceFor(effect, shape) !== effect) warn(ENTRANCES[effect].unless(nounOf(shape)))
    }

    // The one place a change's timing is set: it takes `dur` ms (the line's speed unless given),
    // starting `after` ms after the line's delay, with the line's ease. A shape changed more than
    // once in a beat takes the longest time and the latest start, and the last ease.
    // A repeated line (repeat) takes its speed for each round, and records them (tween: rounds; forever:
    // one round, looped by the widget)
    function schedule(meta, uid, props, { dur = speedOf(props), after = 0 } = {}) {
      const record = tween(meta, uid)
      const easing = props.ease ?? defaults.ease
      if (easing) record.ease = easing
      if (props.repeat) {
        record.rounds = { n: props.repeat }
        if (Number.isFinite(props.repeat)) dur *= props.repeat
      }
      record.dur = Math.max(record.dur, dur)
      record.delay = Math.max(record.delay, delayOf(props) + after)
      return record
    }

    function speedOf(props) {
      return props.speed ?? defaults.speed ?? NORMAL_MS
    }

    function delayOf(props) {
      if (!props.delay) return 0
      if (props.delay.v < 0) throw new Error('"delay" must be zero or more seconds')
      return props.delay.v * 1000
    }

    // `camera at 4,3 zoom 2` pans and zooms the view; `camera reset` goes back to the whole drawing.
    // A shape id centres on where the shape is now (the camera doesn't follow it).
    // `camera travel b c d` pans hop by hop through the stops, like a shape's travel.
    function runCameraLine([, colon, rest = ''], meta, warn) {
      if (colon) throw new Error('"camera" takes no colon, e.g. "camera move 4,3 zoom 2"')
      const props = parseProps(tokenize(rest), 0, 'camera', shapes)
      if (props.x?.bind || props.y?.bind) throw new Error('the camera goes to a number, not one that follows values, e.g. "camera x 4"')
      if (!Object.keys(props).some((key) => ['at', 'x', 'y', 'travel', 'zoom', 'reset'].includes(key))) throw new Error('"camera" expects move, travel, zoom or reset, e.g. "camera move 4,3 zoom 2"')
      if (props.reset && (props.at || props.x || props.y || props.travel || props.zoom)) throw new Error('"camera reset" takes only a speed, a delay and an ease')
      if (props.travel && (props.at || props.x || props.y)) throw new Error('"camera travel" sets the route, so it can\'t go with at / x / y')

      const before = JSON.stringify(camera)
      const next = props.reset ? { x: null, y: null, zoom: 1 } : { ...camera }
      const centre = context.centre // the drawing's centre, when the grid is fixed
      const axis = (n, key, from = camera) => {
        const current = from[key] ?? centre?.[key]
        if (n.rel && current == null) throw new Error('a relative camera move needs a fixed grid, or an absolute "camera move" first')
        return numberValue(n, current, { unit: CELL, coord: true })
      }
      // a shape: the middle of all of it (a group's members), or a point on its edge
      const refCentre = (p) => {
        if (p.anchor) return refPoint(p, shapes)
        const b = bounds(shapes.get(p.ref), shapes)
        return { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 }
      }
      if (props.at?.kind === 'ref') {
        Object.assign(next, refCentre(props.at))
      } else if (props.at) {
        next.x = axis(props.at.x, 'x')
        next.y = axis(props.at.y, 'y')
      }
      if (props.x) next.x = axis(props.x, 'x')
      if (props.y) next.y = axis(props.y, 'y')
      if (props.zoom) {
        next.zoom = numberValue(props.zoom, camera.zoom)
        if (!(next.zoom > 0)) throw new Error('"zoom" must be more than 0')
      }
      // A route: the camera states it passes through (a signed stop is relative to the one before).
      // The views are worked out at playback, where the drawing's size is known.
      let route = null
      if (props.travel) {
        route = [{ ...camera }]
        for (const stop of props.travel) {
          const prev = route[route.length - 1]
          const pt = stop.kind === 'ref' ? refCentre(stop) : { x: axis(stop.x, 'x', prev), y: axis(stop.y, 'y', prev) }
          route.push({ ...pt, zoom: next.zoom })
        }
        Object.assign(next, route[route.length - 1])
      }
      camera = next
      if (JSON.stringify(camera) === before && !route) warn('this camera line changes nothing')
      schedule(meta, 'camera', props, { dur: speedOf(props) * (route ? route.length - 1 : 1) }).path = route // a route takes `speed` per hop
    }

    function runLine(text, meta, warn) {
      // `defaults …` has no id (and no colon), like pause and auto
      const cameraLine = text.match(/^camera(\s*:)?(?:\s+(.*))?$/)
      if (cameraLine) return runCameraLine(cameraLine, meta, warn)
      const defaultsLine = text.match(/^defaults(\s*:)?(?:\s+(.*))?$/)
      if (defaultsLine?.[1]) throw new Error('"defaults" takes no colon, e.g. "defaults fill blue"')
      const match = defaultsLine ? ['', 'defaults', defaultsLine[2] || ''] : text.match(/^((?:[^:\s[]|\[[^\]]*\])+)\s*:\s*(.*)$/) // an id may have places in [ ]: "G[1][2]:"
      if (!match) throw new Error('expected "Id: …" (or defaults, camera, pause, auto, then)')
      const id = canonicalRef(match[1])
      const tokens = tokenize(match[2])

      if (defaultsLine) {
        const props = parseProps(tokens, 0, 'defaults', shapes)
        const reset = Object.keys(props).find((key) => props[key] === 'reset')
        if (reset) throw new Error(`"${reset} reset" puts a shape's look back, so it isn't a default`)
        for (const [key, look] of Object.entries(LOOKS)) { const problem = props[key] && look.check?.(props[key]); if (problem) warn(problem) }
        if (props.reset) { for (const key of Object.keys(defaults)) delete defaults[key]; delete props.reset }
        const before = JSON.stringify(defaults)
        Object.assign(defaults, props)
        if (JSON.stringify(defaults) === before && !tokens.some((t) => t.value === 'clear')) warn('this defaults line changes nothing')
        return
      }

      // "Arr[0..2]: fill red", "B[0..3]: flip": some of a layout's places (rangeOf)
      if (id.includes('..')) return runRange(id, tokens, meta, warn)
      if (!REF.test(id)) throw notAnId(id)

      const first = tokens[0]
      // "V: var 67 at 5,3": a rect that holds a value (a number, "text" or null), straight after "var"
      const isVar = first?.kind === 'word' && first.value === 'var'
      const varFollows = isVar ? followedValue(id, tokens[1], id) : null // "V: var {A * 2}"
      const varValue = isVar ? valueOf(tokens[1]) || varFollows : undefined
      const type = isVar ? 'rect' : first && (first.kind === 'res' ? (RESOURCE_TYPES.includes(first.name) ? first.name : null) : (SHAPE_TYPES.includes(first.value) ? first.value : null))
      if (first?.kind === 'res' && !type) throw new Error(`unknown shape "${first.name}(…)"`)
      const existing = shapes.get(id)

      // "Arr: row [5 3 8 1] at 2,3" (or column): its cells are Arr[0], Arr[1], …
      const word = first?.kind === 'word' ? first.value : ''
      if (!existing && (type || LAYOUT_TYPES.includes(word)) && !ID.test(id)) throw notAnId(id) // a new shape's: no parts
      const owner = !existing && !ID.test(id) && shapes.get(id.match(/^[A-Z][\w-]*/)[0]) // "Arr[9]": a part that isn't there
      const scriptLine = owner && kindOf(owner).script && id.slice(owner.id.length).match(/^\[([^\][]+)\]$/)
      if (scriptLine) return runScriptLine(owner, scriptLine[1], tokens, meta, warn)
      if (owner) throw new Error(`"${owner.id}" has no "${id.slice(owner.id.length)}"${owner.members?.length && owner.layout && !LAYOUTS[owner.layout].views ? ` (its places are ${cellRange(owner, owner.members.length)})` : ''}`)
      if (LAYOUT_TYPES.includes(word)) return createLayout(id, word, tokens, existing, meta, warn)
      // a verb: delete, swap, insert, remove, copy, group, ungroup, arrange (LINES)
      if (LINES[word]?.verb) return VERBS[word](id, existing, tokens, meta, warn, word)

      // "L: arrow" on a line that already exists, with no new ends, isn't a new line: its ends'
      // marks are changed with start / end
      const newEnds = tokens.some((t) => t.kind === 'word' && LINE_ENDS[t.value])
      if (type && SHAPES[type].line && existing && LINE_TYPES.includes(existing.type) && !newEnds) {
        throw new Error(`"${id}" is already a line: to change what's on its ends, e.g. "${id}: end arrow" or "${id}: start dot"`)
      }
      if (type) {
        const props = propsOf(type, tokens, varValue ? 2 : 1, 'create', id)
        if (isVar && props.label !== undefined) throw new Error(`a var's value goes straight after "var", e.g. "${id}: var 67" or "${id}: var "Dog""`)
        if (props.stagger) warn(`"stagger" works on a change to ${GROUPS} (or making ${LAYOUT_NOUNS})`)
        const shape = { ...baseShape(type), id, uid: newUid() }
        if (isVar) Object.assign(shape, { var: true, holds: true })
        checkParts(shape, props)
        applyDefaults(shape)
        if (RESOURCES[type]) RESOURCES[type](shape, first.arg, context)
        applyProps(shape, props, id, warn, meta)
        if (isVar) setValue(shape, varValue || { label: '' })
        if (varFollows) followValue(shape, varFollows, warn)
        shape.layer = layerOf(props)
        if (existing) {
          // Lines attached to the old shape attach to its replacement (same id).
          replaced(id, warn)
          schedule(meta, existing.uid, props).exit = 'fade'
        }
        shapes.set(id, shape)
        schedule(meta, shape.uid, props).enter = effectOf(props)
        if (props.effect) warnEffect(shape, props.effect, warn)
        updateParts(shape, props, meta, warn)
        if (props.trail !== undefined) setTrail(shape, shape, props, meta, warn)
        return
      }

      if (!existing) {
        const word = first?.kind === 'word' ? first.value : ''
        const known = !word || KEYWORDS[word] || KNOWN_WORDS.has(word)
        throw new Error(known ? `no shape called "${id}" (to create one, put a type after the colon, e.g. "${id}: rect")` : `unknown shape type "${first.value}"`)
      }
      // "V2: {V1 * 2}": a value that follows a sum (LINKS: value); "V3: V1 + V2": one worked out
      // from others, once (OPERATORS)
      const followed = existing.holds ? followedValue(id, first) : null
      const worked = followed ? { label: followed.label, next: 1 } : exprValue(existing, tokens)
      // a digit given a word that isn't a name: what it holds ("H[0]: G")
      if (existing.digit && !worked && holderRef(first) && !shapes.has(first.value)) checkDigit(existing.digit, { label: first.value })
      // "V1: A[1]" / "A[2]: V2": a copy of another var's or cell's value glides over
      if (existing.holds && !worked && holderRef(first)) return assignValue(existing, holderRef(first, 'copy from'), tokens, meta, warn)
      // "V: 123" / "Arr[2]: null": a new value for a var or a row's / column's cell ("text" is a
      // label); "H[0]: 0xF" a digit's
      const given = existing.holds && first?.kind === 'word' ? valueOf(first) : undefined
      const newValue = worked ? { label: worked.label } : given && addTo(existing, given)
      const props = propsOf(existing.type, tokens, worked ? worked.next : newValue ? 1 : 0, 'change')
      if (newValue && props.label !== undefined) throw new Error('give one value: a number, "quoted" text or null')
      if (props.count && !newValue) warn('"counter" goes with a new value, e.g. "V1: 100 counter"')
      const before = newValue && valueIn(existing) // what it held, for counter
      // "B: 67": a number's digits (LAYOUTS: radix) take the value, each that changes crossfading
      if (newValue && existing.layout) for (const cell of setNumber(existing, newValue, warn)) schedule(meta, cell.uid, props)
      // "S: "print(y)"": a one-line code block's text is its line's
      if (LAYOUTS[existing.layout]?.lines && props.label !== undefined) {
        const { item, base } = LAYOUTS[existing.layout]
        if (existing.members.length !== 1) throw new Error(`"${id}" has ${existing.members.length} ${item}s, so say which one, e.g. "${cellId(id, base)}: "x = 1""`)
        return runLine(`${existing.members[0]}: ${match[2]}`, meta, warn)
      }
      checkParts(existing, props)
      if (props.repeat) checkRepeat(props, newValue)
      if (props.effect) warn(`"${props.effect}" only applies when a shape is created or deleted`)
      const order = isGroup(existing) ? staggerOrder(existing) : null
      if (order && takeBareNumber(props)) numberEach(existing.members.map((m) => shapes.get(m)), props, meta, warn)
      const { opacity } = props // its tags fade with it, a group's too (updateParts)
      if (order) restyleMembers(existing, props, meta, warn) // takes the members' look out of props
      const shape = structuredClone(existing)
      if (newValue && !existing.layout) setValue(shape, newValue)
      if (newValue) followValue(shape, followed, warn) // a value given stops it following one
      const beforeRounds = props.repeat && lerpedNow()
      const path = applyProps(shape, props, false, warn, meta)
      const firstRound = props.repeat && lerpedNow(shape)
      for (let round = 1; round < (Number.isFinite(props.repeat) ? props.repeat : 1); round++) applyProps(shape, props, false, warn, meta, round)
      // a later move wins: a route, or a straight move (a turn sets its own: turnAbout)
      if (path) Object.assign(tween(meta, shape.uid), { path, turn: null })
      else if (props.at || props.x || props.y) Object.assign(tween(meta, shape.uid), { path: null, turn: null })
      shapes.set(id, shape)
      schedule(meta, shape.uid, props, { dur: speedOf(props) * (props.travel?.length || 1) }) // travel: speed per hop
      if (newValue && (props.count ?? defaults.count)) countUp(shape, before, props, meta, warn)
      if (props.repeat) roundsOf(meta, beforeRounds, firstRound)
      updateParts(shape, props, meta, warn, opacity)
      if (props.trail !== undefined) setTrail(existing, shape, props, meta, warn)
      if (order) applyStagger(shape, order, props, meta, warn)
      else if (props.stagger) warn(`"stagger" works on ${GROUPS}, and "${id}" isn't one`)
    }

    // What a repeated line can do (REPEATS): not a route or a new value; forever, only a change that
    // ends where it started
    function checkRepeat(props, newValue) {
      if (newValue) throw new Error('"repeat" goes round a change to a shape (a look, a move, a turn or an emphasis), not a new value')
      const clash = REPEATS.refuses.find((key) => props[key] !== undefined)
      if (clash) throw new Error(REPEATS.refuse(wordFor(clash, props[clash])))
      // a signed point is from the shape's own centre, which moves each round
      if (props.about?.x?.rel || props.about?.y?.rel) throw new Error('a repeated turn goes round a fixed point: "about x,y" or "about" a shape, not a signed point')
      if (Number.isFinite(props.repeat)) return
      const { takes, turn } = REPEATS.forever
      const other = Object.keys(props).find((key) => !takes.includes(key))
      const whole = !props.angle || (props.angle.rel && props.angle.v % turn === 0)
      if (other || !whole) throw new Error(`"repeat forever" goes round a change that ends where it started: an emphasis, or a whole turn (e.g. "angle +${turn}"), not "${wordFor(other || 'angle', props[other])}"`)
    }
    // Every shape's numbers that blend (LERPED), by uid, as they are now (with `changed`, a shape
    // not yet put back in shapes)
    function lerpedNow(changed) {
      const now = new Map([...shapes.values()].map((s) => [s.uid, pick(s, LERPED)]))
      if (changed) now.set(changed.uid, pick(changed, LERPED))
      return now
    }
    // The rounds of a repeated line (tween: rounds), from every shape's numbers before it (start)
    // and after its first round (first): once, those its first round finished (absolute ones, the
    // same after every round), which play in the first round; from, what each was, for a forever
    // one's loop to go round from
    function roundsOf(meta, start, first) {
      const now = lerpedNow()
      for (const [uid, record] of meta.tweens) {
        if (!record.rounds || record.rounds.once || !start.has(uid) || !now.has(uid)) continue
        const [s0, s1, sn] = [start.get(uid), first.get(uid) || now.get(uid), now.get(uid)]
        const changed = LERPED.filter((key) => s0[key] !== sn[key])
        record.rounds.once = changed.filter((key) => s1[key] === sn[key])
        record.rounds.from = pick(s0, changed)
      }
    }

    // Making a shape (or a copy, or a group) has no members to stagger
    function noStagger(props, warn) {
      if (props.stagger) warn(`"stagger" works on a change to ${GROUPS} (or making ${LAYOUT_NOUNS})`)
    }

    // "S[3]: "…"" / "S[3]: highlight line": a script's line (its lines aren't shapes of their own),
    // replaced (editScript) or lit ({ line: 3 }); "highlight clear" puts the script's lights out
    function runScriptLine(script, place, tokens, meta, warn) {
      const props = parseProps(tokens, 0, 'scriptLine', shapes)
      const token = { kind: 'word', value: place }
      if (props.label !== undefined) editScript(script.id, script, tokens, meta, warn, 'line', token)
      if (!props.highlight) return
      const n = numberOf(token, script.label.split('\n').length, 1) // from 1, or end
      if (n === undefined) throw new Error(`"${script.id}[${place}]": a script's line is a number from 1, or end`)
      const highlight = props.highlight.map((item) => (item === 'line' ? { line: n } : item))
      const changed = structuredClone(shapes.get(script.id))
      applyProps(changed, { highlight }, false, warn, meta)
      shapes.set(changed.id, changed)
      schedule(meta, changed.uid, props)
    }

    // A line on a range of a layout's places: a flip (a number's digits), or a change to how they
    // look (changeRange)
    function runRange(id, tokens, meta, warn) {
      const word = tokens[0]?.kind === 'word' ? tokens[0].value : ''
      const range = rangeOf(id, word || 'range')
      if (!range) throw new Error(`"${id}" isn't a range of a layout's places, e.g. "Arr[0..2]" or "G[0..1][1..2]"`)
      if (!LINES[word]?.verb) return changeRange(range, tokens, meta, warn)
      if (!LINES[word].onRange) throw new Error(`"${word}" doesn't go on a range of places`)
      VERBS[word](range.row.id, range.row, tokens, meta, warn, word, range)
    }

    // "A: delete": a shape goes, with the line's exit effect (a group's members and a var's or
    // row's name and indices too)
    function deleteShape(id, existing, tokens, meta, warn) {
      if (!existing) throw noShape(id)
      refuseView(existing, 'delete')
      const where = tokens[1]?.kind === 'word' && (/^\d+$/.test(tokens[1].value) || tokens[1].value === EDIT_WORDS.end) ? tokens[1].value : null
      if (existing.layout && where) throw new Error(`"delete" deletes the whole ${existing.layout}: to take one cell out, "${id}: remove ${where}"`)
      const props = parseProps(tokens, 1, 'delete', shapes)
      const order = staggerOrder(existing) // taken before its members go
      const lines = LAYOUTS[existing.layout]?.typeInTurn ? existing.members.map((m) => shapes.get(m)).filter(Boolean) : []
      const parts = partsOf(existing)
      removeShape(existing, props, meta, warn)
      if (lines.length && inTurn(props)) typeInTurn(existing, lines, parts, props, meta, true)
      applyStagger(existing, order, props, meta, warn)
    }

    // "B: copy A": an identical copy that starts on the original, so a move on the same line
    // animates away from it
    function copyShape(id, existing, tokens, meta, warn) {
      const srcId = parseAs('id', tokens[1], shapes)
      if (!srcId) throw new Error(`"copy" expects a shape id${tokens[1] ? `: no shape called "${tokens[1].value}"` : ''}`)
      const src = shapes.get(srcId)
      if (isGroup(src)) throw new Error('a group can\'t be copied: copy its shapes instead')
      const props = parseProps(tokens, 2, 'copy', shapes)
      noStagger(props, warn)
      const fresh = { attach: null, hl: null, callout: null }
      const shape = { ...structuredClone(src), ...fresh, id, uid: newUid() }
      tween(meta, shape.uid).from = { ...structuredClone(src), ...fresh, uid: shape.uid }
      const path = applyProps(shape, props, false, warn, meta)
      if (path) Object.assign(tween(meta, shape.uid), { path, turn: null })
      if (existing) {
        replaced(id, warn)
        schedule(meta, existing.uid, props).exit = 'fade'
      }
      shapes.set(id, shape)
      schedule(meta, shape.uid, props, { dur: speedOf(props) * (props.travel?.length || 1) }).enter = 'copy' // travel: speed per hop
      if (props.trail !== undefined) setTrail(src, shape, props, meta, warn) // from the original, where the copy starts
    }

    // "G: group [A B C]": shapes that act as one, riding on the group at their offsets. The shapes
    // go in [ ] (commas optional), like a row's values.
    function makeGroup(id, existing, tokens, meta, warn) {
      if (existing) throw new Error(`"${id}" already exists`)
      if (tokens[1]?.kind !== 'bracket' || tokens[1].value !== '[') throw new Error(`a group's shapes go in [ ] straight after "group", e.g. "${id}: group [a b c]"`)
      const members = []
      let j = 2
      for (; j < tokens.length && tokens[j].kind !== 'bracket'; j++) {
        const ref = parseAs('id', tokens[j], shapes)
        if (!ref) throw new Error(tokens[j].kind === 'word' ? `no shape called "${tokens[j].value}" (is a "]" missing?)` : 'a group\'s [ ] holds shape ids')
        members.push(ref)
      }
      if (tokens[j]?.value !== ']') throw new Error('the "[" of a group has no closing "]"')
      if (!members.length) throw new Error(`a group needs at least one shape, e.g. "${id}: group [a b c]"`)
      const props = parseProps(tokens, j + 1, 'group', shapes)
      noStagger(props, warn)
      const list = members.map((m) => shapes.get(m))
      for (const m of list) {
        if (bound(m)) throw new Error(`"${m.id}" is laid out in "${m.part}", so it can't go in a group: group "${m.part}"`)
        if (LINE_TYPES.includes(m.type) && (!m.from.ref || !m.to.ref)) throw new Error(`"${m.id}" is a line with a free end: group the shapes it joins instead, and it follows them`)
      }
      const b = unionBounds(list, shapes)
      const group = { ...baseShape(GROUP), id, uid: newUid(), members, x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, w: b.x1 - b.x0, h: b.y1 - b.y0 }
      for (const m of list) {
        if (LINE_TYPES.includes(m.type)) continue // follows the shapes its ends are attached to
        leaveGroup(m)
        m.attach = offsetFrom(id, m.x - group.x, m.y - group.y)
      }
      if (takeBareNumber(props)) numberEach(list, props, meta, warn)
      applyProps(group, props, false, warn, meta)
      shapes.set(id, group)
      schedule(meta, group.uid, props).enter = 'fade'
      if (props.trail !== undefined) setTrail(group, group, props, meta, warn)
    }

    // "G: ungroup": the group goes, its shapes stay where they are
    function ungroup(id, existing, tokens, meta) {
      if (!existing) throw noShape(id)
      if (!isGroup(existing) || bound(existing)) throw new Error(`"${id}" isn't a group`)
      parseProps(tokens, 1, 'ungroup', shapes)
      for (const m of existing.members) { const member = shapes.get(m); if (member?.attach?.ref === id) member.attach = null }
      shapes.delete(id)
      tween(meta, existing.uid).exit = 'fade'
    }

    // "G: arrange right gap 0.5" (a direction, or degrees): its shapes in a line that way, in the
    // order they're listed, each placed from the one before, the gap from it that way (placeAlong). The
    // first stays put, and lines follow the shapes they join. They stay in the group, at their new
    // places in it (as keepOffset does).
    function arrangeGroup(id, group, tokens, meta, warn) {
      if (!group) throw noShape(id)
      if (!isGroup(group) || bound(group)) throw new Error(`"${id}" isn't a group: "arrange" lays out a group's shapes, e.g. "G: group [A B C]", then "G: arrange right"`)
      if (group.layout) throw new Error(`a ${LAYOUTS[group.layout].noun} lays out its own ${LAYOUTS[group.layout].item}s`)
      const way = parseAs('num', tokens[1], shapes) ?? parseAs('direction', tokens[1], shapes)
      if (!way) throw new Error(`"arrange" needs a way to go, a number of degrees (clockwise, 0 = right) or ${orList(Object.keys(DIRECTIONS))}, e.g. "${id}: arrange right gap 0.5"`)
      const props = parseProps(tokens, 2, 'arrange', shapes)
      const gap = props.gap ? props.gap.v * CELL : PLACE_GAP
      const placed = group.members.map((m) => shapes.get(m)).filter((m) => m && !LINE_TYPES.includes(m.type)).map((m) => structuredClone(m))
      placed.forEach((m, k) => {
        if (k) Object.assign(m, placeAlong(m, placed[k - 1], way.v, gap))
        offsetInGroup(m)
        shapes.set(m.id, m)
        Object.assign(tween(meta, m.uid), { path: null, turn: null })
        schedule(meta, m.uid, props)
      })
      // its centre moves to the middle of its shapes as they now are (a group in a group's members
      // follow it first), so its box fits them: a group in a group is placed by its box
      resolveAttachments(shapes)
      const b = unionBounds(placed, shapes)
      const moved = { ...structuredClone(group), x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 }
      shapes.set(id, moved)
      for (const m of placed) offsetInGroup(m)
      if (moved.attach?.kind === 'offset') offsetInGroup(moved) // in a group itself
      schedule(meta, moved.uid, props)
      applyStagger(group, staggerOrder(group), props, meta, warn)
    }


    // Removes a shape (and a group's members), with the line's exit effect and timing.
    function removeShape(target, props, meta, warn) {
      if (!target) return
      if (isGroup(target) && !bound(target)) target.members.forEach((m) => removeShape(shapes.get(m), props, meta, warn)) // a view's cells are its grid's
      for (const part of partsOf(target)) removeShape(part, props, meta, warn) // its name, indices, views, spans
      leaveGroup(target)
      freezeEndsAttachedTo(target.id)
      shapes.delete(target.id)
      schedule(meta, target.uid, props).exit = effectOf(props)
      if (props.effect) warnEffect(target, props.effect, warn)
    }

    // "Arr: fill green" on a row, column or group: the look goes to each of its shapes that takes
    // it. With a stagger, a highlight does too (one each, in turn, rather than one round them all).
    function restyleMembers(group, props, meta, warn) {
      if (group.layout) {
        for (const key of ['size', 'width', 'height']) {
          if (props[key]) throw new Error(`a ${group.layout}'s cell size is set when it's made`)
        }
      }
      const staggered = props.stagger ?? defaults.stagger
      const memberLook = [...CELL_STYLE, 'style'] // style reset: each member's own
      const look = pick(props, staggered ? [...memberLook, 'highlight'] : memberLook)
      if (!Object.keys(look).length) return
      for (const key of Object.keys(look)) delete props[key]
      if (group.layout) withRowMax(group, look)
      // cells added to a row / column later take its look as it is now
      if (group.cell) applyProps(group.cell, pick(look, memberLook.filter((key) => !APPLIES[key] || APPLIES[key].includes(group.cell.type))), false, () => {}, meta)
      const used = new Set()
      let resized = false
      for (const member of groupMembers(group)) {
        if (isGroup(member)) continue
        const own = pick(look, Object.keys(look).filter((key) => !APPLIES[key] || APPLIES[key].includes(member.type)))
        if (!Object.keys(own).length) continue
        Object.keys(own).forEach((key) => used.add(key))
        const changed = structuredClone(member)
        applyProps(changed, own, false, warn, meta)
        resized ||= changed.w !== member.w || changed.h !== member.h
        shapes.set(changed.id, changed)
        schedule(meta, changed.uid, props)
      }
      // cells resized (a round bar squares them): the layout they're in closes up round them
      if (resized && group.layout) relayLayout(bound(group) ? shapes.get(group.part) : group, props, meta, warn)
      const unused = Object.keys(look).find((key) => !used.has(key))
      if (unused) warn(`"${wordFor(unused, look[unused])}" doesn't apply to any of the shapes in "${group.id}"`)
    }

    // A row's / column's / group's members in stagger order: cells by number, a group's members as
    // listed. Each entry is a member's uid and those of any shapes in it.
    function staggerOrder(group) {
      if (!isGroup(group)) return []
      return group.members.map((id) => shapes.get(id)).filter(Boolean).map((m) => [m.uid, ...groupMembers(m).map((s) => s.uid)])
    }

    // stagger / stagger-reverse: each member's change starts `gap` seconds after the one before
    // (after any delay). Moves are left alone: the members ride on the group, so move together.
    function applyStagger(group, order, props, meta, warn) {
      const stagger = props.stagger ?? defaults.stagger
      if (!stagger) return
      if (!order.length) {
        if (props.stagger) warn(`"stagger" works on ${GROUPS}, and "${group.id}" isn't one`)
        return
      }
      if (props.stagger && (props.at || props.x || props.y || props.via || props.travel || props.follow)) {
        warn(`${GROUPS} moves as one, so its move isn't staggered`)
      }
      const list = stagger.reverse ? [...order].reverse() : order
      list.forEach((uids, k) => uids.forEach((uid) => schedule(meta, uid, props, { dur: 0, after: k * stagger.gap * 1000 })))
    }

    // The timing of the busiest of some shapes this beat: the longest change, from the earliest
    // start (or the line's speed, if none of them changes)
    function busiest(meta, list) {
      const records = list.map((shape) => meta.tweens.get(shape.uid)).filter((record) => record?.dur)
      if (!records.length) return { dur: speedOf({}), delay: 0 }
      return { dur: Math.max(...records.map((record) => record.dur)), delay: Math.min(...records.map((record) => record.delay)) }
    }

    // Gives a shape that changes along with others (a refitted line, a panel) their timing. One
    // already changing this beat keeps its own; a new one takes its place as it comes in.
    function retime(meta, uid, { dur, delay }) {
      const record = tween(meta, uid)
      if (record.enter || record.dur) return
      Object.assign(record, { dur, delay })
    }

    // The compiler's other parts (COMPILER_PARTS): each is given the shared state and these
    // functions (cx), and gives its own and its verbs; then each is linked to the rest
    let addTo, assignValue, changeRange, rangeOf, editScript, numberOf, checkDigit, checkParts, countUp, createLayout, exprValue, followedValue, followValue, fitCode, fitLinks, fitNumbers, fitSpans, holderRef, linkColour, linkNumber, linkText,
      readLines, refuseView, relayLayout, setNumber, setTrail, setValue, typeInTurn, unlink, updateParts, valueIn, valueOf, withRowMax
    const cx = { shapes, defaults, newUid, context, bound, partsOf, effectOf, layerOf, inTurn, noShape, replaced, applyDefaults, applyProps, applyStagger, busiest, delayOf,
      freezeEndsAttachedTo, numberEach, removeShape, retime, schedule, speedOf, takeBareNumber,
      warnEffect, stampOf, stampNow }
    const parts = window.Anim.COMPILER_PARTS.map((part) => part(cx))
    for (const part of parts) Object.assign(cx, part.functions)
    const link = () => {
      ({ addTo, assignValue, changeRange, rangeOf, editScript, numberOf, checkDigit, checkParts, countUp, createLayout, exprValue, followedValue, followValue, fitCode, fitLinks, fitNumbers, fitSpans, holderRef, linkColour, linkNumber, linkText,
        readLines, refuseView, relayLayout, setNumber, setTrail, setValue, typeInTurn, unlink, updateParts, valueIn, valueOf, withRowMax } = cx)
    }
    for (const part of [...parts, { link }]) part.link()

    // The verbs (LINES with verb: true), each run as (id, existing shape, tokens, meta, warn, word)
    const VERBS = { delete: deleteShape, copy: copyShape, group: makeGroup, ungroup, arrange: arrangeGroup, ...Object.assign({}, ...parts.map((part) => part.verbs)) }

    // What the parts do once a beat's lines have all run (finish: a trail grows along its shape's move)
    const finishBeat = (meta) => parts.forEach((part) => part.finish?.(meta))

    return { shapes, runLine, settle, finishBeat, camera: () => ({ ...camera }) }
  }

  // A comment starts at "#" followed by a space (or the end of the line), outside quotes, so hex
  // colours (#f80) and a "#" in a label are left alone. Whole-line or after a command.
  function stripComment(line) {
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"' && line[i - 1] !== '\\') quoted = !quoted
      else if (ch === '#' && !quoted && (i + 1 === line.length || /\s/.test(line[i + 1]))) return line.slice(0, i)
    }
    return line
  }

  // Joins a scene's lines into commands: a line indented more than the line that started the
  // current command continues it (as if joined with a space), so a long command can be laid out
  // one property per line, or a row's values one per line (a line starting "]" continues it too,
  // so the closing bracket can line up with the id). Comments are removed and blank lines skipped first; `li` is the line
  // the command starts on (for error messages).
  function logicalLines(scene) {
    const out = []
    let current = null
    scene.split('\n').forEach((raw, li) => {
      const text = stripComment(raw).trimEnd()
      if (!text.trim()) return
      const indent = text.length - text.trimStart().length
      // a line starting "]" closes a row's / column's / code block's values laid out a line each
      if (current && (indent > current.indent || text.trimStart().startsWith(']'))) current.text += ` ${text.trim()}`
      else out.push((current = { text: text.trim(), li, indent }))
    })
    return out
  }

  // One record per shape per beat: how its change animates (duration and delay in ms, the route
  // it follows, its entrance / exit effect, the shape a copy starts from, a one-off effect, and
  // `offset`: how far it slides as it enters or leaves, as a row's cell does). Set only where used:
  // `lands`, its new value arrives on a flyer, so it's taken halfway through (as it lands), not
  // blended; `arc`, how far it bows out on the way (a swap); `raise`, it's drawn on top of its layer
  // while it moves (the unit a swap passes in front); `turn`, it turns about a point (pivot, by
  // degrees; carried: as a member of a group that turns), going round it in an arc; `grow`, a
  // trail's new points are drawn as its shape moves (anim-trail.js); `count`, its value counts its
  // way there (counter); `counting`, its label's sums count along with values that do (anim-values.js);
  // `rounds`, it's repeated (repeat: n, and once and from: roundsOf).
  function tween(meta, uid) {
    let record = meta.tweens.get(uid)
    if (!record) meta.tweens.set(uid, (record = { dur: 0, delay: 0, path: null, enter: null, exit: null, from: null, effect: null }))
    stamps.set(record, ++changes)
    return record
  }
  // When each record was last handed out to change (a count of changes): a group's box is only
  // worked out again when a shape in it has changed since it was (boxStale)
  let changes = 0
  const stamps = new WeakMap() // record -> changes, when it was last handed out
  const stampOf = (meta, uid) => stamps.get(meta.tweens.get(uid)) || 0
  const stampNow = () => changes

  // `then` (no id): the lines after it start once everything before it in the beat has finished,
  // `then n` n seconds after that. The beat's parts are compiled one after another (compile: each
  // part before the last is in the beat's `chain`), and play as one beat. Returns the wait (ms)
  // before the next part, or null if the line isn't a `then`.
  function thenLine(text) {
    const match = text.match(/^then(?:\s+(.*))?$/)
    if (!match) return null
    const rest = match[1] || ''
    if (!rest) return 0
    if (!NUMBER.test(rest) || /^[+-]/.test(rest)) throw new Error('"then" takes nothing (start when the lines before it finish) or a number of seconds to wait first, e.g. "then 0.5"')
    return parseFloat(rest) * 1000
  }

  // Timing lines (no id): `pause` waits for a click while playing, `pause n` holds n seconds,
  // `auto` goes straight on to the next beat when this one finishes. Both are the whole beat's
  // (its last part's, after any `then`). Returns true if handled.
  function runTimingLine(text, meta) {
    const match = text.match(/^(pause|auto)\b\s*(.*)$/)
    if (!match) return false
    const [, word, rest] = match
    if (word === 'auto') {
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
    // the same, with where each is (step, beat, and line in the beat's scene), for an editor
    const issues = []

    const snapshot = () => new Map([...compiler.shapes].map(([id, shape]) => [id, structuredClone(shape)]))
    steps.forEach((step, si) => {
      step.beats.forEach((beat, bi) => {
        // lead: how long it waits before it starts (then n)
        const newMeta = (lead = 0) => ({ tweens: new Map(), pause: null, auto: false, lead })
        let meta = newMeta()
        const timing = { pause: null, auto: false } // the whole beat's: given to its last part
        const chain = [] // its parts before its last (then)
        const where = (li) => `Step ${si + 1}${step.beats.length > 1 ? `, beat ${bi + 1}` : ''}, line ${li + 1}`
        logicalLines(beat.scene).forEach(({ text, li }) => {
          // each warning once per line (a row's look, say, is checked on every cell)
          const given = new Set()
          const warn = (message) => {
            if (given.has(message)) return
            given.add(message)
            warnings.push(`${where(li)}: ${message}`)
            issues.push({ error: false, step: si, beat: bi, line: li, message })
          }
          try {
            const lead = thenLine(text)
            if (lead !== null) {
              compiler.finishBeat(meta)
              chain.push({ state: snapshot(), meta, camera: compiler.camera() })
              meta = newMeta(lead)
              return
            }
            if (runTimingLine(text, timing)) return
            compiler.runLine(text, meta, warn)
            compiler.settle(meta, warn)
          } catch (error) {
            errors.push(`${where(li)}: ${error.message} — "${text}"`)
            issues.push({ error: true, step: si, beat: bi, line: li, message: error.message })
          }
        })
        compiler.finishBeat(meta)
        Object.assign(meta, timing)
        beats.push({ step: si, beat: bi, state: snapshot(), meta, camera: compiler.camera(), chain })
      })
    })

    return { beats, errors, warnings, issues }
  }

  Object.assign(window.Anim, { compile, COMPILER_PARTS: [], cellId, markId, indexId, nameId, decimalId, trailId, viewKey, viewId, headId, baseOf, cellRange, pick, baseShape, numberValue, tween })
})()
