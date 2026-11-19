/**
 * anim-render.js - Part of the animation plugin (animation.js): drawing a beat, or a blend
 * between two beats, into the SVG (shapes, labels, lines, highlights, callouts, flows).
 */

;(function () {
  const { PARTS, HEX, COLOURS, FILL_MIXES, towardsBg, svgEl, LINE_TYPES, lucideIcon, lerp, STROKE,
    PATTERNS, reducedMotion, FLOW_SPEED, FONT, resolveEnds, HEAD, clamp01, boxCentre, extents, LAYERS,
    bounds, CELL, easeFn, pointOnHops, pointOnPath, resolveAttachments, textWidth, CALLOUT_CH,
    linePoints, MONO_FONT, measure, mergeBoxes, pointAt, CHOREOGRAPHY, LERPED, SHAPES, kindOf, APPLIES,
    entranceFor, XML_NS, LAYOUTS, LOOKS, barFits, isGroup } = window.Anim

  // Text centred in a shape (or a number badge) is lifted by this share of its font size: the
  // "central" baseline sits it a little low
  const LABEL_LIFT = 0.07
  // A label at the top of its box (label place 'top') is centred this share of its font size below
  // the box's top edge; one at its right (label place 'right') ends this share in from its right edge
  const TOP_PAD = 0.75
  const RIGHT_PAD = 0.3

  // An arrowhead's strength (0-1): arrows have one, and lines or curves given "arrow"
  const headOf = (shape) => (SHAPES[shape.type]?.head || shape.head ? 1 : 0)

  // A var's or cell's bar (LOOKS: bar, BARS): whether it shows one (a kind that fits its outline),
  // and the share of it its value fills (held to 0-1; a value that isn't a number fills none), or 1,
  // all of it, when it has no bar, so turning one on or off blends.
  const hasBar = (shape) => Boolean(shape?.bar && shape.holds && barFits(shape.bar, shape))
  function barShare(shape, label = shape.label, nil = shape.nil) {
    if (!hasBar(shape)) return 1
    const max = shape.max ?? LOOKS.max.default
    const value = nil ? NaN : parseFloat(label)
    return max > 0 && Number.isFinite(value) ? clamp01(value / max) : 0
  }
  // The kind of bar drawn for a blend of two shapes: the one it's going to, or the one it had
  const barKindOf = (...shapes) => shapes.find(hasBar)?.bar

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
  // directly; anything else (a hex colour, the theme's oklch palette, lab, …) is converted by
  // painting one pixel on a canvas and reading it back as sRGB.
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
    const key = name.toLowerCase()
    const css = COLOURS[key] ?? 'none'
    if (role === 'fill' && FILL_MIXES[key]) return towardsBg(css, FILL_MIXES[key])
    return css
  }

  // Colours are blended in JavaScript every frame, like positions: each CSS colour (theme
  // variables, color-mix tints) is resolved to RGBA through hidden probes in an animation's SVG
  // (where its variables are set) and cached for every animation on the page. Reading a computed
  // style restyles the whole page, which the site's :has() selectors make slow, so the first lookup
  // resolves every named colour at once (all probes set, then all read: one restyle). The cache is
  // cleared when the theme changes.
  const colourCache = new Map()
  const namedColours = () => Object.keys(COLOURS).flatMap((name) => [colourCss(name, 'fill'), colourCss(name, 'stroke')])
  function resolveColours(host, list) {
    const probes = [...new Set(list)].map((css) => {
      const probe = host.appendChild(svgEl('rect', { width: 0, height: 0 }))
      probe.style.display = 'none'
      probe.style.fill = css
      return [css, probe]
    })
    for (const [css, probe] of probes) colourCache.set(css, parseColour(getComputedStyle(probe).fill))
    for (const [, probe] of probes) probe.remove()
  }
  let warmed = false // whether every named colour is in the cache
  function rgbaOf(host, css) {
    if (!css || css === 'none') return null
    if (!colourCache.has(css)) {
      if (HEX.test(css)) colourCache.set(css, parseColour(css)) // read directly: no restyle
      else {
        resolveColours(host, warmed ? [css] : [...namedColours().filter((c) => c !== 'none' && !HEX.test(c)), css])
        warmed = true
      }
    }
    return colourCache.get(css)
  }
  // before any animation redraws for the new theme (each one's listener is added later)
  window.addEventListener?.('docsify-theme-change', () => { colourCache.clear(); warmed = false })

  function createRenderer(svg, viewBox, debug) {
    const layers = [0, 1, 2].map(() => svg.appendChild(svgEl('g')))
    const panelLayer = svg.insertBefore(svgEl('g', { class: 'anim-panels' }), layers[0]) // under every shape
    const slotLayer = svg.insertBefore(svgEl('g', { class: 'anim-slots' }), layers[1]) // under the cells
    const slotNodes = new Map() // slot uid -> rect
    const highlightLayer = svg.appendChild(svgEl('g', { class: 'anim-highlights' }))
    const calloutLayer = svg.appendChild(svgEl('g', { class: 'anim-callouts' }))
    const nodes = new Map() // uid -> node

    if (debug) drawDebugGrid(svg, viewBox)

    function makeNode(shape) {
      const g = svgEl('g', { class: `anim-shape anim-${shape.type}` })
      const node = { g, type: shape.type, uid: shape.uid }
      if (LINE_TYPES.includes(shape.type)) {
        // one path for lines, arrows and curves; every line has a head, hidden unless it has one
        node.body = g.appendChild(svgEl('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }))
        node.head = g.appendChild(svgEl('polygon', { 'stroke-linejoin': 'round' }))
      }
      BODIES[shape.type]?.make(node, shape)
      node.label = g.appendChild(svgEl('text', { class: 'anim-label', 'dominant-baseline': 'central' }))
      if (kindOf(shape).pre) node.label.setAttributeNS(XML_NS, 'xml:space', 'preserve') // keeps a code line's indent
      if (kindOf(shape).resource) node.title = g.appendChild(svgEl('title')) // an image's / icon's alt text
      if (debug) node.debugId = g.appendChild(svgEl('text', { class: 'anim-debug-id' }))
      nodes.set(shape.uid, node)
      return node
    }

    const rgba = (css) => rgbaOf(svg, css)
    // A colour part-way from a to b (either may be null = none: it fades in or out)
    function mixColour(a, b, t) {
      if (!a && !b) return 'none'
      const from = a || [...b.slice(0, 3), 0]
      const to = b || [...a.slice(0, 3), 0]
      const [r, g, bl, al] = from.map((v, i) => lerp(v, to[i], t))
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(bl)}, ${al.toFixed(3)})`
    }
    const paint = (el, prop, value) => { if (el.style[prop] !== value) el.style[prop] = value }

    // How each boxed shape type is drawn (lines: in drawNode). make adds its elements to the node
    // (node.body, when it has one, takes the stroke, and the fill if its type takes fill); size
    // sets them to the shape's half-sizes each frame. edge: false, its stroke is its drawing, not an
    // edge round it (an icon), so an inside highlight needn't clear it.
    const setBox = (el, hw, hh) => { attr(el, 'x', -hw); attr(el, 'y', -hh); attr(el, 'width', 2 * hw); attr(el, 'height', 2 * hh) }
    const rectBody = {
      make: (node) => { node.body = node.g.appendChild(svgEl('rect')) },
      size: (node, s, hw, hh) => {
        setBox(node.body, hw, hh)
        const corner = Math.max(0, Math.min(s.corner || 0, hw, hh))
        attr(node.body, 'rx', corner); attr(node.body, 'ry', corner)
      },
    }
    const BODIES = {
      rect: rectBody,
      codeline: rectBody, // a code line's box, which a fill shows as a band
      span: rectBody, // a box round a row's places, which a fill or stroke shows
      circle: {
        make: (node) => { node.body = node.g.appendChild(svgEl('circle')) },
        size: (node, s) => attr(node.body, 'r', s.r),
      },
      diamond: {
        make: (node) => { node.body = node.g.appendChild(svgEl('polygon', { 'stroke-linejoin': 'round' })) },
        size: (node, s, hw, hh) => attr(node.body, 'points', `0,${-hh} ${hw},0 0,${hh} ${-hw},0`),
      },
      text: { make: () => {}, size: () => {} },
      image: {
        make: (node, shape) => {
          node.image = node.g.appendChild(svgEl('image', { href: shape.src, preserveAspectRatio: 'xMidYMid meet' }))
          node.body = node.g.appendChild(svgEl('rect', { fill: 'none' }))
        },
        size: (node, s, hw, hh) => { setBox(node.image, hw, hh); setBox(node.body, hw, hh) },
      },
      icon: {
        make: (node, shape) => {
          node.icon = window.lucide.createElement(lucideIcon(shape.icon))
          attr(node.icon, 'class', 'no-zoom') // the zoom plugin also attaches to nested SVGs
          node.g.appendChild(node.icon)
        },
        size: (node, s, hw, hh, colours) => {
          setBox(node.icon, hw, hh)
          attr(node.icon, 'stroke-width', 2 * s.weight)
          paint(node.icon, 'stroke', colours.stroke)
        },
        edge: false,
      },
    }

    // A code line's text, highlighted by Prism (lang: Prism's name for the language) as nested
    // tspans with Prism's token classes, which the site's code.css colours (animation.css makes
    // them fill with that colour). While typing, the characters from `cut` on are hidden (erasing:
    // those before it); with no cut, all show.
    function codeSpans(text, lang, cut, erase) {
      const grammar = lang && window.Prism?.languages?.[lang]
      const stream = grammar ? window.Prism.tokenize(text, grammar) : [text]
      const top = []
      let at = 0 // characters so far
      const add = (parent, child) => (parent ? parent.appendChild(child) : top.push(child))
      const build = (item, parent) => {
        if (Array.isArray(item)) return item.forEach((part) => build(part, parent))
        if (typeof item !== 'string') {
          const classes = ['token', item.type, ...[].concat(item.alias || [])]
          const span = svgEl('tspan', { class: classes.join(' ') })
          add(parent, span)
          return build(item.content, span)
        }
        const chars = [...item]
        const start = at
        at += chars.length
        if (cut === undefined) return add(parent, document.createTextNode(item))
        const k = Math.max(0, Math.min(chars.length, cut - start))
        ;[[chars.slice(0, k), !erase], [chars.slice(k), erase]].forEach(([part, shown]) => {
          if (!part.length) return
          const span = svgEl('tspan', shown ? {} : { visibility: 'hidden' })
          span.textContent = part.join('')
          add(parent, span)
        })
      }
      build(stream, null)
      return top
    }

    // A shape's text. While it's being typed (typed: 0-1, the share of characters shown) the rest
    // is laid out but hidden, so the text doesn't shift as it grows, whatever its alignment.
    // Erasing (deleted), it's untyped from the start: the first characters go first.
    function setLabel(node, text, typed, erase, lang) {
      const chars = [...(text || '')]
      const shown = typed === undefined ? -1 : Math.round(chars.length * clamp01(typed))
      const key = `${shown}|${erase}|${lang}|${text}`
      if (node.labelKey === key) return
      node.labelKey = key
      const cut = erase ? chars.length - shown : shown
      if (kindOf(node).pre) { node.label.replaceChildren(...codeSpans(text || '', lang, shown < 0 ? undefined : cut, erase)); return }
      if (shown < 0) { node.label.textContent = text; return }
      const before = svgEl('tspan', erase ? { visibility: 'hidden' } : {})
      const after = svgEl('tspan', erase ? {} : { visibility: 'hidden' })
      before.textContent = chars.slice(0, cut).join('')
      after.textContent = chars.slice(cut).join('')
      node.label.replaceChildren(before, after)
    }

    // Draws one shape: `s` is its (interpolated) geometry, `v` its visibility and effect values.
    function drawNode(node, s, v, colours, byId) {
      const { g } = node
      if (isGroup(node)) {
        // A group is invisible (its highlight box is drawn in drawOverlays), but a layout with a
        // panel (LAYOUTS: a code block) has a background behind its box, which takes in its indices
        const panel = LAYOUTS[s.layout]?.panel
        if (panel) {
          node.panel ||= panelLayer.appendChild(svgEl('rect', { class: 'anim-panel' }))
          const c = boxCentre(s)
          const pad = panel.pad * CELL
          attr(node.panel, 'x', c.x - s.w / 2 - pad); attr(node.panel, 'y', c.y - s.h / 2 - pad)
          attr(node.panel, 'width', Math.max(0, s.w + 2 * pad)); attr(node.panel, 'height', Math.max(0, s.h + 2 * pad))
          attr(node.panel, 'rx', panel.corner * CELL)
          node.panel.style.opacity = v.opacity
        }
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
        for (const name of ['x', 'y', 'width', 'height', 'rx', 'ry', 'r', 'd', 'points']) {
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
      const glowColour = kindOf(s).label === 'content' ? colours.colour : colours.stroke // text glows its own colour
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
      paint(node.label, 'fontFamily', s.mono ? MONO_FONT : '')
      paint(node.label, 'fontStyle', (v.nil ?? s.nil) ? 'italic' : '') // a null value
      node.label.style.opacity = v.labelOpacity
      paint(node.label, 'fill', colours.colour) // a text shape's colour, or any shape's label
      if (kindOf(node).pre) paint(node.label, 'color', colours.colour) // for tokens code.css doesn't colour
      setLabel(node, v.label, v.typed, v.erase, s.lang)

      if (LINE_TYPES.includes(node.type)) {
        const ends = v.ends || resolveEnds(s, byId)
        // dashBase: a line from a shape starts its pattern at the shape's centre, not its edge, so
        // the dashes stay put while the edge point slides round the shape as the other end moves
        const fromShape = s.from?.ref && byId.get(s.from.ref)
        const dashBase = fromShape ? Math.hypot(ends.from.x - boxCentre(fromShape).x, ends.from.y - boxCentre(fromShape).y) : 0
        // The points it's drawn through (a curve's smooth path), with the distance along to each
        const path = measure(linePoints(ends).map((p) => ({ x: p.x + v.dx, y: p.y + v.dy })))
        const total = path[path.length - 1].at
        const at = (d) => pointAt(path, d)
        const pathTo = (d) => [...path.filter((p) => p.at < d), at(d)]

        // The head (fading in or out as it's added or taken off) sits on the end, or on the tip
        // while drawing in; the stroke stops at its back. Erasing, it stays on the end.
        let bodyLen = total
        if (v.head) {
          const head = Math.min(HEAD * (0.6 + 0.4 * s.weight), total * 0.6)
          const reach = v.erase ? total : total * v.draw
          const tip = at(reach)
          const behind = at(Math.max(0, reach - head))
          const dl = Math.hypot(tip.x - behind.x, tip.y - behind.y)
          const last = path[path.length - 2] || path[0]
          const [ux, uy] = dl > 1e-6 ? [(tip.x - behind.x) / dl, (tip.y - behind.y) / dl] : [Math.sign(tip.x - last.x), Math.sign(tip.y - last.y)]
          const base = { x: tip.x - ux * head, y: tip.y - uy * head }
          const half = head * 0.55
          attr(node.head, 'points', `${tip.x},${tip.y} ${base.x - uy * half},${base.y + ux * half} ${base.x + uy * half},${base.y - ux * half}`)
          node.head.style.strokeWidth = strokeWidth
          paint(node.head, 'fill', colours.stroke)
          paint(node.head, 'stroke', colours.stroke)
          bodyLen = total - head * v.head
        }
        node.head.style.opacity = v.head ? clamp01(v.draw * 4 - 0.2) * v.head : 0
        attr(node.body, 'd', `M ${pathTo(bodyLen).map((p) => `${p.x} ${p.y}`).join(' L ')}`)
        node.body.style.strokeWidth = strokeWidth
        if (v.draw < 1) {
          setFlow(node.body) // off while drawing in
          syncGhost(node.body)
          attr(node.body, 'pathLength', '1')
          node.body.style.strokeDasharray = '1 1'
          // the drawn part: from the start to `draw` along, or (erasing) from `1 - draw` to the end
          node.body.style.strokeDashoffset = String(v.erase ? 1 + v.draw : 1 - v.draw)
        } else {
          attr(node.body, 'pathLength', null)
          node.body.style.strokeDasharray = dash
          node.body.style.strokeLinecap = cap
          setFlow(node.body, pattern, dashBase)
          syncGhost(node.body, dashBase)
        }
        paint(node.body, 'stroke', colours.stroke)
        drawSignal(node, v.signal, path, strokeWidth)
        const { x: mx, y: my } = at(total / 2) // the label sits halfway along
        attr(node.label, 'x', mx); attr(node.label, 'y', my)
        attr(node.label, 'text-anchor', 'middle')
        node.label.classList.add('anim-halo')
        attr(g, 'transform', v.scale === 1 && !v.rot ? '' : `translate(${mx} ${my}) rotate(${v.rot || 0}) scale(${v.scale}) translate(${-mx} ${-my})`)
        if (node.debugId) { attr(node.debugId, 'x', path[0].x); attr(node.debugId, 'y', path[0].y); node.debugId.textContent = s.id }
        return
      }

      const c = boxCentre(s)
      attr(g, 'transform', `translate(${c.x + v.dx} ${c.y + v.dy}) rotate(${s.angle + (v.rot || 0)}) scale(${v.scale * s.scale})`)
      const { hw, hh } = extents(s)

      BODIES[node.type].size(node, s, hw, hh, colours)
      // highlight line: a band behind the text (SHAPES: band), fading in and out with it
      const band = kindOf(node).band
      if (band && (v.hlLine || node.band)) {
        node.band ||= g.insertBefore(svgEl('rect', { class: 'anim-highlight-line' }), node.label)
        setBox(node.band, hw + band.pad * fontSize, hh)
        const corner = band.corner === null ? Math.min(s.corner || 0, hw, hh) : band.corner * fontSize
        attr(node.band, 'rx', corner); attr(node.band, 'ry', corner)
        node.band.style.opacity = v.hlLine
      }
      if (node.body) {
        const bar = v.bar !== undefined
        if (APPLIES.fill.includes(node.type)) paint(node.body, 'fill', bar ? 'none' : colours.fill)
        drawBars(node, s, v, hw, hh, colours)
        paint(node.body, 'stroke', s.weight ? colours.stroke : 'none')
        node.body.style.strokeWidth = strokeWidth
        node.body.style.strokeDasharray = dash
        node.body.style.strokeLinecap = cap
        setFlow(node.body)
        syncGhost(node.body)
      }
      if (node.title && node.title.textContent !== s.label) node.title.textContent = s.label

      // Label: where its type puts it (SHAPES): in the middle, below, or (text) the shape itself; or
      // where its bar puts it (BAR_DRAWS: label)
      const label = node.label
      const place = (v.barKind && BAR_DRAWS[v.barKind].label?.(s, hw, hh)) || kindOf(s).label
      attr(label, 'x', 0)
      attr(label, 'text-anchor', 'middle')
      if (place === 'content') {
        const anchor = s.align === 'left' ? 'start' : s.align === 'right' ? 'end' : 'middle'
        attr(label, 'text-anchor', anchor)
        attr(label, 'x', anchor === 'start' ? -hw : anchor === 'end' ? hw : 0)
        attr(label, 'y', 0)
      } else if (place === 'code') {
        attr(label, 'text-anchor', 'start')
        attr(label, 'x', -hw + kindOf(s).pre.pad * fontSize)
        attr(label, 'y', -LABEL_LIFT * fontSize)
      } else if (place === 'below') {
        attr(label, 'y', hh + fontSize * 0.75)
      } else if (place === 'top') {
        // inside the top of the box, or in the middle of one too short for that
        attr(label, 'y', Math.min(-hh + TOP_PAD * fontSize, 0) - LABEL_LIFT * fontSize)
      } else if (place === 'right') {
        attr(label, 'text-anchor', 'end')
        attr(label, 'x', hw - RIGHT_PAD * fontSize)
        attr(label, 'y', -LABEL_LIFT * fontSize)
      } else {
        attr(label, 'y', -LABEL_LIFT * fontSize) // "central" sits text a little low in a shape
      }
      if (node.debugId) { attr(node.debugId, 'x', -hw); attr(node.debugId, 'y', -hh - 4); node.debugId.textContent = s.id }
    }

    // How each kind of bar (BARS in anim-core.js) is drawn, in place of the shape's fill: over its
    // track and under its edge. make(node) adds its parts under the shape's body and returns them;
    // draw(parts, s, share, hw, hh, colours) sets them each frame, share (0-1) being how full it is,
    // colours.fill its fill tinted as a fill, colours.raw the same as it is (like a stroke), and
    // colours.track the rest's (tinted). label(s, hw, hh), if given, is where the
    // value goes (a label place: SHAPES), in place of the shape's own.
    const under = (node, tag) => node.g.insertBefore(svgEl(tag, { stroke: 'none' }), node.body)
    const tall = (hw, hh) => hh > hw // a linear bar fills up, rather than across
    const hasTrack = (s) => colourCss(s.track) !== 'none'
    const BAR_DRAWS = {
      // the track and a full-size box cut down to the share (clip-path inset), so a rounded corner
      // stays rounded: up from the bottom of a box taller than it is wide, otherwise from the left.
      // Its value is in the middle of a track; with none, at the end it grows towards (the top, or
      // the right), as on a bar chart. The bar is its fill colour as it is (stronger than a tinted
      // fill), over the tinted track.
      linear: {
        make: (node) => [under(node, 'rect'), under(node, 'rect')],
        label: (s, hw, hh) => (hasTrack(s) ? 'centre' : tall(hw, hh) ? 'top' : 'right'),
        draw: ([track, fill], s, share, hw, hh, colours) => {
          const corner = Math.max(0, Math.min(s.corner || 0, hw, hh))
          for (const el of [track, fill]) { setBox(el, hw, hh); attr(el, 'rx', corner); attr(el, 'ry', corner) }
          paint(track, 'fill', colours.track)
          paint(fill, 'fill', colours.raw)
          const cut = `${(100 * (1 - share)).toFixed(2)}%`
          paint(fill, 'clipPath', tall(hw, hh) ? `inset(${cut} 0 0 0)` : `inset(0 ${cut} 0 0)`)
        },
      },
    }

    // A shape's bar (v.bar: how full, v.barKind: its kind), its parts made once per kind and hidden
    // while that kind isn't showing.
    function drawBars(node, s, v, hw, hh, colours) {
      for (const [kind, parts] of Object.entries(node.bars || {})) {
        if (kind !== v.barKind) parts.forEach((el) => paint(el, 'display', 'none'))
      }
      if (!v.barKind) return
      node.bars ||= {}
      const parts = (node.bars[v.barKind] ||= BAR_DRAWS[v.barKind].make(node))
      parts.forEach((el) => paint(el, 'display', ''))
      BAR_DRAWS[v.barKind].draw(parts, s, clamp01(v.bar), hw, hh, colours)
    }

    // signal: a glowing blip running along a line once (signal: { t: 0-1, reverse }), its tail
    // fading behind it. It runs on until the tail has gone past the end.
    const TAIL_PARTS = 5
    function drawSignal(node, signal, path, strokeWidth) {
      if (!signal) {
        if (node.blip) node.blip.style.display = 'none'
        return
      }
      if (!node.blip) {
        node.blip = node.g.appendChild(svgEl('g', { class: 'anim-signal' }))
        node.blipTail = Array.from({ length: TAIL_PARTS }, () => node.blip.appendChild(svgEl('path', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })))
        node.blipHead = node.blip.appendChild(svgEl('circle'))
      }
      node.blip.style.display = ''
      const total = path[path.length - 1].at
      const at = (d) => pointAt(path, d)
      const tail = Math.min(0.9 * CELL, total / 2)
      const d = clamp01(signal.t) * (total + tail) // how far the tip has gone
      // a stretch of the line between two distances from the start, flipped for signal-reverse
      const stretch = (d0, d1) => {
        let a = Math.max(0, d0)
        let b = Math.min(total, d1)
        if (signal.reverse) [a, b] = [total - b, total - a]
        if (b <= a) return ''
        return `M ${[at(a), ...path.filter((p) => p.at > a && p.at < b), at(b)].map((p) => `${p.x} ${p.y}`).join(' L ')}`
      }
      // the tail: overlapping pieces, so it's brightest at the tip
      node.blipTail.forEach((part, i) => {
        attr(part, 'd', stretch(d - (tail * (i + 1)) / TAIL_PARTS, d) || null)
        part.style.strokeWidth = Math.max(6, 2.2 * strokeWidth)
      })
      const tip = at(signal.reverse ? total - d : d)
      attr(node.blipHead, 'cx', tip.x); attr(node.blipHead, 'cy', tip.y)
      attr(node.blipHead, 'r', Math.max(10, 3.2 * strokeWidth))
      node.blipHead.style.opacity = d <= total ? 1 : 0
    }

    // Puts each node in its layer, in creation order, with any raised while it moves (a swap's
    // `raise`) on top of its layer.
    function order(list) {
      list.sort((a, b) => LAYERS[a.shape.layer] - LAYERS[b.shape.layer] || Boolean(a.raised) - Boolean(b.raised) || a.shape.uid - b.shape.uid)
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

    // Each entrance / exit (ENTRANCES in anim-core.js): how visible a shape is (v) as it appears
    // (t: 0 -> 1) or disappears (t: 1 -> 0); `raw` is the same without easing.
    const FRAMES = {
      fade: (v, t) => { v.opacity = t },
      pop: (v, t) => { v.scale = Math.max(0.001, t); v.opacity = clamp01(t * 3) },
      draw: (v, t) => { v.draw = t },
      // the shape fades in quickly and its text types out at an even pace, one character at a time
      // (and un-types on the way out)
      typed: (v, t, raw) => { v.opacity = clamp01(raw * 6); v.typed = raw },
      // in from (out to) the nearest edge of the view
      slide: (v, t, raw, shape) => {
        const off = offscreenOffset(shape)
        v.dx = off.dx * (1 - t); v.dy = off.dy * (1 - t)
      },
      appear: (v, t, raw) => { v.opacity = raw > 0 ? 1 : 0 }, // there as soon as it starts
      vanish: (v, t, raw) => { v.opacity = raw < 1 ? 0 : 1 }, // gone as soon as it starts
    }
    function appear(effect, t, shape, raw = t) {
      const v = { opacity: 1, scale: 1, draw: 1, dx: 0, dy: 0 }
      ;(FRAMES[entranceFor(effect, shape)] || FRAMES.fade)(v, t, raw, shape)
      return v
    }

    // Each one-off emphasis (EMPHASES in anim-core.js), over its time (raw: 0 -> 1, un-eased)
    const EMPHASIS_FRAMES = {
      pulse: (v, raw) => { v.scale = 1 + 0.25 * Math.sin(Math.PI * raw) },
      shake: (v, raw) => { v.dx = 0.15 * CELL * Math.sin(8 * Math.PI * raw) * (1 - raw) },
      // turns left and right twice, easing in and out
      wobble: (v, raw) => { v.rot = 14 * Math.sin(4 * Math.PI * raw) * Math.sin(Math.PI * raw) },
      // three hops up, like a dropped ball, each lower than the last
      bounce: (v, raw) => { v.dy = -0.6 * CELL * Math.abs(Math.sin(3 * Math.PI * raw)) * Math.pow(1 - raw, 1.5) },
      // brightens and glows, then fades back
      glow: (v, raw) => { v.glow = Math.sin(Math.PI * raw) },
      // a blip along the line at an even pace
      signal: (v, raw) => { v.signal = { t: raw, reverse: false } },
      'signal-reverse': (v, raw) => { v.signal = { t: raw, reverse: true } },
    }

    // A fitted box (SHAPES: fitted, and a fit layout's box, so a code block's panel) widens over the
    // first part of its change and its text changes after; or its text changes first and it narrows
    // after (CHOREOGRAPHY: fitSplit). So longer text never sticks out of it. fitPhase: the box's
    // progress; textPhase: the text's.
    const fitted = (s) => Boolean(kindOf(s).fitted || LAYOUTS[s.layout]?.fit)
    const split = CHOREOGRAPHY.fitSplit
    const first = (t) => clamp01(t / split)
    const second = (t) => clamp01((t - split) / (1 - split))
    const fitPhase = (a, b, t) => (b.w > a.w ? first(t) : b.w < a.w ? second(t) : t)
    const textPhase = (a, b, t) => (b.w > a.w ? second(t) : b.w < a.w ? first(t) : t)

    function interpolate(a, b, t) {
      const s = { ...b }
      // a layout with a panel (LAYOUTS) blends its box's offset too, so the panel follows its cells
      const keys = LAYOUTS[b.layout]?.panel ? [...LERPED, 'cx', 'cy'] : LERPED
      const across = fitted(b) ? fitPhase(a, b, t) : t
      for (const key of keys) {
        const k = key === 'w' || key === 'cx' ? across : t
        if (typeof a[key] === 'number' && typeof b[key] === 'number') s[key] = lerp(a[key], b[key], k)
      }
      // A line style change cross-fades from the old style to the new (see syncGhost)
      if (a.linestyle !== b.linestyle && t < 1) {
        s.fromStyle = a.linestyle
        s.styleT = t
      }
      return s
    }

    // Shapes lit by a spotlight in a state (by id): spotlit shapes, the members of spotlit groups, the
    // shapes a spotlit shape covers (a span's cells: covers), a layout with a panel that has a lit
    // cell, and lines whose ends are both on lit shapes. Null when nothing is spotlit.
    function litIds(state) {
      if (![...state.values()].some((s) => s.hl?.spotlight)) return null
      const lit = new Set()
      const isLit = (shape, depth = 0) => {
        if (!shape || depth > 8) return false
        if (shape.hl?.spotlight) return true
        if (shape.attach?.kind === 'offset') return isLit(state.get(shape.attach.ref), depth + 1) // a group member
        if (shape.part) return isLit(state.get(shape.part), depth + 1) // a name / index goes with its owner
        return false
      }
      for (const shape of state.values()) if (isLit(shape)) lit.add(shape.id)
      for (const shape of state.values()) if (shape.hl?.spotlight) shape.covers?.forEach((id) => lit.add(id))
      // a layout's panel (LAYOUTS: panel) is the background its cells belong on, so it stays lit
      // while any of them is (its other cells, and its name and indices, still dim)
      for (const shape of state.values()) {
        if (LAYOUTS[shape.layout]?.panel && shape.members.some((id) => lit.has(id))) lit.add(shape.id)
      }
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

    // The ids a glowing shape covers in a state (a span's cells: covers), worked out once per state
    const glowCache = new WeakMap()
    function glowFor(state) {
      if (!glowCache.has(state)) {
        glowCache.set(state, new Set([...state.values()].filter((s) => s.hl?.glow).flatMap((s) => s.covers || [])))
      }
      return glowCache.get(state)
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
      // Ids that pass from one shape to another (cells that swap, a shape replaced): what's
      // attached to them stays with the id's place rather than riding along with either shape.
      const passed = new Set([...B.keys()].filter((id) => A.has(id) && A.get(id).uid !== B.get(id).uid))

      for (const uid of uids) {
        // A copy starts as its original, so it animates away from it
        const tw = meta.tweens.get(uid)
        const a = aByUid.get(uid) || (bByUid.has(uid) ? tw?.from : undefined)
        const b = bByUid.get(uid)
        const raw = clamp01(progress(uid))
        const easing = easeFn(tw?.ease)
        const t = easing(raw) // spring goes past 1 and back
        let shape
        let v
        if (a && b) {
          shape = interpolate(a, b, t)
          if (!extra.forward) shape.flow = a.flow // flow switches to where we're going (A, going back)
          if (tw?.path) Object.assign(shape, tw.path.hops ? pointOnHops(tw.path.hops, raw, easing) : pointOnPath(tw.path, t))
          v = { opacity: 1, scale: 1, draw: 1, dx: 0, dy: 0 }
          const swap = a.label !== b.label
          // code text changes while its box is at its wider (see fitPhase)
          const u = kindOf(b).fitted ? textPhase(a, b, t) : t
          v.label = swap && u < 0.5 ? a.label : b.label
          v.nil = swap && u < 0.5 ? a.nil : b.nil
          v.labelOpacity = swap ? Math.abs(2 * u - 1) : 1
          // One-off effects, forwards only (going back doesn't replay them)
          if (extra.forward && tw?.effect) EMPHASIS_FRAMES[tw.effect](v, raw)
          // swap: the cell bows out to one side on its way to the other's place
          if (tw?.arc) {
            const k = Math.sin(Math.PI * clamp01(t))
            v.dx += tw.arc.x * k
            v.dy += tw.arc.y * k
          }
        } else if (b) {
          shape = b
          v = appear(tw?.enter || 'fade', t, b, raw)
          // a row's cell slides in from beside the row (insert)
          if (tw?.offset) { v.dx += tw.offset.x * (1 - t); v.dy += tw.offset.y * (1 - t) }
        } else {
          shape = a
          v = appear(tw?.exit || 'fade', 1 - t, a, 1 - raw)
          v.erase = true // a drawn line or typed text is erased from its start, not wound back from its end
          if (tw?.offset) { v.dx += tw.offset.x * t; v.dy += tw.offset.y * t } // and out (remove)
        }
        // a bar grows or shrinks to its new value (or turns on or off) with the change; a value that
        // lands from a flyer (tween: lands), which showed it on the way, is taken as it lands
        v.barKind = a && b ? barKindOf(b, a) : barKindOf(shape)
        if (v.barKind) v.bar = !(a && b) ? barShare(shape) : tw?.lands ? barShare(t < 0.5 ? a : b) : lerp(barShare(a), barShare(b), t)
        // an arrowhead fades in or out as it's added to or taken off a line
        v.head = a && b ? lerp(headOf(a), headOf(b), t) : headOf(shape)
        v.label ??= shape.label
        v.labelOpacity ??= 1
        const node = nodes.get(uid) || makeNode(shape)
        items.push({ uid, shape, v, node, a, b, t })
        if (!LINE_TYPES.includes(shape.type) && (!now.has(shape.id) || b)) now.set(shape.id, { ...shape, x: shape.x + v.dx, y: shape.y + v.dy })
      }

      // Attached shapes and group members follow their ref's current (interpolated) place, so they
      // stay together along curves and routes. A shape whose attachment changes this beat keeps its
      // own interpolated path; a group member moved within its group glides to its new offset.
      // An id held by a shape leaving and one arriving (a removed cell's place) is the arriving one's
      const byItem = new Map()
      for (const item of items) if (item.b || !byItem.has(item.shape.id)) byItem.set(item.shape.id, item)
      resolveAttachments(now, (shape) => {
        const item = byItem.get(shape.id)
        const spec = item && !LINE_TYPES.includes(item.shape.type) && (item.b || item.a).attach
        if (!spec || passed.has(spec.ref)) return null
        const before = item.a?.attach
        if (item.a && item.b && !(before && before.kind === spec.kind && before.ref === spec.ref && before.side === spec.side)) return null
        if (spec.kind !== 'offset' || before?.kind !== 'offset') return spec
        return { ...spec, dx: lerp(before.dx, spec.dx, item.t), dy: lerp(before.dy, spec.dy, item.t) }
      }, (shape, p) => {
        const item = byItem.get(shape.id)
        item.shape = { ...item.shape, x: p.x, y: p.y }
        Object.assign(shape, { x: p.x + item.v.dx, y: p.y + item.v.dy }) // `now` keeps the drawn place
      })

      // Lines whose ends move between A and B (or swap between a shape and a point) blend the two.
      // An end on an id that passes to another shape goes from its place in A to its place in B.
      const at = (state) => (passed.size ? { get: (id) => (passed.has(id) ? state.get(id) : now.get(id)) } : now)
      for (const item of items) {
        if (!LINE_TYPES.includes(item.shape.type) || !item.a || !item.b) continue
        const ea = resolveEnds(item.a, at(A))
        const eb = resolveEnds(item.b, at(B))
        const mix = (p, q) => ({ x: lerp(p.x, q.x, item.t), y: lerp(p.y, q.y, item.t) })
        // A curve's via points blend too, when it has the same number before and after; otherwise
        // the new ones are used throughout (straightening from or bending to them as the ends move)
        const vias = ea.vias.length === eb.vias.length ? eb.vias.map((q, i) => mix(ea.vias[i], q)) : eb.vias
        item.v.ends = { from: mix(ea.from, eb.from), to: mix(ea.to, eb.to), vias }
      }

      // Flyers: copies of a value gliding between vars and cells, drawn only while the beat plays.
      // Hop by hop through the first `move` of their time, their look blending from `from`'s to
      // `to`'s, then fading out (or, with move 1, gone as they arrive, where a cell takes over).
      for (const flyer of meta.flyers || []) {
        uids.add(flyer.uid)
        const easing = easeFn(meta.tweens.get(flyer.uid)?.ease)
        const raw = clamp01(progress(flyer.uid))
        const u = clamp01(raw / flyer.move)
        const k = easing(u)
        const shape = { ...interpolate(flyer.from, flyer.to, k), ...pointOnHops(flyer.hops, u, easing) }
        const opacity = flyer.move < 1 ? 1 - clamp01((raw - flyer.move) / (1 - flyer.move)) : raw < 1 ? 1 : 0
        const v = { opacity, scale: 1, draw: 1, dx: 0, dy: 0, head: 0, label: flyer.from.label, nil: flyer.from.nil, labelOpacity: 1 }
        // the value it carries, as a bar from its source's to its target's
        v.barKind = barKindOf(flyer.to, flyer.from)
        if (v.barKind) v.bar = lerp(barShare(flyer.from), barShare(flyer.to, flyer.from.label, flyer.from.nil), k)
        items.push({ uid: flyer.uid, shape, v, node: nodes.get(flyer.uid) || makeNode(shape), a: flyer.from, b: flyer.to, t: k, flyer: true })
      }

      for (const [uid, node] of nodes) {
        if (!uids.has(uid)) {
          node.g.remove()
          node.panel?.remove()
          for (const o of Object.values(node.overlays || {})) o.el.remove()
          nodes.delete(uid)
        }
      }

      // Spotlight: shapes outside it fade to DIM over the beat
      const litA = litFor(A)
      const litB = litFor(B)
      for (const item of items) {
        if (item.flyer) { item.dimK = 1; continue } // a value on the move is never dimmed
        // each state by the shape's id in it (a swapped cell's id changes)
        const dimA = litA && !litA.has((item.a || item.shape).id) ? 1 : 0
        const dimB = litB && !litB.has((item.b || item.shape).id) ? 1 : 0
        const dim = lerp(dimA, dimB, extra.beatT)
        item.dimK = 1 - (1 - DIM) * dim // its highlights and callout dim with it
        item.v.opacity *= item.dimK
      }

      const glowA = glowFor(A)
      const glowB = glowFor(B)
      const finalByUid = new Map([...final.values()].map((s) => [s.uid, s]))
      order(items.map(({ node, shape, uid, t }) => ({ node, shape: finalByUid.get(uid) || shape, raised: meta.tweens.get(uid)?.raise && t > 0 && t < 1 })))

      for (const item of items) {
        // colours: blended from A's to B's over the shape's progress (entering / leaving: their own)
        const from = item.a || item.b
        const to = item.b || item.a
        const t = item.a && item.b ? clamp01(item.t) : 1
        const ink = (s) => (s.nil && s.colour !== 'none' ? 'muted' : s.colour) // a null value is muted (colour none still hides it)
        const colours = {
          fill: mixColour(rgba(colourCss(from.fill, 'fill')), rgba(colourCss(to.fill, 'fill')), t),
          stroke: mixColour(rgba(colourCss(from.stroke, 'stroke')), rgba(colourCss(to.stroke, 'stroke')), t),
          colour: mixColour(rgba(colourCss(ink(from), 'stroke')), rgba(colourCss(ink(to), 'stroke')), t),
        }
        // a bar's track: none on a shape without a bar, so it fades in and out as the bar turns on and off
        if (item.v.bar !== undefined) {
          const track = (s) => rgba(colourCss(hasBar(s) ? s.track : 'none', 'fill'))
          colours.track = mixColour(track(from), track(to), t)
          // its fill as it is, not tinted as a fill (BAR_DRAWS choose which to use)
          colours.raw = mixColour(rgba(colourCss(from.fill, 'stroke')), rgba(colourCss(to.fill, 'stroke')), t)
        }
        // highlight glow fades in / out like the box; a shape glows too when one covering it does
        // (a span's cells: covers)
        item.v.hlGlow = blend(item, (s) => s.hl?.glow || (s === item.a ? glowA : glowB).has(s.id))
        item.v.hlLine = blend(item, (s) => s.hl?.line)
        drawNode(item.node, item.shape, item.v, colours, now)
        drawOverlays(item, now)
      }
      drawSlots(meta, progress, now)
    }

    // The slots (muted outlines) of a beat's row / column edits (insert, remove), which only show
    // while it plays. A closing slot appears as its cell leaves, then shrinks from its far side as
    // the cells after it close up; an opening one grows as the cells move aside and goes as its
    // cell lands. `then` is where the second part starts in the slot's time (the first ends at
    // 1 - then).
    function drawSlots(meta, progress, now) {
      const live = new Set()
      for (const slot of meta.slots || []) {
        const row = now.get(slot.ref)
        if (!row) continue
        live.add(slot.uid)
        const raw = clamp01(progress(slot.uid))
        const ease = easeFn(meta.tweens.get(slot.uid)?.ease)
        let size
        let opacity
        if (slot.closing) {
          const u = clamp01(ease(clamp01((raw - slot.then) / (1 - slot.then))))
          size = 1 - u
          opacity = clamp01(raw / CHOREOGRAPHY.slotFade) * (1 - u)
        } else {
          size = clamp01(ease(clamp01(raw / (1 - slot.then))))
          opacity = size * (1 - clamp01((raw - (1 - CHOREOGRAPHY.slotFade)) / CHOREOGRAPHY.slotFade))
        }
        let el = slotNodes.get(slot.uid)
        if (!el) slotNodes.set(slot.uid, (el = slotLayer.appendChild(svgEl('rect', { class: 'anim-slot' }))))
        // its near side stays put; it grows / shrinks along the row
        const length = slot.across ? slot.w : slot.h
        const along = (slot.across ? slot.dx : slot.dy) - length / 2 + (length * size) / 2
        const w = slot.across ? slot.w * size : slot.w
        const h = slot.across ? slot.h : slot.h * size
        const cx = row.x + (slot.across ? along : slot.dx)
        const cy = row.y + (slot.across ? slot.dy : along)
        attr(el, 'x', cx - w / 2)
        attr(el, 'y', cy - h / 2)
        attr(el, 'width', Math.max(0, w))
        attr(el, 'height', Math.max(0, h))
        attr(el, 'rx', Math.min(slot.corner, w / 2, h / 2))
        paint(el, 'opacity', String(size > 0.01 ? opacity : 0))
      }
      for (const [uid, el] of slotNodes) {
        if (!live.has(uid)) { el.remove(); slotNodes.delete(uid) }
      }
    }

    // How much of a two-state feature shows: from A's value to B's over the shape's progress,
    // times the shape's own visibility (entering / leaving).
    const blend = (item, has) => lerp(item.a && has(item.a) ? 1 : 0, item.b && has(item.b) ? 1 : 0, item.a && item.b ? item.t : 1) * (item.a && item.b ? 1 : item.v.opacity)

    // How far inside the shape's edge the inside highlight's centre line sits: past the shape's own
    // stroke (half of it is inside the edge), a small gap, and half the highlight's own line.
    const HL_LINE = 3 // the highlight's line (anim-highlight-outline / -inside in animation.css)
    const insetOf = (s) => {
      const stroke = BODIES[s.type]?.edge === false || s.stroke === 'none' ? 0 : STROKE * (s.weight ?? 1) * (s.scale ?? 1)
      return stroke / 2 + 0.04 * CELL + HL_LINE / 2
    }

    // A highlight path following a shape's outline, grown by `offset` (shrunk if negative): a rounded
    // rect for rects and text, a circle, a diamond. Groups, images and icons (outline), and shapes
    // with a name or indices (`boxed`), get a rounded box round their bounds `b`, which includes an
    // image's or icon's label.
    function highlightPath(s, v, offset, b, boxedToo = false) {
      const rectPath = (hw, hh, r) => {
        r = Math.max(0, Math.min(r, hw, hh))
        return `M ${-hw + r} ${-hh} H ${hw - r} A ${r} ${r} 0 0 1 ${hw} ${-hh + r} V ${hh - r} A ${r} ${r} 0 0 1 ${hw - r} ${hh}`
          + ` H ${-hw + r} A ${r} ${r} 0 0 1 ${-hw} ${hh - r} V ${-hh + r} A ${r} ${r} 0 0 1 ${-hw + r} ${-hh} Z`
      }
      // its outline (SHAPES); a group, or an outline round a label below its shape, is a box
      const kind = kindOf(s)
      const boxed = boxedToo || !kind.outline || (offset > 0 && kind.label === 'below')
      if (boxed) {
        const hw = (b.x1 - b.x0) / 2 + offset
        const hh = (b.y1 - b.y0) / 2 + offset
        return { d: rectPath(hw, hh, 0.12 * CELL), transform: `translate(${(b.x0 + b.x1) / 2} ${(b.y0 + b.y1) / 2})` }
      }
      const c = boxCentre(s)
      const transform = `translate(${c.x + (v.dx || 0)} ${c.y + (v.dy || 0)}) rotate(${(s.angle || 0) + (v.rot || 0)})`
      const k = (s.scale ?? 1) * (v.scale ?? 1)
      const { hw, hh } = extents(s)
      const w = Math.max(0, hw * k + offset)
      const h = Math.max(0, hh * k + offset)
      if (kind.outline === 'round') {
        const r = Math.max(0, s.r * k + offset)
        return { d: `M ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 Z`, transform }
      }
      if (kind.outline === 'diamond') {
        // each side moves out by `offset`: the same diamond, scaled by (d + offset) / d, where d is
        // the distance from the centre to a side
        const d = (hw * k * hh * k) / (Math.hypot(hw * k, hh * k) || 1)
        const f = Math.max(0, (d + offset) / (d || 1))
        return { d: `M 0 ${-hh * k * f} L ${hw * k * f} 0 L 0 ${hh * k * f} L ${-hw * k * f} 0 Z`, transform }
      }
      // a box: its corners (if it has them) grown or shrunk with it, or rounded on the way out
      const cornered = APPLIES.corner.includes(s.type)
      const corner = cornered ? Math.min(s.corner || 0, hw, hh) * k : 0
      const r = cornered ? corner + offset : offset > 0 ? offset : 0
      return { d: rectPath(w, h, r), transform }
    }

    // What a shape shows of a two-state feature mid-blend: B's, or A's while A's fades out
    const shownValue = (item, get) => {
      const a = item.a && get(item.a)
      const b = item.b && get(item.b)
      return b != null && (item.t >= 0.5 || a == null) ? b : a ?? b
    }

    // The overlays drawn above the shapes, in world space: the highlights (outline, inside, arrow,
    // number) and the callout bubble. Each:
    //   has(state)  whether a state of the shape shows it (it fades in and out between beats)
    //   make()      its elements, made when it first shows: { el, … }, el the one that fades
    //   draw(o, f)  places them each frame; f gives the shape's bounds b, its fade (0-1, before
    //               dimming), the item, and `now` (every shape where it is this frame)
    const PAD = 0.15 * CELL // an outline's gap round the shape
    const highlightPathOf = (key, offsetOf) => ({
      make: () => ({ el: highlightLayer.appendChild(svgEl('path', { class: `anim-highlight-${key}` })) }),
      draw: (o, { item, b, now }) => {
        // an outline is round the whole thing: a var's / row's / column's name and indices too (not
        // a shape that hugs its own edge, SHAPES: hug)
        const parts = key === 'outline' && !kindOf(item.shape).hug ? [...now.values()].filter((s) => s.part === item.shape.id && PARTS[s.role]?.outline) : []
        const outer = parts.length > 0
        const box = outer ? mergeBoxes([b, ...parts.map((part) => bounds(part, now))]) : b
        const { d, transform } = highlightPath(item.shape, item.v, offsetOf(item.shape), box, outer)
        attr(o.el, 'd', d)
        attr(o.el, 'transform', transform)
      },
    })
    const OVERLAYS = {
      // the shape's own outline, PAD outside it; inside: the same line just inside its stroke. Both
      // are paths in the shape's place and turn (see highlightPath).
      outline: { has: (s) => s.hl?.outline, ...highlightPathOf('outline', (s) => (kindOf(s).hug ? 0 : PAD)) },
      inside: { has: (s) => s.hl?.inside, ...highlightPathOf('inside', (s) => -insetOf(s)) },
      // a block arrow pointing in at the top-right corner, sliding in as it fades in
      arrow: {
        has: (s) => s.hl?.arrow,
        make: () => {
          const el = highlightLayer.appendChild(svgEl('polygon', { class: 'anim-highlight-arrow', 'stroke-linejoin': 'round' }))
          // pointing along +x with its tip at 0,0 (rotated to point down-left below)
          const L = 0.9 * CELL, H = 0.50 * CELL, HW = 0.33 * CELL, SW = 0.17 * CELL
          attr(el, 'points', `0,0 ${-H},${-HW} ${-H},${-SW} ${-L},${-SW} ${-L},${SW} ${-H},${SW} ${-H},${HW}`)
          return { el }
        },
        draw: (o, { b, fade }) => {
          const back = (1 - fade) * 0.4 * CELL // slides by its fade, not the dimming
          const tip = { x: b.x1 - 0.75 * PAD + back, y: b.y0 + 0.75 * PAD - back }
          attr(o.el, 'transform', `translate(${tip.x} ${tip.y}) rotate(135)`)
        },
      },
      // a numbered disc on the top-left corner, popping in
      number: {
        has: (s) => s.hl?.number != null,
        make: () => {
          const el = highlightLayer.appendChild(svgEl('g', { class: 'anim-highlight-number' }))
          el.appendChild(svgEl('circle', { r: 0.28 * CELL }))
          return { el, text: el.appendChild(svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' })) }
        },
        draw: (o, { item, b, fade }) => {
          const n = shownValue(item, (s) => s.hl?.number)
          const label = n == null ? '' : String(n)
          if (o.text.textContent !== label) o.text.textContent = label
          const size = FONT * (label.length > 2 ? 0.62 : 0.88)
          o.text.style.fontSize = `${size}px`
          attr(o.text, 'y', -LABEL_LIFT * size) // "central" sits text a little low
          attr(o.el, 'transform', `translate(${b.x0} ${b.y0}) scale(${Math.max(0.001, 0.6 + 0.4 * fade)})`)
        },
      },
      // a speech bubble beside the shape (drawBubble)
      callout: {
        has: (s) => s.callout,
        make: () => {
          const el = calloutLayer.appendChild(svgEl('g', { class: 'anim-callout' }))
          const path = el.appendChild(svgEl('path'))
          const text = el.appendChild(svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }))
          return { el, path, text, key: null } // key: the text its lines were built for
        },
        draw: (o, { item, b }) => {
          const callout = shownValue(item, (s) => s.callout)
          if (callout) drawBubble(o, callout, b)
        },
      },
    }

    // Draws a shape's overlays: each fades in / out with its feature, and dims with a shape outside
    // the spotlight; once faded out it's removed.
    function drawOverlays(item, now) {
      const node = item.node
      node.overlays ||= {}
      const k = item.dimK
      const showing = Object.entries(OVERLAYS)
        .map(([name, overlay]) => [name, overlay, blend(item, overlay.has)])
        .filter(([name, , fade]) => fade || node.overlays[name])
      if (!showing.length) return
      const b = bounds(item.shape, now, { ends: item.v.ends, dx: item.v.dx, dy: item.v.dy })
      for (const [name, overlay, fade] of showing) {
        const o = (node.overlays[name] ||= overlay.make())
        overlay.draw(o, { item, b, fade, now })
        o.el.style.opacity = fade * k
        if (!fade) { o.el.remove(); delete node.overlays[name] }
      }
    }

    // A speech bubble (o: the callout overlay's elements) beside bounds `b`, with a tail pointing at it.
    function drawBubble(o, callout, b) {
      const size = FONT * 0.75
      const lineH = size * 1.25
      const lines = wrapText(callout.text, size, CALLOUT_CH * textWidth('0', size))
      const w = Math.max(CELL, ...lines.map((line) => textWidth(line, size))) + size * 1.4
      const h = lines.length * lineH + size * 0.75
      const tail = 0.3 * CELL
      const m = 4
      // A side with no room for the bubble (a shape at the drawing's edge) flips to the opposite
      // side, then tries the other two; with no room anywhere it keeps its side.
      const room = {
        above: b.y0 - tail - h >= viewBox.y + m,
        below: b.y1 + tail + h <= viewBox.y + viewBox.h - m,
        left: b.x0 - tail - w >= viewBox.x + m,
        right: b.x1 + tail + w <= viewBox.x + viewBox.w - m,
      }
      const opposite = { above: 'below', below: 'above', left: 'right', right: 'left' }
      const across = callout.side === 'above' || callout.side === 'below' ? ['left', 'right'] : ['above', 'below']
      const side = [callout.side, opposite[callout.side], ...across].find((s) => room[s]) || callout.side
      const cx0 = (b.x0 + b.x1) / 2
      const cy0 = (b.y0 + b.y1) / 2
      let cx = cx0, cy = cy0, tip
      if (side === 'below') { tip = { x: cx0, y: b.y1 + 4 }; cy = b.y1 + tail + h / 2 }
      else if (side === 'left') { tip = { x: b.x0 - 4, y: cy0 }; cx = b.x0 - tail - w / 2 }
      else if (side === 'right') { tip = { x: b.x1 + 4, y: cy0 }; cx = b.x1 + tail + w / 2 }
      else { tip = { x: cx0, y: b.y0 - 4 }; cy = b.y0 - tail - h / 2 }
      // Keep the bubble inside the drawing (the tail still points at the shape)
      cx = Math.min(viewBox.x + viewBox.w - w / 2 - m, Math.max(viewBox.x + w / 2 + m, cx))
      cy = Math.min(viewBox.y + viewBox.h - h / 2 - m, Math.max(viewBox.y + h / 2 + m, cy))
      attr(o.path, 'd', bubblePath(cx, cy, w, h, Math.min(10, h / 3), side, tip))
      o.text.style.fontSize = `${size}px`
      if (o.key !== callout.text) {
        o.key = callout.text
        o.text.replaceChildren(...lines.map((line) => {
          const span = svgEl('tspan')
          span.textContent = line
          return span
        }))
      }
      ;[...o.text.children].forEach((span, i) => {
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

    return { render }
  }

  function drawDebugGrid(svg, view) {
    // a fixed grid's cells only (not the margin round it); a fitted drawing's whole view
    const vb = view.cols ? { x: 0, y: 0, w: view.cols * CELL, h: view.rows * CELL } : view
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
