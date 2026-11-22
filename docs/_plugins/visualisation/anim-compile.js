/**
 * anim-compile.js - Part of the animation plugin (animation.js): compiling each beat's scene
 * lines into a snapshot of every shape, plus how each change animates (tweens) and the camera.
 */

;(function () {
  const { CELL, cellToPx, APPLIES, LINE_TYPES, resolveEnds, boxCentre, PLACE_GAP, placeNextTo,
    attachPos, buildPolyline, buildPath, resolveAttachments, unionBounds, NORMAL_MS, parseProps,
    tokenize, bounds, ID, RESERVED, RESOURCE_TYPES, SHAPE_TYPES, LAYOUT_TYPES, EMPHASES, ENTRANCES,
    entranceFor, parseAs, lucideIcon, KEYWORDS, NUMBER, linePoints, besideOf, offsetFrom, CELL_STYLE,
    LINES, wordFor, LOOKS, article, SHAPES, kindOf, HIGHLIGHT_KINDS, LAYOUTS, nounOf, PARTS, isGroup,
    DEFAULT_EFFECT, nounList, LAYOUT_NAMES, GROUP, LAYOUT_NOUNS, EDIT_WORDS, FULL_TURN, scriptSize, placeFor, isLoop,
    NUMBERINGS } = window.Anim

  // The ids of the shapes that go with a var, row or column: a row's / column's cells (id.0,
  // id.1, …; a code block's lines from id.1) and their numbers (NUMBERINGS: id.index.0, …), and the name
  // (id.name). Cells are numbered from the layout's base (LAYOUTS): `k` is a cell's number as
  // written, and its place in the row is k - base.
  // A grid's / table's (LAYOUTS: views) rows and columns are named like a row's cells, after the
  // view's word if it has one (g.1, g.col.2), and its heading t.head; their cells like a row's
  // (g.1.2, t.head.2). Their indices take the same last parts (g.index.1, g.index.col.2).
  const cellId = (id, k) => `${id}.${k}`
  const markId = (id, numbering, k) => `${id}.${numbering.part}.${k}`
  const indexId = (id, k) => markId(id, NUMBERINGS.indices, k)
  const nameId = (id) => `${id}.name`
  const viewKey = (view, k) => (view.word ? `${view.word}.${k}` : String(k))
  const viewId = (id, view, k) => `${id}.${viewKey(view, k)}`
  const headId = (id, head) => `${id}.${head.word}`
  const baseOf = (layout) => LAYOUTS[layout]?.base || 0
  const cellRange = (row, n) => (n ? `${cellId(row.id, baseOf(row.layout))} to ${cellId(row.id, baseOf(row.layout) + n - 1)}` : 'none')

  const pick = (props, keys) => Object.fromEntries(Object.entries(props).filter(([key]) => keys.includes(key)))

  // ---------------------------------------------------------------------------
  // Compiling scenes into one state per beat
  // ---------------------------------------------------------------------------

  function baseShape(type) {
    const shape = { type, label: '', stroke: 'fg', colour: 'fg', fill: 'none', weight: 1, font: 1, angle: 0, scale: 1, bold: false, linestyle: 'solid', flow: 'none', align: 'centre', layer: 'normal' }
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
    }

    // Applies a shape's look (size, then LOOKS): absolute when creating; on a change, a signed
    // number is relative to the current value.
    function applyLook(shape, props, creating, warn) {
      const now = (value) => (creating ? undefined : value)
      const cells = (n, current) => numberValue(n, now(current), { unit: CELL })
      // size: absolute, or one signed number on a change (both sides by that amount). A relative
      // pair (size +1x+0) isn't allowed: width / height change one side.
      if (props.size) {
        check(shape, 'size')
        const relative = !creating && (props.size.w.rel || props.size.h.rel)
        if (relative && !props.size.one) throw new Error('a relative size takes one number (e.g. "size +1"): use "width +1" / "height +1" to change one side')
        if (kindOf(shape).outline === 'round') { // one size: the diameter
          if (!props.size.one) throw new Error(`${article(shape.type)} ${shape.type} takes one size (or use radius)`)
          shape.r = Math.max(0, cells(props.size.w, shape.r * 2) / 2)
        } else {
          shape.w = Math.max(0, cells(props.size.w, shape.w))
          shape.h = Math.max(0, cells(props.size.h, shape.h))
        }
      }
      if (props.size && (props.width || props.height)) throw new Error('give either "size" or "width" / "height", not both')
      for (const [key, look] of Object.entries(LOOKS)) {
        const value = props[key]
        if (!value) continue
        const word = wordFor(key, value)
        check(shape, key, word)
        if (look.quiet?.includes(shape.type)) warn(`"${word}" has no effect on ${shape.type}`)
        const problem = look.check?.(value, shape)
        if (problem) warn(problem)
        if (look.unit) shape[look.field] = Math.max(look.min ?? -Infinity, numberValue(value, now(shape[look.field]), { unit: look.unit }))
        else shape[look.field] = look.map && value in look.map ? look.map[value] : value
      }
      // flow only shows on a dashed or dotted line
      if (props.linestyle === 'solid' && shape.flow !== 'none' && !props.flow) warn('this line is still flowing, but flow only shows on a dashed or dotted line (add static to stop it)')
      if (props.flow && shape.flow !== 'none' && shape.linestyle === 'solid') warn(`"${props.flow}" only shows on a dashed or dotted line`)
    }

    // A grid coordinate (the centre of a cell), absolute, or relative to `current` when signed
    const coord = (n, current) => numberValue(n, current, { unit: CELL, coord: true })

    // Applies parsed props to a shape (a fresh one when creating, a copy when changing).
    // Returns the route it moves along (a curve through via points, travel's hops, a followed
    // line), or null for a straight move.
    function applyProps(shape, props, creating, warn, meta) {
      for (const ref of [props.at?.ref, props.from?.ref, props.to?.ref, props.attach?.ref, ...(props.via || []).map((v) => v.ref),
        ...(props.travel || []).map((v) => v.ref)]) {
        if (ref && LINE_TYPES.includes(shapes.get(ref).type)) throw new Error(`"${ref}" is a line, so it can't be used as a position`)
      }
      if (props.label !== undefined) { shape.label = props.label; if (shape.nil) shape.nil = false }
      applyLook(shape, props, creating, warn)
      if (kindOf(shape).script) fitScript(shape, props)
      // a script given new text has no map of where its blocks went (an edit gives one: editScript)
      if (kindOf(shape).script && props.label !== undefined && meta) tween(meta, shape.uid).script = null
      if (props.highlight) applyHighlight(shape, props.highlight)
      if (props.emphasis) applyEmphasis(shape, props, creating, warn, meta)
      if (props.callout) shape.callout = props.callout.none ? null : { text: props.callout.text, side: props.callout.side }
      return LINE_TYPES.includes(shape.type) ? placeLine(shape, props, creating, warn) : placeShape(shape, props, creating, warn)
    }

    // highlight: each kind (HIGHLIGHT_KINDS) stays until clear. One that takes a number is
    // { kind: n }: with no number, "number" takes the next (next), "line" is just on (bare); the
    // others need one.
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
      if (n === null && kind.bare) return true
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

    // A line's ends (from / to, or the whole line shifted by a relative move) and its via points
    // (a curve's bends, a line's corners). A line has no route of its own, so this returns null.
    function placeLine(shape, props, creating, warn) {
      if (props.travel || props.follow || props.attach) throw new Error('a line has no single position, so it can\'t travel, follow or attach (its ends can follow shapes)')
      if (props.x || props.y || props.at?.kind === 'ref' || props.at?.kind === 'place') throw new Error('a line has no single position: use from / to, or "move +x,+y" to shift it')
      if (props.at) {
        if (!props.at.x.rel || !props.at.y.rel || creating) throw new Error('a line has no single position: use from / to, or "move +x,+y" to shift it')
        const ends = resolveEnds(shape, shapes)
        shape.from = { x: coord(props.at.x, ends.from.x), y: coord(props.at.y, ends.from.y) }
        shape.to = { x: coord(props.at.x, ends.to.x), y: coord(props.at.y, ends.to.y) }
        // its free via points move with it (vias on shapes stay on them)
        if (shape.via) shape.via = shape.via.map((p) => (p.ref ? p : { x: coord(props.at.x, p.x), y: coord(props.at.y, p.y) }))
      }
      for (const key of ['from', 'to']) {
        const end = props[key]
        if (!end) continue
        if (end.kind === 'ref') { shape[key] = { ref: end.ref }; continue }
        const current = creating ? undefined : resolveEnds(shape, shapes)[key]
        shape[key] = { x: coord(end.x, current?.x), y: coord(end.y, current?.y) }
      }
      if (creating && (!shape.from || !shape.to)) throw new Error(`${article(nounOf(shape))} ${nounOf(shape)} needs both ends, e.g. "from 2,3 to 7,8" or "from a to b"`)
      if (props.via && props.bend) throw new Error('give either "via" or "bend", not both: a curve bends through its via points, or by its bend when it has none')
      if (props.bend) shape.via = null // bends by its bend from now on
      if (props.via) {
        // Via points (replacing any it had): a shape id stays on that shape, a placement is fixed
        // where it is now, and a signed number is relative to the point before.
        const point = { type: 'point', x: 0, y: 0, w: 0, h: 0 } // something to place next to a shape
        const ends = resolveEnds({ ...shape, via: [] }, shapes)
        let prev = ends.from
        shape.via = props.via.map((via) => {
          let p
          if (via.kind === 'ref') { p = { ref: via.ref }; prev = boxCentre(shapes.get(via.ref)); return p }
          if (via.kind === 'place') p = placeNextTo(point, shapes.get(via.ref), via.place, PLACE_GAP)
          else p = { x: coord(via.x, prev.x), y: coord(via.y, prev.y) }
          prev = p
          return { x: p.x, y: p.y }
        })
      }
      const loops = isLoop(shape)
      if (creating && kindOf(shape).bends && !shape.via?.length && !loops && !props.bend) warn('a curve with no "via" points or "bend" is a straight line')
      if (props.bend && loops) warn('"bend" has no effect on a loop: its angle and size shape it')
      if (kindOf(shape).loop?.props.some((key) => props[key]) && !loops) {
        warn('angle and size shape a loop: a curve from a shape to itself with no "via" points, e.g. "curve from a to a angle up"')
      }
      return null
    }

    // A boxed shape's place: where it goes (at, x, y), what it's attached to, and the route it
    // takes there (travel, follow, via), which it returns.
    function placeShape(shape, props, creating, warn) {
      checkMove(shape, props, creating)
      const start = { x: shape.x, y: shape.y }
      setPosition(shape, props, creating)
      if (props.attach || props.detach) attachShape(shape, props, warn)
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
      if ((owned || bound(shape)) && (positioned || props.via || props.travel || props.follow || props.attach || props.detach)) {
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
    function setPosition(shape, props, creating) {
      const now = (value) => (creating ? undefined : value)
      const { at } = props
      if (at?.kind === 'abs') { shape.x = coord(at.x, now(shape.x)); shape.y = coord(at.y, now(shape.y)) }
      if (at?.kind === 'ref') Object.assign(shape, placeFor(shape, boxCentre(shapes.get(at.ref))))
      if (at?.kind === 'place') {
        const gap = props.gap ? props.gap.v * CELL : PLACE_GAP
        Object.assign(shape, placeNextTo(shape, shapes.get(at.ref), at.place, gap))
      }
      if (props.x) shape.x = coord(props.x, now(shape.x))
      if (props.y) shape.y = coord(props.y, now(shape.y))
    }

    // attach (beside or on top of another shape) / detach
    function attachShape(shape, props, warn) {
      if (props.attach) {
        if (props.attach.ref === shape.id) throw new Error('a shape can\'t attach to itself')
        leaveGroup(shape)
        if (props.gap && props.attach.side === 'centre') warn('"gap" does nothing when attaching on top of a shape (give a side, e.g. attach right-of a)')
        shape.attach = besideOf(props.attach.ref, props.attach.side, props.gap ? props.gap.v * CELL : PLACE_GAP)
        Object.assign(shape, attachPos(shape, shapes.get(props.attach.ref), shape.attach))
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
          points.push(stop.kind === 'ref' ? onto(boxCentre(shapes.get(stop.ref))) : { x: coord(stop.x, prev.x), y: coord(stop.y, prev.y) })
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
        // the route starts from wherever the shape is)
        const farEnd = props.follow.reverse ? line.from : line.to
        if (farEnd?.ref && shapes.has(farEnd.ref)) along.push(onto(boxCentre(shapes.get(farEnd.ref))))
        Object.assign(shape, along[along.length - 1])
        return buildPolyline([start, ...along])
      }
      if (!props.via) return null
      const vias = props.via.map((via) => {
        if (via.kind === 'ref') return onto(boxCentre(shapes.get(via.ref)))
        if (via.kind === 'place') return placeNextTo(shape, shapes.get(via.ref), via.place, PLACE_GAP)
        return { x: coord(via.x, start.x), y: coord(via.y, start.y) }
      })
      return buildPath([start, ...vias, { x: shape.x, y: shape.y }])
    }

    // Moving an attached shape releases it; moving a group member keeps it in the group (at its
    // new place in it)
    function keepOffset(shape, props) {
      const moved = props.at || props.x || props.y || props.via || props.travel || props.follow
      if (!moved || !shape.attach || props.attach) return
      if (shape.attach.kind !== 'offset') { shape.attach = null; return }
      const parent = shapes.get(shape.attach.ref)
      shape.attach.dx = shape.x - parent.x
      shape.attach.dy = shape.y - parent.y
    }

    // Gives a new shape the default look (defaults …) that applies to its type, as if written on
    // its line. The line's timing defaults (speed, effect, ease, stagger, keep-style) are read
    // where they're used.
    function applyDefaults(shape) {
      const fits = (key) => !APPLIES[key] || APPLIES[key].includes(shape.type)
      const look = pick(defaults, ['size', ...Object.keys(LOOKS)].filter(fits))
      if (look.size && kindOf(shape).outline === 'round' && !look.size.one) delete look.size // a round shape takes one size
      applyLook(shape, look, true, () => {})
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
    // them in [ ] where its label would go: "s: scratch [ "…" "…" ] at 2,1", "s: [ "…" ]".
    function propsOf(type, tokens, i, kind) {
      if (!SHAPES[type]?.lines || tokens[i]?.kind !== 'bracket' || tokens[i].value !== '[') return parseProps(tokens, i, kind, shapes)
      const noun = nounOf({ type })
      const example = `e.g. "${type} ["…" "…"] at 2,1"`
      const { values, next } = readLines(tokens, i, { noun, item: 'line', example })
      const props = parseProps(tokens, next, kind, shapes)
      if (props.label !== undefined) throw new Error(`a ${noun} takes one "quoted" line, or its lines in [ ], ${example}`)
      props.label = values.join('\n')
      return props
    }

    const replaced = (id, warn) => warn(`"${id}" already exists, so it is replaced`)
    // "a row, column, code block, grid, table or group": what stagger works on
    const GROUPS = nounList([...LAYOUT_NAMES, GROUP])

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

    // After every line: put attached shapes and group members where their refs now are
    // (several passes, for chains), and fit each group's box round its members.
    function settle(meta) {
      fitCode(meta)
      fitSpans(meta)
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
        const b = unionBounds([...members, ...indices], shapes)
        if (group.layout) {
          // a row / column is placed by its first cell: its box is its cells' (cx, cy: to its middle)
          const before = [group.w, group.h, group.cx, group.cy].join()
          Object.assign(group, { w: b.x1 - b.x0, h: b.y1 - b.y0, cx: (b.x0 + b.x1) / 2 - group.x, cy: (b.y0 + b.y1) / 2 - group.y })
          // its panel grows and shrinks with it, in the time its cells take
          if (panel && meta && [group.w, group.h, group.cx, group.cy].join() !== before) retime(meta, group.uid, busiest(meta, members))
          continue
        }
        group.w = 2 * Math.max(group.x - b.x0, b.x1 - group.x)
        group.h = 2 * Math.max(group.y - b.y0, b.y1 - group.y)
      }
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
    function schedule(meta, uid, props, { dur = speedOf(props), after = 0 } = {}) {
      const record = tween(meta, uid)
      const easing = props.ease ?? defaults.ease
      if (easing) record.ease = easing
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
      if (colon) throw new Error('"camera" takes no colon, e.g. "camera at 4,3 zoom 2"')
      const props = parseProps(tokenize(rest), 0, 'camera', shapes)
      if (props.at?.kind === 'place') throw new Error('"camera at" takes "x,y" or a shape id')
      if (!Object.keys(props).some((key) => ['at', 'x', 'y', 'travel', 'zoom', 'reset'].includes(key))) throw new Error('"camera" expects at, travel, zoom or reset, e.g. "camera at 4,3 zoom 2"')
      if (props.reset && (props.at || props.x || props.y || props.travel || props.zoom)) throw new Error('"camera reset" takes only a speed, a delay and an ease')
      if (props.travel && (props.at || props.x || props.y)) throw new Error('"camera travel" sets the route, so it can\'t go with at / x / y')

      const before = JSON.stringify(camera)
      const next = props.reset ? { x: null, y: null, zoom: 1 } : { ...camera }
      const centre = context.centre // the drawing's centre, when the grid is fixed
      const axis = (n, key, from = camera) => {
        const current = from[key] ?? centre?.[key]
        if (n.rel && current == null) throw new Error('a relative camera move needs a fixed grid, or an absolute "camera at" first')
        return numberValue(n, current, { unit: CELL, coord: true })
      }
      const refCentre = (ref) => {
        const b = bounds(shapes.get(ref), shapes)
        return { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 }
      }
      if (props.at?.kind === 'ref') {
        Object.assign(next, refCentre(props.at.ref))
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
          const pt = stop.kind === 'ref' ? refCentre(stop.ref) : { x: axis(stop.x, 'x', prev), y: axis(stop.y, 'y', prev) }
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
      const cameraLine = text.match(/^camera(\s*:)?(?:\s+(.*))?$/i)
      if (cameraLine) return runCameraLine(cameraLine, meta, warn)
      const defaultsLine = text.match(/^defaults(\s*:)?(?:\s+(.*))?$/i)
      if (defaultsLine?.[1]) throw new Error('"defaults" takes no colon, e.g. "defaults fill blue"')
      const match = defaultsLine ? ['', 'defaults', defaultsLine[2] || ''] : text.match(/^([^:\s]+)\s*:\s*(.*)$/)
      if (!match) throw new Error('expected "id: …" (or defaults, camera, pause, auto)')
      const id = match[1]
      const tokens = tokenize(match[2])

      if (defaultsLine) {
        const props = parseProps(tokens, 0, 'defaults', shapes)
        for (const [key, look] of Object.entries(LOOKS)) { const problem = props[key] && look.check?.(props[key]); if (problem) warn(problem) }
        if (props.reset) { for (const key of Object.keys(defaults)) delete defaults[key]; delete props.reset }
        const before = JSON.stringify(defaults)
        Object.assign(defaults, props)
        if (JSON.stringify(defaults) === before && !tokens.some((t) => t.lower === 'clear')) warn('this defaults line changes nothing')
        return
      }

      if (!ID.test(id)) throw new Error(`"${id}" isn't a valid id (letters, digits, _ - and ., starting with a letter)`)
      if (RESERVED.has(id.toLowerCase())) throw new Error(`"${id}" is a reserved word, so it can't be an id`)

      const first = tokens[0]
      // "v: var 67 at 5,3": a rect that holds a value (a number, "text" or null), straight after "var"
      const isVar = first?.kind === 'word' && first.lower === 'var'
      const varValue = isVar ? valueOf(tokens[1]) : undefined
      const type = isVar ? 'rect' : first && (first.kind === 'res' ? (RESOURCE_TYPES.includes(first.name) ? first.name : null) : (SHAPE_TYPES.includes(first.lower) ? first.lower : null))
      if (first?.kind === 'res' && !type) throw new Error(`unknown shape "${first.name}(…)"`)
      const existing = shapes.get(id)

      // "arr: row [5 3 8 1] at 2,3" (or column): its cells are arr.0, arr.1, …
      const word = first?.kind === 'word' ? first.lower : ''
      if (LAYOUT_TYPES.includes(word)) return createLayout(id, word, tokens, existing, meta, warn)
      // a verb: delete, swap, insert, remove, copy, group, ungroup (LINES)
      if (LINES[word]?.verb && (LINES[word].on?.(existing) ?? true)) return VERBS[word](id, existing, tokens, meta, warn, word)

      // "l: arrow …" on a line or curve that already exists, with no new ends, puts a head on it
      // (rather than replacing it with an arrow shape): read as a change, where "arrow" is the flag
      const addsHead = SHAPES[type]?.head && existing && LINE_TYPES.includes(existing.type)
        && !tokens.some((t) => t.kind === 'word' && ['from', 'to'].includes(t.lower))
      if (type && !addsHead) {
        const props = propsOf(type, tokens, varValue ? 2 : 1, 'create')
        if (isVar && props.label !== undefined) throw new Error(`a var's value goes straight after "var", e.g. "${id}: var 67" or "${id}: var "Dog""`)
        if (props.stagger) warn(`"stagger" works on a change to ${GROUPS} (or making ${LAYOUT_NOUNS})`)
        const shape = { ...baseShape(type), id, uid: newUid() }
        if (isVar) Object.assign(shape, { var: true, holds: true })
        checkParts(shape, props)
        applyDefaults(shape)
        if (RESOURCES[type]) RESOURCES[type](shape, first.arg, context)
        applyProps(shape, props, true, warn, meta)
        if (isVar) setValue(shape, varValue || { label: '' })
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
        return
      }

      if (!existing) {
        const word = first?.kind === 'word' ? first.lower : ''
        const known = !word || KEYWORDS[word] || RESERVED.has(word)
        throw new Error(known ? `no shape called "${id}" (to create one, put a type after the colon, e.g. "${id}: rect")` : `unknown shape type "${first.value}"`)
      }
      // "v1: a.1" / "a.2: v2": a copy of another var's or cell's value glides over
      if (existing.holds && holderRef(first)) return assignValue(existing, holderRef(first, 'copy from'), tokens, meta, warn)
      // "v: 123" / "arr.2: null": a new value for a var or a row's / column's cell ("text" is a label)
      const newValue = existing.holds && first?.kind === 'word' ? valueOf(first) : undefined
      const props = propsOf(existing.type, tokens, newValue ? 1 : 0, 'change')
      if (newValue && props.label !== undefined) throw new Error('give one value: a number, "quoted" text or null')
      // "s: "print(y)"": a one-line code block's text is its line's
      if (LAYOUTS[existing.layout]?.lines && props.label !== undefined) {
        const { item, base } = LAYOUTS[existing.layout]
        if (existing.members.length !== 1) throw new Error(`"${id}" has ${existing.members.length} ${item}s, so say which one, e.g. "${cellId(id, base)}: "x = 1""`)
        return runLine(`${existing.members[0]}: ${match[2]}`, meta, warn)
      }
      checkParts(existing, props)
      if (props.effect) warn(`"${props.effect}" only applies when a shape is created or deleted`)
      const order = isGroup(existing) ? staggerOrder(existing) : null
      if (order && takeBareNumber(props)) numberEach(existing.members.map((m) => shapes.get(m)), props, meta, warn)
      if (order) restyleMembers(existing, props, meta, warn) // takes the members' look out of props
      const shape = structuredClone(existing)
      if (newValue) setValue(shape, newValue)
      const path = applyProps(shape, props, false, warn, meta)
      if (path) tween(meta, shape.uid).path = path
      else if (props.at || props.x || props.y) tween(meta, shape.uid).path = null // a later straight move wins
      shapes.set(id, shape)
      schedule(meta, shape.uid, props, { dur: speedOf(props) * (props.travel?.length || 1) }) // travel: speed per hop
      updateParts(shape, props, meta, warn)
      if (order) applyStagger(shape, order, props, meta, warn)
      else if (props.stagger) warn(`"stagger" works on ${GROUPS}, and "${id}" isn't one`)
    }

    // Making a shape (or a copy, or a group) has no members to stagger
    function noStagger(props, warn) {
      if (props.stagger) warn(`"stagger" works on a change to ${GROUPS} (or making ${LAYOUT_NOUNS})`)
    }

    // "a: delete": a shape goes, with the line's exit effect (a group's members and a var's or
    // row's name and indices too)
    function deleteShape(id, existing, tokens, meta, warn) {
      if (!existing) throw noShape(id)
      refuseView(existing, 'delete')
      const where = tokens[1]?.kind === 'word' && (/^\d+$/.test(tokens[1].value) || tokens[1].lower === EDIT_WORDS.end) ? tokens[1].value : null
      if (existing.layout && where) throw new Error(`"delete" deletes the whole ${existing.layout}: to take one cell out, "${id}: remove ${where}"`)
      const props = parseProps(tokens, 1, 'delete', shapes)
      const order = staggerOrder(existing) // taken before its members go
      const lines = LAYOUTS[existing.layout]?.typeInTurn ? existing.members.map((m) => shapes.get(m)).filter(Boolean) : []
      const parts = partsOf(existing)
      removeShape(existing, props, meta, warn)
      if (lines.length && inTurn(props)) typeInTurn(existing, lines, parts, props, meta, true)
      applyStagger(existing, order, props, meta, warn)
    }

    // "b: copy a": an identical copy that starts on the original, so a move on the same line
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
      if (path) tween(meta, shape.uid).path = path
      if (existing) {
        replaced(id, warn)
        schedule(meta, existing.uid, props).exit = 'fade'
      }
      shapes.set(id, shape)
      schedule(meta, shape.uid, props, { dur: speedOf(props) * (props.travel?.length || 1) }).enter = 'copy' // travel: speed per hop
    }

    // "g: group [a b c]": shapes that act as one, riding on the group at their offsets. The shapes
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
    }

    // "g: ungroup": the group goes, its shapes stay where they are
    function ungroup(id, existing, tokens, meta) {
      if (!existing) throw noShape(id)
      if (!isGroup(existing) || bound(existing)) throw new Error(`"${id}" isn't a group`)
      parseProps(tokens, 1, 'ungroup', shapes)
      for (const m of existing.members) { const member = shapes.get(m); if (member?.attach?.ref === id) member.attach = null }
      shapes.delete(id)
      tween(meta, existing.uid).exit = 'fade'
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

    // "arr: fill green" on a row, column or group: the look goes to each of its shapes that takes
    // it. With a stagger, a highlight does too (one each, in turn, rather than one round them all).
    function restyleMembers(group, props, meta, warn) {
      if (group.layout) {
        for (const key of ['size', 'width', 'height']) {
          if (props[key]) throw new Error(`a ${group.layout}'s cell size is set when it's made`)
        }
      }
      const staggered = props.stagger ?? defaults.stagger
      const look = pick(props, staggered ? [...CELL_STYLE, 'highlight'] : CELL_STYLE)
      if (!Object.keys(look).length) return
      for (const key of Object.keys(look)) delete props[key]
      if (group.layout) withRowMax(group, look)
      // cells added to a row / column later take its look as it is now
      if (group.cell) applyProps(group.cell, pick(look, CELL_STYLE.filter((key) => !APPLIES[key] || APPLIES[key].includes(group.cell.type))), false, () => {}, meta)
      const used = new Set()
      for (const member of groupMembers(group)) {
        if (isGroup(member)) continue
        const own = pick(look, Object.keys(look).filter((key) => key === 'highlight' || APPLIES[key].includes(member.type)))
        if (!Object.keys(own).length) continue
        Object.keys(own).forEach((key) => used.add(key))
        const changed = structuredClone(member)
        applyProps(changed, own, false, warn, meta)
        shapes.set(changed.id, changed)
        schedule(meta, changed.uid, props)
      }
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
    let assignValue, checkParts, createLayout, fitCode, fitSpans, holderRef, readLines, refuseView, setValue,
      typeInTurn, updateParts, valueOf, withRowMax
    const cx = { shapes, defaults, newUid, context, bound, partsOf, effectOf, layerOf, inTurn, noShape, replaced, applyDefaults, applyProps, applyStagger, busiest, delayOf,
      freezeEndsAttachedTo, numberEach, removeShape, retime, schedule, speedOf, takeBareNumber,
      warnEffect }
    const parts = window.Anim.COMPILER_PARTS.map((part) => part(cx))
    for (const part of parts) Object.assign(cx, part.functions)
    const link = () => {
      ({ assignValue, checkParts, createLayout, fitCode, fitSpans, holderRef, readLines, refuseView, setValue,
        typeInTurn, updateParts, valueOf, withRowMax } = cx)
    }
    for (const part of [...parts, { link }]) part.link()

    // The verbs (LINES with verb: true), each run as (id, existing shape, tokens, meta, warn, word)
    const VERBS = { delete: deleteShape, copy: copyShape, group: makeGroup, ungroup, ...Object.assign({}, ...parts.map((part) => part.verbs)) }

    return { shapes, runLine, settle, camera: () => ({ ...camera }) }
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
  // while it moves (the unit a swap passes in front).
  function tween(meta, uid) {
    let record = meta.tweens.get(uid)
    if (!record) meta.tweens.set(uid, (record = { dur: 0, delay: 0, path: null, enter: null, exit: null, from: null, effect: null }))
    return record
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
    // the same, with where each is (step, beat, and line in the beat's scene), for an editor
    const issues = []

    steps.forEach((step, si) => {
      step.beats.forEach((beat, bi) => {
        const meta = { tweens: new Map(), pause: null, auto: false }
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
            if (runTimingLine(text, meta)) return
            compiler.runLine(text, meta, warn)
            compiler.settle(meta)
          } catch (error) {
            errors.push(`${where(li)}: ${error.message} — "${text}"`)
            issues.push({ error: true, step: si, beat: bi, line: li, message: error.message })
          }
        })
        const state = new Map([...compiler.shapes].map(([id, shape]) => [id, structuredClone(shape)]))
        beats.push({ step: si, beat: bi, state, meta, camera: compiler.camera() })
      })
    })

    return { beats, errors, warnings, issues }
  }

  Object.assign(window.Anim, { compile, COMPILER_PARTS: [], cellId, markId, indexId, nameId, viewKey, viewId, headId, baseOf, cellRange, pick, baseShape, numberValue, tween })
})()
