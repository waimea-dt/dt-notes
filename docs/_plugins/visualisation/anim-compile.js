/**
 * anim-compile.js - Part of the animation plugin (animation.js): compiling each beat's scene
 * lines into a snapshot of every shape, plus how each change animates (tweens) and the camera.
 */

;(function () {
  const { CELL, cellToPx, APPLIES, LINE_TYPES, resolveEnds, boxCentre, PLACE_GAP,
    placeNextTo, attachPos, buildPolyline, buildPath, resolveAttachments, unionBounds, NORMAL_MS,
    parseProps, tokenize, bounds, ID, RESERVED, RESOURCE_TYPES, SHAPE_TYPES, LAYOUT_TYPES, EMPHASES, ENTRANCES, entranceFor,
    parseAs, lucideIcon, KEYWORDS, NUMBER, linePoints, besideOf, offsetFrom, CHOREOGRAPHY: C, CELL_STYLE, LINES,
    wordFor, LOOKS, KEPT_STYLE, article, SHAPES, kindOf, HIGHLIGHT_KINDS, LAYOUTS, nounOf, FONT,
    textWidth, BARS, mergeBoxes } = window.Anim

  // The ids of the shapes that go with a var, row or column: a row's / column's cells (id.0,
  // id.1, …; a code block's lines from id.1) and their index labels (id.index.0, …), and the name
  // (id.name). Cells are numbered from the layout's base (LAYOUTS): `k` is a cell's number as
  // written, and its place in the row is k - base.
  // A grid's / table's (LAYOUTS: views) rows and columns are named like a row's cells, after the
  // view's word if it has one (g.1, g.col.2), and its heading t.head; their cells like a row's
  // (g.1.2, t.head.2). Their indices take the same last parts (g.index.1, g.index.col.2).
  const cellId = (id, k) => `${id}.${k}`
  const indexId = (id, k) => `${id}.index.${k}`
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
  // an absolute value a grid coordinate (the centre of that cell).
  function numberValue(n, current, { unit = 1, coord = false } = {}) {
    if (n.rel && current !== undefined && current !== null) return current + n.v * unit
    return coord ? cellToPx(n.v) : n.v * unit
  }

  function createCompiler(context) {
    const shapes = new Map() // id -> current shape
    let defaults = {}
    let camera = { x: null, y: null, zoom: 1 } // centre in px (null: the drawing's centre)
    let uid = 0
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

    // Applies parsed props to a shape (a fresh one when creating, a copy when changing).
    // Returns the curve's points (start, vias, end) when the line has `via`, otherwise null.
    function applyProps(shape, props, creating, warn, meta) {
      const isLine = LINE_TYPES.includes(shape.type)
      for (const ref of [props.at?.ref, props.from?.ref, props.to?.ref, props.attach?.ref, ...(props.via || []).map((v) => v.ref),
        ...(props.travel || []).map((v) => v.ref)]) {
        if (ref && LINE_TYPES.includes(shapes.get(ref).type)) throw new Error(`"${ref}" is a line, so it can't be used as a position`)
      }
      // Relative values need something to be relative to: never when creating
      const now = (value) => (creating ? undefined : value)
      const coord = (n, current) => numberValue(n, current, { unit: CELL, coord: true })

      if (props.label !== undefined) { shape.label = props.label; if (shape.nil) shape.nil = false }
      applyLook(shape, props, creating, warn)

      // highlight: each kind (HIGHLIGHT_KINDS) stays until clear; "number" with no value is the next
      if (props.highlight) {
        const none = Object.fromEntries(Object.entries(HIGHLIGHT_KINDS).map(([kind, h]) => [kind, 'off' in h ? h.off : false]))
        const hl = { ...none, ...shape.hl }
        for (const item of props.highlight) {
          const kind = HIGHLIGHT_KINDS[typeof item === 'object' ? 'number' : item]
          if (kind?.applies && !kind.applies(shape)) throw new Error(kind.refuse(shape))
          if (item === 'clear') Object.assign(hl, none)
          else if (typeof item === 'object') hl.number = lastNumber = item.number ?? lastNumber + 1
          else hl[item] = true
        }
        shape.hl = hl
      }
      // pulse / shake / wobble / bounce / glow: one-off effects this beat, on an existing shape
      // (and a group's members, and the shapes it covers: a span's cells)
      // signal / signal-reverse: a blip along a line (a group's lines)
      if (props.emphasis) {
        const signal = EMPHASES[props.emphasis].along
        if (signal && !isLine && shape.type !== 'group') throw new Error(`"${props.emphasis}" travels along a line, arrow or curve`)
        const covered = (shape.covers || []).map((id) => shapes.get(id)).filter(Boolean)
        // a grid's row or column covers its members too, so each is taken once
        const targets = [...new Set([shape, ...groupMembers(shape), ...covered])].filter((target) => !signal || LINE_TYPES.includes(target.type))
        if (creating) warn(`"${props.emphasis}" plays on a shape that already exists, so it does nothing here`)
        else if (!targets.length) warn(`"${shape.id}" has no lines in it, so "${props.emphasis}" does nothing`)
        else {
          for (const target of targets) schedule(meta, target.uid, props).effect = props.emphasis // a group's members (a span's cells) play it too
        }
      }
      if (props.callout) shape.callout = props.callout.none ? null : { text: props.callout.text, side: props.callout.side }

      if (isLine && (props.travel || props.follow || props.attach)) throw new Error('a line has no single position, so it can\'t travel, follow or attach (its ends can follow shapes)')
      if (isLine) {
        if (props.x || props.y || props.at?.kind === 'ref' || props.at?.kind === 'place') throw new Error('a line has no single position: use from / to, or "move +x,+y" to shift it')
        if (props.at) {
          if (!props.at.x.rel || !props.at.y.rel || creating) throw new Error('a line has no single position: use from / to, or "move +x,+y" to shift it')
          const ends = resolveEnds(shape, shapes)
          shape.from = { x: coord(props.at.x, ends.from.x), y: coord(props.at.y, ends.from.y) }
          shape.to = { x: coord(props.at.x, ends.to.x), y: coord(props.at.y, ends.to.y) }
          // a curve's free via points move with it (vias on shapes stay on them)
          if (shape.via) shape.via = shape.via.map((p) => (p.ref ? p : { x: coord(props.at.x, p.x), y: coord(props.at.y, p.y) }))
        }
        for (const key of ['from', 'to']) {
          const end = props[key]
          if (!end) continue
          if (end.kind === 'ref') { shape[key] = { ref: end.ref }; continue }
          const current = creating ? undefined : resolveEnds(shape, shapes)[key]
          shape[key] = { x: coord(end.x, current?.x), y: coord(end.y, current?.y) }
        }
        if (creating && (!shape.from || !shape.to)) throw new Error(`${shape.type === 'curve' ? 'a curve' : 'a line'} needs both ends, e.g. "from 2,3 to 7,8" or "from a to b"`)
        if (props.via && shape.type !== 'curve') throw new Error('"via" bends a curve, so it can\'t be used on a line: use "curve" instead (e.g. "c: curve from a to b via 5,2")')
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
        if (creating && shape.type === 'curve' && !shape.via?.length) warn('a curve with no "via" points is a straight line')
        return null
      }

      const positioned = props.at || props.x || props.y
      // a shape placed by what it belongs to (SHAPES: owned), or a grid's row or column (a view),
      // laid out in its grid, can't be moved on its own
      const owned = kindOf(shape).owned
      if ((owned || shape.view) && (positioned || props.via || props.travel || props.follow || props.attach || props.detach)) {
        throw new Error(shape.view ? `"${shape.id}" is laid out in "${shape.part}", so it can't be moved on its own: move "${shape.part}"`
          : `${article(nounOf(shape))} ${nounOf(shape)} can't be moved: ${owned}`)
      }
      if (props.travel && props.follow) throw new Error('give either "travel" or "follow", not both')
      if ((props.travel || props.follow) && (positioned || props.via)) throw new Error('"travel" and "follow" set the route, so they can\'t go with at / move / x / y / via')
      if ((props.travel || props.follow) && creating) throw new Error('"travel" and "follow" only work when moving an existing shape')
      if (props.attach && (positioned || props.via || props.travel || props.follow)) throw new Error('"attach" sets the position, so it can\'t go with a move')
      if (props.via && creating) throw new Error('"via" only works when moving an existing shape')
      if (props.via && !props.at && !props.x && !props.y) throw new Error('"via" needs a move too, e.g. "move 9,3 via 5,1"')
      const start = { x: shape.x, y: shape.y }

      const at = props.at
      if (at?.kind === 'abs') { shape.x = coord(at.x, now(shape.x)); shape.y = coord(at.y, now(shape.y)) }
      if (at?.kind === 'ref') Object.assign(shape, boxCentre(shapes.get(at.ref)))
      if (at?.kind === 'place') {
        const gap = props.gap ? props.gap.v * CELL : PLACE_GAP
        Object.assign(shape, placeNextTo(shape, shapes.get(at.ref), at.place, gap))
      }
      if (props.x) shape.x = coord(props.x, now(shape.x))
      if (props.y) shape.y = coord(props.y, now(shape.y))

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
      if (creating && (shape.x === undefined || shape.y === undefined)) throw new Error('needs a position, e.g. "at 3,2"')

      // Moving an attached shape releases it; moving a group member keeps it in the group
      // (at its new place in it).
      const moved = positioned || props.via || props.travel || props.follow
      const keepOffset = () => {
        if (!moved || !shape.attach || props.attach) return
        if (shape.attach.kind !== 'offset') { shape.attach = null; return }
        const parent = shapes.get(shape.attach.ref)
        shape.attach.dx = shape.x - parent.x
        shape.attach.dy = shape.y - parent.y
      }

      if (props.travel) {
        // hop by hop through the stops; a signed stop is relative to the one before
        const points = [start]
        for (const stop of props.travel) {
          const prev = points[points.length - 1]
          points.push(stop.kind === 'ref' ? boxCentre(shapes.get(stop.ref)) : { x: coord(stop.x, prev.x), y: coord(stop.y, prev.y) })
        }
        Object.assign(shape, points[points.length - 1])
        keepOffset()
        const path = buildPolyline(points)
        path.hops = points // eased hop by hop at playback (pointOnHops)
        return path
      }
      if (props.follow) {
        const line = shapes.get(props.follow.ref)
        if (!LINE_TYPES.includes(line.type)) throw new Error(`"${props.follow.ref}" isn't a line or arrow, so it can't be followed`)
        // along the line (a curve's whole path), from the end it starts at
        const along = linePoints(resolveEnds(line, shapes)).map(({ x, y }) => ({ x, y }))
        if (props.follow.reverse) along.reverse()
        // The line stops short of a shape at its far end, so finish on that shape's centre (as
        // the route starts from wherever the shape is)
        const farEnd = props.follow.reverse ? line.from : line.to
        if (farEnd?.ref && shapes.has(farEnd.ref)) along.push(boxCentre(shapes.get(farEnd.ref)))
        Object.assign(shape, along[along.length - 1])
        keepOffset()
        return buildPolyline([start, ...along])
      }
      keepOffset()
      if (!props.via) return null

      // Via points: signed numbers are relative to where the shape starts.
      const vias = props.via.map((via) => {
        if (via.kind === 'ref') return boxCentre(shapes.get(via.ref))
        if (via.kind === 'place') return placeNextTo(shape, shapes.get(via.ref), via.place, PLACE_GAP)
        return { x: coord(via.x, start.x), y: coord(via.y, start.y) }
      })
      return buildPath([start, ...vias, { x: shape.x, y: shape.y }])
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
      if (shape.type !== 'group') return []
      return shape.members.flatMap((id) => { const m = shapes.get(id); return m ? [m, ...groupMembers(m)] : [] })
    }

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
        if (group.type !== 'group') continue
        // a row / column emptied by remove: nothing, at its first cell's place
        if (!group.members.length) { if (group.layout) Object.assign(group, { w: 0, h: 0, cx: 0, cy: 0 }); continue }
        const members = group.members.map((id) => shapes.get(id)).filter(Boolean)
        // a layout with a panel (LAYOUTS) takes its indices in too: the panel goes behind them
        const panel = LAYOUTS[group.layout]?.panel
        const indices = panel ? [...shapes.values()].filter((s) => s.part === group.id && s.id.startsWith(indexId(group.id, ''))) : []
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
      if (shape.type === 'group') return // its members show it (or say why not)
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
        if (props.reset) { defaults = {}; delete props.reset }
        const before = JSON.stringify(defaults)
        defaults = { ...defaults, ...props }
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
      if (LINES[word]?.verb) return VERBS[word](id, existing, tokens, meta, warn, word)

      // "l: arrow …" on a line or curve that already exists, with no new ends, puts a head on it
      // (rather than replacing it with an arrow shape): read as a change, where "arrow" is the flag
      const addsHead = type === 'arrow' && existing && LINE_TYPES.includes(existing.type)
        && !tokens.some((t) => t.kind === 'word' && ['from', 'to'].includes(t.lower))
      if (type && !addsHead) {
        const props = parseProps(tokens, varValue ? 2 : 1, 'create', shapes)
        if (isVar && props.label !== undefined) throw new Error(`a var's value goes straight after "var", e.g. "${id}: var 67" or "${id}: var "Dog""`)
        if (props.stagger) warn('"stagger" works on a change to a row, column or group (or making a row / column)')
        const shape = { ...baseShape(type), id, uid: ++uid }
        if (isVar) Object.assign(shape, { var: true, holds: true })
        checkParts(shape, props)
        applyDefaults(shape)
        if (RESOURCES[type]) RESOURCES[type](shape, first.arg, context)
        applyProps(shape, props, true, warn, meta)
        if (isVar) setValue(shape, varValue || { label: '' })
        shape.layer = props.layer || defaults.layer || 'normal'
        if (existing) {
          // Lines attached to the old shape attach to its replacement (same id).
          warn(`"${id}" already exists, so it is replaced`)
          schedule(meta, existing.uid, props).exit = 'fade'
        }
        shapes.set(id, shape)
        schedule(meta, shape.uid, props).enter = props.effect || defaults.effect || 'fade'
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
      const props = parseProps(tokens, newValue ? 1 : 0, 'change', shapes)
      if (newValue && props.label !== undefined) throw new Error('give one value: a number, "quoted" text or null')
      // "s: "print(y)"": a one-line code block's text is its line's
      if (LAYOUTS[existing.layout]?.lines && props.label !== undefined) {
        const { item, base } = LAYOUTS[existing.layout]
        if (existing.members.length !== 1) throw new Error(`"${id}" has ${existing.members.length} ${item}s, so say which one, e.g. "${cellId(id, base)}: "x = 1""`)
        return runLine(`${existing.members[0]}: ${match[2]}`, meta, warn)
      }
      checkParts(existing, props)
      if (props.effect) warn(`"${props.effect}" only applies when a shape is created or deleted`)
      const order = existing.type === 'group' ? staggerOrder(existing) : null
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
      else if (props.stagger) warn(`"stagger" works on a row, column or group, and "${id}" isn't one`)
    }

    // A cell's number as written after a verb ("swap 0 3", "range 3 end"): a whole number, or end,
    // the last cell (after: the place after it, where an insert goes on the end). Undefined if it's
    // neither.
    function placeOf(row, token, { after = false } = {}) {
      if (token?.kind === 'word' && token.lower === 'end') return baseOf(row.layout) + row.members.length - (after ? 0 : 1)
      return parseAs('index', token)
    }

    // A grid's lines from the top, as views: its heading (if it has one), then its rows
    const gridLines = (grid) => [...(grid.heading ? [grid.heading] : []), ...grid.views.row]

    // A place in a grid (LAYOUTS: views), "row.column" ("1.2", "end.0", a table's "head.3"), as its
    // line from the top (gridLines) and its column, both from 0. Undefined if it isn't one; an error
    // if the grid has no such row or column.
    function gridPlaceOf(grid, token) {
      const parts = token?.kind === 'word' ? token.lower.split('.') : []
      if (parts.length !== 2) return undefined
      const kind = LAYOUTS[grid.layout]
      const base = baseOf(grid.layout)
      const lines = gridLines(grid)
      const across = shapes.get(lines[0]).members.length
      const offset = grid.heading ? 1 : 0 // a table's rows come after its heading
      const number = (part, n) => (part === 'end' ? n - 1 : /^\d+$/.test(part) ? Number(part) - base : undefined)
      const r = kind.head && parts[0] === kind.head.word ? 0 : number(parts[0], grid.views.row.length) + offset
      const c = number(parts[1], across)
      if (Number.isNaN(r) || c === undefined) return undefined
      const rows = grid.views.row.length ? `${base} to ${base + grid.views.row.length - 1}` : 'none'
      if (r < 0 || r >= lines.length) throw new Error(`"${grid.id}" has no row ${parts[0]} (its rows are ${rows}${grid.heading ? `, and its heading is ${kind.head.word}` : ''})`)
      if (c < 0 || c >= across) throw new Error(`"${grid.id}" has no column ${parts[1]} (its columns are ${base} to ${base + across - 1})`)
      return { r, c }
    }

    // Two places in a layout, written after a verb at tokens[i] and [i + 1] (a row's "0 2" or
    // "3 end", a grid's "1.2 3.4"), either way round: the cells between them (a grid's: the block
    // they're the corners of), in order, and the places, lowest first (as a span keeps them).
    // `example` is the line as it might be written, for the message when they're missing.
    function cellsBetween(row, tokens, i, word, example) {
      if (LAYOUTS[row.layout].views) {
        const [a, b] = [tokens[i], tokens[i + 1]].map((token) => gridPlaceOf(row, token))
        if (!a || !b) throw new Error(`"${word}" expects two of a ${LAYOUTS[row.layout].noun}'s cells, as row.column, e.g. ${example('0.0', '1.2')}`)
        const from = { r: Math.min(a.r, b.r), c: Math.min(a.c, b.c) }
        const to = { r: Math.max(a.r, b.r), c: Math.max(a.c, b.c) }
        return { from, to, cells: placedCells(row, { from, to }) }
      }
      const base = baseOf(row.layout)
      const [a, b] = [tokens[i], tokens[i + 1]].map((token) => placeOf(row, token))
      if (a === undefined || b === undefined) throw new Error(`"${word}" expects two cell numbers, e.g. ${example(base, base + 2)}`)
      const n = row.members.length
      for (const k of [a, b]) {
        if (k < base || k >= base + n) throw new Error(`"${row.id}" has no cell ${k} (its cells are ${cellRange(row, n)})`)
      }
      const [from, to] = a <= b ? [a, b] : [b, a]
      return { from, to, cells: placedCells(row, { from, to }) }
    }

    // The cells at some places of a layout (as cellsBetween gives them): a row's from one number to
    // another, a grid's in the block between two corners. Places past the end (after a remove) are
    // left out.
    function placedCells(row, { from, to }) {
      const ids = LAYOUTS[row.layout].views
        ? gridLines(row).slice(from.r, to.r + 1).flatMap((line) => shapes.get(line).members.slice(from.c, to.c + 1))
        : row.members.slice(from - baseOf(row.layout), to - baseOf(row.layout) + 1)
      return ids.map((cell) => shapes.get(cell)).filter(Boolean)
    }

    // Where a shape is laid out relative to `frame`, from their offset attachments: a cell in its
    // row, or a grid's cell in one of its rows or columns (both laid out in the grid). Each is
    // followed up to the first shape they're both laid out in.
    function offsetIn(shape, frame) {
      const chain = (start) => {
        const out = new Map()
        let dx = 0
        let dy = 0
        for (let s = start, depth = 0; s && depth < 16; depth++) {
          out.set(s.id, { dx, dy })
          if (s.attach?.kind !== 'offset') break
          dx += s.attach.dx
          dy += s.attach.dy
          s = shapes.get(s.attach.ref)
        }
        return out
      }
      const mine = chain(shape)
      for (const [id, d] of chain(frame)) {
        const m = mine.get(id)
        if (m) return { x: m.dx - d.dx, y: m.dy - d.dy }
      }
      return { x: shape.x - frame.x, y: shape.y - frame.y }
    }

    // "arr: range 0 3 fill red": a change to some of a row's / column's cells, each changed as if on
    // its own line (stagger: in cell order). Only a look, highlights, emphasis and callouts: the cells
    // stay in the row (LINES: range).
    function changeRange(id, row, tokens, meta, warn) {
      if (!row) throw new Error(`no shape called "${id}"`)
      if (!row.layout) throw new Error(`"range" picks some of a row's or column's cells, and "${id}" isn't one`)
      const { cells } = cellsBetween(row, tokens, 1, 'range', (a, b) => `"${id}: range ${a} ${b} fill red"`)
      const props = parseProps(tokens, 3, 'range', shapes)
      const own = { ...props }
      delete own.stagger
      withRowMax(row, own)
      if (takeBareNumber(own)) numberEach(cells, own, meta, warn)
      for (const cell of cells) {
        const changed = structuredClone(cell)
        applyProps(changed, own, false, warn, meta)
        shapes.set(changed.id, changed)
        schedule(meta, changed.uid, props)
      }
      applyStagger(row, cells.map((cell) => [cell.uid]), props, meta, warn)
    }

    // "s: span arr 0 2": a box round some of a row's / column's / code block's places (SHAPES: span),
    // as one shape for highlights, a callout and a name. It's a part of the row (it goes when the
    // row does) and stays on its places through swaps, inserts and removes (fitSpans). Spanning an
    // existing span again moves it to the new places, gliding there.
    function makeSpan(id, existing, tokens, meta, warn) {
      const example = `e.g. "${id}: span arr 0 2"`
      const rowId = parseAs('id', tokens[1], shapes)
      const row = rowId && shapes.get(rowId)
      if (!row) throw new Error(`"span" expects a row, column or code block and two of its cell numbers, ${example}${tokens[1] && !rowId ? `: no shape called "${tokens[1].value}"` : ''}`)
      if (!row.layout) throw new Error(`"span" goes round some of a row's, column's or code block's cells, and "${rowId}" isn't one`)
      const { from, to } = cellsBetween(row, tokens, 2, 'span', (a, b) => `"${id}: span ${rowId} ${a} ${b}"`)
      const props = parseProps(tokens, 4, 'span', shapes)
      if (rowId === id) throw new Error('a span needs an id of its own')
      const respan = existing?.type === 'span'
      if (existing && !respan) {
        warn(`"${id}" already exists, so it is replaced`)
        removeShape(existing, props, meta, warn)
      }
      const shape = respan ? structuredClone(existing) : { ...baseShape('span'), id, uid: ++uid }
      shape.span = { of: rowId, from, to }
      shape.part = rowId
      checkParts(shape, props)
      if (!respan) applyDefaults(shape)
      fitSpan(shape)
      applyProps(shape, props, !respan, warn, meta)
      shapes.set(id, shape)
      const record = schedule(meta, shape.uid, props)
      if (!respan) record.enter = props.effect || defaults.effect || 'fade'
      else if (props.effect) warn(`"${props.effect}" only applies when a shape is created or deleted`)
      updateParts(shape, props, meta, warn)
    }

    // A span's box: round its places in its row (each cell's offset in the row and its size), and
    // the cells it covers (for a spotlight). Places past the row's end (after a remove) are left out.
    function fitSpan(span) {
      const row = shapes.get(span.span.of)
      const cells = placedCells(row, span.span)
      span.covers = cells.map((cell) => cell.id)
      const pad = C.spanPad * CELL
      // each cell's box at its place, measured from the row's first cell (bounds: aligned code lines too)
      const box = cells.length ? mergeBoxes(cells.map((cell) => bounds({ ...cell, ...offsetIn(cell, row) }, shapes)))
        : { x0: 0, y0: 0, x1: 0, y1: 0 }
      const dx = (box.x0 + box.x1) / 2
      const dy = (box.y0 + box.y1) / 2
      Object.assign(span, { w: cells.length ? box.x1 - box.x0 + 2 * pad : 0, h: cells.length ? box.y1 - box.y0 + 2 * pad : 0 })
      span.attach = offsetFrom(row.id, dx, dy)
      Object.assign(span, { x: row.x + dx, y: row.y + dy })
    }

    // After every line: each span refitted to its places, as its row's cells move (in the time its
    // busiest cell takes this beat)
    function fitSpans(meta) {
      for (const span of shapes.values()) {
        if (!span.span || !shapes.has(span.span.of)) continue
        const before = [span.w, span.h, span.attach.dx, span.attach.dy].join()
        fitSpan(span)
        if (meta && [span.w, span.h, span.attach.dx, span.attach.dy].join() !== before) {
          retime(meta, span.uid, busiest(meta, shapes.get(span.span.of).members.map((cell) => shapes.get(cell)).filter(Boolean)))
        }
      }
    }

    // "bar" on a row's / column's cells with no max (given, or a default): a full bar is its biggest
    // value now, the same for every cell. Adds it to `look`; `values` are the cells' values (default:
    // the row's cells).
    function withRowMax(row, look, values = row.members.map((id) => shapes.get(id)).filter(Boolean)) {
      if (!BARS[look.bar ?? defaults.bar] || look.max || defaults.max) return
      const biggest = Math.max(...values.map((value) => (value.nil ? NaN : parseFloat(value.label))).filter(Number.isFinite))
      if (biggest > 0) look.max = { v: biggest, rel: false }
    }

    // Making a shape (or a copy, or a group) has no members to stagger
    function noStagger(props, warn) {
      if (props.stagger) warn('"stagger" works on a change to a row, column or group (or making a row / column)')
    }

    // "a: delete": a shape goes, with the line's exit effect (a group's members and a var's or
    // row's name and indices too)
    function deleteShape(id, existing, tokens, meta, warn) {
      if (!existing) throw new Error(`no shape called "${id}"`)
      refuseView(existing, 'delete')
      const where = tokens[1]?.kind === 'word' && (/^\d+$/.test(tokens[1].value) || tokens[1].lower === 'end') ? tokens[1].value : null
      if (existing.layout && where) throw new Error(`"delete" deletes the whole ${existing.layout}: to take one cell out, "${id}: remove ${where}"`)
      const props = parseProps(tokens, 1, 'delete', shapes)
      const order = staggerOrder(existing) // taken before its members go
      const lines = LAYOUTS[existing.layout]?.typeInTurn ? existing.members.map((m) => shapes.get(m)).filter(Boolean) : []
      const parts = [...shapes.values()].filter((s) => s.part === id)
      removeShape(existing, props, meta, warn)
      if (lines.length && (props.effect || defaults.effect) === 'typed') typeInTurn(existing, lines, parts, props, meta, true)
      applyStagger(existing, order, props, meta, warn)
    }

    // "b: copy a": an identical copy that starts on the original, so a move on the same line
    // animates away from it
    function copyShape(id, existing, tokens, meta, warn) {
      const srcId = parseAs('id', tokens[1], shapes)
      if (!srcId) throw new Error(`"copy" expects a shape id${tokens[1] ? `: no shape called "${tokens[1].value}"` : ''}`)
      const src = shapes.get(srcId)
      if (src.type === 'group') throw new Error('a group can\'t be copied: copy its shapes instead')
      const props = parseProps(tokens, 2, 'copy', shapes)
      noStagger(props, warn)
      const fresh = { attach: null, hl: null, callout: null }
      const shape = { ...structuredClone(src), ...fresh, id, uid: ++uid }
      tween(meta, shape.uid).from = { ...structuredClone(src), ...fresh, uid: shape.uid }
      const path = applyProps(shape, props, false, warn, meta)
      if (path) tween(meta, shape.uid).path = path
      if (existing) {
        warn(`"${id}" already exists, so it is replaced`)
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
        if (m.view) throw new Error(`"${m.id}" is laid out in "${m.part}", so it can't go in a group: group "${m.part}"`)
        if (LINE_TYPES.includes(m.type) && (!m.from.ref || !m.to.ref)) throw new Error(`"${m.id}" is a line with a free end: group the shapes it joins instead, and it follows them`)
      }
      const b = unionBounds(list, shapes)
      const group = { ...baseShape('group'), id, uid: ++uid, members, x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, w: b.x1 - b.x0, h: b.y1 - b.y0 }
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
      if (!existing) throw new Error(`no shape called "${id}"`)
      if (existing.type !== 'group' || existing.view) throw new Error(`"${id}" isn't a group`)
      parseProps(tokens, 1, 'ungroup', shapes)
      for (const m of existing.members) { const member = shapes.get(m); if (member?.attach?.ref === id) member.attach = null }
      shapes.delete(id)
      tween(meta, existing.uid).exit = 'fade'
    }

    // The verbs (LINES with verb: true), each run as (id, existing shape, tokens, meta, warn, word)
    const VERBS = { delete: deleteShape, copy: copyShape, group: makeGroup, ungroup, swap: swapCells, insert: editCells, remove: editCells, range: changeRange, span: makeSpan }

    // A value a var or a row's / column's cell holds: a number, "quoted" text or null (shown muted)
    function valueOf(token) {
      if (token?.kind === 'str') return { label: token.value }
      if (token?.kind === 'word' && NUMBER.test(token.value)) return { label: token.value }
      if (token?.kind === 'word' && token.lower === 'null') return { label: 'null', nil: true }
      return undefined
    }
    function setValue(shape, value) {
      shape.label = value.label
      shape.nil = Boolean(value.nil)
    }
    const valueIn = (shape) => ({ label: shape.label, nil: shape.nil })
    // keep-style: the look a value takes with it (not its size, or highlights)
    const keptStyle = (props, shape) => ((props.keepStyle ?? defaults.keepStyle) ? pick(shape, KEPT_STYLE) : {})

    // A word naming another shape (not a keyword or a value): the var or cell it names, or, with
    // `use` (what it's for), an error if it isn't one. Without `use`, undefined if it isn't a name.
    function holderRef(token, use) {
      if (token?.kind !== 'word' || !ID.test(token.value) || KEYWORDS[token.lower] || RESERVED.has(token.lower)) return undefined
      const shape = shapes.get(token.value)
      if (!use) return token.value
      if (!shape) throw new Error(`unknown word "${token.value}" (and no var or cell has that name to ${use})`)
      if (!shape.holds) throw new Error(`"${token.value}" doesn't hold a value, so there's nothing to ${use}: use a var or a row's / column's cell`)
      return shape
    }

    // A flyer: a copy that exists only while the beat plays, gliding hop by hop through `hops` to
    // arrive `arrive` ms in (after the line's delay). It then lingers where it landed, fading out
    // (it moves for flyMove of its time), or with linger false vanishes as it arrives, where
    // something else takes over. Its look blends from `from`'s to `to`'s on the way.
    function fly(meta, from, to, hops, props, { arrive, linger = true }) {
      const n = ++uid
      const move = linger ? C.flyMove : 1
      const look = (shape) => ({ ...structuredClone(shape), id: `~flyer${n}`, uid: n, attach: null, hl: null, callout: null, layer: 'front' })
      meta.flyers = [...(meta.flyers || []), { uid: n, from: look(from), to: look(to), hops, move }]
      schedule(meta, n, props, { dur: arrive / move })
    }

    // A value flown from `source` (a var or cell) along `hops` into `target`, a var or cell that
    // takes it as the flyer lands, `arrive` ms in: crossfading in, centred on the landing, and with
    // keep-style taking the look it came with.
    function flyValue(meta, source, target, hops, props, arrive) {
      const changed = { ...structuredClone(target), ...keptStyle(props, source) }
      setValue(changed, valueIn(source))
      shapes.set(changed.id, changed)
      const fade = C.crossfade * speedOf(props)
      // lands: the flyer has already shown the value on the way, so the target takes it as it lands
      // rather than blending to it (a bar would fill a second time under the flyer)
      schedule(meta, changed.uid, props, { dur: fade, after: arrive - fade / 2 }).lands = true
      fly(meta, source, changed, hops, props, { arrive })
    }

    // "v1: a.1": a copy of a.1 glides onto v1, which takes its value as it lands
    function assignValue(target, source, tokens, meta, warn) {
      const props = parseProps(tokens, 1, 'assign', shapes)
      if (source.id === target.id) return warn(`"${target.id}" already holds its own value`)
      flyValue(meta, source, target, [{ x: source.x, y: source.y }, { x: target.x, y: target.y }], props, C.arrive * speedOf(props))
    }

    // A var's / row's / column's name tag, and a row's / column's cell numbers (indices), are text
    // shapes that go with it: attached, so they move with it, and removed with it (`part`). The
    // name is "id.name" (left of a var or row, above a column, unless a side is given); indices are
    // "id.index.0", … (smaller and muted, below a row's cells, left of a column's), fixed in the row
    // at the places, so they stay put through a swap and while cells slide in and out, and the last
    // one comes as a slot opens on the end and goes as one closes.
    function checkParts(shape, props) {
      if (props.name && !shape.var && !shape.layout && !shape.span) throw new Error('"name" is for a var, row, column or span')
      if (props.indices !== undefined && !shape.layout) throw new Error('"indices" is for a row, column, grid or table')
      if (props.indices !== undefined && shape.view) throw new Error(`a grid's indices number all its rows and columns, so they go on the whole grid: "${shape.part}: indices"`)
    }

    // A grid's row or column (a view) belongs to its grid, so it can't be deleted or edited on its own
    function refuseView(shape, word) {
      if (shape.view) throw new Error(`"${shape.id}" is part of "${shape.part}", so "${word}" doesn't work on it on its own`)
    }

    // A row edit (swap, insert, remove): not on a grid's row or column, nor yet on a grid
    function refuseGridEdit(row, word) {
      refuseView(row, word)
      const { views, noun } = LAYOUTS[row.layout]
      if (views) throw new Error(`"${word}" doesn't work on ${article(noun)} ${noun} yet`)
    }

    function updateParts(shape, props, meta, warn) {
      if (props.name) setName(shape, props.name, props, meta, warn)
      if (props.indices !== undefined) {
        if (shape.indices === props.indices) warn(props.indices ? `"${shape.id}" already shows its indices` : `"${shape.id}" isn't showing its indices`)
        shape.indices = props.indices
        syncIndices(shape, props, meta)
      }
    }

    // The side a name goes, unless given: its layout's (LAYOUTS: name), a span's by its row's layout
    // (LAYOUTS: spanName), or left of a var
    function nameSide(owner) {
      if (owner.span) return LAYOUTS[shapes.get(owner.span.of)?.layout]?.spanName || 'above'
      return LAYOUTS[owner.layout]?.name || 'left-of'
    }

    function setName(owner, name, props, meta, warn) {
      const id = nameId(owner.id)
      const old = shapes.get(id)
      if (name.none) {
        if (!old) return warn(`"${owner.id}" has no name to clear`)
        shapes.delete(id)
        tween(meta, old.uid).exit = 'fade'
        schedule(meta, old.uid, props)
        return
      }
      const text = old ? structuredClone(old) : { ...baseShape('text'), id, uid: ++uid, font: 1.2, layer: owner.layer, part: owner.id }
      text.label = name.text
      text.attach = besideOf(owner.id, name.side || old?.attach?.side || nameSide(owner), 0.2 * CELL)
      Object.assign(text, attachPos(text, owner, text.attach))
      shapes.set(id, text)
      if (!old) tween(meta, text.uid).enter = 'fade'
      schedule(meta, text.uid, props)
    }

    // Adds or removes index texts so a row / column has one per cell (none without "indices"),
    // new ones fading in `add` ms in and old ones out `remove` ms in.
    function syncIndices(row, props, meta, { add = 0, remove = 0 } = {}) {
      const marks = row.indices ? indexMarks(row) : []
      const { numbers } = LAYOUTS[row.layout]
      const kept = new Set()
      for (const mark of marks) {
        const id = indexId(row.id, mark.key)
        kept.add(id)
        const old = shapes.get(id)
        // Fixed in the row beside its place (not on the cell), so it stays with the place while a
        // cell slides in or out of it; at the back, so a sliding cell passes over it
        const text = old || { ...baseShape('text'), id, uid: ++uid, label: mark.label, font: 0.88, colour: 'muted', layer: 'back', part: row.id }
        if (numbers) text.font = 0.88 * mark.of.font // line numbers keep to the code's size
        const place = { ...mark.of, ...offsetIn(mark.of, row) }
        place.x += row.x
        place.y += row.y
        const p = placeNextTo(text, place, mark.index.side, mark.index.gap * CELL)
        text.attach = offsetFrom(row.id, p.x - row.x, p.y - row.y)
        Object.assign(text, p)
        if (old) continue
        shapes.set(id, text)
        tween(meta, text.uid).enter = 'fade'
        schedule(meta, text.uid, props, { after: add })
      }
      // the ones with nothing left to number (or all of them, with indices clear)
      for (const old of [...shapes.values()].filter((s) => s.part === row.id && s.id.startsWith(indexId(row.id, '')) && !kept.has(s.id))) {
        shapes.delete(old.id)
        tween(meta, old.uid).exit = 'fade'
        schedule(meta, old.uid, props, { after: remove })
      }
    }

    // What a layout's indices number, in order: each with its id's last part (key), its label, the
    // shape it goes beside (of) and where (LAYOUTS: index). A row's / column's cells, or a grid's
    // rows and columns (LAYOUTS: views; a table's heading isn't numbered).
    function indexMarks(row) {
      const kind = LAYOUTS[row.layout]
      const base = baseOf(row.layout)
      const mark = (ids, key, index) => ids.map((id, k) => ({ key: key(k + base), label: String(k + base), of: shapes.get(id), index }))
      if (!kind.views) return mark(row.members, (k) => k, kind.index)
      return Object.entries(kind.views).flatMap(([name, view]) => mark(row.views[name], (k) => viewKey(view, k), view.index))
    }

    // Removes a shape (and a group's members), with the line's exit effect and timing.
    function removeShape(target, props, meta, warn) {
      if (!target) return
      if (target.type === 'group' && !target.view) target.members.forEach((m) => removeShape(shapes.get(m), props, meta, warn)) // a view's cells are its grid's
      for (const part of [...shapes.values()].filter((s) => s.part === target.id)) removeShape(part, props, meta, warn) // its name, indices
      leaveGroup(target)
      freezeEndsAttachedTo(target.id)
      shapes.delete(target.id)
      schedule(meta, target.uid, props).exit = props.effect || defaults.effect || 'fade'
      if (props.effect) warnEffect(target, props.effect, warn)
    }

    // A row (side by side) or column (one under another) of rect cells, ids "id.0", "id.1", …: a
    // group placed by its first cell. The values go in [ ] straight after the type (numbers or
    // quoted text, commas optional), or a bare count makes that many empty cells; size, gap and
    // the look apply to every cell.
    function createLayout(id, layout, tokens, existing, meta, warn) {
      if (LAYOUTS[layout].lines) return createLines(id, layout, tokens, existing, meta, warn)
      if (LAYOUTS[layout].views) return createGrid(id, layout, tokens, existing, meta, warn)
      const example = `e.g. "${id}: ${layout} [5 3 8 1] at 2,3" (words in quotes: ["A" "B"]), or a number of empty cells: "${id}: ${layout} 4 at 2,3"`
      const count = tokens[1]?.kind === 'word' && NUMBER.test(tokens[1].value) ? tokens[1].value : null
      if (count !== null && !/^\d+$/.test(count)) throw new Error(`a ${layout}'s number of cells is a whole number, e.g. "${id}: ${layout} 4", not "${count}"`)
      if (count !== null && +count < 1) throw new Error(`a ${layout} needs at least one cell`)
      if (count === null && (tokens[1]?.kind !== 'bracket' || tokens[1].value !== '[')) throw new Error(`a ${layout}'s values go in [ ] straight after "${layout}", ${example}`)
      const values = count === null ? [] : Array.from({ length: +count }, () => ({ label: '' }))
      let j = count === null ? 2 : 1
      for (; count === null && j < tokens.length; j++) {
        const token = tokens[j]
        if (token.kind === 'bracket') break
        const value = valueOf(token)
        if (!value) throw new Error(`a ${layout}'s values are numbers, "quoted" text or null, not "${token.value ?? token.name}" (is a "]" missing?)`)
        values.push(value)
      }
      if (count === null && tokens[j]?.value !== ']') throw new Error(`the "[" of a ${layout} has no closing "]"`)
      if (!values.length) throw new Error(`a ${layout} needs at least one value, ${example}`)
      const props = parseProps(tokens, j + 1, 'layout', shapes)
      if (props.label !== undefined) throw new Error(count === null ? `a ${layout}'s values all go inside its [ ]` : `a ${layout} of ${count} empty cells has no labels: give its values in [ ] instead`)
      makeLayout(id, layout, values, props, existing, meta, warn)
    }

    // A layout of lines (LAYOUTS: lines), "c: code "print(x)" lang python at 2,1", or its lines in
    // [ ]: a column of code lines, c.1, c.2, … (numbered from 1), each as wide as the longest (fitCode).
    function createLines(id, layout, tokens, existing, meta, warn) {
      const { noun, item } = LAYOUTS[layout]
      const example = `e.g. "${id}: ${layout} "print(x)" lang python at 2,1", or its ${item}s in [ ]: "${id}: ${layout} ["x = 1" "print(x)"] at 2,1"`
      const values = []
      let j = 1
      if (tokens[1]?.kind === 'str') {
        values.push({ label: tokens[1].value })
        j = 2
      } else {
        if (tokens[1]?.kind !== 'bracket' || tokens[1].value !== '[') throw new Error(`a ${noun}'s ${item}s go in quotes straight after "${layout}", ${example}`)
        for (j = 2; j < tokens.length && tokens[j].kind !== 'bracket'; j++) {
          if (tokens[j].kind !== 'str') throw new Error(`a ${noun}'s ${item}s are "quoted" text, not "${tokens[j].value ?? tokens[j].name}" (is a "]" missing?)`)
          values.push({ label: tokens[j].value })
        }
        if (tokens[j]?.value !== ']') throw new Error(`the "[" of a ${noun} has no closing "]"`)
        if (!values.length) throw new Error(`a ${noun} needs at least one ${item}, ${example}`)
        j++
      }
      const props = parseProps(tokens, j, 'layout', shapes)
      if (props.label !== undefined) throw new Error(`a ${noun} takes one "quoted" ${item}, or its ${item}s in [ ], ${example}`)
      const sized = ['size', 'width', 'height'].find((key) => props[key])
      if (sized) throw new Error(`a ${noun} is as big as its ${item}s, so it takes no "${sized}" (use font to make it bigger or smaller)`)
      makeLayout(id, layout, values, props, existing, meta, warn)
    }

    // A grid or table (LAYOUTS: views): its rows of values in [ ], each in [ ] like a row's
    // ("g: grid [[1 2 3] [4 5 6]]", commas optional), or a number of empty cells across and down
    // ("g: grid 4x3"). Shorter rows are filled out with empty cells. A table's first row is its
    // headings.
    function createGrid(id, layout, tokens, existing, meta, warn) {
      const { noun } = LAYOUTS[layout]
      const example = `e.g. "${id}: ${layout} [[1 2 3] [4 5 6]] at 2,2" (words in quotes: ["A" "B"]), or a number of empty cells across and down: "${id}: ${layout} 4x3 at 2,2"`
      const count = (token) => (token?.kind === 'word' && /^\d+$/.test(token.value) ? +token.value : null)
      const rows = []
      let j
      if (count(tokens[1]) !== null) {
        const [across, down] = [count(tokens[1]), count(tokens[2])]
        if (down === null) throw new Error(`a ${noun}'s number of cells is across x down, e.g. "${id}: ${layout} 4x3"`)
        if (!across || !down) throw new Error(`a ${noun} needs at least one cell`)
        for (let r = 0; r < down; r++) rows.push(Array.from({ length: across }, () => ({ label: '' })))
        j = 3
      } else {
        if (tokens[1]?.kind !== 'bracket' || tokens[1].value !== '[') throw new Error(`a ${noun}'s rows go in [ ] straight after "${layout}", ${example}`)
        for (j = 2; tokens[j]?.value === '['; j++) {
          const values = []
          for (j++; j < tokens.length && tokens[j].kind !== 'bracket'; j++) {
            const value = valueOf(tokens[j])
            if (!value) throw new Error(`a ${noun}'s values are numbers, "quoted" text or null, not "${tokens[j].value ?? tokens[j].name}" (is a "]" missing?)`)
            values.push(value)
          }
          if (tokens[j]?.value !== ']') throw new Error(`a row of a ${noun} has no closing "]"`)
          if (!values.length) throw new Error(`a row of a ${noun} needs at least one value, ${example}`)
          rows.push(values)
        }
        if (tokens[j]?.value !== ']') throw new Error(tokens[j] ? `a ${noun}'s rows each go in [ ], ${example}` : `the "[" of a ${noun} has no closing "]"`)
        if (!rows.length) throw new Error(`a ${noun} needs at least one row, ${example}`)
        j++
      }
      const across = Math.max(...rows.map((values) => values.length))
      if (rows.some((values) => values.length < across)) warn(`the rows of "${id}" aren't all ${across} long, so the short ones are filled out with empty cells`)
      for (const values of rows) while (values.length < across) values.push({ label: '' })
      const props = parseProps(tokens, j, 'layout', shapes)
      if (props.label !== undefined) throw new Error(`a ${noun}'s values all go inside its [ ]`)
      makeLayout(id, layout, rows, props, existing, meta, warn)
    }

    // Where each of a layout's cells goes, from its values (a grid's: its rows of values), in order:
    // its value, its id, and for a grid its line from the top (gridLines) and column, from 0.
    // Also the ids of a grid's views (each view's, a row's for each line and a column's for each
    // column, and a table's heading) and the cells in each, by id.
    function placesFor(id, layout, values) {
      const kind = LAYOUTS[layout]
      const base = baseOf(layout)
      if (!kind.views) return { places: values.map((value, k) => ({ value, id: cellId(id, k + base) })) }
      const heading = kind.head ? headId(id, kind.head) : null
      const body = values.slice(heading ? 1 : 0)
      const views = {
        row: body.map((_, k) => viewId(id, kind.views.row, k + base)),
        col: values[0].map((_, k) => viewId(id, kind.views.col, k + base)),
      }
      const lines = [...(heading ? [heading] : []), ...views.row]
      const places = values.flatMap((row, r) => row.map((value, c) => ({ value, id: cellId(lines[r], c + base), r, c })))
      const cellsOf = new Map([...lines.map((line, r) => [line, places.filter((p) => p.r === r).map((p) => p.id)]),
        ...views.col.map((col, c) => [col, places.filter((p) => p.c === c).map((p) => p.id)])])
      return { places, views, heading, cellsOf }
    }

    // Lays a grid's cells out from its first one: each column as wide as its widest cell and each
    // row as tall as its tallest, `gap` apart.
    function layoutGrid(grid, cells, places) {
      const widths = []
      const heights = []
      places.forEach(({ r, c }, k) => {
        widths[c] = Math.max(widths[c] || 0, cells[k].w)
        heights[r] = Math.max(heights[r] || 0, cells[k].h)
      })
      const start = (sizes, n) => sizes.slice(0, n).reduce((sum, size) => sum + size + grid.gap, 0) + (sizes[n] - sizes[0]) / 2
      places.forEach(({ r, c }, k) => { cells[k].attach = offsetFrom(grid.id, start(widths, c), start(heights, r)) })
    }

    // A grid's rows and columns (and a table's heading): groups of its cells (LAYOUTS: views) that
    // don't own them, so a look, highlight, range or span works on one as on a row or column. Each
    // is part of the grid, laid out in it at its first cell, and covers its cells (a spotlight or
    // glow on it lights them).
    function makeViews(grid, { views, heading, cellsOf }, props, meta) {
      const kind = LAYOUTS[grid.layout]
      const made = [...(heading ? [[heading, kind.views.row.layout]] : []), // laid out like its rows
        ...Object.entries(kind.views).flatMap(([name, view]) => views[name].map((id) => [id, view.layout]))]
      for (const [id, layout] of made) {
        const members = cellsOf.get(id)
        const first = shapes.get(members[0])
        const b = unionBounds(members.map((cell) => shapes.get(cell)), shapes)
        const view = {
          ...baseShape('group'), id, uid: ++uid, layout, members, covers: members, view: true, part: grid.id,
          attach: offsetFrom(grid.id, first.attach.dx, first.attach.dy), x: first.x, y: first.y,
          w: b.x1 - b.x0, h: b.y1 - b.y0, cx: (b.x0 + b.x1) / 2 - first.x, cy: (b.y0 + b.y1) / 2 - first.y,
        }
        shapes.set(id, view)
        schedule(meta, view.uid, props).enter = 'fade'
      }
    }

    // Makes a row / column / code block from its cells' values (a grid / table: its rows of values)
    // and the line's props.
    function makeLayout(id, layout, values, props, existing, meta, warn) {
      if (existing) {
        warn(`"${id}" already exists, so it is replaced`)
        removeShape(existing, props, meta, warn)
      }
      const kind = LAYOUTS[layout]
      const laid = placesFor(id, layout, values)
      const { places } = laid
      const ids = places.map((place) => place.id)
      for (const taken of [...ids, ...(laid.cellsOf?.keys() || [])]) {
        if (!shapes.has(taken)) continue
        warn(`"${taken}" already exists, so it is replaced by ${laid.cellsOf?.has(taken) ? 'a row or column' : 'a cell'} of "${id}"`)
        removeShape(shapes.get(taken), props, meta, warn)
      }

      // The cells, laid out from the first one (at 0,0 for now)
      const gap = props.gap ? props.gap.v * CELL : 0
      const look = pick(props, ['size', 'width', 'height', ...CELL_STYLE])
      withRowMax(null, look, places.map((place) => place.value))
      const cells = places.map(({ value }, k) => {
        const cell = { ...baseShape(kind.cell), id: ids[k], uid: ++uid, holds: true, x: 0, y: 0 }
        applyDefaults(cell)
        applyProps(cell, look, true, warn, meta)
        setValue(cell, value)
        cell.layer = props.layer || defaults.layer || 'normal'
        return cell
      })
      // a blank cell in the row's look, for cells added later (insert)
      const blank = { ...structuredClone(cells[0]), label: '', nil: false }
      delete blank.id
      delete blank.uid
      // a table's headings start with their own look (LAYOUTS: head)
      if (laid.heading) for (const cell of cells.filter((_, k) => places[k].r === 0)) applyProps(cell, kind.head.look, false, warn, meta)
      if (kind.fit) fitLines(cells)
      if (kind.views) layoutGrid({ id, gap }, cells, places)
      else layoutCells({ id, layout, gap }, cells)
      cells.forEach((cell) => Object.assign(cell, { x: cell.attach.dx, y: cell.attach.dy }))
      if (takeBareNumber(props)) numberEach(cells, props, meta, warn)
      const b = unionBounds(cells, shapes)
      const row = {
        ...baseShape('group'), id, uid: ++uid, layout, members: ids, gap, cell: blank,
        w: b.x1 - b.x0, h: b.y1 - b.y0, cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2,
      }
      if (kind.views) Object.assign(row, { views: laid.views, heading: laid.heading })
      applyProps(row, pick(props, ['at', 'x', 'y', 'highlight', 'callout']), true, warn, meta)
      shapes.set(id, row)
      schedule(meta, row.uid, props).enter = 'fade'
      for (const cell of cells) {
        Object.assign(cell, { x: row.x + cell.attach.dx, y: row.y + cell.attach.dy })
        shapes.set(cell.id, cell)
        schedule(meta, cell.uid, props).enter = props.effect || defaults.effect || 'fade'
      }
      if (kind.views) makeViews(row, laid, props, meta)
      if (props.effect) warnEffect(cells[0], props.effect, warn)
      updateParts(row, props, meta, warn)
      if (LAYOUTS[layout].typeInTurn && (props.effect || defaults.effect) === 'typed') typeInTurn(row, cells, [...shapes.values()].filter((s) => s.part === id), props, meta)
      applyStagger(row, cells.map((cell) => [cell.uid]), { ...props, at: null, x: null, y: null }, meta, warn) // placing it isn't a move
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
        if (member.type === 'group') continue
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
      if (group.type !== 'group') return []
      return group.members.map((id) => shapes.get(id)).filter(Boolean).map((m) => [m.uid, ...groupMembers(m).map((s) => s.uid)])
    }

    // stagger / stagger-reverse: each member's change starts `gap` seconds after the one before
    // (after any delay). Moves are left alone: the members ride on the group, so move together.
    function applyStagger(group, order, props, meta, warn) {
      const stagger = props.stagger ?? defaults.stagger
      if (!stagger) return
      if (!order.length) {
        if (props.stagger) warn(`"stagger" works on a row, column or group, and "${group.id}" isn't one`)
        return
      }
      if (props.stagger && (props.at || props.x || props.y || props.via || props.travel || props.follow)) {
        warn('a row, column or group moves as one, so its move isn\'t staggered')
      }
      const list = stagger.reverse ? [...order].reverse() : order
      list.forEach((uids, k) => uids.forEach((uid) => schedule(meta, uid, props, { dur: 0, after: k * stagger.gap * 1000 })))
    }

    // "arr: swap 0 3": two cells change places, one arcing over and one under (a column's: to the
    // right and left). Ids go with the places, so afterwards arr.0 is the cell now first; whatever
    // is attached to arr.0 (a pointer) stays there, and highlights go with the cells.
    function swapCells(id, row, tokens, meta, warn) {
      if (!row) throw new Error(`no shape called "${id}"`)
      if (!row.layout) throw new Error(`"swap" swaps two cells of a row or column, and "${id}" isn't one`)
      refuseGridEdit(row, 'swap')
      const base = baseOf(row.layout)
      const i = placeOf(row, tokens[1])
      const j = placeOf(row, tokens[2])
      if (i === undefined || j === undefined) throw new Error(`"swap" expects two cell numbers, e.g. "${id}: swap ${base} ${base + 3}"`)
      const props = parseProps(tokens, 3, 'swap', shapes)
      const [a, b] = [i, j].map((k) => {
        const cell = row.members.includes(cellId(id, k)) && shapes.get(cellId(id, k))
        if (!cell) throw new Error(`"${cellId(id, k)}" isn't a cell of "${id}" (its cells are ${cellRange(row, row.members.length)})`)
        return cell
      })
      if (i === j) return warn('a cell swapped with itself stays where it is')

      // Neighbours just pass each other; further apart, they clear the cells in between
      const { across } = LAYOUTS[row.layout]
      const lift = C.swapLift[Math.abs(i - j) > 1 ? 'far' : 'near'] * Math.max(...[a, b].map((cell) => bowOf(row, cell)))
      const moves = [[a, b], [b, a]].map(([cell, other]) => {
        const moved = structuredClone(cell)
        moved.id = other.id
        moved.attach = offsetFrom(id, other.attach.dx, other.attach.dy)
        const onward = across ? other.attach.dx > cell.attach.dx : other.attach.dy > cell.attach.dy
        tween(meta, moved.uid).arc = across ? { x: 0, y: onward ? -lift : lift } : { x: onward ? lift : -lift, y: 0 }
        return moved
      })
      for (const moved of moves) {
        shapes.set(moved.id, moved)
        schedule(meta, moved.uid, props)
      }
    }

    // How far a swapped cell bows out from its row or column, before the lift (LAYOUTS: bow): its
    // size across it, or a grid cell (a code line, whose box is as wide as the block)
    const bowOf = (row, cell) => (LAYOUTS[row.layout].bow === 'cell' ? CELL : LAYOUTS[row.layout].across ? cell.h : cell.w)

    // Lays a row's / column's cells out in order from its first cell: ids id.0, id.1, … and their
    // offsets in it.
    function layoutCells(row, cells) {
      const { across } = LAYOUTS[row.layout]
      let offset = 0
      cells.forEach((cell, k) => {
        const before = cells[k - 1]
        if (before) offset += (across ? (before.w + cell.w) / 2 : (before.h + cell.h) / 2) + (row.gap || 0)
        cell.id = cellId(row.id, k + baseOf(row.layout))
        cell.attach = offsetFrom(row.id, across ? offset : 0, across ? 0 : offset)
      })
      row.members = cells.map((cell) => cell.id)
    }

    // A fitted layout's cells (LAYOUTS: fit) all take the size of the biggest, so a fill or highlight
    // makes even bands: a code line's text's width (spaces kept) plus a margin each side, and its
    // height (SHAPES: pre). Changed in place.
    function fitLines(cells) {
      const size = (cell) => FONT * cell.font
      const pre = (cell) => kindOf(cell).pre
      const w = Math.max(...cells.map((cell) => textWidth(cell.label, size(cell), cell.bold, cell.mono, true) + 2 * pre(cell).pad * size(cell)))
      const h = Math.max(...cells.map((cell) => pre(cell).height * size(cell)))
      for (const cell of cells) Object.assign(cell, { w, h })
    }

    // After every line: a code block whose lines have changed (a longer line, a new font, a line
    // inserted or removed) is refitted, its lines resized and moved to match, in the time its
    // busiest line takes this beat. Its line numbers move with them.
    function fitCode(meta) {
      for (const row of shapes.values()) {
        if (!LAYOUTS[row.layout]?.fit || !row.members.length) continue
        const cells = row.members.map((id) => shapes.get(id)).filter(Boolean)
        const before = cells.map((cell) => [cell.w, cell.h, cell.attach.dx, cell.attach.dy].join())
        fitLines(cells)
        layoutCells(row, cells)
        const changed = cells.filter((cell, k) => [cell.w, cell.h, cell.attach.dx, cell.attach.dy].join() !== before[k])
        if (!changed.length) continue
        const timing = busiest(meta, cells)
        changed.forEach((cell) => retime(meta, cell.uid, timing))
        if (row.indices) {
          syncIndices(row, {}, meta)
          for (let k = 0; k < cells.length; k++) {
            const index = shapes.get(indexId(row.id, k + baseOf(row.layout)))
            if (index) retime(meta, index.uid, timing)
          }
        }
      }
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

    // typed on a code block: its panel, name and line numbers (`parts`) fade in quickly, then its
    // lines type out one after another, in the line's time (each line's share by its length, so the
    // typing keeps an even pace). Deleted (`leaving`), the lines untype the same way, then the rest
    // fades.
    function typeInTurn(row, cells, parts, props, meta, leaving = false) {
      const total = speedOf(props)
      const fade = C.panelFade * total
      const chars = cells.map((cell) => [...cell.label].length)
      const all = chars.reduce((a, b) => a + b, 0) || 1
      const start = delayOf(props)
      let after = leaving ? 0 : fade
      cells.forEach((cell, k) => {
        const record = tween(meta, cell.uid)
        record.dur = (total * chars[k]) / all
        record.delay = start + after
        after += record.dur
      })
      for (const shape of [row, ...parts]) Object.assign(tween(meta, shape.uid), { dur: fade, delay: start + (leaving ? total : 0) })
    }

    // "arr: remove 2" / "arr: remove end" / "arr: insert 7 at 3" / "arr: insert 8 at end": a cell
    // leaves or arrives, sliding out below a row (left of a column) as it fades, and the cells
    // after it close up or open a space. Ids go with the places, as in a swap: after "remove 2",
    // arr.2 is the cell that was arr.3, and what's attached to the last place (now gone) is left
    // where it was. "insert v1 at …" copies a var's or cell's value in; "remove … into v1" moves
    // the cell's value out into one.
    function editCells(id, row, tokens, meta, warn, word) {
      if (!row) throw new Error(`no shape called "${id}"`)
      const removing = word === 'remove'
      if (!row.layout) throw new Error(`"${word}" ${removing ? 'takes a cell out of' : 'puts a cell into'} a row or column, and "${id}" isn't one${removing ? ` (to delete it: "${id}: delete")` : ''}`)
      refuseGridEdit(row, word)
      const kind = LAYOUTS[row.layout]
      const example = removing ? `"${id}: remove 2" or "${id}: remove end into v1"` : kind.lines ? `"${id}: insert "x = 1" at 2" or "${id}: insert "x = 1" at end"` : `"${id}: insert 7 at 3" or "${id}: insert v1 at end"`
      const cells = row.members.map((m) => shapes.get(m)).filter(Boolean)
      const n = cells.length
      const base = baseOf(row.layout)
      const range = cellRange(row, n)
      // a cell number, or end: the last cell (remove), or after it (insert); as a place in the row
      // (from 0), and as written
      const place = (token) => {
        const k = placeOf(row, token, { after: !removing })
        return k === undefined ? undefined : k - base
      }

      // The operands: where, and what goes in (a value, or a copy of a var's or cell's), or the var
      // or cell the removed value goes into
      let at
      let value
      let source // a var or cell copied in (insert), as it is now
      let target // the var or cell removed into
      let next
      if (removing) {
        at = place(tokens[1])
        if (at === undefined) throw new Error(`"remove" expects a cell number or end, e.g. ${example}`)
        next = 2
        if (tokens[2]?.kind === 'word' && tokens[2].lower === 'into') {
          if (!holderRef(tokens[3])) throw new Error(`"into" expects a var or cell, e.g. ${example}`)
          target = holderRef(tokens[3], 'remove into')
          next = 4
        }
      } else {
        value = valueOf(tokens[1])
        if (!value && holderRef(tokens[1])) {
          source = structuredClone(holderRef(tokens[1], 'insert'))
          value = valueIn(source)
        }
        if (!value) throw new Error(`"insert" expects a value (a number, "quoted" text or null) or a var, e.g. ${example}`)
        if (tokens[2]?.lower !== 'at' || place(tokens[3]) === undefined) throw new Error(`"insert" expects a value and where it goes (a cell number or end), e.g. ${example}`)
        at = place(tokens[3])
        next = 4
      }
      const props = parseProps(tokens, next, word, shapes)
      // keep-style needs a var's or cell's value coming in or going out
      if (props.keepStyle && !source && !target) throw new Error(`"keep-style" goes with a var's or cell's value, e.g. "${id}: ${removing ? 'remove end into v1' : 'insert v1 at 0'} keep-style"`)

      if (removing && !n) throw new Error(`"${id}" has no cells left to remove`)
      if (removing && (at < 0 || at >= n)) throw new Error(`"${id}" has no cell ${at + base} (its cells are ${range})`)
      if (!removing && (at < 0 || at > n)) throw new Error(`"insert … at" goes from ${base} to ${n + base} (or end), and "${id}" has ${n} ${kind.item}${n === 1 ? '' : 's'}`)
      if (target && target.uid === cells[at].uid) throw new Error(`"${target.id}" is the cell being removed, so it can't be removed into`)

      const speed = speedOf(props)
      // the second of the two moves (closing up, or sliding in) starts when the leaving cell is
      // mostly gone, or the arriving one's slot has mostly opened
      const then = C.then * speed
      const timing = (uid, after) => schedule(meta, uid, props, { after })
      const { across } = kind
      // where a cell comes from / goes to: beside the row (LAYOUTS: slide), or its own place
      const aside = (cell) => (!kind.slide ? { x: 0, y: 0 } : across ? { x: 0, y: C.aside * cell.h } : { x: -C.aside * cell.w, y: 0 })

      // A slot (a muted outline) marks the space while it opens or closes (drawn only during the beat): left
      // where a cell goes out, closing as the cells after it close up; or opening as the cells move
      // aside, for the new cell to land in. At the end, one opens or closes on the end.
      const list = cells.map((cell) => structuredClone(cell))
      let slotCell
      if (removing) {
        freezeEndsAttachedTo(cellId(id, n - 1)) // the last place goes
        const [gone] = list.splice(at, 1)
        if (target) tween(meta, gone.uid).exit = 'vanish' // it flies to the target instead (below)
        else Object.assign(tween(meta, gone.uid), { exit: 'fade', offset: aside(gone) })
        timing(gone.uid, 0)
        list.slice(at).forEach((cell) => timing(cell.uid, then))
        slotCell = gone
      } else {
        const blank = row.cell || { ...baseShape('rect') }
        const cell = { ...structuredClone(blank), ...(source ? keptStyle(props, source) : {}), uid: ++uid, holds: true, hl: null, callout: null }
        setValue(cell, value)
        list.splice(at, 0, cell)
        list.slice(at + 1).forEach((other) => timing(other.uid, 0))
        Object.assign(tween(meta, cell.uid), { enter: 'fade', offset: aside(cell) })
        timing(cell.uid, then) // when a flyer brings a var's value (below), as it arrives
        slotCell = cell
      }
      for (const cell of cells) shapes.delete(cell.id)
      if (kind.fit && list.length) {
        // the block widens for a longer line as the others move aside, or narrows once the
        // longest has gone
        const widths = new Map(list.map((cell) => [cell.uid, cell.w]))
        fitLines(list)
        list.filter((cell) => widths.get(cell.uid) !== cell.w && cell.uid !== slotCell?.uid).forEach((cell) => timing(cell.uid, removing ? then : 0))
      }
      layoutCells(row, list)
      for (const cell of list) {
        Object.assign(cell, { x: row.x + cell.attach.dx, y: row.y + cell.attach.dy })
        shapes.set(cell.id, cell)
      }
      // the last index comes with the slot, or goes as it closes
      if (row.indices) syncIndices(row, props, meta, { add: 0, remove: then })

      // remove into: the removed cell itself drops out and glides onto the target, which takes its
      // value as it lands. The target may be another of this row's cells, which may have moved up a
      // place, so it's found by its uid after the layout.
      if (target) {
        const out = aside(slotCell)
        const to = [...shapes.values()].find((s) => s.uid === target.uid)
        const hops = [{ x: slotCell.x, y: slotCell.y }, { x: slotCell.x + out.x, y: slotCell.y + out.y }, { x: to.x, y: to.y }]
        flyValue(meta, slotCell, to, hops, props, C.arriveOut * speed)
      }

      // A copy of a var or cell glides to just outside the opening slot (its look turning into the
      // row's on the way), then the new cell, solid from the start, slides in from there
      if (source) {
        tween(meta, slotCell.uid).enter = 'appear' // there from the start: the flyer is on it
        const out = aside(slotCell)
        const place = { x: row.x + slotCell.attach.dx, y: row.y + slotCell.attach.dy }
        fly(meta, source, slotCell, [{ x: source.x, y: source.y }, { x: place.x + out.x, y: place.y + out.y }], props, { arrive: then, linger: false })
      }

      // The slot's place in the row (a removed cell's from before, a new cell's from after the
      // layout), and its time: both parts, start to end (LAYOUTS: slot; none for bars, BARS: slot)
      if (!kind.slot || BARS[slotCell.bar]?.slot === false) return
      const slot = {
        uid: ++uid, ref: id, across, closing: removing, then: C.then / (1 + C.then),
        dx: slotCell.attach.dx, dy: slotCell.attach.dy, w: slotCell.w, h: slotCell.h, corner: slotCell.corner || 0,
      }
      schedule(meta, slot.uid, props, { dur: speed + then })
      meta.slots = [...(meta.slots || []), slot]
    }

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
  // `lands`, its new value arrives on a flyer, so it's taken halfway through (as it lands), not blended.
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

  Object.assign(window.Anim, { compile })
})()
