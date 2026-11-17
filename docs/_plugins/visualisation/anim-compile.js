/**
 * anim-compile.js - Part of the animation plugin (animation.js): compiling each beat's scene
 * lines into a snapshot of every shape, plus how each change animates (tweens) and the camera.
 */

;(function () {
  const { CELL, cellToPx, APPLIES, LINE_TYPES, FLOWS, resolveEnds, boxCentre, PLACE_GAP,
    placeNextTo, attachPos, buildPolyline, buildPath, resolveAttachments, unionBounds, NORMAL_MS,
    parseProps, tokenize, bounds, ID, RESERVED, RESOURCE_TYPES, SHAPE_TYPES, parseAs, lucideIcon,
    KEYWORDS, NUMBER } = window.Anim

  // ---------------------------------------------------------------------------
  // Compiling scenes into one state per beat
  // ---------------------------------------------------------------------------

  function baseShape(type) {
    const shape = { type, label: '', stroke: 'fg', colour: 'fg', fill: 'none', weight: 1, font: 1, angle: 0, scale: 1, bold: false, linestyle: 'solid', flow: 'none', align: 'centre', layer: 'normal' }
    if (type === 'rect') Object.assign(shape, { w: CELL, h: CELL, corner: 0, fill: 'bg' })
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

      // highlight: box / spotlight / arrow / number N stay until clear
      if (props.highlight) {
        const none = { box: false, spotlight: false, arrow: false, glow: false, number: null }
        const hl = { ...none, ...shape.hl }
        for (const item of props.highlight) {
          if (item === 'clear') Object.assign(hl, none)
          else if (typeof item === 'object') hl.number = item.number
          else hl[item] = true
        }
        shape.hl = hl
      }
      // pulse / shake / wobble / bounce / glow: one-off effects this beat, on an existing shape
      // (and a group's members)
      if (props.emphasis) {
        if (creating) warn(`"${props.emphasis}" plays on a shape that already exists, so it does nothing here`)
        else for (const target of [shape, ...groupMembers(shape)]) tween(meta, target.uid).effect = props.emphasis
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
        }
        for (const key of ['from', 'to']) {
          const end = props[key]
          if (!end) continue
          if (end.kind === 'ref') { shape[key] = { ref: end.ref }; continue }
          const current = creating ? undefined : resolveEnds(shape, shapes)[key]
          shape[key] = { x: coord(end.x, current?.x), y: coord(end.y, current?.y) }
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
        return { x: coord(via.x, start.x), y: coord(via.y, start.y) }
      })
      return buildPath([start, ...vias, { x: shape.x, y: shape.y }])
    }

    // Copies the defaults that apply to this type onto a new shape.
    function applyDefaults(shape) {
      for (const [key, value] of Object.entries(defaults)) {
        if (['speed', 'effect'].includes(key)) continue
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

    // draw only applies to lines and arrows, slide only to shapes; otherwise they fade
    function warnEffect(shape, effect, warn) {
      const line = LINE_TYPES.includes(shape.type)
      if (effect === 'draw' && !line) warn(`"draw" only draws lines and arrows, so this ${shape.type} fades instead`)
      if (effect === 'slide' && line) warn(`"slide" doesn't move lines, so this ${shape.type} fades instead`)
    }

    // Seconds before a line's change starts (the longest delay wins if a shape changes twice in a beat).
    function setDelay(meta, uid, props) {
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
      const extra = Object.keys(props).find((key) => !['at', 'x', 'y', 'travel', 'zoom', 'reset', 'speed', 'delay'].includes(key))
      if (extra) throw new Error(`"camera" takes at / x / y, travel, zoom, reset, speed and delay, not "${extra === 'label' ? 'quoted text' : extra}"`)
      if (props.at?.kind === 'place') throw new Error('"camera at" takes "x,y" or a shape id')
      if (!Object.keys(props).some((key) => ['at', 'x', 'y', 'travel', 'zoom', 'reset'].includes(key))) throw new Error('"camera" expects at, travel, zoom or reset, e.g. "camera at 4,3 zoom 2"')
      if (props.reset && (props.at || props.x || props.y || props.travel || props.zoom)) throw new Error('"camera reset" takes only a speed and a delay')
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
        const extra = Object.keys(props).filter((key) => !['speed', 'effect', 'delay'].includes(key))
        if (extra.length) throw new Error(`"remove" only takes a speed, an effect and a delay, not "${extra[0]}"`)
        // Removing a group removes its members too
        const removeOne = (target) => {
          if (!target) return
          if (target.type === 'group') target.members.forEach((m) => removeOne(shapes.get(m)))
          leaveGroup(target)
          freezeEndsAttachedTo(target.id)
          shapes.delete(target.id)
          tween(meta, target.uid).exit = props.effect || defaults.effect || 'fade'
          if (props.effect) warnEffect(target, props.effect, warn)
          tween(meta, target.uid).dur = speedOf(props)
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
      const shape = structuredClone(existing)
      const path = applyProps(shape, props, false, warn, meta)
      if (path) tween(meta, shape.uid).path = path
      else if (props.at || props.x || props.y) tween(meta, shape.uid).path = null // a later straight move wins
      shapes.set(id, shape)
      tween(meta, shape.uid).dur = Math.max(tween(meta, shape.uid).dur, speedOf(props) * (props.travel?.length || 1)) // travel: speed per hop
      setDelay(meta, shape.uid, props)
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
