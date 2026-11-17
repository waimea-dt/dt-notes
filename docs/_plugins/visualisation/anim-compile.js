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

      if (props.label !== undefined) shape.label = props.label
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
          else if (typeof item === 'object') hl.number = item.number
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
        if (['speed', 'effect', 'ease', 'stagger'].includes(key)) continue
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
        if (group.type !== 'group' || !group.members.length) continue
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
        const members = []
        let j = 1
        for (let ref; (ref = parseAs('id', tokens[j], shapes)); j++) members.push(ref)
        if (!members.length) throw new Error('"group" expects the ids of the shapes to group, e.g. "g: group a b c"')
        const props = parseProps(tokens, j, 'change', shapes)
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
        const props = parseProps(tokens, 1, 'create', shapes)
        if (props.stagger) warn('"stagger" works on a change to a row, column or group (or making a row / column)')
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
          tween(meta, existing.uid).exit = 'fade'
          tween(meta, existing.uid).dur = speedOf(props)
          setDelay(meta, existing.uid, props)
        }
        shapes.set(id, shape)
        tween(meta, shape.uid).enter = props.effect || defaults.effect || 'fade'
        if (props.effect) warnEffect(shape, props.effect, warn)
        tween(meta, shape.uid).dur = speedOf(props)
        setDelay(meta, shape.uid, props)
        return
      }

      if (!existing) {
        const word = first?.kind === 'word' ? first.lower : ''
        const known = !word || KEYWORDS[word] || RESERVED.has(word)
        throw new Error(known ? `no shape called "${id}" (to create one, put a type after the colon, e.g. "${id}: rect")` : `unknown shape type "${first.value}"`)
      }
      const props = parseProps(tokens, 0, 'change', shapes)
      if (props.effect) warn(`"${props.effect}" only applies when a shape is created or removed`)
      const order = existing.type === 'group' ? staggerOrder(existing) : null
      if (order) restyleMembers(existing, props, meta, warn) // takes the members' look out of props
      const shape = structuredClone(existing)
      const path = applyProps(shape, props, false, warn, meta)
      if (path) tween(meta, shape.uid).path = path
      else if (props.at || props.x || props.y) tween(meta, shape.uid).path = null // a later straight move wins
      shapes.set(id, shape)
      tween(meta, shape.uid).dur = Math.max(tween(meta, shape.uid).dur, speedOf(props) * (props.travel?.length || 1)) // travel: speed per hop
      setDelay(meta, shape.uid, props)
      if (order) applyStagger(shape, order, props, meta, warn)
      else if (props.stagger) warn(`"stagger" works on a row, column or group, and "${id}" isn't one`)
    }

    // Removes a shape (and a group's members), with the line's exit effect and timing.
    function removeShape(target, props, meta, warn) {
      if (!target) return
      if (target.type === 'group') target.members.forEach((m) => removeShape(shapes.get(m), props, meta, warn))
      leaveGroup(target)
      freezeEndsAttachedTo(target.id)
      shapes.delete(target.id)
      tween(meta, target.uid).exit = props.effect || defaults.effect || 'fade'
      if (props.effect) warnEffect(target, props.effect, warn)
      tween(meta, target.uid).dur = speedOf(props)
      setDelay(meta, target.uid, props)
    }

    // A row (side by side) or column (one under another) of rect cells, ids "id.0", "id.1", …: a
    // group placed by its first cell. The values come straight after the type (numbers or quoted
    // text); size, gap and the look apply to every cell.
    function createLayout(id, layout, tokens, existing, meta, warn) {
      const values = []
      let j = 1
      for (; j < tokens.length; j++) {
        const token = tokens[j]
        if (token.kind === 'str') values.push(token.value)
        else if (token.kind === 'word' && NUMBER.test(token.value)) values.push(token.value)
        else break
      }
      if (!values.length) throw new Error(`a ${layout} needs its values straight after "${layout}", e.g. "${id}: ${layout} 5 3 8 1 at 2,3" (put words in quotes: "A" "B")`)
      const props = parseProps(tokens, j, 'layout', shapes)
      if (props.label !== undefined) throw new Error(`a ${layout}'s values all go straight after "${layout}"`)
      const allowed = ['at', 'x', 'y', 'gap', 'size', 'width', 'height', ...CELL_STYLE, 'layer', 'speed', 'delay', 'ease', 'stagger', 'effect', 'highlight', 'callout']
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
      const across = layout === 'row'
      const gap = props.gap ? props.gap.v * CELL : 0
      const look = pick(props, ['size', 'width', 'height', ...CELL_STYLE])
      let offset = 0
      const cells = values.map((label, k) => {
        const cell = { ...baseShape('rect'), id: ids[k], uid: ++uid, label, x: 0, y: 0 }
        applyDefaults(cell)
        applyProps(cell, look, true, warn, meta)
        cell.layer = props.layer || defaults.layer || 'normal'
        return cell
      })
      cells.forEach((cell, k) => {
        const before = cells[k - 1]
        if (before) offset += (across ? (before.w + cell.w) / 2 : (before.h + cell.h) / 2) + gap
        cell.attach = { ref: id, dx: across ? offset : 0, dy: across ? 0 : offset }
        Object.assign(cell, { x: cell.attach.dx, y: cell.attach.dy })
      })
      const b = unionBounds(cells, shapes)
      const row = {
        ...baseShape('group'), id, uid: ++uid, layout, members: ids,
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
  // it follows, its entrance / exit effect, the shape a copy starts from, a one-off effect).
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
