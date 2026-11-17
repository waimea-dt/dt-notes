/**
 * anim-compile.js - Part of the animation plugin (animation.js): compiling each beat's scene
 * lines into a snapshot of every shape, plus how each change animates (tweens) and the camera.
 */

;(function () {
  const { CELL, cellToPx, APPLIES, LINE_TYPES, FLOWS, resolveEnds, boxCentre, PLACE_GAP,
    placeNextTo, attachPos, buildPolyline, buildPath, resolveAttachments, unionBounds, NORMAL_MS,
    parseProps, tokenize, bounds, ID, RESERVED, RESOURCE_TYPES, SHAPE_TYPES, LAYOUT_TYPES, SIGNALS,
    parseAs, lucideIcon, KEYWORDS, NUMBER, linePoints } = window.Anim

  // A row's or column's look, given to each of its cells (when made, and on a change to it)
  const CELL_STYLE = ['fill', 'stroke', 'colour', 'weight', 'font', 'bold', 'mono', 'corner', 'linestyle', 'flow']
  const pick = (props, keys) => Object.fromEntries(Object.entries(props).filter(([key]) => keys.includes(key)))

  // ---------------------------------------------------------------------------
  // Compiling scenes into one state per beat
  // ---------------------------------------------------------------------------

  function baseShape(type) {
    const shape = { type, label: '', stroke: 'fg', colour: 'fg', fill: 'none', weight: 1, font: 1, angle: 0, scale: 1, bold: false, linestyle: 'solid', flow: 'none', align: 'centre', layer: 'normal' }
    if (type === 'rect') Object.assign(shape, { w: CELL, h: CELL, corner: 0, fill: 'bg' })
    if (type === 'diamond') Object.assign(shape, { w: CELL, h: CELL, fill: 'bg' })
    if (type === 'circle') Object.assign(shape, { r: CELL / 2, fill: 'bg' })
    if (type === 'image') Object.assign(shape, { w: CELL, h: CELL, stroke: 'none' })
    if (type === 'icon') Object.assign(shape, { w: CELL, h: CELL })
    if (type === 'text') Object.assign(shape, { w: 0, h: 0 })
    return shape
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

    const check = (shape, key, word = key) => {
      if (key === 'stroke' && shape.type === 'text') throw new Error('"stroke" doesn\'t apply to text: use colour')
      if (key === 'radius' && shape.type === 'rect') throw new Error('"radius" is for circles: use corner for a rect\'s corners')
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
      // Relative values need something to be relative to: never when creating
      const now = (value) => (creating ? undefined : value)
      const cells = (n, current) => numberValue(n, now(current), { unit: CELL })
      const times = (n, current) => numberValue(n, now(current))
      const coord = (n, current) => numberValue(n, current, { unit: CELL, coord: true })

      if (props.label !== undefined) { shape.label = props.label; if (shape.nil) shape.nil = false }
      if (props.font) { check(shape, 'font'); shape.font = Math.max(0.1, times(props.font, shape.font)) }
      // size: absolute, or one signed number on a change (both sides by that amount). A relative
      // pair (size +1x+0) isn't allowed: width / height change one side.
      if (props.size) {
        check(shape, 'size')
        const relative = !creating && (props.size.w.rel || props.size.h.rel)
        if (relative && !props.size.one) throw new Error('a relative size takes one number (e.g. "size +1"): use "width +1" / "height +1" to change one side')
        if (shape.type === 'circle') {
          if (!props.size.one) throw new Error('a circle takes one size (or use radius)')
          shape.r = Math.max(0, cells(props.size.w, shape.r * 2) / 2)
        } else {
          shape.w = Math.max(0, cells(props.size.w, shape.w))
          shape.h = Math.max(0, cells(props.size.h, shape.h))
        }
      }
      if (props.size && (props.width || props.height)) throw new Error('give either "size" or "width" / "height", not both')
      if (props.width) { check(shape, 'width'); shape.w = Math.max(0, cells(props.width, shape.w)) }
      if (props.height) { check(shape, 'height'); shape.h = Math.max(0, cells(props.height, shape.h)) }
      if (props.radius) { check(shape, 'radius'); shape.r = Math.max(0, cells(props.radius, shape.r)) }
      if (props.corner) { check(shape, 'corner'); shape.corner = Math.max(0, cells(props.corner, shape.corner)) }
      if (props.fill) { check(shape, 'fill'); shape.fill = props.fill }
      if (props.stroke) { check(shape, 'stroke'); shape.stroke = props.stroke }
      if (props.colour) shape.colour = props.colour
      if (props.weight) {
        if (shape.type === 'text') warn('"weight" has no effect on text')
        shape.weight = Math.max(0, times(props.weight, shape.weight))
      }
      if (props.align) { check(shape, 'align'); shape.align = props.align }
      if (props.angle) { check(shape, 'angle'); shape.angle = times(props.angle, shape.angle) }
      if (props.scale) { check(shape, 'scale'); shape.scale = Math.max(0, times(props.scale, shape.scale)) }
      if (props.bold) shape.bold = true
      if (props.mono) shape.mono = true
      if (props.head) { check(shape, 'head', 'arrow'); shape.head = true }
      if (props.linestyle) {
        check(shape, 'linestyle', props.linestyle)
        shape.linestyle = props.linestyle
        if (shape.linestyle === 'solid' && shape.flow !== 'none' && !props.flow) warn('this line is still flowing, but flow only shows on a dashed or dotted line (add static to stop it)')
      }
      if (props.flow) {
        check(shape, 'flow', props.flow)
        shape.flow = FLOWS[props.flow]
        if (shape.flow !== 'none' && shape.linestyle === 'solid') warn(`"${props.flow}" only shows on a dashed or dotted line`)
      }
      if (props.layer) shape.layer = props.layer

      // highlight: outline / inside / spotlight / arrow / number N stay until clear
      if (props.highlight) {
        const none = { outline: false, inside: false, spotlight: false, arrow: false, glow: false, number: null }
        const hl = { ...none, ...shape.hl }
        for (const item of props.highlight) {
          if (item === 'outline' && isLine) throw new Error('"highlight outline" doesn\'t fit a line: try glow or signal')
          if (item === 'inside' && (isLine || ['text', 'group'].includes(shape.type))) {
            throw new Error(`"highlight inside" needs a shape with an inside (rect, circle, diamond, image or icon), not ${shape.type === 'arrow' ? 'an' : 'a'} ${shape.type === 'group' ? (shape.layout || 'group') : shape.type}`)
          }
          if (item === 'clear') Object.assign(hl, none)
          else if (typeof item === 'object') hl.number = lastNumber = item.number ?? lastNumber + 1
          else hl[item] = true
        }
        shape.hl = hl
      }
      // pulse / shake / wobble / bounce / glow: one-off effects this beat, on an existing shape
      // (and a group's members)
      // signal / signal-reverse: a blip along a line (a group's lines)
      if (props.emphasis) {
        const signal = props.emphasis in SIGNALS
        if (signal && !isLine && shape.type !== 'group') throw new Error(`"${props.emphasis}" travels along a line, arrow or curve`)
        const targets = [shape, ...groupMembers(shape)].filter((target) => !signal || LINE_TYPES.includes(target.type))
        if (creating) warn(`"${props.emphasis}" plays on a shape that already exists, so it does nothing here`)
        else if (!targets.length) warn(`"${shape.id}" has no lines in it, so "${props.emphasis}" does nothing`)
        else {
          for (const target of targets) {
            const record = tween(meta, target.uid)
            record.effect = props.emphasis
            record.dur = Math.max(record.dur, speedOf(props)) // a group's members play it too
            setDelay(meta, target.uid, props)
          }
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

    // Copies the defaults that apply to this type onto a new shape.
    function applyDefaults(shape) {
      for (const [key, value] of Object.entries(defaults)) {
        if (['speed', 'effect', 'ease', 'stagger', 'keepStyle'].includes(key)) continue
        if (APPLIES[key] && !APPLIES[key].includes(shape.type)) continue
        const cells = (n) => numberValue(n, undefined, { unit: CELL })
        if (key === 'size' && shape.type === 'circle') { if (value.one) shape.r = cells(value.w) / 2; continue }
        if (key === 'size') { shape.w = cells(value.w); shape.h = cells(value.h); continue }
        if (key === 'radius') { shape.r = cells(value); continue }
        if (key === 'corner') { shape.corner = cells(value); continue }
        if (key === 'width') { shape.w = cells(value); continue }
        if (key === 'height') { shape.h = cells(value); continue }
        if (['weight', 'font', 'angle', 'scale'].includes(key)) { shape[key] = numberValue(value); continue }
        shape[key] = value
      }
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
        tween(meta, member.uid).dur = Math.max(tween(meta, member.uid).dur, speedOf(props))
        setDelay(meta, member.uid, props)
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
      for (const shape of shapes.values()) if (shape.attach && !shapes.has(shape.attach.ref)) shape.attach = null
      resolveAttachments(shapes)
      for (const group of shapes.values()) {
        if (group.type !== 'group') continue
        // a row / column emptied by delete / pop: nothing, at its first cell's place
        if (!group.members.length) { if (group.layout) Object.assign(group, { w: 0, h: 0, cx: 0, cy: 0 }); continue }
        const b = unionBounds(group.members.map((id) => shapes.get(id)).filter(Boolean), shapes)
        if (group.layout) {
          // a row / column is placed by its first cell: its box is its cells' (cx, cy: to its middle)
          Object.assign(group, { w: b.x1 - b.x0, h: b.y1 - b.y0, cx: (b.x0 + b.x1) / 2 - group.x, cy: (b.y0 + b.y1) / 2 - group.y })
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

    // draw only applies to lines and arrows, slide only to shapes, typed only to text; otherwise they fade
    function warnEffect(shape, effect, warn) {
      const line = LINE_TYPES.includes(shape.type)
      if (effect === 'draw' && !line) warn(`"draw" only draws lines and arrows, so this ${shape.type} fades instead`)
      if (effect === 'slide' && line) warn(`"slide" doesn't move lines, so this ${shape.type} fades instead`)
      if (effect === 'typed' && !shape.label) warn(`"typed" types out a shape's text, and this ${shape.type} has none, so it fades instead`)
    }

    // Seconds before a line's change starts (the longest delay wins if a shape changes twice in a
    // beat), and its easing (the last one wins).
    function setDelay(meta, uid, props) {
      const easing = props.ease ?? defaults.ease
      if (easing) tween(meta, uid).ease = easing
      if (!props.delay) return
      if (props.delay.v < 0) throw new Error('"delay" must be zero or more seconds')
      const record = tween(meta, uid)
      record.delay = Math.max(record.delay, props.delay.v * 1000)
    }

    function speedOf(props) {
      return props.speed ?? defaults.speed ?? NORMAL_MS
    }

    // `camera at 4,3 zoom 2` pans and zooms the view; `camera reset` goes back to the whole drawing.
    // A shape id centres on where the shape is now (the camera doesn't follow it).
    // `camera travel b c d` pans hop by hop through the stops, like a shape's travel.
    function runCameraLine([, colon, rest = ''], meta, warn) {
      if (colon) throw new Error('"camera" takes no colon, e.g. "camera at 4,3 zoom 2"')
      const props = parseProps(tokenize(rest), 0, 'camera', shapes)
      const extra = Object.keys(props).find((key) => !['at', 'x', 'y', 'travel', 'zoom', 'reset', 'speed', 'delay', 'ease'].includes(key))
      if (extra) throw new Error(`"camera" takes at / x / y, travel, zoom, reset, speed, delay and ease, not "${extra === 'label' ? 'quoted text' : extra}"`)
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
      const record = tween(meta, 'camera')
      record.dur = speedOf(props) * (route ? route.length - 1 : 1) // a route takes `speed` per hop
      record.path = route
      setDelay(meta, 'camera', props)
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
        for (const key of ['label', 'at', 'x', 'y', 'from', 'to', 'gap', 'delay', 'via', 'name', 'indices']) {
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
      // "v: var 67 at 5,3": a rect that holds a value (a number, "text" or null), straight after "var"
      const isVar = first?.kind === 'word' && first.lower === 'var'
      const varValue = isVar ? valueOf(tokens[1]) : undefined
      const type = isVar ? 'rect' : first && (first.kind === 'res' ? (RESOURCE_TYPES.includes(first.name) ? first.name : null) : (SHAPE_TYPES.includes(first.lower) ? first.lower : null))
      if (first?.kind === 'res' && !type) throw new Error(`unknown shape "${first.name}(…)"`)
      const existing = shapes.get(id)

      if (first?.kind === 'word' && first.lower === 'remove') {
        if (!existing) throw new Error(`no shape called "${id}"`)
        const props = parseProps(tokens, 1, 'remove', shapes)
        const extra = Object.keys(props).filter((key) => !['speed', 'effect', 'delay', 'ease', 'stagger'].includes(key))
        if (extra.length) throw new Error(`"remove" only takes a speed, an effect, a delay, an ease and a stagger, not "${extra[0]}"`)
        const order = staggerOrder(existing) // taken before its members go
        removeShape(existing, props, meta, warn)
        applyStagger(existing, order, props, meta, warn)
        return
      }

      // "arr: row 5 3 8 1 at 2,3" (or column): its cells are arr.0, arr.1, …
      if (first?.kind === 'word' && LAYOUT_TYPES.includes(first.lower)) return createLayout(id, first.lower, tokens, existing, meta, warn)
      if (first?.kind === 'word' && first.lower === 'swap') return swapCells(id, existing, tokens, meta, warn)
      // "pop" on anything else is the effect (which warns that it does nothing on a change)
      if (first?.kind === 'word' && (['delete', 'insert', 'push'].includes(first.lower) || (first.lower === 'pop' && existing?.layout))) {
        return editCells(id, existing, first.lower, tokens, meta)
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
        if (props.stagger) warn('"stagger" works on a change to a row, column or group (or making a row / column)')
        const fresh = { attach: null, hl: null, callout: null }
        const shape = { ...structuredClone(src), ...fresh, id, uid: ++uid }
        tween(meta, shape.uid).from = { ...structuredClone(src), ...fresh, uid: shape.uid }
        const path = applyProps(shape, props, false, warn, meta)
        if (path) tween(meta, shape.uid).path = path
        if (existing) {
          warn(`"${id}" already exists, so it is replaced`)
          tween(meta, existing.uid).exit = 'fade'
          tween(meta, existing.uid).dur = speedOf(props)
        }
        shapes.set(id, shape)
        tween(meta, shape.uid).enter = 'copy'
        tween(meta, shape.uid).dur = speedOf(props) * (props.travel?.length || 1) // travel: speed per hop
        setDelay(meta, shape.uid, props)
        return
      }
      if (firstWord === 'group') {
        if (existing) throw new Error(`"${id}" already exists`)
        // the shapes go in [ ] (commas optional), like a row's values
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
        const props = parseProps(tokens, j + 1, 'change', shapes)
        if (props.stagger) warn('"stagger" works on a change to a row, column or group (or making a row / column)')
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
        if (takeBareNumber(props)) numberEach(list, props, meta, warn)
        applyProps(group, props, false, warn, meta)
        shapes.set(id, group)
        tween(meta, group.uid).enter = 'fade'
        tween(meta, group.uid).dur = speedOf(props)
        return
      }
      if (firstWord === 'ungroup') {
        if (!existing) throw new Error(`no shape called "${id}"`)
        if (existing.type !== 'group') throw new Error(`"${id}" isn't a group`)
        if (tokens.length > 1) throw new Error('"ungroup" takes nothing after it')
        for (const m of existing.members) { const member = shapes.get(m); if (member?.attach?.ref === id) member.attach = null }
        shapes.delete(id)
        tween(meta, existing.uid).exit = 'fade'
        return
      }

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
        if (isVar) setValue(shape, varValue || { label: '' })
        shape.layer = props.layer || defaults.layer || 'normal'
        if (existing) {
          // Lines attached to the old shape attach to its replacement (same id).
          warn(`"${id}" already exists, so it is replaced`)
          tween(meta, existing.uid).exit = 'fade'
          tween(meta, existing.uid).dur = speedOf(props)
          setDelay(meta, existing.uid, props)
        }
        shapes.set(id, shape)
        tween(meta, shape.uid).enter = props.effect || defaults.effect || 'fade'
        if (props.effect) warnEffect(shape, props.effect, warn)
        tween(meta, shape.uid).dur = speedOf(props)
        setDelay(meta, shape.uid, props)
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
      checkParts(existing, props)
      if (props.effect) warn(`"${props.effect}" only applies when a shape is created or removed`)
      const order = existing.type === 'group' ? staggerOrder(existing) : null
      if (order && takeBareNumber(props)) numberEach(existing.members.map((m) => shapes.get(m)), props, meta, warn)
      if (order) restyleMembers(existing, props, meta, warn) // takes the members' look out of props
      const shape = structuredClone(existing)
      if (newValue) setValue(shape, newValue)
      const path = applyProps(shape, props, false, warn, meta)
      if (path) tween(meta, shape.uid).path = path
      else if (props.at || props.x || props.y) tween(meta, shape.uid).path = null // a later straight move wins
      shapes.set(id, shape)
      tween(meta, shape.uid).dur = Math.max(tween(meta, shape.uid).dur, speedOf(props) * (props.travel?.length || 1)) // travel: speed per hop
      setDelay(meta, shape.uid, props)
      updateParts(shape, props, meta, warn)
      if (order) applyStagger(shape, order, props, meta, warn)
      else if (props.stagger) warn(`"stagger" works on a row, column or group, and "${id}" isn't one`)
    }

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
    const KEPT_STYLE = ['fill', 'stroke', 'colour']
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

    // A flyer: a copy that exists only while the beat plays, gliding hop by hop through `hops` in
    // the first `move` of its time (then fading out), or (move 1) vanishing as it arrives, where
    // something else takes over. Its look blends from `from`'s to `to`'s on the way.
    function fly(meta, from, to, hops, props, { after = 0, dur, move = 1 }) {
      const n = ++uid
      const look = (shape) => ({ ...structuredClone(shape), id: `~flyer${n}`, uid: n, attach: null, hl: null, callout: null, layer: 'front' })
      meta.flyers = [...(meta.flyers || []), { uid: n, from: look(from), to: look(to), hops, move }]
      setDelay(meta, n, props)
      Object.assign(tween(meta, n), { dur, delay: (props.delay ? props.delay.v * 1000 : 0) + after })
    }

    // A var's or cell's new value (and with keep-style, the look it came with), crossfading in
    // over `land` ms (the moment a flyer lands)
    function landValue(meta, target, value, props, land, style = {}) {
      const changed = { ...structuredClone(target), ...style }
      setValue(changed, value)
      shapes.set(changed.id, changed)
      const speed = speedOf(props)
      setDelay(meta, changed.uid, props)
      const record = tween(meta, changed.uid)
      record.dur = Math.max(record.dur, 0.5 * speed)
      record.delay = Math.max(record.delay, (props.delay ? props.delay.v * 1000 : 0) + land - 0.25 * speed)
      return changed
    }

    // "v1: a.1": a copy of a.1 glides onto v1, which takes its value as it lands
    function assignValue(target, source, tokens, meta, warn) {
      const props = parseProps(tokens, 1, 'edit', shapes)
      const extra = Object.keys(props).find((key) => !['speed', 'delay', 'ease', 'keepStyle'].includes(key))
      if (extra) throw new Error(`copying a value only takes a speed, a delay, an ease and keep-style, not "${extra === 'label' ? 'quoted text' : extra}"`)
      if (source.id === target.id) return warn(`"${target.id}" already holds its own value`)
      const speed = speedOf(props)
      const changed = landValue(meta, target, valueIn(source), props, speed, keptStyle(props, source))
      fly(meta, source, changed, [{ x: source.x, y: source.y }, { x: target.x, y: target.y }], props, { dur: 1.25 * speed, move: 0.8 })
    }

    // A change's timing, starting `after` ms into it (after any delay)
    function timeAt(meta, uid, props, after = 0) {
      setDelay(meta, uid, props) // the ease, and checks the delay
      const record = tween(meta, uid)
      record.dur = Math.max(record.dur, speedOf(props))
      record.delay = Math.max(record.delay, (props.delay ? props.delay.v * 1000 : 0) + after)
    }

    // A var's / row's / column's name tag, and a row's / column's cell numbers (indices), are text
    // shapes that go with it: attached, so they move with it, and removed with it (`part`). The
    // name is "id.name" (left of a var or row, above a column, unless a side is given); indices are
    // "id.index.0", … (smaller and muted, below a row's cells, left of a column's), fixed in the row
    // at the places, so they stay put through a swap and while cells slide in and out, and the last
    // one comes as a slot opens on the end and goes as one closes.
    function checkParts(shape, props) {
      if (props.name && !shape.var && !shape.layout) throw new Error('"name" is for a var, row or column')
      if (props.indices !== undefined && !shape.layout) throw new Error('"indices" is for a row or column')
    }

    function updateParts(shape, props, meta, warn) {
      if (props.name) setName(shape, props.name, props, meta, warn)
      if (props.indices !== undefined) {
        if (shape.indices === props.indices) warn(props.indices ? `"${shape.id}" already shows its indices` : `"${shape.id}" isn't showing its indices`)
        shape.indices = props.indices
        syncIndices(shape, props, meta)
      }
    }

    function setName(owner, name, props, meta, warn) {
      const nameId = `${owner.id}.name`
      const old = shapes.get(nameId)
      if (name.none) {
        if (!old) return warn(`"${owner.id}" has no name to clear`)
        shapes.delete(nameId)
        tween(meta, old.uid).exit = 'fade'
        timeAt(meta, old.uid, props)
        return
      }
      const text = old ? structuredClone(old) : { ...baseShape('text'), id: nameId, uid: ++uid, font: 1.2, layer: owner.layer, part: owner.id }
      text.label = name.text
      text.attach = { ref: owner.id, side: name.side || old?.attach?.side || (owner.layout === 'column' ? 'above' : 'left-of'), gap: 0.2 * CELL }
      Object.assign(text, attachPos(text, owner, text.attach))
      shapes.set(nameId, text)
      if (!old) tween(meta, text.uid).enter = 'fade'
      timeAt(meta, text.uid, props)
    }

    // Adds or removes index texts so a row / column has one per cell (none without "indices"),
    // new ones fading in `add` ms in and old ones out `remove` ms in.
    function syncIndices(row, props, meta, { add = 0, remove = 0 } = {}) {
      const n = row.indices ? row.members.length : 0
      const across = row.layout === 'row'
      for (let k = 0; ; k++) {
        const indexId = `${row.id}.index.${k}`
        const old = shapes.get(indexId)
        if (k >= n) {
          if (!old) break
          shapes.delete(indexId)
          tween(meta, old.uid).exit = 'fade'
          timeAt(meta, old.uid, props, remove)
          continue
        }
        // Fixed in the row beside its place (not on the cell), so it stays with the place while a
        // cell slides in or out of it; at the back, so a sliding cell passes over it
        const text = old || { ...baseShape('text'), id: indexId, uid: ++uid, label: String(k), font: 0.88, colour: 'muted', layer: 'back', part: row.id }
        const cell = shapes.get(`${row.id}.${k}`)
        const place = { ...cell, x: row.x + cell.attach.dx, y: row.y + cell.attach.dy }
        const p = placeNextTo(text, place, across ? 'below' : 'left-of', (across ? 0.1 : 0.2) * CELL)
        text.attach = { ref: row.id, dx: p.x - row.x, dy: p.y - row.y }
        Object.assign(text, p)
        if (old) continue
        shapes.set(indexId, text)
        tween(meta, text.uid).enter = 'fade'
        timeAt(meta, text.uid, props, add)
      }
    }

    // Removes a shape (and a group's members), with the line's exit effect and timing.
    function removeShape(target, props, meta, warn) {
      if (!target) return
      if (target.type === 'group') target.members.forEach((m) => removeShape(shapes.get(m), props, meta, warn))
      for (const part of [...shapes.values()].filter((s) => s.part === target.id)) removeShape(part, props, meta, warn) // its name, indices
      leaveGroup(target)
      freezeEndsAttachedTo(target.id)
      shapes.delete(target.id)
      tween(meta, target.uid).exit = props.effect || defaults.effect || 'fade'
      if (props.effect) warnEffect(target, props.effect, warn)
      tween(meta, target.uid).dur = speedOf(props)
      setDelay(meta, target.uid, props)
    }

    // A row (side by side) or column (one under another) of rect cells, ids "id.0", "id.1", …: a
    // group placed by its first cell. The values go in [ ] straight after the type (numbers or
    // quoted text, commas optional), or a bare count makes that many empty cells; size, gap and
    // the look apply to every cell.
    function createLayout(id, layout, tokens, existing, meta, warn) {
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
      const allowed = ['at', 'x', 'y', 'gap', 'size', 'width', 'height', ...CELL_STYLE, 'layer', 'speed', 'delay', 'ease', 'stagger', 'effect', 'highlight', 'callout', 'name', 'indices']
      const extra = Object.keys(props).find((key) => !allowed.includes(key))
      if (extra) throw new Error(`"${extra === 'head' ? 'arrow' : extra}" doesn't apply to a ${layout}`)

      if (existing) {
        warn(`"${id}" already exists, so it is replaced`)
        removeShape(existing, props, meta, warn)
      }
      const ids = values.map((_, k) => `${id}.${k}`)
      for (const cellId of ids) {
        if (!shapes.has(cellId)) continue
        warn(`"${cellId}" already exists, so it is replaced by a cell of "${id}"`)
        removeShape(shapes.get(cellId), props, meta, warn)
      }

      // The cells, laid out from the first one (at 0,0 for now)
      const gap = props.gap ? props.gap.v * CELL : 0
      const look = pick(props, ['size', 'width', 'height', ...CELL_STYLE])
      const cells = values.map((value, k) => {
        const cell = { ...baseShape('rect'), id: ids[k], uid: ++uid, holds: true, x: 0, y: 0 }
        applyDefaults(cell)
        applyProps(cell, look, true, warn, meta)
        setValue(cell, value)
        cell.layer = props.layer || defaults.layer || 'normal'
        return cell
      })
      // a blank cell in the row's look, for cells added later (insert, push)
      const blank = { ...structuredClone(cells[0]), label: '', nil: false }
      delete blank.id
      delete blank.uid
      layoutCells({ id, layout, gap }, cells)
      cells.forEach((cell) => Object.assign(cell, { x: cell.attach.dx, y: cell.attach.dy }))
      if (takeBareNumber(props)) numberEach(cells, props, meta, warn)
      const b = unionBounds(cells, shapes)
      const row = {
        ...baseShape('group'), id, uid: ++uid, layout, members: ids, gap, cell: blank,
        w: b.x1 - b.x0, h: b.y1 - b.y0, cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2,
      }
      applyProps(row, pick(props, ['at', 'x', 'y', 'highlight', 'callout']), true, warn, meta)
      shapes.set(id, row)
      tween(meta, row.uid).enter = 'fade'
      tween(meta, row.uid).dur = speedOf(props)
      for (const cell of cells) {
        Object.assign(cell, { x: row.x + cell.attach.dx, y: row.y + cell.attach.dy })
        shapes.set(cell.id, cell)
        tween(meta, cell.uid).enter = props.effect || defaults.effect || 'fade'
        tween(meta, cell.uid).dur = speedOf(props)
        setDelay(meta, cell.uid, props)
      }
      if (props.effect) warnEffect(cells[0], props.effect, warn)
      updateParts(row, props, meta, warn)
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
      // cells added to a row / column later take its look as it is now
      if (group.cell) applyProps(group.cell, pick(look, CELL_STYLE.filter((key) => !APPLIES[key] || APPLIES[key].includes('rect'))), false, () => {}, meta)
      const used = new Set()
      for (const member of groupMembers(group)) {
        if (member.type === 'group') continue
        const own = pick(look, Object.keys(look).filter((key) => key === 'highlight' || APPLIES[key].includes(member.type)))
        if (!Object.keys(own).length) continue
        Object.keys(own).forEach((key) => used.add(key))
        const changed = structuredClone(member)
        applyProps(changed, own, false, warn, meta)
        shapes.set(changed.id, changed)
        tween(meta, changed.uid).dur = Math.max(tween(meta, changed.uid).dur, speedOf(props))
        setDelay(meta, changed.uid, props)
      }
      const unused = Object.keys(look).find((key) => !used.has(key))
      if (unused) warn(`"${unused === 'mono' ? 'monospace' : unused === 'linestyle' ? look[unused] : unused}" doesn't apply to any of the shapes in "${group.id}"`)
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
      const base = props.delay ? props.delay.v * 1000 : 0
      list.forEach((uids, k) => uids.forEach((uid) => {
        const record = tween(meta, uid)
        record.delay = Math.max(record.delay, base + k * stagger.gap * 1000)
      }))
    }

    // "arr: swap 0 3": two cells change places, one arcing over and one under (a column's: to the
    // right and left). Ids go with the places, so afterwards arr.0 is the cell now first; whatever
    // is attached to arr.0 (a pointer) stays there, and highlights go with the cells.
    function swapCells(id, row, tokens, meta, warn) {
      if (!row) throw new Error(`no shape called "${id}"`)
      if (!row.layout) throw new Error(`"swap" swaps two cells of a row or column, and "${id}" isn't one`)
      const index = (token) => (token?.kind === 'word' && /^\d+$/.test(token.value) ? Number(token.value) : undefined)
      const i = index(tokens[1])
      const j = index(tokens[2])
      if (i === undefined || j === undefined) throw new Error(`"swap" expects two cell numbers, e.g. "${id}: swap 0 3"`)
      const props = parseProps(tokens, 3, 'swap', shapes)
      const extra = Object.keys(props).find((key) => !['speed', 'delay', 'ease'].includes(key))
      if (extra) throw new Error(`"swap" only takes a speed, a delay and an ease, not "${extra}"`)
      const ids = [`${id}.${i}`, `${id}.${j}`]
      const [a, b] = ids.map((cellId) => {
        const cell = shapes.get(cellId)
        if (!cell || cell.attach?.ref !== id || cell.attach.dx === undefined) throw new Error(`"${cellId}" isn't a cell of "${id}" (its cells are ${id}.0 to ${id}.${row.members.length - 1})`)
        return cell
      })
      if (i === j) return warn('a cell swapped with itself stays where it is')

      // Neighbours just pass each other; further apart, they clear the cells in between
      const across = row.layout === 'row'
      const lift = (Math.abs(i - j) > 1 ? 1.1 : 0.6) * Math.max(...[a, b].map((cell) => (across ? cell.h : cell.w)))
      const moves = [[a, b], [b, a]].map(([cell, other]) => {
        const moved = structuredClone(cell)
        moved.id = other.id
        moved.attach = { ...cell.attach, dx: other.attach.dx, dy: other.attach.dy }
        const onward = across ? other.attach.dx > cell.attach.dx : other.attach.dy > cell.attach.dy
        tween(meta, moved.uid).arc = across ? { x: 0, y: onward ? -lift : lift } : { x: onward ? lift : -lift, y: 0 }
        return moved
      })
      for (const moved of moves) {
        shapes.set(moved.id, moved)
        tween(meta, moved.uid).dur = Math.max(tween(meta, moved.uid).dur, speedOf(props))
        setDelay(meta, moved.uid, props)
      }
    }

    // Lays a row's / column's cells out in order from its first cell: ids id.0, id.1, … and their
    // offsets in it.
    function layoutCells(row, cells) {
      const across = row.layout === 'row'
      let offset = 0
      cells.forEach((cell, k) => {
        const before = cells[k - 1]
        if (before) offset += (across ? (before.w + cell.w) / 2 : (before.h + cell.h) / 2) + (row.gap || 0)
        cell.id = `${row.id}.${k}`
        cell.attach = { ref: row.id, dx: across ? offset : 0, dy: across ? 0 : offset }
      })
      row.members = cells.map((cell) => cell.id)
    }

    // When the second part of a cell edit starts: the cells closing up start when the leaving one
    // is mostly gone, and an arriving one when its slot has mostly opened.
    const THEN = 0.6

    // "arr: delete 2" / "arr: pop" / "arr: insert 7 at 3" / "arr: push 8": a cell leaves or
    // arrives, sliding out below a row (left of a column) as it fades, and the cells after it close
    // up or open a space. Ids go with the places, as in a swap: after "delete 2", arr.2 is the
    // cell that was arr.3, and what's attached to the last place (now gone) is left where it was.
    function editCells(id, row, word, tokens, meta) {
      if (!row) throw new Error(`no shape called "${id}"`)
      if (!row.layout) throw new Error(`"${word}" changes the cells of a row or column, and "${id}" isn't one`)
      const examples = { delete: 'delete 2', insert: 'insert 7 at 3" or "insert v1 at 3', push: 'push 8" or "push v1', pop: 'pop" or "pop v1' }
      const cells = row.members.map((m) => shapes.get(m)).filter(Boolean)
      const n = cells.length
      const range = n ? `${id}.0 to ${id}.${n - 1}` : 'none'
      const index = (token) => (token?.kind === 'word' && /^\d+$/.test(token.value) ? Number(token.value) : undefined)

      // The operands: where, and what goes in (a value, or a copy of a var's or cell's), or for
      // pop, the var or cell its value goes into
      let at
      let value
      let source // a var or cell copied in (insert, push), as it is now
      let target // the var or cell popped into
      let next = 1
      if (word === 'delete') {
        at = index(tokens[1])
        if (at === undefined) throw new Error(`"delete" expects a cell number, e.g. "${id}: ${examples.delete}"`)
        next = 2
      } else if (word === 'pop') {
        at = n - 1
        if (holderRef(tokens[1])) { target = holderRef(tokens[1], 'pop into'); next = 2 }
      } else {
        value = valueOf(tokens[1])
        if (!value && holderRef(tokens[1])) {
          source = structuredClone(holderRef(tokens[1], word === 'push' ? 'push' : 'insert'))
          value = valueIn(source)
        }
        if (!value) throw new Error(`"${word}" expects a value (a number, "quoted" text or null) or a var, e.g. "${id}: ${examples[word]}"`)
        next = 2
        if (word === 'insert') {
          if (tokens[2]?.lower !== 'at' || index(tokens[3]) === undefined) throw new Error(`"insert" expects a value and where it goes, e.g. "${id}: ${examples.insert}"`)
          at = index(tokens[3])
          next = 4
        } else at = n
      }
      const props = parseProps(tokens, next, 'edit', shapes)
      const moving = source || target // a var's or cell's value comes in or goes out
      const extra = Object.keys(props).find((key) => !['speed', 'delay', 'ease', ...(moving ? ['keepStyle'] : [])].includes(key))
      if (extra === 'keepStyle') throw new Error(`"keep-style" goes with a var's or cell's value, e.g. "${id}: ${word === 'pop' ? 'pop v1' : word === 'push' ? 'push v1' : 'insert v1 at 0'} keep-style"`)
      if (extra) throw new Error(`"${word}" only takes a speed, a delay and an ease${moving ? ' (and keep-style)' : ''}, not "${extra === 'label' ? 'quoted text' : extra}"`)

      const removing = word === 'delete' || word === 'pop'
      if (removing && !n) throw new Error(`"${id}" has no cells left to ${word}`)
      if (removing && at >= n) throw new Error(`"${id}" has no cell ${at} (its cells are ${range})`)
      if (!removing && at > n) throw new Error(`"insert … at" goes from 0 to ${n} (${n}: on the end), and "${id}" has ${n} cell${n === 1 ? '' : 's'}`)
      if (target?.id === `${id}.${n - 1}`) throw new Error(`"${target.id}" is the cell being popped, so it can't be popped into`)

      const speed = speedOf(props)
      const base = props.delay ? props.delay.v * 1000 : 0
      const timing = (uid, after) => timeAt(meta, uid, props, after)
      const across = row.layout === 'row'
      const aside = (cell) => (across ? { x: 0, y: 1.2 * cell.h } : { x: -1.2 * cell.w, y: 0 }) // where a cell comes from / goes to

      // A slot (a muted outline) marks the space while it opens or closes (drawn only during the beat): left
      // where a cell goes out, closing as the cells after it close up; or opening as the cells move
      // aside, for the new cell to land in. Push and pop open and close one on the end.
      const list = cells.map((cell) => structuredClone(cell))
      let slotCell
      if (removing) {
        freezeEndsAttachedTo(`${id}.${n - 1}`) // the last place goes
        const [gone] = list.splice(at, 1)
        if (target) tween(meta, gone.uid).cut = true // it flies to the target instead (below)
        else Object.assign(tween(meta, gone.uid), { exit: 'fade', offset: aside(gone) })
        timing(gone.uid, 0)
        list.slice(at).forEach((cell) => timing(cell.uid, THEN * speed))
        slotCell = gone
      } else {
        const blank = row.cell || { ...baseShape('rect') }
        const cell = { ...structuredClone(blank), ...(source ? keptStyle(props, source) : {}), uid: ++uid, holds: true, hl: null, callout: null }
        setValue(cell, value)
        list.splice(at, 0, cell)
        list.slice(at + 1).forEach((other) => timing(other.uid, 0))
        Object.assign(tween(meta, cell.uid), { enter: 'fade', offset: aside(cell) })
        timing(cell.uid, THEN * speed)
        slotCell = cell
      }
      for (const cell of cells) shapes.delete(cell.id)
      layoutCells(row, list)
      for (const cell of list) {
        Object.assign(cell, { x: row.x + cell.attach.dx, y: row.y + cell.attach.dy })
        shapes.set(cell.id, cell)
      }
      // the last index comes with the slot, or goes as it closes
      if (row.indices) syncIndices(row, props, meta, { add: 0, remove: THEN * speed })

      // pop into: the popped cell itself drops out and glides onto the target, which takes its value
      // as it lands (the target may be another of this row's cells, so after the layout)
      if (target) {
        const out = aside(slotCell)
        const to = shapes.get(target.id)
        const hops = [{ x: slotCell.x, y: slotCell.y }, { x: slotCell.x + out.x, y: slotCell.y + out.y }, { x: to.x, y: to.y }]
        const changed = landValue(meta, to, valueIn(slotCell), props, 1.2 * speed, keptStyle(props, slotCell))
        fly(meta, slotCell, changed, hops, props, { dur: 1.5 * speed, move: 0.8 })
      }

      // A copy of a var or cell glides to just outside the opening slot (its look turning into the
      // row's on the way), then the new cell, solid from the start, slides in from there
      if (source) {
        tween(meta, slotCell.uid).solid = true
        const out = aside(slotCell)
        const place = { x: row.x + slotCell.attach.dx, y: row.y + slotCell.attach.dy }
        fly(meta, source, slotCell, [{ x: source.x, y: source.y }, { x: place.x + out.x, y: place.y + out.y }], props, { dur: THEN * speed })
      }

      // The slot's place in the row (a removed cell's from before, a new cell's from after the
      // layout), and its time: both parts, start to end
      const slot = {
        uid: ++uid, ref: id, across, closing: removing, then: THEN / (1 + THEN),
        dx: slotCell.attach.dx, dy: slotCell.attach.dy, w: slotCell.w, h: slotCell.h, corner: slotCell.corner || 0,
      }
      setDelay(meta, slot.uid, props)
      Object.assign(tween(meta, slot.uid), { dur: (1 + THEN) * speed, delay: base })
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
  // one property per line. Comments are removed and blank lines skipped first; `li` is the line
  // the command starts on (for error messages).
  function logicalLines(scene) {
    const out = []
    let current = null
    scene.split('\n').forEach((raw, li) => {
      const text = stripComment(raw).trimEnd()
      if (!text.trim()) return
      const indent = text.length - text.trimStart().length
      if (current && indent > current.indent) current.text += ` ${text.trim()}`
      else out.push((current = { text: text.trim(), li, indent }))
    })
    return out
  }

  // One record per shape per beat: how its change animates (duration and delay in ms, the route
  // it follows, its entrance / exit effect, the shape a copy starts from, a one-off effect, and
  // `offset`: how far it slides as it enters or leaves, as a row's cell does).
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

    steps.forEach((step, si) => {
      step.beats.forEach((beat, bi) => {
        const meta = { tweens: new Map(), pause: null, auto: false }
        const where = (li) => `Step ${si + 1}${step.beats.length > 1 ? `, beat ${bi + 1}` : ''}, line ${li + 1}`
        logicalLines(beat.scene).forEach(({ text, li }) => {
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
        beats.push({ step: si, beat: bi, state, meta, camera: compiler.camera() })
      })
    })

    return { beats, errors, warnings }
  }

  Object.assign(window.Anim, { compile })
})()
