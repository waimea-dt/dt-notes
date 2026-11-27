/**
 * anim-trail.js - Part of the animation plugin (animation.js), and of its compiler (createCompiler
 * in anim-compile.js): trails. "A: trail" gives a shape a trail (a part, "A.trail": a line, SHAPES:
 * trail) that grows along the way it goes from then on, until "A: trail clear".
 */

;(function () {
  const { boxCentre, isLine, MAX_DEPTH, STYLE, pick, baseShape, trailId, rotateAbout, arcOffset, pointOnHops, pointOnPath,
    easeFn, lerp } = window.Anim

  // How finely a trail follows a move: points per hop of a travel, along a route (via, follow), and
  // degrees per point of a turn (about). A straight move needs no more than its end.
  const TRAIL_STEPS = { hop: 16, route: 48, degrees: 5 }

  window.Anim.COMPILER_PARTS.push((cx) => {
    const { shapes, newUid, tween } = cx
    let schedule // linked once every part is made

    // "A: trail" / "A: trail clear". `before` is the shape as it was before this line, so a trail
    // turned on with a move ("A: move 9,3 trail") starts where the move does.
    function setTrail(before, shape, props, meta, warn) {
      if (isLine(shape)) throw new Error('a line has no single position, so it can\'t leave a trail (a shape on its end can)')
      const id = trailId(shape.id)
      const old = shapes.get(id)
      if (!props.trail) {
        if (!old) return warn(`"${shape.id}" has no trail to clear`)
        shapes.delete(id)
        schedule(meta, old.uid, props).exit = 'fade'
        return
      }
      if (old) return warn(`"${shape.id}" already leaves a trail`)
      const start = boxCentre(before)
      const trail = { ...baseShape('trail'), id, uid: newUid(), part: shape.id, owner: shape.uid, role: 'trail', from: start, to: { ...start }, via: [] }
      trail.start = pick(trail, STYLE)
      shapes.set(id, trail)
      schedule(meta, trail.uid, props).enter = 'appear' // there from the start, so it grows from nothing
    }

    // A trail's points: its ends and via points (a new one has just its start)
    const pointsOf = (trail) => (trail.via.length || trail.from.x !== trail.to.x || trail.from.y !== trail.to.y
      ? [trail.from, ...trail.via, trail.to] : [trail.from])

    // The shape that moved a shape this beat, and how: the shape itself or what it rides on (its
    // group, or the shape it's attached to), with the first of them to have a route (a turn, a
    // path, or a swap's bow) or else to have changed at all (record: its timing)
    function moverOf(shape, meta) {
      let first = null
      for (let s = shape, depth = 0; s && depth < MAX_DEPTH; s = s.attach && shapes.get(s.attach.ref), depth++) {
        const record = meta.tweens.get(s.uid)
        if (record?.turn || record?.path || record?.arc) return { shape: s, record }
        first ||= record?.dur ? { shape: s, record } : null
      }
      return first || { shape, record: null }
    }

    // The way a shape's centre went from `last` to `end` this beat: { at(u), steps, raw }. at(u) is
    // its centre a fraction u of the way through (raw: u is un-eased, as a travel's hops ease each
    // on its own), sampled at `steps` points after the first.
    function wayOf(last, end, mover) {
      const { record } = mover
      if (record?.turn) {
        const { pivot, by } = record.turn
        return { at: (u) => rotateAbout(last, pivot, by * u), steps: Math.max(1, Math.ceil(Math.abs(by) / TRAIL_STEPS.degrees)) }
      }
      if (record?.path) {
        // the route is the mover's: the shape keeps its offset from it
        const off = { x: end.x - mover.shape.x, y: end.y - mover.shape.y }
        const shifted = (p) => ({ x: p.x + off.x, y: p.y + off.y })
        const { path } = record
        if (path.hops) return { at: (u) => shifted(pointOnHops(path.hops, u, easeFn(record.ease))), steps: (path.hops.length - 1) * TRAIL_STEPS.hop, raw: true }
        return { at: (u) => shifted(pointOnPath(path, u)), steps: TRAIL_STEPS.route }
      }
      const straight = (u) => ({ x: lerp(last.x, end.x, u), y: lerp(last.y, end.y, u) })
      if (record?.arc) {
        // a swapped cell bows out to one side on its way, as the renderer draws it (tween: arc)
        const { arc } = record
        return { at: (u) => { const p = straight(u); const off = arcOffset(arc, u); return { x: p.x + off.x, y: p.y + off.y } }, steps: TRAIL_STEPS.route }
      }
      return { at: straight, steps: 1 }
    }

    // Once a beat's lines have run: each trail whose shape has moved takes the way it went, drawn
    // as it moves (tween: grow, in the mover's time)
    function growTrails(meta) {
      for (const trail of [...shapes.values()].filter((s) => s.role === 'trail')) {
        const owner = shapes.get(trail.part)
        if (!owner) continue
        const end = boxCentre(owner)
        const last = trail.to
        if (Math.hypot(end.x - last.x, end.y - last.y) < 1e-6) continue
        const mover = moverOf(owner, meta)
        const way = wayOf(last, end, mover)
        const added = Array.from({ length: way.steps }, (_, k) => way.at((k + 1) / way.steps))
        added[added.length - 1] = end
        const kept = pointsOf(trail)
        const points = [...kept, ...added]
        const grown = { ...structuredClone(trail), from: points[0], to: points[points.length - 1], via: points.slice(1, -1) }
        shapes.set(trail.id, grown)
        const record = tween(meta, grown.uid)
        const { dur = 0, delay = 0, ease } = mover.record || schedule(meta, grown.uid, {})
        Object.assign(record, { dur, delay, grow: { kept: kept.length, steps: way.steps, raw: Boolean(way.raw) } })
        if (mover.record?.rounds) record.rounds = mover.record.rounds // grows round by round, as its shape goes
        if (ease) record.ease = ease
      }
    }

    return {
      functions: { setTrail },
      verbs: {},
      finish: growTrails,
      link: () => { ({ schedule } = cx) },
    }
  })
})()
