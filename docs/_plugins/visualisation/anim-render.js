/**
 * anim-render.js - Part of the animation plugin (animation.js): drawing a beat, or a blend
 * between two beats, into the SVG (shapes, labels, lines, highlights, callouts, flows).
 */

;(function () {
  const { HEX, COLOURS, PLAIN_FILLS, svgEl, LINE_TYPES, lucideIcon, lerp, STROKE, PATTERNS,
    reducedMotion, FLOW_SPEED, FONT, resolveEnds, HEAD, clamp01, boxCentre, extents, LAYERS, bounds,
    CELL, ease, pointOnHops, pointOnPath, resolveAttachments, textWidth, CALLOUT_CH } = window.Anim

  // ---------------------------------------------------------------------------
  // SVG rendering
  // ---------------------------------------------------------------------------

  const flowState = new WeakMap() // stroke element -> { key, anim } for flowing dashes

  // Sets (or with null, removes) an attribute only when it changes. Writing an SVG attribute makes
  // the browser re-check the element's layout even when the value is the same, and every shape is
  // drawn on every frame of a transition. Each element's last values are remembered here.
  const attrCache = new WeakMap()
  function attr(el, name, value) {
    let cache = attrCache.get(el)
    if (!cache) attrCache.set(el, (cache = new Map()))
    const text = value === null || value === undefined ? null : String(value)
    if (cache.has(name) && cache.get(name) === text) return
    cache.set(name, text)
    if (text === null) el.removeAttribute(name)
    else el.setAttribute(name, text)
  }

  // Parses a computed colour to [r, g, b, a] (0-255, alpha 0-1). rgb() and color(srgb …) are read
  // directly; anything else (the theme's oklch palette, lab, …) is converted by painting one pixel
  // on a canvas and reading it back as sRGB.
  let pixel = null
  function parseColour(text) {
    if (!text || text === 'none') return null
    const srgb = text.match(/^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.e-]+))?\)$/)
    if (srgb) return [srgb[1] * 255, srgb[2] * 255, srgb[3] * 255, srgb[4] === undefined ? 1 : +srgb[4]]
    const rgb = text.match(/^rgba?\(([^)]+)\)$/)
    if (rgb) {
      const [r, g, b, a = 1] = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number)
      return [r, g, b, a]
    }
    pixel ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    if (!pixel) return null
    pixel.clearRect(0, 0, 1, 1)
    pixel.fillStyle = text
    pixel.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = pixel.getImageData(0, 0, 1, 1).data
    return [r, g, b, a / 255]
  }

  function colourCss(name, role) {
    if (!name) return 'none'
    if (HEX.test(name)) return name
    const css = COLOURS[name.toLowerCase()] ?? 'none'
    if (role === 'fill' && !PLAIN_FILLS.includes(name.toLowerCase())) return `color-mix(in srgb, ${css} 45%, var(--anim-bg))`
    return css
  }

  function createRenderer(svg, viewBox, debug) {
    const layers = [0, 1, 2].map(() => svg.appendChild(svgEl('g')))
    const highlightLayer = svg.appendChild(svgEl('g', { class: 'anim-highlights' }))
    const calloutLayer = svg.appendChild(svgEl('g', { class: 'anim-callouts' }))
    const nodes = new Map() // uid -> node

    if (debug) drawDebugGrid(svg, viewBox)

    function makeNode(shape) {
      const g = svgEl('g', { class: `anim-shape anim-${shape.type}` })
      const node = { g, type: shape.type, uid: shape.uid }
      if (shape.type === 'rect') node.body = g.appendChild(svgEl('rect'))
      if (shape.type === 'circle') node.body = g.appendChild(svgEl('circle'))
      if (LINE_TYPES.includes(shape.type)) {
        node.body = g.appendChild(svgEl('line', { 'stroke-linecap': 'round' }))
        if (shape.type === 'arrow') node.head = g.appendChild(svgEl('polygon', { 'stroke-linejoin': 'round' }))
      }
      if (shape.type === 'image') {
        node.image = g.appendChild(svgEl('image', { href: shape.src, preserveAspectRatio: 'xMidYMid meet' }))
        node.body = g.appendChild(svgEl('rect', { fill: 'none' }))
      }
      if (shape.type === 'icon') {
        node.icon = window.lucide.createElement(lucideIcon(shape.icon))
        attr(node.icon, 'class', 'no-zoom') // the zoom plugin also attaches to nested SVGs
        g.appendChild(node.icon)
      }
      node.label = g.appendChild(svgEl('text', { class: 'anim-label', 'dominant-baseline': 'central' }))
      if (['image', 'icon'].includes(shape.type)) {
        const title = g.appendChild(svgEl('title'))
        node.title = title
      }
      if (debug) node.debugId = g.appendChild(svgEl('text', { class: 'anim-debug-id' }))
      nodes.set(shape.uid, node)
      return node
    }

    // Colours are blended in JavaScript every frame, like positions: each CSS colour (theme
    // variables, color-mix tints) is resolved to RGBA once through a hidden probe and cached; the
    // cache is cleared when the theme changes.
    const probe = svg.appendChild(svgEl('rect', { width: 0, height: 0 }))
    probe.style.display = 'none'
    const colourCache = new Map()
    function rgba(css) {
      if (!css || css === 'none') return null
      if (!colourCache.has(css)) {
        probe.style.fill = css
        colourCache.set(css, parseColour(getComputedStyle(probe).fill))
      }
      return colourCache.get(css)
    }
    // A colour part-way from a to b (either may be null = none: it fades in or out)
    function mixColour(a, b, t) {
      if (!a && !b) return 'none'
      const from = a || [...b.slice(0, 3), 0]
      const to = b || [...a.slice(0, 3), 0]
      const [r, g, bl, al] = from.map((v, i) => lerp(v, to[i], t))
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(bl)}, ${al.toFixed(3)})`
    }
    const paint = (el, prop, value) => { if (el.style[prop] !== value) el.style[prop] = value }

    // Draws one shape: `s` is its (interpolated) geometry, `v` its visibility and effect values.
    function drawNode(node, s, v, colours, byId) {
      const { g } = node
      if (node.type === 'group') {
        // A group is invisible (its highlight box is drawn in drawOverlays)
        if (node.debugId) { attr(node.debugId, 'x', s.x); attr(node.debugId, 'y', s.y); node.debugId.textContent = s.id }
        return
      }
      const strokeWidth = STROKE * s.weight
      // Dash patterns use round caps, so each drawn dash is shortened (and gap lengthened) by the
      // stroke width to keep the visible lengths; a dash of 0 is a round dot. Scales with the weight.
      const k = STROKE * Math.max(s.weight, 0.5) // the line's thickness in px (w)
      const dashFor = (style) => {
        if (style === 'solid' || !PATTERNS[style]) return { dash: 'none', cap: '', dashLen: 0, gapLen: 0, plain: true }
        const dashLen = Math.max(0, PATTERNS[style].d * k - strokeWidth)
        const gapLen = PATTERNS[style].g * k + strokeWidth
        return { dash: `${dashLen} ${gapLen}`, cap: 'round', dashLen, gapLen, plain: false }
      }
      const pattern = dashFor(s.linestyle)
      const { dash, cap } = pattern

      // A style change cross-fades: a copy of the stroke in the old style (the ghost) fades out on
      // top while the new style fades in. The ghost mirrors the stroke's geometry and colour.
      const fading = s.fromStyle && s.fromStyle !== s.linestyle && v.draw >= 1
      const syncGhost = (body, base = 0) => {
        if (!fading) {
          if (node.ghost) { flowState.get(node.ghost)?.anim?.cancel(); node.ghost.remove() }
          node.ghost = null
          body.style.strokeOpacity = ''
          return
        }
        if (!node.ghost) {
          node.ghost = body.cloneNode(false)
          // the old pattern carries on from where the stroke's flow had got to
          flowState.set(node.ghost, { key: '', shift: flowState.get(body)?.shift || 0 })
        }
        const ghost = node.ghost
        for (const name of ['x', 'y', 'width', 'height', 'rx', 'ry', 'r', 'x1', 'y1', 'x2', 'y2']) {
          const value = body.getAttribute(name)
          attr(ghost, name, value)
        }
        if (ghost.previousSibling !== body) body.after(ghost)
        const old = dashFor(s.fromStyle)
        ghost.style.cssText = ''
        Object.assign(ghost.style, {
          fill: 'none', stroke: body.style.stroke, strokeWidth: body.style.strokeWidth,
          strokeDasharray: old.dash, strokeLinecap: old.cap, strokeOpacity: String(1 - s.styleT),
        })
        setFlow(ghost, old, base)
        body.style.strokeOpacity = String(s.styleT)
      }
      // Flow: a looping Web Animation adds a steady march to the dash offset, one pattern period
      // per loop (seamless); reverse runs it backwards. It never eases. The offset underneath it
      // (inline) is `base` (see dashBase) plus `shift`, how far the march had got when it last
      // stopped or changed, so a new pattern, a change of direction or stopping carries on from
      // where the dashes are instead of jumping.
      const setFlow = (el, pat = pattern, base = 0) => {
        const on = s.flow !== 'none' && !pat.plain && v.draw >= 1 && !reducedMotion()
        const period = pat.dashLen + pat.gapLen
        const key = on ? `${period.toFixed(3)}|${s.flow}` : ''
        let state = flowState.get(el)
        if (!state) flowState.set(el, (state = { key: '', shift: 0 }))
        if (state.key !== key) {
          if (state.anim) {
            const { duration, iterations } = state.anim.effect.getTiming()
            const frac = iterations && duration ? ((state.anim.currentTime ?? 0) % duration) / duration : 0
            state.shift -= state.period * (state.reverse ? 1 - frac : frac)
            state.anim.cancel()
            state.anim = null
          }
          if (on && period) state.shift %= period // whole periods don't show
          state.key = key
          if (on && el.animate && period) {
            state.period = period
            state.reverse = s.flow === 'reverse'
            state.anim = el.animate([{ strokeDashoffset: '0px' }, { strokeDashoffset: `${-period}px` }], {
              duration: (period / FLOW_SPEED) * 1000, iterations: Infinity, direction: state.reverse ? 'reverse' : 'normal', composite: 'add',
            })
          }
        }
        el.style.strokeDashoffset = `${base + state.shift}px`
      }
      g.style.opacity = v.opacity
      // glow: brighter, with a soft halo. The one-off glow (v.glow) uses the shape's own colour
      // (the highlight colour if it has none); highlight glow (v.hlGlow) the highlight colour.
      const glowColour = (node.type === 'text' ? colours.colour : colours.stroke)
      const halo = (k, colour) => `drop-shadow(0 0 ${0.15 * CELL * k}px ${colour})`
      const filters = []
      const bright = Math.max(v.glow || 0, v.hlGlow || 0)
      if (bright) filters.push(`brightness(${1 + 0.35 * bright})`)
      if (v.glow) filters.push(halo(v.glow, glowColour === 'none' ? 'var(--color-important)' : glowColour))
      if (v.hlGlow) filters.push(halo(v.hlGlow, 'var(--color-important)'))
      g.style.filter = filters.join(' ')
      const fontSize = FONT * s.font
      node.label.style.fontSize = `${fontSize}px`
      node.label.style.fontWeight = s.bold ? '700' : ''
      node.label.style.opacity = v.labelOpacity
      paint(node.label, 'fill', colours.colour) // a text shape's colour, or any shape's label
      if (node.label.textContent !== v.label) node.label.textContent = v.label

      if (LINE_TYPES.includes(node.type)) {
        let { from, to } = resolveEnds(s, byId)
        if (v.ends) ({ from, to } = v.ends)
        // dashBase: a line from a shape starts its pattern at the shape's centre, not its edge, so
        // the dashes stay put while the edge point slides round the shape as the other end moves
        const fromShape = s.from?.ref && byId.get(s.from.ref)
        const dashBase = fromShape ? Math.hypot(from.x - boxCentre(fromShape).x, from.y - boxCentre(fromShape).y) : 0
        from = { x: from.x + v.dx, y: from.y + v.dy }
        to = { x: to.x + v.dx, y: to.y + v.dy }
        const len = Math.hypot(to.x - from.x, to.y - from.y)
        const ux = len ? (to.x - from.x) / len : 0
        const uy = len ? (to.y - from.y) / len : 0
        let end = to
        if (node.head) {
          const head = Math.min(HEAD * (0.6 + 0.4 * s.weight), len * 0.6)
          const back = { x: to.x - ux * head, y: to.y - uy * head }
          const half = head * 0.55
          const drawn = { x: from.x + (to.x - from.x) * v.draw, y: from.y + (to.y - from.y) * v.draw }
          const tip = v.draw < 1 ? drawn : to
          const base = v.draw < 1 ? { x: tip.x - ux * head, y: tip.y - uy * head } : back
          attr(node.head, 'points', `${tip.x},${tip.y} ${base.x - uy * half},${base.y + ux * half} ${base.x + uy * half},${base.y - ux * half}`)
          node.head.style.opacity = clamp01(v.draw * 4 - 0.2)
          node.head.style.strokeWidth = strokeWidth
          paint(node.head, 'fill', colours.stroke)
          paint(node.head, 'stroke', colours.stroke)
          end = back
        }
        attr(node.body, 'x1', from.x); attr(node.body, 'y1', from.y)
        attr(node.body, 'x2', end.x); attr(node.body, 'y2', end.y)
        node.body.style.strokeWidth = strokeWidth
        if (v.draw < 1) {
          setFlow(node.body) // off while drawing in
          syncGhost(node.body)
          attr(node.body, 'pathLength', '1')
          node.body.style.strokeDasharray = '1 1'
          node.body.style.strokeDashoffset = String(1 - v.draw)
        } else {
          attr(node.body, 'pathLength', null)
          node.body.style.strokeDasharray = dash
          node.body.style.strokeLinecap = cap
          setFlow(node.body, pattern, dashBase)
          syncGhost(node.body, dashBase)
        }
        paint(node.body, 'stroke', colours.stroke)
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        attr(node.label, 'x', mx); attr(node.label, 'y', my)
        attr(node.label, 'text-anchor', 'middle')
        node.label.classList.add('anim-halo')
        attr(g, 'transform', v.scale === 1 && !v.rot ? '' : `translate(${mx} ${my}) rotate(${v.rot || 0}) scale(${v.scale}) translate(${-mx} ${-my})`)
        if (node.debugId) { attr(node.debugId, 'x', from.x); attr(node.debugId, 'y', from.y); node.debugId.textContent = s.id }
        return
      }

      const c = boxCentre(s)
      attr(g, 'transform', `translate(${c.x + v.dx} ${c.y + v.dy}) rotate(${s.angle + (v.rot || 0)}) scale(${v.scale * s.scale})`)
      const { hw, hh } = extents(s)

      if (node.type === 'rect') {
        attr(node.body, 'x', -hw); attr(node.body, 'y', -hh)
        attr(node.body, 'width', 2 * hw); attr(node.body, 'height', 2 * hh)
        const corner = Math.max(0, Math.min(s.corner || 0, hw, hh))
        attr(node.body, 'rx', corner); attr(node.body, 'ry', corner)
      }
      if (node.type === 'circle') attr(node.body, 'r', s.r)
      if (['rect', 'circle'].includes(node.type)) {
        paint(node.body, 'fill', colours.fill)
        paint(node.body, 'stroke', s.weight ? colours.stroke : 'none')
        node.body.style.strokeWidth = strokeWidth
        node.body.style.strokeDasharray = dash
        node.body.style.strokeLinecap = cap
        setFlow(node.body)
        syncGhost(node.body)
      }
      if (node.type === 'image') {
        for (const el of [node.image, node.body]) {
          attr(el, 'x', -hw); attr(el, 'y', -hh)
          attr(el, 'width', 2 * hw); attr(el, 'height', 2 * hh)
        }
        paint(node.body, 'stroke', s.weight ? colours.stroke : 'none')
        node.body.style.strokeWidth = strokeWidth
        node.body.style.strokeDasharray = dash
        node.body.style.strokeLinecap = cap
        setFlow(node.body)
        syncGhost(node.body)
      }
      if (node.type === 'icon') {
        attr(node.icon, 'x', -hw); attr(node.icon, 'y', -hh)
        attr(node.icon, 'width', 2 * hw); attr(node.icon, 'height', 2 * hh)
        attr(node.icon, 'stroke-width', 2 * s.weight)
        paint(node.icon, 'stroke', colours.stroke)
      }
      if (node.title && node.title.textContent !== s.label) node.title.textContent = s.label

      // Label: inside rect/circle, the content of text, under image/icon
      const label = node.label
      attr(label, 'x', 0)
      attr(label, 'text-anchor', 'middle')
      if (node.type === 'text') {
        const anchor = s.align === 'left' ? 'start' : s.align === 'right' ? 'end' : 'middle'
        attr(label, 'text-anchor', anchor)
        attr(label, 'x', anchor === 'start' ? -hw : anchor === 'end' ? hw : 0)
        attr(label, 'y', 0)
      } else if (['image', 'icon'].includes(node.type)) {
        attr(label, 'y', hh + fontSize * 0.75)
      } else {
        attr(label, 'y', 0)
      }
      if (node.debugId) { attr(node.debugId, 'x', -hw); attr(node.debugId, 'y', -hh - 4); node.debugId.textContent = s.id }
    }

    // Puts each node in its layer, in creation order.
    function order(list) {
      list.sort((a, b) => LAYERS[a.shape.layer] - LAYERS[b.shape.layer] || a.shape.uid - b.shape.uid)
      // Moves only the nodes that are out of place: re-appending every node each frame is costly
      const prev = layers.map(() => null)
      list.forEach(({ node, shape }) => {
        const i = LAYERS[shape.layer]
        const want = prev[i] ? prev[i].nextSibling : layers[i].firstChild
        if (node.g.parentNode !== layers[i] || want !== node.g) layers[i].insertBefore(node.g, want)
        prev[i] = node.g
      })
    }

    function offscreenOffset(shape) {
      const c = bounds(shape, new Map())
      const cx = (c.x0 + c.x1) / 2
      const cy = (c.y0 + c.y1) / 2
      const options = [
        { d: cx - viewBox.x, dx: -(c.x1 - viewBox.x) - CELL / 2, dy: 0 },
        { d: viewBox.x + viewBox.w - cx, dx: viewBox.x + viewBox.w - c.x0 + CELL / 2, dy: 0 },
        { d: cy - viewBox.y, dx: 0, dy: -(c.y1 - viewBox.y) - CELL / 2 },
        { d: viewBox.y + viewBox.h - cy, dx: 0, dy: viewBox.y + viewBox.h - c.y0 + CELL / 2 },
      ]
      return options.sort((a, b) => a.d - b.d)[0]
    }

    // Visibility for a shape that is appearing (t: 0 -> 1) or disappearing (t: 1 -> 0).
    function appear(effect, t, shape) {
      const v = { opacity: 1, scale: 1, draw: 1, dx: 0, dy: 0 }
      const isLine = LINE_TYPES.includes(shape.type)
      if (effect === 'pop') { v.scale = Math.max(0.001, t); v.opacity = clamp01(t * 3) }
      else if (effect === 'draw' && isLine) v.draw = t
      else if (effect === 'slide' && !isLine) {
        const off = offscreenOffset(shape)
        v.dx = off.dx * (1 - t); v.dy = off.dy * (1 - t)
      } else v.opacity = t
      return v
    }

    function interpolate(a, b, t) {
      const s = { ...b }
      for (const key of ['x', 'y', 'w', 'h', 'r', 'corner', 'weight', 'font', 'angle', 'scale']) {
        if (typeof a[key] === 'number' && typeof b[key] === 'number') s[key] = lerp(a[key], b[key], t)
      }
      // A line style change cross-fades from the old style to the new (see syncGhost)
      if (a.linestyle !== b.linestyle && t < 1) {
        s.fromStyle = a.linestyle
        s.styleT = t
      }
      return s
    }

    // Shapes lit by a spotlight in a state (by id): spotlit shapes, the members of spotlit groups,
    // and lines whose ends are both on lit shapes. Null when nothing is spotlit.
    function litIds(state) {
      if (![...state.values()].some((s) => s.hl?.spotlight)) return null
      const lit = new Set()
      const isLit = (shape, depth = 0) => {
        if (!shape || depth > 8) return false
        if (shape.hl?.spotlight) return true
        if (shape.attach?.dx !== undefined) return isLit(state.get(shape.attach.ref), depth + 1)
        return false
      }
      for (const shape of state.values()) if (isLit(shape)) lit.add(shape.id)
      for (const shape of state.values()) {
        if (LINE_TYPES.includes(shape.type) && shape.from.ref && shape.to.ref && lit.has(shape.from.ref) && lit.has(shape.to.ref)) lit.add(shape.id)
      }
      return lit
    }

    // A beat's state never changes once compiled, so its spotlit shapes are worked out once
    const litCache = new WeakMap()
    function litFor(state) {
      if (!litCache.has(state)) litCache.set(state, litIds(state))
      return litCache.get(state)
    }

    const DIM = 0.2 // opacity of shapes outside the spotlight

    /**
     * Renders the transition between two consecutive states. progress(uid) gives each shape's
     * position from A (0) to B (1); `final` is the state the transition ends on (it supplies
     * the colours) and `ms(uid)` the colour transition time. `extra.beatT` is the whole beat's
     * progress from A to B (for the spotlight) and `extra.forward` its direction (one-off
     * highlight effects only play forwards).
     */
    function render(A, B, meta, progress, final, extra = { forward: true, beatT: 1 }) {
      const aByUid = new Map([...A.values()].map((s) => [s.uid, s]))
      const bByUid = new Map([...B.values()].map((s) => [s.uid, s]))
      const uids = new Set([...aByUid.keys(), ...bByUid.keys()])
      const items = []
      const now = new Map() // id -> interpolated shape, for attached line ends and shapes

      for (const uid of uids) {
        // A copy starts as its original, so it animates away from it
        const tw = meta.tweens.get(uid)
        const a = aByUid.get(uid) || (bByUid.has(uid) ? tw?.from : undefined)
        const b = bByUid.get(uid)
        const raw = clamp01(progress(uid))
        const t = ease(raw)
        let shape
        let v
        if (a && b) {
          shape = interpolate(a, b, t)
          if (!extra.forward) shape.flow = a.flow // flow switches to where we're going (A, going back)
          if (tw?.path) Object.assign(shape, tw.path.hops ? pointOnHops(tw.path.hops, raw) : pointOnPath(tw.path, t))
          v = { opacity: 1, scale: 1, draw: 1, dx: 0, dy: 0 }
          const swap = a.label !== b.label
          v.label = swap && t < 0.5 ? a.label : b.label
          v.labelOpacity = swap ? Math.abs(2 * t - 1) : 1
          // One-off effects, forwards only (going back doesn't replay them)
          const oneoff = extra.forward && tw?.effect
          if (oneoff === 'pulse') v.scale = 1 + 0.25 * Math.sin(Math.PI * raw)
          if (oneoff === 'shake') v.dx = 0.15 * CELL * Math.sin(8 * Math.PI * raw) * (1 - raw)
          // wobble: turns left and right twice, easing in and out
          if (oneoff === 'wobble') v.rot = 14 * Math.sin(4 * Math.PI * raw) * Math.sin(Math.PI * raw)
          // bounce: three hops up, like a dropped ball, each lower than the last
          if (oneoff === 'bounce') v.dy = -0.6 * CELL * Math.abs(Math.sin(3 * Math.PI * raw)) * Math.pow(1 - raw, 1.5)
          // glow: brightens and glows, then fades back
          if (oneoff === 'glow') v.glow = Math.sin(Math.PI * raw)
        } else if (b) {
          shape = b
          v = appear(tw?.enter || 'fade', t, b)
        } else {
          shape = a
          v = appear(tw?.exit || 'fade', 1 - t, a)
        }
        v.label ??= shape.label
        v.labelOpacity ??= 1
        const node = nodes.get(uid) || makeNode(shape)
        items.push({ uid, shape, v, node, a, b, t })
        if (!LINE_TYPES.includes(shape.type) && (!now.has(shape.id) || b)) now.set(shape.id, { ...shape, x: shape.x + v.dx, y: shape.y + v.dy })
      }

      // Attached shapes and group members follow their ref's current (interpolated) place, so they
      // stay together along curves and routes. A shape whose attachment changes this beat keeps its
      // own interpolated path; a group member moved within its group glides to its new offset.
      const byItem = new Map(items.map((item) => [item.shape.id, item]))
      resolveAttachments(now, (shape) => {
        const item = byItem.get(shape.id)
        const spec = item && !LINE_TYPES.includes(item.shape.type) && (item.b || item.a).attach
        if (!spec) return null
        const before = item.a?.attach
        if (item.a && item.b && !(before && before.ref === spec.ref && before.side === spec.side)) return null
        if (spec.dx === undefined || before?.dx === undefined) return spec
        return { ...spec, dx: lerp(before.dx, spec.dx, item.t), dy: lerp(before.dy, spec.dy, item.t) }
      }, (shape, p) => {
        const item = byItem.get(shape.id)
        item.shape = { ...item.shape, x: p.x, y: p.y }
        Object.assign(shape, { x: p.x + item.v.dx, y: p.y + item.v.dy }) // `now` keeps the drawn place
      })

      // Lines whose ends move between A and B (or swap between a shape and a point) blend the two.
      for (const item of items) {
        if (!LINE_TYPES.includes(item.shape.type) || !item.a || !item.b) continue
        const ea = resolveEnds(item.a, now)
        const eb = resolveEnds(item.b, now)
        item.v.ends = {
          from: { x: lerp(ea.from.x, eb.from.x, item.t), y: lerp(ea.from.y, eb.from.y, item.t) },
          to: { x: lerp(ea.to.x, eb.to.x, item.t), y: lerp(ea.to.y, eb.to.y, item.t) },
        }
      }
      for (const [uid, node] of nodes) {
        if (!uids.has(uid)) {
          for (const el of [node.g, node.box, node.pointer, node.badge, node.bubble]) el?.remove()
          nodes.delete(uid)
        }
      }

      // Spotlight: shapes outside it fade to DIM over the beat
      const litA = litFor(A)
      const litB = litFor(B)
      for (const item of items) {
        const dimA = litA && !litA.has(item.shape.id) ? 1 : 0
        const dimB = litB && !litB.has(item.shape.id) ? 1 : 0
        const dim = lerp(dimA, dimB, extra.beatT)
        item.dimK = 1 - (1 - DIM) * dim // its highlights and callout dim with it
        item.v.opacity *= item.dimK
      }

      const finalByUid = new Map([...final.values()].map((s) => [s.uid, s]))
      order(items.map(({ node, shape, uid }) => ({ node, shape: finalByUid.get(uid) || shape })))

      for (const item of items) {
        // colours: blended from A's to B's over the shape's progress (entering / leaving: their own)
        const from = item.a || item.b
        const to = item.b || item.a
        const t = item.a && item.b ? item.t : 1
        const colours = {
          fill: mixColour(rgba(colourCss(from.fill, 'fill')), rgba(colourCss(to.fill, 'fill')), t),
          stroke: mixColour(rgba(colourCss(from.stroke, 'stroke')), rgba(colourCss(to.stroke, 'stroke')), t),
          colour: mixColour(rgba(colourCss(from.colour, 'stroke')), rgba(colourCss(to.colour, 'stroke')), t),
        }
        item.v.hlGlow = blend(item, (s) => s.hl?.glow) // highlight glow fades in / out like the box
        drawNode(item.node, item.shape, item.v, colours, now)
        drawOverlays(item, now)
      }
    }

    // How much of a two-state feature shows: from A's value to B's over the shape's progress,
    // times the shape's own visibility (entering / leaving).
    const blend = (item, has) => lerp(item.a && has(item.a) ? 1 : 0, item.b && has(item.b) ? 1 : 0, item.a && item.b ? item.t : 1) * (item.a && item.b ? 1 : item.v.opacity)

    // The highlight box, arrow and number badge, and the callout bubble, drawn above everything
    // in world space.
    function drawOverlays(item, now) {
      const node = item.node
      // Each fades in / out with its feature, and dims with a shape outside the spotlight
      const k = item.dimK
      const boxOpacity = blend(item, (s) => s.hl?.box) * k
      const arrowOpacity = blend(item, (s) => s.hl?.arrow) * k
      const badgeOpacity = blend(item, (s) => s.hl?.number != null) * k
      const bubbleOpacity = blend(item, (s) => s.callout) * k
      if (!boxOpacity && !node.box && !arrowOpacity && !node.pointer && !badgeOpacity && !node.badge && !bubbleOpacity && !node.bubble) return
      const b = bounds(item.shape, now, { ends: item.v.ends, dx: item.v.dx, dy: item.v.dy })
      const pad = 0.15 * CELL

      if (boxOpacity || node.box) {
        if (!node.box) node.box = highlightLayer.appendChild(svgEl('rect', { class: 'anim-highlight-box' }))
        Object.entries({ x: b.x0 - pad, y: b.y0 - pad, width: b.x1 - b.x0 + 2 * pad, height: b.y1 - b.y0 + 2 * pad, rx: 0.12 * CELL })
          .forEach(([k, val]) => attr(node.box, k, val))
        node.box.style.opacity = boxOpacity
        if (!boxOpacity) { node.box.remove(); node.box = null }
      }

      // arrow: a block arrow pointing in at the top-right corner, sliding in as it fades in
      if (arrowOpacity || node.pointer) {
        if (!node.pointer) {
          node.pointer = highlightLayer.appendChild(svgEl('polygon', { class: 'anim-highlight-arrow', 'stroke-linejoin': 'round' }))
          // pointing along +x with its tip at 0,0 (rotated to point down-left below)
          const L = 0.9 * CELL, H = 0.50 * CELL, HW = 0.33 * CELL, SW = 0.17 * CELL
          attr(node.pointer, 'points', `0,0 ${-H},${-HW} ${-H},${-SW} ${-L},${-SW} ${-L},${SW} ${-H},${SW} ${-H},${HW}`)
        }
        const back = (1 - arrowOpacity / k) * 0.4 * CELL // slides by its fade, not the dimming
        const tip = { x: b.x1 - 0.75 * pad + back, y: b.y0 + 0.75 * pad - back }
        attr(node.pointer, 'transform', `translate(${tip.x} ${tip.y}) rotate(135)`)
        node.pointer.style.opacity = arrowOpacity
        if (!arrowOpacity) { node.pointer.remove(); node.pointer = null }
      }

      // number N: a numbered disc on the top-left corner, popping in
      if (badgeOpacity || node.badge) {
        // The number being shown: B's, or A's while A's fades out
        const n = (item.b?.hl?.number != null && (item.t >= 0.5 || item.a?.hl?.number == null)) ? item.b.hl.number : (item.a?.hl?.number ?? item.b?.hl?.number)
        if (!node.badge) {
          node.badge = highlightLayer.appendChild(svgEl('g', { class: 'anim-highlight-number' }))
          node.badge.appendChild(svgEl('circle', { r: 0.28 * CELL }))
          node.badgeText = node.badge.appendChild(svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }))
        }
        const label = n == null ? '' : String(n)
        if (node.badgeText.textContent !== label) node.badgeText.textContent = label
        const badgeFont = FONT * (label.length > 2 ? 0.62 : 0.88)
        node.badgeText.style.fontSize = `${badgeFont}px`
        attr(node.badgeText, 'y', -0.07 * badgeFont) // digits have no descenders, so "central" sits them low
        attr(node.badge, 'transform', `translate(${b.x0} ${b.y0}) scale(${Math.max(0.001, 0.6 + 0.4 * badgeOpacity / k)})`)
        node.badge.style.opacity = badgeOpacity
        if (!badgeOpacity) { node.badge.remove(); node.badge = null }
      }

      if (bubbleOpacity || node.bubble) {
        // The text being shown: B's, or A's while A's callout fades out
        const callout = (item.b?.callout && (item.t >= 0.5 || !item.a?.callout)) ? item.b.callout : (item.a?.callout || item.b?.callout)
        if (!node.bubble) {
          node.bubble = calloutLayer.appendChild(svgEl('g', { class: 'anim-callout' }))
          node.bubblePath = node.bubble.appendChild(svgEl('path'))
          node.bubbleText = node.bubble.appendChild(svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }))
          node.bubbleKey = null // the text's lines are (re)built on first draw
        }
        if (callout) drawBubble(node, callout, b)
        node.bubble.style.opacity = bubbleOpacity
        if (!bubbleOpacity) { node.bubble.remove(); node.bubble = null }
      }
    }

    // A speech bubble beside bounds `b`, with a tail pointing at it.
    function drawBubble(node, callout, b) {
      const size = FONT * 0.75
      const lineH = size * 1.25
      const lines = wrapText(callout.text, size, CALLOUT_CH * textWidth('0', size))
      const w = Math.max(CELL, ...lines.map((line) => textWidth(line, size))) + size * 1.4
      const h = lines.length * lineH + size * 0.75
      const tail = 0.3 * CELL
      const cx0 = (b.x0 + b.x1) / 2
      const cy0 = (b.y0 + b.y1) / 2
      let cx = cx0, cy = cy0, tip
      if (callout.side === 'below') { tip = { x: cx0, y: b.y1 + 4 }; cy = b.y1 + tail + h / 2 }
      else if (callout.side === 'left') { tip = { x: b.x0 - 4, y: cy0 }; cx = b.x0 - tail - w / 2 }
      else if (callout.side === 'right') { tip = { x: b.x1 + 4, y: cy0 }; cx = b.x1 + tail + w / 2 }
      else { tip = { x: cx0, y: b.y0 - 4 }; cy = b.y0 - tail - h / 2 }
      // Keep the bubble inside the drawing (the tail still points at the shape)
      const m = 4
      cx = Math.min(viewBox.x + viewBox.w - w / 2 - m, Math.max(viewBox.x + w / 2 + m, cx))
      cy = Math.min(viewBox.y + viewBox.h - h / 2 - m, Math.max(viewBox.y + h / 2 + m, cy))
      attr(node.bubblePath, 'd', bubblePath(cx, cy, w, h, Math.min(10, h / 3), callout.side, tip))
      node.bubbleText.style.fontSize = `${size}px`
      if (node.bubbleKey !== callout.text) {
        node.bubbleKey = callout.text
        node.bubbleText.replaceChildren(...lines.map((line) => {
          const span = svgEl('tspan')
          span.textContent = line
          return span
        }))
      }
      ;[...node.bubbleText.children].forEach((span, i) => {
        attr(span, 'x', cx)
        attr(span, 'y', cy + (i - (lines.length - 1) / 2) * lineH)
      })
    }

    // Splits text into lines no wider than maxW at spaces (a single long word gets a line of its own).
    function wrapText(text, size, maxW) {
      const lines = []
      let line = ''
      for (const word of text.split(/\s+/).filter(Boolean)) {
        const next = line ? `${line} ${word}` : word
        if (line && textWidth(next, size) > maxW) { lines.push(line); line = word }
        else line = next
      }
      if (line || !lines.length) lines.push(line)
      return lines
    }

    // A rounded rectangle with a tail on the side facing the shape.
    function bubblePath(cx, cy, w, h, r, side, tip) {
      const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2
      const half = Math.min(10, w / 4, h / 3)
      const tx = Math.min(x1 - r - half, Math.max(x0 + r + half, tip.x))
      const ty = Math.min(y1 - r - half, Math.max(y0 + r + half, tip.y))
      let d = `M ${x0 + r} ${y0}`
      if (side === 'below') d += ` L ${tx - half} ${y0} L ${tip.x} ${tip.y} L ${tx + half} ${y0}`
      d += ` L ${x1 - r} ${y0} Q ${x1} ${y0} ${x1} ${y0 + r}`
      if (side === 'left') d += ` L ${x1} ${ty - half} L ${tip.x} ${tip.y} L ${x1} ${ty + half}`
      d += ` L ${x1} ${y1 - r} Q ${x1} ${y1} ${x1 - r} ${y1}`
      if (side === 'above') d += ` L ${tx + half} ${y1} L ${tip.x} ${tip.y} L ${tx - half} ${y1}`
      d += ` L ${x0 + r} ${y1} Q ${x0} ${y1} ${x0} ${y1 - r}`
      if (side === 'right') d += ` L ${x0} ${ty + half} L ${tip.x} ${tip.y} L ${x0} ${ty - half}`
      return `${d} L ${x0} ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} Z`
    }

    return { render, clearColours: () => colourCache.clear() }
  }

  function drawDebugGrid(svg, vb) {
    const g = svg.appendChild(svgEl('g', { class: 'anim-debug-grid' }))
    const c0 = Math.floor(vb.x / CELL)
    const c1 = Math.ceil((vb.x + vb.w) / CELL)
    const r0 = Math.floor(vb.y / CELL)
    const r1 = Math.ceil((vb.y + vb.h) / CELL)
    for (let c = c0; c <= c1; c++) g.appendChild(svgEl('line', { x1: c * CELL, y1: vb.y, x2: c * CELL, y2: vb.y + vb.h }))
    for (let r = r0; r <= r1; r++) g.appendChild(svgEl('line', { x1: vb.x, y1: r * CELL, x2: vb.x + vb.w, y2: r * CELL }))
    for (let c = c0; c < c1; c++) {
      const label = g.appendChild(svgEl('text', { x: (c + 0.5) * CELL, y: vb.y + 14, 'text-anchor': 'middle' }))
      label.textContent = c + 1
    }
    for (let r = r0; r < r1; r++) {
      const label = g.appendChild(svgEl('text', { x: vb.x + 6, y: (r + 0.5) * CELL, 'dominant-baseline': 'central' }))
      label.textContent = r + 1
    }
  }

  Object.assign(window.Anim, { createRenderer })
})()
