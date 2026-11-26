/**
 * anim-render.js - Part of the animation plugin (animation.js): drawing a beat, or a blend
 * between two beats, into the SVG (shapes, labels, lines, highlights, callouts, flows).
 */

;(function () {
  const { PARTS, HEX, COLOURS, FILL_MIXES, towardsBg, svgEl, LINE_TYPES, lucideIcon, lerp, STROKE,
    PATTERNS, reducedMotion, FLOW_SPEED, FONT, resolveEnds, HEAD, clamp01, boxCentre, extents, LAYERS, IMAGE_FITS,
    bounds, CELL, easeFn, pointOnHops, pointOnPath, resolveAttachments, textWidth, CALLOUT_CH,
    linePoints, MONO_FONT, measure, mergeBoxes, pointAt, CHOREOGRAPHY, LERPED, kindOf, APPLIES,
    entranceFor, XML_NS, LAYOUTS, LOOKS, hasBar, roundBar, isGroup, scriptOf, scriptBlocksIn, scriptTextSize, SCRIPT_TEXT, edgeOf,
    END_MARKS, LINE_ENDS, TEXT_MARKS, textRuns, polygonPoints, roundCorners, digitSymbol, rotateAbout, arcOffset, placeFor, COLOUR_PICKS, evaluate } = window.Anim

  // Text centred in a shape (or a number badge) is lifted by this share of its font size: the
  // "central" baseline sits it a little low
  const LABEL_LIFT = 0.07
  // A label at the top of its box (label place 'top') is centred this share of its font size below
  // the box's top edge; one at its right (label place 'right') ends this share in from its right edge
  const TOP_PAD = 0.75
  const RIGHT_PAD = 0.3
  // A label below its shape is centred this share of its font size below the shape's bottom edge
  const BELOW_GAP = 0.75
  // How text is anchored for each alignment (ALIGNS), and which side of its box it's placed by
  const ANCHORS = { left: { anchor: 'start', side: -1 }, centre: { anchor: 'middle', side: 0 }, right: { anchor: 'end', side: 1 } }
  // The places a label goes (SHAPES: label, BAR_DRAWS: label):
  //   at       where it's drawn ({ x, y, anchor }), from the shape s, its half-sizes and the font
  //            size in px; none: it isn't placed here (along: a line places it halfway along
  //            itself; script: drawScript draws it)
  //   over     it sits on its shape, so a colour picked from what's behind it (COLOUR_PICKS) is
  //            picked against the shape's fill
  //   own      the label is the shape itself (text), so it glows its own colour
  //   outside  it's outside its shape, so an outline round the shape goes round it too, as a box
  const lifted = (font) => -LABEL_LIFT * font // "central" sits text a little low in a shape
  const LABEL_PLACES = {
    centre: { over: true, at: (s, hw, hh, font) => ({ x: 0, y: lifted(font), anchor: ANCHORS.centre.anchor }) },
    // inside the top of the box, or in the middle of one too short for that
    top: { over: true, at: (s, hw, hh, font) => ({ x: 0, y: Math.min(-hh + TOP_PAD * font, 0) + lifted(font), anchor: ANCHORS.centre.anchor }) },
    right: { over: true, at: (s, hw, hh, font) => ({ x: hw - RIGHT_PAD * font, y: lifted(font), anchor: ANCHORS.right.anchor }) },
    code: { over: true, at: (s, hw, hh, font) => ({ x: -hw + kindOf(s).pre.pad * font, y: lifted(font), anchor: ANCHORS.left.anchor }) },
    content: { own: true, at: (s, hw) => { const { anchor, side } = ANCHORS[s.align] || ANCHORS.centre; return { x: side * hw, y: 0, anchor } } },
    below: { outside: true, at: (s, hw, hh, font) => ({ x: 0, y: hh + font * BELOW_GAP, anchor: ANCHORS.centre.anchor }) },
    along: {},
    script: {},
  }

  const endsOf = (fn) => Object.fromEntries(Object.keys(LINE_ENDS).map((end) => [end, fn(end)]))
  // How strongly each mark shows at each end (0-1), e.g. { from: {}, to: { arrow: 1 } }: blended
  // as one is added or taken off, or one changes to another (the old fades out as the new fades in)
  const marksOf = (shape) => endsOf((end) => { const kind = shape[LINE_ENDS[end]]; return END_MARKS[kind] && !END_MARKS[kind].blank ? { [kind]: 1 } : {} })
  const blendMarks = (a, b, t) => endsOf((end) => Object.fromEntries([...new Set([...Object.keys(a[end]), ...Object.keys(b[end])])]
    .map((kind) => [kind, lerp(a[end][kind] || 0, b[end][kind] || 0, t)])))
  const noMarks = endsOf(() => ({}))
  // How each mark (END_MARKS) is drawn at a line's end:
  //   d       d(p, u, n, k): its path, from the end's tip p, the way out along the line u, across it
  //           n, and its size k (both unit vectors)
  //   filled  it's filled in the line's colour (otherwise only stroked)
  //   back    how far short of the tip the line itself stops (× k), so it doesn't show past the mark
  const along = (p, u, a, n, b) => `${p.x + u.x * a + n.x * b} ${p.y + u.y * a + n.y * b}`
  const DOT = 0.4 // a dot's radius (× k)
  const SPREAD = 0.55 // how far either side of the line an arrowhead, crow's foot or bar goes (× k)
  const END_DRAWS = {
    arrow: { filled: true, back: 1, d: (p, u, n, k) => `M ${along(p, u, 0, n, 0)} L ${along(p, u, -k, n, SPREAD * k)} L ${along(p, u, -k, n, -SPREAD * k)} Z` },
    // a dot sitting on the tip
    dot: {
      filled: true, back: DOT,
      d: (p, u, n, k) => {
        const r = DOT * k
        return `M ${along(p, u, -r, n, r)} A ${r} ${r} 0 1 1 ${along(p, u, -r, n, -r)} A ${r} ${r} 0 1 1 ${along(p, u, -r, n, r)} Z`
      },
    },
    // many: two toes fanning out to the tip from a point on the line, which is the middle one
    crow: { back: 0, d: (p, u, n, k) => `M ${along(p, u, 0, n, SPREAD * k)} L ${along(p, u, -k, n, 0)} L ${along(p, u, 0, n, -SPREAD * k)}` },
    // one: a bar across the line, just short of the tip
    bar: { back: 0, d: (p, u, n, k) => `M ${along(p, u, -k / 2, n, SPREAD * k)} L ${along(p, u, -k / 2, n, -SPREAD * k)}` },
  }

  // A var's or cell's bar (LOOKS: bar, BARS): the share of it its value fills (held to 0-1; a value
  // that isn't a number fills none), or 1, all of it, when it shows none (hasBar), so turning one on
  // or off blends.
  function barShare(shape, label = shape.label, nil = shape.nil) {
    if (!hasBar(shape)) return 1
    const max = shape.max ?? LOOKS.max.default
    const value = nil ? NaN : parseFloat(label)
    return max > 0 && Number.isFinite(value) ? clamp01(value / max) : 0
  }
  // The kind of bar drawn for a blend of two shapes: the one it's going to, or the one it had
  const barKindOf = (...shapes) => shapes.find((shape) => shape && hasBar(shape))?.bar
  // How much of each kind of bar shows (0-1) while a shape changes from one kind to another, or
  // turns one on or off: the old fading out as the new fades in, as their parts can't morph into
  // each other. Kind null is the shape's own plain fill. None (null) while it keeps its kind.
  function barFades(a, b, t) {
    const [from, to] = [a, b].map((s) => (hasBar(s) ? s.bar : null))
    if (from === to) return null
    const u = clamp01(t)
    return new Map([[from, 1 - u], [to, u]])
  }
  // How round a box is drawn (v.round, 0-1): round while it shows a round bar (BARS: round), blending
  // as one turns on or off
  const roundness = (shape) => (roundBar(shape) ? 1 : 0)
  // A box's corner as drawn: its own, or all the way round as it's round (v.round)
  const cornerOf = (s, v, hw, hh) => Math.max(0, lerp(Math.min(s.corner || 0, hw, hh), Math.min(hw, hh), v.round || 0))

  // A value part-way (t) through counting ("counter", tween: count): a whole number steps through
  // each one between; any other shows as many decimal places as either end has. A digit (radix,
  // place) shows its place's digit of the whole number counted to.
  function countLabel({ from, to, radix, place }, t) {
    const n = lerp(from, to, t)
    if (radix) return digitSymbol(Math.floor(Math.abs(Math.round(n)) / radix ** place) % radix)
    const places = Math.max(...[from, to].map((x) => (String(x).split('.')[1] || '').length))
    return places ? n.toFixed(places) : String(Math.round(n))
  }

  // Where a repeated change (tween: rounds, n of them; forever: one, looped) has got, raw (0-1) of
  // the way through its time, each round eased on its own: t, its repeated looks' progress over
  // all of them; once, its first-round looks' (done after the first); raw, the round's own
  function roundsOf(rounds, raw, easing) {
    const n = Number.isFinite(rounds.n) ? rounds.n : 1
    const k = Math.min(n - 1, Math.floor(raw * n))
    const local = raw * n - k
    const e = easing(local)
    return { t: (k + e) / n, once: k ? 1 : e, raw: local }
  }

  // A label following values that count (tween: counting) part-way (t): each sum worked out from
  // the numbers its counting sources show then (countLabel), the others as they are; null if one
  // can't be worked out (it shows its new text)
  function countedText({ parts, counts, values }, t) {
    const numberOf = (term) => (term.ref === undefined ? term.v : counts[term.ref] ? Number(countLabel(counts[term.ref], t)) : values[term.ref])
    try {
      return parts.map((part) => (part.expr ? String(evaluate(part.expr, numberOf)) : part.text)).join('')
    } catch {
      return null
    }
  }

  // A polygon's corners with each side moved out by `grow` (in, when negative), each corner where
  // its two moved sides meet (no further out than MITER × grow, for a very sharp one)
  const MITER = 4
  function grownCorners(corners, grow) {
    const n = corners.length
    const area = corners.reduce((sum, p, i) => sum + p.x * corners[(i + 1) % n].y - corners[(i + 1) % n].x * p.y, 0)
    const out = area > 0 ? 1 : -1 // which side of each side is outside (the way round it goes)
    const normal = (a, b) => { const len = Math.hypot(b.x - a.x, b.y - a.y) || 1; return { x: (out * (b.y - a.y)) / len, y: (out * (a.x - b.x)) / len } }
    return corners.map((p, i) => {
      const [n1, n2] = [normal(corners[(i - 1 + n) % n], p), normal(p, corners[(i + 1) % n])]
      const m = { x: n1.x + n2.x, y: n1.y + n2.y }
      const len = Math.hypot(m.x, m.y)
      if (len < 1e-9) return { x: p.x + n1.x * grow, y: p.y + n1.y * grow }
      const reach = Math.min(MITER * Math.abs(grow), Math.abs(grow / ((m.x * n1.x + m.y * n1.y) / len))) * Math.sign(grow)
      return { x: p.x + (m.x / len) * reach, y: p.y + (m.y / len) * reach }
    })
  }

  // A polygon's outline (SHAPES: points) in a box of half-sizes hw, hh, as a closed path, each side
  // moved out by `grow` (a highlight's gap, the same all round), its corners rounded by r (each as
  // much as fits): from the middle of its first side round to it
  function polygonPath(points, hw, hh, r, grow = 0) {
    const corners = grow ? grownCorners(polygonPoints(points, hw, hh), grow) : polygonPoints(points, hw, hh)
    if (!r) return `M ${corners.map((p) => `${p.x} ${p.y}`).join(' L ')} Z`
    const mid = { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 }
    const round = roundCorners([mid, ...corners.slice(1), corners[0], mid], r)
    return `M ${round.map((p) => `${p.x} ${p.y}`).join(' L ')} Z`
  }

  // ---------------------------------------------------------------------------
  // SVG rendering
  // ---------------------------------------------------------------------------

  const flowState = new WeakMap() // stroke element -> { key, anim } for flowing dashes

  // Sets (or with null, removes) an attribute only when it changes. Writing an SVG attribute makes
  // the browser re-check the element's layout even when the value is the same, and every shape is
  // drawn on every frame of a transition. Each element's last values are remembered here.
  const attrCache = new WeakMap()
  let clipCount = 0 // clip paths made (drawCover), for ids unique on the page
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

  // A shape's look (`field`): a digit's from its value (`label`, the one shown: it swaps halfway
  // through a crossfade) while it still takes it (LAYOUTS: digits.looks, shape.auto), or its own
  const lookOf = (s, field, label = s.label) => (s.auto?.includes(field) ? LAYOUTS[s.digit].digits.looks[label]?.[field] : undefined) ?? s[field]

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
  const cssCache = new Map() // CSS colour -> it as drawn (rgba, or none): mixCss
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
  window.addEventListener?.('docsify-theme-change', () => { colourCache.clear(); cssCache.clear(); warmed = false })

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
        // one path for lines, arrows and curves; the marks on its ends are added as they're first shown
        node.body = g.appendChild(svgEl('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }))
        node.marks = endsOf(() => ({})) // end -> mark -> its path
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
    // A colour part-way from a to b, as [r, g, b, a] (either may be null = none: it fades in or out),
    // and as CSS (mixColour)
    function mixRgba(a, b, t) {
      if (!a && !b) return null
      const from = a || [...b.slice(0, 3), 0]
      const to = b || [...a.slice(0, 3), 0]
      return from.map((v, i) => lerp(v, to[i], t))
    }
    const cssOf = (c) => (c ? `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${c[3].toFixed(3)})` : 'none')
    const mixColour = (a, b, t) => cssOf(mixRgba(a, b, t))
    // Two CSS colours part-way from a to b, as CSS: one that isn't changing (a is b, as for most
    // shapes on most frames) is worked out once (cssCache), not mixed again every frame
    function mixCss(a, b, t) {
      if (a !== b) return mixColour(rgba(a), rgba(b), t)
      if (!cssCache.has(a)) cssCache.set(a, cssOf(rgba(a)))
      return cssCache.get(a)
    }
    // A colour seen over another (an opaque one): the top's alpha mixes them
    const over = (top, under) => (top ? mixRgba(under, [...top.slice(0, 3), 1], top[3]) : under)
    // A colour picked from what's behind (COLOUR_PICKS: contrast): its dark colour on a backdrop
    // lighter than the threshold (by relative luminance), its light one on a darker one, blending
    // between them within `soft` of it
    function pickInk(pick, behind) {
      const linear = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
      const [r, g, b] = (behind || [0, 0, 0]).map(linear)
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
      const dark = clamp01((lum - pick.threshold + pick.soft) / (2 * pick.soft))
      return mixRgba(rgba(colourCss(pick.light, 'stroke')), rgba(colourCss(pick.dark, 'stroke')), dark)
    }
    // Sets an inline style property only when it changes, remembering what it set (as attr does):
    // reading el.style back each frame costs as much as drawing. A property set here is only ever
    // set here, so what it remembers stays true.
    const styleCache = new WeakMap()
    function paint(el, prop, value) {
      let cache = styleCache.get(el)
      if (!cache) styleCache.set(el, (cache = new Map()))
      if (cache.get(prop) === value) return
      cache.set(prop, value)
      el.style[prop] = value
    }

    // How each boxed shape type is drawn (lines: in drawNode). make adds its elements to the node
    // (node.body, when it has one, takes the stroke, and the fill if its type takes fill); size
    // sets them to the shape's half-sizes each frame (v: how it's drawn now). edge: false, its stroke is its drawing, not an
    // edge round it (an icon), so an inside highlight needn't clear it.
    const setBox = (el, hw, hh) => { attr(el, 'x', -hw); attr(el, 'y', -hh); attr(el, 'width', 2 * hw); attr(el, 'height', 2 * hh) }
    const rectBody = {
      make: (node) => { node.body = node.g.appendChild(svgEl('rect')) },
      size: (node, s, hw, hh, colours, v) => {
        setBox(node.body, hw, hh)
        const corner = cornerOf(s, v, hw, hh)
        attr(node.body, 'rx', corner); attr(node.body, 'ry', corner)
      },
    }
    // An image's URL, with its fit. Browsers (Chrome) ignore an <image>'s preserveAspectRatio for an
    // SVG with its own viewBox, using the SVG's instead, so an SVG is given its fit in its URL too
    // (an svgView fragment, which overrides the SVG's own).
    const SVG_FILE = /\.svg(\?[^#]*)?$/i
    const imageHref = (src, fit) => (SVG_FILE.test(src) ? `${src}#svgView(preserveAspectRatio(${encodeURIComponent(fit)}))` : src)

    const BODIES = {
      rect: rectBody,
      codeline: rectBody, // a code line's box, which a fill shows as a band
      span: rectBody, // a box round a row's places, which a fill or stroke shows
      circle: { // an ellipse, round in a square box
        make: (node) => { node.body = node.g.appendChild(svgEl('ellipse')) },
        size: (node, s, hw, hh) => { attr(node.body, 'rx', hw); attr(node.body, 'ry', hh) },
      },
      diamond: {
        make: (node) => { node.body = node.g.appendChild(svgEl('polygon', { 'stroke-linejoin': 'round' })) },
        size: (node, s, hw, hh) => attr(node.body, 'points', `0,${-hh} ${hw},0 0,${hh} ${-hw},0`),
      },
      polygon: {
        make: (node) => { node.body = node.g.appendChild(svgEl('path', { 'stroke-linejoin': 'round' })) },
        size: (node, s, hw, hh) => attr(node.body, 'd', polygonPath(s.points, hw, hh, s.corner || 0)),
      },
      text: { make: () => {}, size: () => {} },
      image: {
        make: (node, shape) => {
          node.image = node.g.appendChild(svgEl('image'))
          node.body = node.g.appendChild(svgEl('rect', { fill: 'none' }))
        },
        size: (node, s, hw, hh) => {
          setBox(node.image, hw, hh)
          setBox(node.body, hw, hh)
          const fit = IMAGE_FITS[s.fit ?? LOOKS.fit.default]
          attr(node.image, 'preserveAspectRatio', fit)
          attr(node.image, 'href', imageHref(s.src, fit))
        },
      },
      // a script's drawing goes in node.script (drawScript), as its label
      scratch: {
        make: (node) => { node.script = node.g.appendChild(svgEl('g', { class: 'anim-script' })) },
        size: () => {},
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

    // A label's text is built once as nodes, then only its text nodes' data changes from frame to
    // frame: adding or removing nodes restyles the whole page (the site's :has() rules), while
    // changing a text node's data doesn't. Each run of text is a leaf: { text, a } when it all
    // shows, or { text, a, b } while typing, a and b being the text of two tspans, the part before
    // the cut and the part after it, one shown and one hidden. A plain label is one leaf (text:
    // null, the whole label); a marked one's (runs) a leaf per run; a code line's are the strings
    // among Prism's tokens.
    function buildLabel(label, code, lang, typing, erase, runs) {
      const leaves = []
      const tspanText = (parent, shown) => parent.appendChild(svgEl('tspan', shown ? {} : { visibility: 'hidden' })).appendChild(document.createTextNode(''))
      const leaf = (parent, text) => {
        if (!typing) leaves.push({ text, a: parent.appendChild(document.createTextNode('')) })
        else leaves.push({ text, a: tspanText(parent, !erase), b: tspanText(parent, erase) })
      }
      label.replaceChildren()
      if (runs) markedRuns(runs, label, leaf)
      else if (code === null) leaf(label, null)
      else codeTokens(code, lang, label, leaf)
      return leaves
    }

    // A marked label's runs (textRuns), each in a tspan: a mark's at its size, raised or lowered,
    // bold or italic (TEXT_MARKS), and the next run back on the line. dy is in each run's own size
    // (em), so it holds as the font changes.
    function markedRuns(runs, parent, leaf) {
      let shift = 0
      for (const run of runs) {
        const mark = TEXT_MARKS[run.mark] || { size: 1, shift: 0 }
        const span = parent.appendChild(svgEl('tspan'))
        // as styles, not attributes: the site's own rules (its reset's "font: inherit") give text a
        // size, weight and style that an attribute (the weakest) loses to; otherwise the label's own
        // (bold, a null's italic). The size is a share of the label's, as dy's em is of the run's own.
        span.style.fontSize = mark.size === 1 ? 'inherit' : `${mark.size * 100}%`
        span.style.fontWeight = mark.bold ? '700' : 'inherit'
        span.style.fontStyle = mark.italic ? 'italic' : 'inherit'
        if (mark.shift !== shift) attr(span, 'dy', `${(mark.shift - shift) / mark.size}em`)
        shift = mark.shift
        leaf(span, run.text)
      }
    }

    // A code line's text, highlighted by Prism (lang: Prism's name for the language) as nested
    // tspans with Prism's token classes, which the site's code.css colours (animation.css makes
    // them fill with that colour). leaf(parent, text) adds each string between the tokens.
    function codeTokens(text, lang, parent, leaf) {
      const grammar = lang && window.Prism?.languages?.[lang]
      const walk = (item, into) => {
        if (Array.isArray(item)) return item.forEach((part) => walk(part, into))
        if (typeof item === 'string') return leaf(into, item)
        const classes = ['token', item.type, ...[].concat(item.alias || [])]
        walk(item.content, into.appendChild(svgEl('tspan', { class: classes.join(' ') })))
      }
      walk(grammar ? window.Prism.tokenize(text, grammar) : [text], parent)
    }

    // Sets a text node's data, only when it changes
    const setData = (node, text) => { if (node.data !== text) node.data = text }

    // A shape's text. While it's being typed (typed: 0-1, the share of characters shown) the rest
    // is laid out but hidden, so the text doesn't shift as it grows, whatever its alignment.
    // Erasing (deleted), it's untyped from the start: the first characters go first. A plain
    // label's nodes are rebuilt only when typing starts or stops; a code line's when its text does.
    function setLabel(node, label, typed, erasing, lang) {
      const text = label ?? ''
      const typing = typed !== undefined
      const erase = Boolean(erasing)
      const code = kindOf(node).pre ? text : null
      const runs = code === null ? textRuns(text) : null
      const marked = runs && (runs.length > 1 || runs[0].mark) ? runs : null
      const chars = [...(marked ? marked.map((run) => run.text).join('') : text)]
      const shown = typing ? Math.round(chars.length * clamp01(typed)) : -1
      const key = `${shown}|${erase}|${lang}|${text}`
      if (node.labelKey === key) return
      node.labelKey = key
      const build = `${typing}|${typing && erase}|${code === null ? (marked ? `marked|${text}` : '') : `${lang}|${code}`}`
      if (node.labelBuild !== build) {
        node.labelBuild = build
        node.leaves = buildLabel(node.label, code, lang, typing, erase, marked)
      }
      // the characters before the cut are the first part of each leaf: shown while typing, hidden
      // while erasing
      const cut = erase ? chars.length - shown : shown
      let at = 0 // characters so far
      for (const leaf of node.leaves) {
        const part = leaf.text ?? text
        if (!leaf.b) { setData(leaf.a, part); continue }
        const partChars = [...part]
        const k = Math.max(0, Math.min(partChars.length, cut - at))
        setData(leaf.a, partChars.slice(0, k).join(''))
        setData(leaf.b, partChars.slice(k).join(''))
        at += partChars.length
      }
    }

    // An element's text (debug ids, alt text, a number badge), changing its text node's data rather
    // than replacing it (see buildLabel)
    function setText(el, text) {
      const node = el.firstChild
      if (node?.nodeType === Node.TEXT_NODE && !node.nextSibling) setData(node, text)
      else el.textContent = text
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
        if (node.debugId) { attr(node.debugId, 'x', s.x); attr(node.debugId, 'y', s.y); setText(node.debugId, s.id) }
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
      g.style.opacity = v.opacity * (s.opacity ?? 1)
      // glow: brighter, with a soft halo. The one-off glow (v.glow) uses the shape's own colour
      // (the highlight colour if it has none); highlight glow (v.hlGlow) the highlight colour.
      const glowColour = LABEL_PLACES[kindOf(s).label]?.own ? colours.colour : colours.stroke // text glows its own colour
      const halo = (k, colour) => `drop-shadow(0 0 ${0.15 * CELL * k}px ${colour})`
      const filters = []
      const bright = Math.max(v.glow || 0, v.hlGlow || 0)
      if (bright) filters.push(`brightness(${1 + 0.35 * bright})`)
      if (v.glow) filters.push(halo(v.glow, glowColour === 'none' ? 'var(--color-important)' : glowColour))
      if (v.hlGlow) filters.push(halo(v.hlGlow, 'var(--color-important)'))
      g.style.filter = filters.join(' ')
      const fontSize = FONT * s.font
      node.label.style.fontSize = `${fontSize}px`
      node.label.style.fontWeight = lookOf(s, 'bold', v.label) ? '700' : ''
      paint(node.label, 'fontFamily', s.mono ? MONO_FONT : '')
      paint(node.label, 'fontStyle', (v.nil ?? s.nil) ? 'italic' : '') // a null value
      node.label.style.opacity = v.labelOpacity
      paint(node.label, 'fill', colours.colour) // a text shape's colour, or any shape's label
      if (kindOf(node).pre) paint(node.label, 'color', colours.colour) // for tokens code.css doesn't colour
      setLabel(node, kindOf(node).script ? '' : v.label, v.typed, v.erase, s.lang) // a script is drawn by drawScript

      if (LINE_TYPES.includes(node.type)) {
        const ends = v.ends || resolveEnds(s, byId)
        // dashBase: a line from a shape starts its pattern at the shape's centre, not its edge, so
        // the dashes stay put while the edge point slides round the shape as the other end moves
        const fromShape = s.from?.ref && byId.get(s.from.ref)
        const dashBase = fromShape ? Math.hypot(ends.from.x - boxCentre(fromShape).x, ends.from.y - boxCentre(fromShape).y) : 0
        // The points it's drawn through (its corners, or a curve's smooth path), with the distance
        // along to each: as much of it as shows (LOOKS: show), from its start
        const whole = measure(linePoints(ends).map((p) => ({ x: p.x + v.dx, y: p.y + v.dy })))
        const wholeLen = whole[whole.length - 1].at
        const shownLen = wholeLen * clamp01(s.show ?? 1)
        const path = shownLen < wholeLen ? [...whole.filter((p) => p.at < shownLen), { ...pointAt(whole, shownLen), at: shownLen }] : whole
        const total = path[path.length - 1].at
        const at = (d) => pointAt(path, d)
        const pathTo = (d) => [...path.filter((p) => p.at < d), at(d)]
        const pathBetween = (d0, d1) => [at(d0), ...path.filter((p) => p.at > d0 && p.at < d1), at(d1)]

        // Each mark (END_DRAWS, fading in or out as it's added, taken off or changed) sits on its
        // end, and the stroke stops at its back. While drawing in, the end's rides on the tip;
        // erasing, the start's rides on the erased edge. tip: how far along its end's point is;
        // way: +1 out along the line (the end's), -1 back (the start's). A line shown in part (LOOKS:
        // show) has its end's mark on the tip of the part shown, as while it's drawn in.
        const size = Math.min(HEAD * (0.6 + 0.4 * s.weight), wholeLen * 0.6)
        const marks = v.marks || noMarks
        const tips = { to: { tip: v.erase ? total : total * v.draw, way: 1 }, from: { tip: v.erase ? total * (1 - v.draw) : 0, way: -1 } }
        const frameAt = ({ tip, way }) => {
          const p = at(tip)
          const behind = at(Math.min(total, Math.max(0, tip - way * size)))
          const dl = Math.hypot(p.x - behind.x, p.y - behind.y)
          const near = way > 0 ? path[path.length - 2] || path[0] : path[1] || path[0] // for its way when it's too short to measure
          const u = dl > 1e-6 ? { x: (p.x - behind.x) / dl, y: (p.y - behind.y) / dl } : { x: Math.sign(p.x - near.x), y: Math.sign(p.y - near.y) }
          return { p, u, n: { x: -u.y, y: u.x } }
        }
        const shown = clamp01(v.draw * 4 - 0.2)
        for (const end of Object.keys(LINE_ENDS)) {
          const els = node.marks[end]
          for (const kind of Object.keys(marks[end])) els[kind] ||= g.insertBefore(svgEl('path', { 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }), node.label)
          const kinds = Object.keys(els).filter((kind) => marks[end][kind])
          const frame = kinds.length ? frameAt(tips[end]) : null
          for (const [kind, el] of Object.entries(els)) {
            const k = (marks[end][kind] || 0) * shown
            el.style.opacity = k
            if (!k) continue
            attr(el, 'd', END_DRAWS[kind].d(frame.p, frame.u, frame.n, size))
            el.style.strokeWidth = strokeWidth
            paint(el, 'fill', END_DRAWS[kind].filled ? colours.stroke : 'none')
            paint(el, 'stroke', colours.stroke)
          }
        }
        const backOf = (end) => Object.entries(marks[end]).reduce((sum, [kind, k]) => sum + END_DRAWS[kind].back * size * k, 0)
        const bodyStart = backOf('from')
        const bodyLen = total - backOf('to')
        attr(node.body, 'd', `M ${(bodyStart ? pathBetween(bodyStart, bodyLen) : pathTo(bodyLen)).map((p) => `${p.x} ${p.y}`).join(' L ')}`)
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
          setFlow(node.body, pattern, dashBase + bodyStart) // the pattern keeps its place along the line
          syncGhost(node.body, dashBase + bodyStart)
        }
        paint(node.body, 'stroke', colours.stroke)
        drawSignal(node, v.signal, path, strokeWidth)
        const { x: mx, y: my } = pointAt(whole, wholeLen / 2) // the label sits halfway along all of it
        attr(node.label, 'x', mx); attr(node.label, 'y', my)
        attr(node.label, 'text-anchor', 'middle')
        node.label.classList.add('anim-halo')
        attr(g, 'transform', v.scale === 1 && !v.rot ? '' : `translate(${mx} ${my}) rotate(${v.rot || 0}) scale(${v.scale}) translate(${-mx} ${-my})`)
        if (node.debugId) { attr(node.debugId, 'x', path[0].x); attr(node.debugId, 'y', path[0].y); setText(node.debugId, s.id) }
        return
      }

      const c = boxCentre(s)
      attr(g, 'transform', `translate(${c.x + v.dx} ${c.y + v.dy}) rotate(${s.angle + (v.rot || 0)}) scale(${v.scale * s.scale})`)
      const { hw, hh } = extents(s)

      BODIES[node.type].size(node, s, hw, hh, colours, v)
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
        if (APPLIES.fill.includes(node.type)) {
          const plain = plainFill(v)
          paint(node.body, 'fill', plain > 0 ? colours.fill : 'none')
          paint(node.body, 'fillOpacity', plain > 0 && plain < 1 ? String(plain) : '')
        }
        drawBars(node, s, v, hw, hh, colours)
        paint(node.body, 'stroke', s.weight ? colours.stroke : 'none')
        node.body.style.strokeWidth = strokeWidth
        node.body.style.strokeDasharray = dash
        node.body.style.strokeLinecap = cap
        setFlow(node.body)
        syncGhost(node.body)
      }
      if (node.title) setText(node.title, s.label ?? '')

      // Label: where its type puts it (SHAPES: label, LABEL_PLACES), or where its bar puts it
      // (labelPlace); a script is drawn by drawScript
      if (kindOf(s).script) drawScript(node, s, v.script, colours)
      const { place, fade } = labelPlace(s, v, hw, hh)
      if (fade !== 1) node.label.style.opacity = v.labelOpacity * fade
      const at = LABEL_PLACES[place].at?.(s, hw, hh, fontSize)
      if (at) {
        attr(node.label, 'x', at.x)
        attr(node.label, 'y', at.y)
        attr(node.label, 'text-anchor', at.anchor)
      }
      drawCover(node, v, hw, hh, colours)
      if (node.debugId) { attr(node.debugId, 'x', -hw); attr(node.debugId, 'y', -hh - 4); setText(node.debugId, s.id) }
    }

    // A script shape's script (SHAPES: script), drawn by its library (SCRIPTS) or, until that has
    // loaded, as plain text, at the scale that fits the shape's box (blending from A's to B's).
    // step (scriptStep): A's and B's scripts, lit lines and boxes, and an edit's map. A change of
    // script shows A's drawing and B's together while it plays (moveBlocks), each where it is in its
    // own box: from the edge the shape is placed by (edgeOf), so that edge holds still while the
    // box between them grows or shrinks.
    function drawScript(node, s, step, colours) {
      const to = scriptDrawing(node, s, step.b)
      const from = step.a !== step.b ? scriptDrawing(node, s, step.a) : null
      const pair = `${from?.key}|${to.key}`
      if (node.scriptPair !== pair) {
        node.scriptPair = pair
        node.script.replaceChildren(...[to, from].filter(Boolean).map((drawing) => drawing.svg)) // A's over B's, fading out
        for (const key of node.drawings.keys()) if (key !== to.key && key !== from?.key) node.drawings.delete(key)
      }
      const fit = (drawing, box) => Math.min(box.w / drawing.w, box.h / drawing.h)
      const k = lerp(fit(from || to, step.boxA), fit(to, step.boxB), step.t)
      // a drawing's middle from the middle of the box as it is now, when it's in its own box
      const edge = edgeOf(s) || { x: 0, y: 0 }
      const middleIn = (box) => ({ x: (-edge.x * (box.w - s.w)) / 2, y: (-edge.y * (box.h - s.h)) / 2 })
      const [atA, atB] = [middleIn(step.boxA), middleIn(step.boxB)]
      for (const [drawing, at] of [[from, atA], [to, atB]]) {
        if (!drawing) continue
        const [hw, hh] = [(drawing.w * k) / 2, (drawing.h * k) / 2]
        attr(drawing.svg, 'x', at.x - hw); attr(drawing.svg, 'y', at.y - hh)
        attr(drawing.svg, 'width', 2 * hw); attr(drawing.svg, 'height', 2 * hh)
        if (drawing.text) paint(drawing.text, 'fill', colours.colour) // plain text takes the shape's colour
      }
      // how far A's drawing's middle is from B's, and a cell, in the drawings' units
      moveBlocks(from, to, step, { x: (atA.x - atB.x) / k, y: (atA.y - atB.y) / k }, CELL / k)
    }

    // A script's drawing, made once for its text (and kept while it's A's or B's): its <svg>, its
    // size, and its blocks (own: its own parts gathered in a group, so it moves and dims as one,
    // apart from the blocks inside a C block; x, y, where it sits from the drawing's middle; line,
    // the line it starts on; look, to tell a moved block from a changed one; holds, it's a C block
    // with blocks inside).
    function scriptDrawing(node, s, text) {
      const script = scriptOf(s)
      const ready = script.ready()
      const key = `${ready}|${text}`
      node.drawings ||= new Map()
      if (node.drawings.has(key)) return node.drawings.get(key)
      const { svg, blocks } = ready ? script.render(text) : { svg: scriptText(text), blocks: [] }
      const [w, h] = [+svg.getAttribute('width'), +svg.getAttribute('height')]
      if (!svg.hasAttribute('viewBox')) attr(svg, 'viewBox', `0 0 ${w} ${h}`)
      attr(svg, 'class', `${svg.getAttribute('class') || ''} no-zoom`.trim()) // the zoom plugin also attaches to nested SVGs
      svg.style.overflow = 'visible' // a block moving to its new place can pass outside it
      const lines = scriptBlocksIn(script, text.split('\n')).map((block) => block.at + 1)
      const own = blocks.map((block, i) => {
        const parts = [...block.children].filter((part) => !blocks.some((other) => other !== block && part.contains(other)))
        const group = block.insertBefore(svgEl('g'), parts[0] || null)
        group.append(...parts)
        const at = offsetIn(block, svg)
        const holds = blocks.some((other) => other !== block && block.contains(other)) // a C block, with blocks inside
        return { group, line: lines[i], look: group.innerHTML, holds, x: at.x - w / 2, y: at.y - h / 2 }
      })
      const drawing = { key, svg, w, h, own, text: ready ? null : svg.firstChild }
      node.drawings.set(key, drawing)
      return drawing
    }
    // Where an element sits in an <svg> (its parents' translations, as the library places blocks)
    function offsetIn(el, root) {
      let x = 0
      let y = 0
      for (let e = el; e && e !== root; e = e.parentNode) {
        const m = e.transform?.baseVal?.consolidate()?.matrix
        if (m) { x += m.e; y += m.f }
      }
      return { x, y }
    }

    // A script's blocks between A and B (t: how far). The same script: each block's light blends.
    // A new one: A's drawing crossfades into B's. An edit (map), in turn: a block that's gone fades
    // out; then, quickly (CHOREOGRAPHY: scriptRoom), the blocks make room or close up, one still there
    // sliding from its place in A to its place in B and one that's changed (a replaced line)
    // crossfading from its old look to its new (the dip as they pass marks the change), or for a C
    // block whose inside grew or shrank, morphing from its old shape to its new (blockMorph), or if
    // it can't, swapping halfway (CHOREOGRAPHY: scriptReshape); then a new one
    // fades in. New and gone blocks move with the block before them (or after, at the top), and
    // slide in from or out to the right as they fade (CHOREOGRAPHY: scriptAside, in cells). Each is
    // dimmed by the light (highlight line N: a spotlight within the script), as far as it's on.
    function moveBlocks(from, to, { t, map, litA, litB }, apart, cell) {
      const on = lerp(litA != null ? 1 : 0, litB != null ? 1 : 0, t)
      const lit = (block, line) => (block && block.line === line ? 1 : 0)
      const dimmed = (light) => (on > light ? 1 - (1 - BLOCK_DIM) * (on - light) : 1)
      const show = (block, { x, y }, opacity) => {
        attr(block.group, 'transform', x || y ? `translate(${x} ${y})` : null)
        paint(block.group, 'opacity', opacity < 1 ? String(opacity) : '')
      }
      const still = { x: 0, y: 0 }
      const morphing = new Set() // the morph steps applied this frame
      if (from) unmorph(from, morphing) // as drawn
      paint(to.svg, 'opacity', from && !map ? String(t) : '')
      if (from) paint(from.svg, 'opacity', map ? '' : String(1 - t))
      if (!from || !map) {
        // the same blocks (or, crossfading, each drawing's own), lit as A then B
        to.own.forEach((block) => show(block, still, dimmed(lerp(from ? 0 : lit(block, litA), lit(block, litB), t))))
        from?.own.forEach((block) => show(block, still, dimmed(lit(block, litA))))
        return unmorph(to, morphing)
      }
      const was = to.own.map((_, j) => (map[j] === null ? null : from.own[map[j]]))
      const now = from.own.map((_, k) => to.own[map.indexOf(k)] || null)
      // the three parts of the edit's time: going (a gone block), making room, coming (a new one)
      const rest = 1 - CHOREOGRAPHY.scriptRoom
      const goes = now.includes(null) ? rest / (was.includes(null) ? 2 : 1) : 0
      const comes = was.includes(null) ? rest / (now.includes(null) ? 2 : 1) : 0
      const part = (start, end) => (end > start ? clamp01((t - start) / (end - start)) : 1)
      const [out, room, inn] = [part(0, goes), part(goes, 1 - comes), part(1 - comes, 1)]
      // how far each block is from where it's drawn: B's from their places in A, A's towards B's
      const toShift = to.own.map((block, j) => was[j] && { x: (was[j].x + apart.x - block.x) * (1 - room), y: (was[j].y + apart.y - block.y) * (1 - room) })
      const fromShift = from.own.map((block, k) => now[k] && { x: (now[k].x - apart.x - block.x) * room, y: (now[k].y - apart.y - block.y) * room })
      // a new block, or one that's gone, moves with its neighbour (the one before, or after)
      const withNeighbour = (shifts) => shifts.map((shift, i) => shift || shifts.slice(0, i).reverse().find(Boolean) || shifts.slice(i + 1).find(Boolean) || still)
      const toMoves = withNeighbour(toShift)
      const fromMoves = withNeighbour(fromShift)
      const kept = new Set(was.filter((block, j) => block?.look === to.own[j].look)) // shown as they are by B
      const aside = (far, move) => ({ x: move.x + CHOREOGRAPHY.scriptAside * cell * far, y: move.y })
      // a reshaped C block's new shape, as far as it's in (its old one is the rest)
      const span = CHOREOGRAPHY.scriptReshape
      const reshaped = span ? clamp01((room - (1 - span) / 2) / span) : room < 0.5 ? 0 : 1
      // a C block whose inside changed morphs (B's drawn as it morphs from A's look), as the room's made
      const morphed = new Set()
      to.own.forEach((block, j) => {
        const steps = block.holds && was[j] && !kept.has(was[j]) && morphOf(to, from, j, was[j])
        if (!steps) return
        morphed.add(was[j])
        for (const step of steps) { attr(step.el, step.name, step.at(room)); morphing.add(step) }
      })
      unmorph(to, morphing)
      const shown = (block, j) => (!was[j] ? inn : kept.has(was[j]) || morphed.has(was[j]) ? 1 : block.holds ? reshaped : room) // new, kept or morphing, reshaped, changed
      const hidden = (block, k) => (kept.has(block) || morphed.has(block) ? 1 : !now[k] ? out : block.holds ? reshaped : room) // kept or morphing, gone, reshaped, changed
      to.own.forEach((block, j) => show(block, was[j] ? toMoves[j] : aside(1 - inn, toMoves[j]), shown(block, j) * dimmed(lerp(lit(was[j], litA), lit(block, litB), t))))
      from.own.forEach((block, k) => show(block, now[k] ? fromMoves[k] : aside(out, fromMoves[k]), (1 - hidden(block, k)) * dimmed(lit(block, litA))))
    }

    // A changed block's morph from its look in A's drawing to its look in B's: a step for each of
    // B's own parts' attributes that differ (MORPHED), each part matched with the next of A's of
    // the same kind, each value blended by blendValues. null when it can't morph (another shape, or
    // other parts), so it changes another way. Worked out once for each pair of drawings.
    const MORPHED = ['d', 'transform']
    function morphOf(to, from, j, was) {
      to.morphs ||= new Map()
      const key = `${from.key}|${j}|${from.own.indexOf(was)}`
      if (!to.morphs.has(key)) to.morphs.set(key, blockMorph(was.group, to.own[j].group))
      return to.morphs.get(key)
    }
    function blockMorph(before, after) {
      const olds = [...before.children]
      const steps = []
      let k = 0
      for (const el of after.children) {
        while (k < olds.length && olds[k].tagName !== el.tagName) k++
        const old = olds[k++]
        if (!old) return null
        for (const name of MORPHED) {
          const [a, b] = [old.getAttribute(name), el.getAttribute(name)]
          if (a === b) continue
          const at = a !== null && b !== null && blendValues(a, b)
          if (!at) return null
          steps.push({ el, name, at, end: b })
        }
      }
      return steps
    }
    // A drawing's morphed parts set back as drawn, but for those still morphing (steps)
    function unmorph(drawing, steps) {
      for (const step of drawing.morphing || []) if (!steps.has(step)) attr(step.el, step.name, step.end)
      drawing.morphing = new Set([...steps].filter((step) => drawing.svg.contains(step.el)))
    }

    // Two SVG attribute values with the same words and different numbers (a path's commands, a
    // transform), as at(u): the value u of the way from a to b. null if they differ in more than
    // their numbers, or in an arc's flags (which can't be part way).
    const NUMBER_IN = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi
    function blendValues(a, b) {
      const [words, others] = [a.split(NUMBER_IN), b.split(NUMBER_IN)]
      const [xs, ys] = [(a.match(NUMBER_IN) || []).map(Number), (b.match(NUMBER_IN) || []).map(Number)]
      if (words.join('|') !== others.join('|') || xs.length !== ys.length) return null
      let command = ''
      let n = 0 // the number's place in its command's arguments
      for (let k = 0; k < xs.length; k++) {
        const letter = words[k].match(/[a-z](?=[^a-z]*$)/i)
        if (letter) { command = letter[0]; n = 0 }
        if (/a/i.test(command) && [3, 4].includes(n % 7) && xs[k] !== ys[k]) return null
        n++
      }
      return (u) => words.map((word, k) => (k < xs.length ? word + String(lerp(xs[k], ys[k], u)) : word)).join('')
    }

    // A script's lines as mono text, one under another (at font 1, as scriptTextSize measures them)
    function scriptText(text) {
      const { w, h } = scriptTextSize(text)
      const svg = svgEl('svg', { width: w, height: h })
      const size = SCRIPT_TEXT.font * FONT
      const pad = SCRIPT_TEXT.pad * size
      const lines = svg.appendChild(svgEl('text', { 'dominant-baseline': 'central' }))
      lines.setAttributeNS(XML_NS, 'xml:space', 'preserve')
      Object.assign(lines.style, { fontFamily: MONO_FONT, fontSize: `${size}px` })
      text.split('\n').forEach((line, i) => {
        const span = lines.appendChild(svgEl('tspan', { x: pad, y: pad + (i + 0.5) * SCRIPT_TEXT.height * size }))
        span.textContent = line
      })
      return svg
    }

    // How each kind of bar (BARS in anim-core.js) is drawn, in place of the shape's fill: over its
    // track and under its edge. make(node) adds its parts under the shape's body and returns them;
    // draw(parts, s, share, hw, hh, colours, v) sets them each frame, share (0-1) being how full it is,
    // colours.fill its fill tinted as a fill, colours.raw the same as it is (like a stroke), and
    // colours.track the rest's (tinted). label(s, hw, hh), if given, is where the
    // value goes (a label place: SHAPES), in place of the shape's own. A round one (BARS: round) is
    // drawn in the circle that fits its box, clockwise from the top. For a label whose colour is
    // picked from what's behind it (COLOUR_PICKS): cover(share, hw, hh) is the path of the bar's
    // filled part, where the label is drawn again in the colour picked against it (drawCover);
    // holed, the label sits clear of the track.
    const under = (node, tag) => node.g.insertBefore(svgEl(tag, { stroke: 'none' }), node.body)
    const tall = (hw, hh) => hh > hw // a bar fills up, rather than across
    const hasTrack = (s) => colourCss(s.track) !== 'none'
    const BAR_DRAWS = {
      // the track and a full-size box cut down to the share (clip-path inset), so a rounded corner
      // stays rounded: up from the bottom of a box taller than it is wide, otherwise from the left.
      // Its value is in the middle of a track; with none, at the end it grows towards (the top, or
      // the right), as on a bar chart. The bar is its fill colour as it is (stronger than a tinted
      // fill), over the tinted track.
      bar: {
        make: (node) => [under(node, 'rect'), under(node, 'rect')],
        label: (s, hw, hh) => (hasTrack(s) ? 'centre' : tall(hw, hh) ? 'top' : 'right'),
        draw: ([track, fill], s, share, hw, hh, colours, v) => {
          const corner = cornerOf(s, v, hw, hh)
          for (const el of [track, fill]) { setBox(el, hw, hh); attr(el, 'rx', corner); attr(el, 'ry', corner) }
          paint(track, 'fill', colours.track)
          paint(fill, 'fill', colours.raw)
          const cut = `${(100 * (1 - share)).toFixed(2)}%`
          paint(fill, 'clipPath', tall(hw, hh) ? `inset(${cut} 0 0 0)` : `inset(0 ${cut} 0 0)`)
        },
        cover: (share, hw, hh) => (tall(hw, hh) ? boxPath(-hw, hh - 2 * hh * share, 2 * hw, 2 * hh * share) : boxPath(-hw, -hh, 2 * hw * share, 2 * hh)),
      },
      // a band round the inside of the circle, `width` (× its radius) wide: the track, and an arc
      // over it (a dash, its length the share, with flat ends)
      ring: {
        width: 0.3,
        make: (node) => [under(node, 'circle'), under(node, 'circle')].map((el) => {
          attr(el, 'pathLength', 1); attr(el, 'transform', 'rotate(-90)'); paint(el, 'fill', 'none')
          return el
        }),
        label: () => 'centre',
        holed: true, // its value is in the hole in the middle
        draw: ([track, arc], s, share, hw, hh, colours) => {
          const r = Math.min(hw, hh)
          const width = BAR_DRAWS.ring.width * r
          for (const el of [track, arc]) { attr(el, 'r', r - width / 2); paint(el, 'strokeWidth', `${width}px`) }
          paint(track, 'stroke', colours.track)
          paint(arc, 'stroke', colours.raw)
          paint(arc, 'strokeDasharray', `${share.toFixed(4)} 1`)
        },
      },
      // a disc, the track, and a wedge over it
      pie: {
        make: (node) => [under(node, 'circle'), under(node, 'path')],
        label: () => 'centre',
        draw: ([track, wedge], s, share, hw, hh, colours) => {
          const r = Math.min(hw, hh)
          attr(track, 'r', r)
          attr(wedge, 'd', wedgePath(r, share))
          paint(track, 'fill', colours.track)
          paint(wedge, 'fill', colours.raw)
        },
        cover: (share, hw, hh) => wedgePath(Math.min(hw, hh), share),
      },
    }
    const boxPath = (x, y, w, h) => `M ${x} ${y} h ${w} v ${h} h ${-w} Z`

    // A label whose colour is picked from what's behind it (colours.cover), on a bar that has a
    // cover (BAR_DRAWS): a copy of it on top, clipped to the bar's filled part and coloured for
    // that, so a label half on the bar and half off reads on both. Its text is copied again only
    // when the label's changes (setLabel: labelKey, as it types or its marks change); its place and
    // look follow the label's each frame. Taken away when it isn't needed.
    const COVER_ATTRS = ['x', 'y', 'text-anchor']
    const COVER_STYLES = ['fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'opacity']
    function drawCover(node, v, hw, hh, colours) {
      const cover = colours.cover && !v.barFades && BAR_DRAWS[v.barKind]?.cover?.(clamp01(v.bar), hw, hh)
      if (!cover) {
        node.cover?.remove()
        node.cover = null
        return
      }
      if (!node.clip) {
        node.clip = node.g.appendChild(svgEl('clipPath', { id: `anim-cover-${++clipCount}` }))
        node.clip.appendChild(svgEl('path'))
      }
      attr(node.clip.firstChild, 'd', cover)
      if (!node.cover) {
        node.cover = svgEl('text', { class: node.label.getAttribute('class'), 'dominant-baseline': 'central', 'clip-path': `url(#${node.clip.id})` })
        node.label.after(node.cover)
        node.coverKey = null
      }
      if (node.coverKey !== node.labelKey) {
        node.coverKey = node.labelKey
        node.cover.replaceChildren(...node.label.cloneNode(true).childNodes)
      }
      for (const name of COVER_ATTRS) attr(node.cover, name, node.label.getAttribute(name))
      for (const prop of COVER_STYLES) paint(node.cover, prop, node.label.style[prop])
      paint(node.cover, 'fill', colours.cover)
    }
    // A wedge of a circle of radius r, its share of it (0-1) clockwise from the top
    function wedgePath(r, share) {
      if (share <= 0) return ''
      if (share >= 1) return `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`
      const turn = share * 2 * Math.PI
      return `M 0 0 L 0 ${-r} A ${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${r * Math.sin(turn)} ${-r * Math.cos(turn)} Z`
    }

    // A shape's bar (v.bar: how full, v.barKind: its kind), its parts made once per kind and hidden
    // while that kind isn't showing. Changing kind, both show, cross-fading (v.barFades).
    const NO_BARS = new Map()
    function drawBars(node, s, v, hw, hh, colours) {
      if (!node.bars && !v.barKind && !v.barFades) return // it's never had a bar
      const shown = v.barFades || (v.barKind ? new Map([[v.barKind, 1]]) : NO_BARS)
      for (const [kind, parts] of Object.entries(node.bars || {})) {
        if (!shown.has(kind)) parts.forEach((el) => paint(el, 'display', 'none'))
      }
      for (const [kind, fade] of shown) {
        if (!kind) continue // the plain fill, drawn by the body
        node.bars ||= {}
        const parts = (node.bars[kind] ||= BAR_DRAWS[kind].make(node))
        parts.forEach((el) => { paint(el, 'display', ''); paint(el, 'opacity', fade < 1 ? String(fade) : '') })
        BAR_DRAWS[kind].draw(parts, s, clamp01(v.bar), hw, hh, colours, v)
      }
    }
    // Where a shape's label goes (place: a LABEL_PLACES key): where its bar puts it (BAR_DRAWS:
    // label), or its type (SHAPES); fade, how much of it shows there (0-1). Changing bar kind
    // (v.barFades) to one that puts it elsewhere, it fades out at the old place and back in at the
    // new, rather than jumping.
    function labelPlace(s, v, hw, hh) {
      const placeOf = (kind) => (kind && BAR_DRAWS[kind].label?.(s, hw, hh)) || kindOf(s).label
      if (!v.barFades) return { place: placeOf(v.barKind), fade: 1 }
      const [[kindA], [kindB, u]] = [...v.barFades]
      const [from, to] = [kindA, kindB].map(placeOf)
      if (from === to) return { place: to, fade: 1 }
      return { place: u < 0.5 ? from : to, fade: Math.abs(2 * u - 1) }
    }
    // How much of a shape's plain fill shows: all of it without a bar, none with one, and between
    // as a bar turns on or off (v.barFades)
    const plainFill = (v) => (v.barFades?.has(null) ? v.barFades.get(null) : v.bar === undefined ? 1 : 0)

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

    // once / tOnce: the looks a repeated change finished in its first round, and their progress
    // (roundsOf)
    function interpolate(a, b, t, { once = [], tOnce = t } = {}) {
      const s = { ...b }
      // a layout with a panel (LAYOUTS) blends its box's offset too, so the panel follows its cells,
      // as a polygon given new points (SHAPES: points) does, its box round them
      const keys = LAYOUTS[b.layout]?.panel || kindOf(b).points ? [...LERPED, 'cx', 'cy'] : LERPED
      const across = fitted(b) ? fitPhase(a, b, t) : t
      for (const key of keys) {
        const k = once.includes(key) ? tOnce : key === 'w' || key === 'cx' ? across : t
        if (typeof a[key] === 'number' && typeof b[key] === 'number') s[key] = lerp(a[key], b[key], k)
      }
      // A polygon's points glide to their new places (as many as it had); otherwise they change halfway
      if (a.points && b.points && a.points !== b.points) {
        s.points = a.points.length === b.points.length ? b.points.map((p, i) => ({ u: lerp(a.points[i].u, p.u, t), v: lerp(a.points[i].v, p.v, t) }))
          : t < 0.5 ? a.points : b.points
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

    // A state's shapes by uid, worked out once: a beat's state never changes once compiled
    const uidMaps = new WeakMap()
    function byUidOf(state) {
      if (!uidMaps.has(state)) uidMaps.set(state, new Map([...state.values()].map((s) => [s.uid, s])))
      return uidMaps.get(state)
    }
    // Ids that pass from one shape to another from A to B (cells that swap, a shape replaced): what's
    // attached to them stays with the id's place rather than riding along with either shape. Once
    // per pair of states.
    const passedCache = new WeakMap() // A -> B -> ids
    function passedOf(A, B) {
      if (!passedCache.has(A)) passedCache.set(A, new WeakMap())
      const byB = passedCache.get(A)
      if (!byB.has(B)) byB.set(B, new Set([...B.keys()].filter((id) => A.has(id) && A.get(id).uid !== B.get(id).uid)))
      return byB.get(B)
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

    // A growing trail's ends (tween: grow): its kept points, then its new ones as far as its shape
    // has got (its progress, eased as its shape's move is, or raw for a travel's hops)
    function grownEnds(trail, tw, raw) {
      const { kept, steps } = tw.grow
      const points = [trail.from, ...trail.via, trail.to]
      const u = clamp01(tw.grow.raw ? clamp01(raw) : tw.rounds ? roundsOf(tw.rounds, clamp01(raw), easeFn(tw.ease)).t : easeFn(tw.ease)(clamp01(raw))) * steps
      const whole = Math.min(steps, Math.floor(u))
      const drawn = points.slice(0, kept + whole)
      if (whole < steps) {
        const [p, q] = [points[kept + whole - 1], points[kept + whole]]
        drawn.push({ x: lerp(p.x, q.x, u - whole), y: lerp(p.y, q.y, u - whole) })
      }
      return { from: drawn[0], to: drawn[drawn.length - 1], vias: drawn.slice(1, -1), smooth: false, corner: 0 }
    }

    const DIM = 0.2 // opacity of shapes outside the spotlight
    const BLOCK_DIM = 0.45 // opacity of a script's other blocks (highlight line N): lighter, as they sit close together

    /**
     * Renders the transition between two consecutive states. progress(uid) gives each shape's
     * position from A (0) to B (1); `final` is the state the transition ends on (it supplies
     * the colours) and `ms(uid)` the colour transition time. `extra.beatT` is the whole beat's
     * progress from A to B (for the spotlight) and `extra.forward` its direction (one-off
     * highlight effects only play forwards).
     */
    function render(A, B, meta, progress, final, extra = { forward: true, beatT: 1 }) {
      const aByUid = byUidOf(A)
      const bByUid = byUidOf(B)
      const uids = new Set([...aByUid.keys(), ...bByUid.keys()]) // flyers are added to it below
      const items = []
      const now = new Map() // id -> interpolated shape, for attached line ends and shapes
      const passed = passedOf(A, B)

      for (const uid of uids) {
        // A copy starts as its original, so it animates away from it
        const tw = meta.tweens.get(uid)
        const a = aByUid.get(uid) || (bByUid.has(uid) ? tw?.from : undefined)
        const b = bByUid.get(uid)
        const raw = clamp01(progress(uid))
        const easing = easeFn(tw?.ease)
        // a repeated change goes round in rounds, each eased (roundsOf); its first-round looks by tOnce
        const rounds = tw?.rounds && roundsOf(tw.rounds, raw, easing)
        const t = rounds ? rounds.t : easing(raw) // spring goes past 1 and back
        const tOnce = rounds ? rounds.once : t
        let shape
        let v
        if (a && b) {
          shape = interpolate(a, b, t, { once: tw?.rounds?.once, tOnce })
          if (!extra.forward) shape.flow = a.flow // flow switches to where we're going (A, going back)
          if (tw?.path) Object.assign(shape, tw.path.hops ? pointOnHops(tw.path.hops, raw, easing) : pointOnPath(tw.path, t))
          // a turn about a point goes round it (a group's members ride round on it: carried)
          if (tw?.turn && !tw.turn.carried && !LINE_TYPES.includes(shape.type)) Object.assign(shape, placeFor(shape, rotateAbout(boxCentre(a), tw.turn.pivot, tw.turn.by * t)))
          v = { opacity: 1, scale: 1, draw: 1, dx: 0, dy: 0 }
          const swap = a.label !== b.label
          // code text changes while its box is at its wider (see fitPhase)
          const u = kindOf(b).fitted ? textPhase(a, b, tOnce) : tOnce
          v.label = swap && u < 0.5 ? a.label : b.label
          v.nil = swap && u < 0.5 ? a.nil : b.nil
          v.labelOpacity = swap ? Math.abs(2 * u - 1) : 1
          // counter: the value counts its way there instead (tween: count)
          if (tw?.count) Object.assign(v, { label: countLabel(tw.count, clamp01(t)), nil: false, labelOpacity: 1 })
          // a label following counting values counts along with them (tween: counting)
          const counted = tw?.counting && countedText(tw.counting, clamp01(t))
          if (counted !== null && counted !== undefined) Object.assign(v, { label: counted, labelOpacity: 1 })
          // One-off effects, forwards only (going back doesn't replay them)
          if (extra.forward && tw?.effect) EMPHASIS_FRAMES[tw.effect](v, rounds ? rounds.raw : raw) // once a round
          // swap: the cell bows out to one side on its way to the other's place
          if (tw?.arc) {
            const off = arcOffset(tw.arc, clamp01(t))
            v.dx += off.x
            v.dy += off.y
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
        v.barFades = a && b ? barFades(a, b, t) : null
        if (v.barKind) v.bar = !(a && b) ? barShare(shape) : tw?.lands ? barShare(t < 0.5 ? a : b) : lerp(barShare(a), barShare(b), t)
        v.round = a && b ? lerp(roundness(a), roundness(b), t) : roundness(shape)
        // a mark on an end fades in or out as it's added to, taken off or changed on a line
        if (LINE_TYPES.includes(shape.type)) v.marks = a && b ? blendMarks(marksOf(a), marksOf(b), t) : marksOf(shape)
        v.label ??= shape.label
        v.labelOpacity ??= 1
        const node = nodes.get(uid) || makeNode(shape)
        items.push({ uid, shape, v, node, a, b, t, tOnce })
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
        if (item.a && item.b && !(before && before.kind === spec.kind && before.ref === spec.ref && before.side === spec.side && before.anchor === spec.anchor)) return null
        const turn = meta.tweens.get(item.uid)?.turn
        if (turn && !turn.carried) return null // turning on its own, round its own pivot
        if (spec.kind !== 'offset' || before?.kind !== 'offset') return spec
        // turning with its group, its offset turns with it
        if (turn) { const offset = rotateAbout({ x: before.dx, y: before.dy }, null, turn.by * item.t); return { ...spec, dx: offset.x, dy: offset.y } }
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
        if (!LINE_TYPES.includes(item.shape.type)) continue
        const tw = meta.tweens.get(item.uid)
        // a trail is drawn as far as its shape has got along its new points
        if (tw?.grow && item.b) { item.v.ends = grownEnds(item.b, tw, progress(item.uid)); continue }
        if (!item.a || !item.b) continue
        // turning about a point: its free ends and via points go round it, its ends on shapes stay on them
        if (tw?.turn) {
          const spun = (p) => (p.ref ? p : rotateAbout(p, tw.turn.pivot, tw.turn.by * item.t))
          item.v.ends = resolveEnds({ ...item.shape, from: spun(item.a.from), to: spun(item.a.to), via: item.a.via?.map(spun) }, at(B))
          continue
        }
        const ea = resolveEnds(item.a, at(A))
        const eb = resolveEnds(item.b, at(B))
        const mix = (p, q) => ({ x: lerp(p.x, q.x, item.t), y: lerp(p.y, q.y, item.t) })
        // Via points blend too, when it has the same number before and after; otherwise the new
        // ones are used throughout (straightening from or bending to them as the ends move)
        const vias = ea.vias.length === eb.vias.length ? eb.vias.map((q, i) => mix(ea.vias[i], q)) : eb.vias
        item.v.ends = { from: mix(ea.from, eb.from), to: mix(ea.to, eb.to), vias, smooth: eb.smooth, corner: lerp(ea.corner, eb.corner, item.t) }
        // Via points worked out from its look (a loop, a bend) are worked out again from its blended
        // look, so a loop turns and grows, and a bend bows, rather than its points sliding across
        const end = (key) => (item.a[key].ref && item.a[key].ref === item.b[key].ref ? item.b[key] : item.v.ends[key])
        if (ea.worked && eb.worked) item.v.ends = resolveEnds({ ...item.shape, from: end('from'), to: end('to') }, at(B))
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
        const v = { opacity, scale: 1, draw: 1, dx: 0, dy: 0, label: flyer.from.label, nil: flyer.from.nil, labelOpacity: 1 }
        // the value it carries, as a bar from its source's to its target's
        v.barKind = barKindOf(flyer.to, flyer.from)
        if (v.barKind) v.bar = lerp(barShare(flyer.from), barShare(flyer.to, flyer.from.label, flyer.from.nil), k)
        v.round = lerp(roundness(flyer.from), roundness(flyer.to), k)
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
      const finalByUid = byUidOf(final)
      order(items.map(({ node, shape, uid, t }) => ({ node, shape: finalByUid.get(uid) || shape, raised: meta.tweens.get(uid)?.raise && t > 0 && t < 1 })))

      for (const item of items) {
        // colours: blended from A's to B's over the shape's progress (entering / leaving: their own)
        const from = item.a || item.b
        const to = item.b || item.a
        const t = item.a && item.b ? clamp01(item.tOnce ?? item.t) : 1 // a repeated change's colours change in its first round
        // a null value is muted (colour none still hides it); a digit, its value's colour
        const ink = (s) => (s.nil && s.colour !== 'none' ? 'muted' : lookOf(s, 'colour'))
        const [fillA, fillB] = [colourCss(from.fill, 'fill'), colourCss(to.fill, 'fill')]
        const colours = {
          fill: mixCss(fillA, fillB, t),
          stroke: mixCss(colourCss(from.stroke, 'stroke'), colourCss(to.stroke, 'stroke'), t),
        }
        // a bar's track: none on a shape without a bar, so it fades in and out as the bar turns on and off
        let track = null
        let raw = null
        if (item.v.bar !== undefined) {
          const trackOf = (s) => rgba(colourCss(hasBar(s) ? s.track : 'none', 'fill'))
          track = mixRgba(trackOf(from), trackOf(to), t)
          // its fill as it is, not tinted as a fill (BAR_DRAWS choose which to use)
          raw = mixRgba(rgba(colourCss(from.fill, 'stroke')), rgba(colourCss(to.fill, 'stroke')), t)
          Object.assign(colours, { track: cssOf(track), raw: cssOf(raw) })
        }
        // The label's colour. One picked from what's behind it (COLOUR_PICKS: contrast) is picked
        // against the backdrop, or, where the label sits on the shape (LABEL_PLACES: over), its fill
        // and its bar's track (unless the label is clear of it: BAR_DRAWS: holed) over that. Where it
        // sits on a bar, the part of it over the bar is drawn again in the colour picked against
        // the bar (colours.cover: drawCover). What's behind is only worked out for a picked colour.
        const inkOn = (backing) => mixRgba(...[from, to].map((s) => (COLOUR_PICKS[ink(s)] ? pickInk(COLOUR_PICKS[ink(s)], backing) : rgba(colourCss(ink(s), 'stroke')))), t)
        if (![from, to].some((s) => COLOUR_PICKS[ink(s)])) colours.colour = mixCss(colourCss(ink(from), 'stroke'), colourCss(ink(to), 'stroke'), t)
        else {
          const fill = mixRgba(rgba(fillA), rgba(fillB), t)
          const backdrop = rgba(COLOURS.bg)
          const onShape = LABEL_PLACES[kindOf(item.shape).label]?.over
          const bar = BAR_DRAWS[item.v.barKind]
          const base = onShape ? over(track && !bar?.holed ? track : null, backdrop) : backdrop
          const behind = onShape ? over(fill && [...fill.slice(0, 3), fill[3] * plainFill(item.v)], base) : backdrop
          colours.colour = cssOf(inkOn(behind))
          if (onShape && raw && bar?.cover) colours.cover = cssOf(inkOn(over(raw, base)))
        }
        // highlight glow fades in / out like the box; a shape glows too when one covering it does
        // (a span's cells: covers)
        item.v.hlGlow = blend(item, (s) => s.hl?.glow || (s === item.a ? glowA : glowB).has(s.id))
        // highlight line: with no number, a band behind its text (a script's: scriptStep)
        item.v.hlLine = blend(item, (s) => s.hl?.line === true)
        if (kindOf(item.shape).script) item.v.script = scriptStep(item, meta.tweens.get(item.uid))
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
    // A script shape between A and B, for drawScript: their scripts, lit lines (highlight line N)
    // and boxes, how far (t), and an edit's map of its blocks (tween: script). Coming or going, it's
    // the one it has.
    function scriptStep({ a, b, t }, tw) {
      const [from, to] = [a || b, b || a]
      const lit = (s) => (typeof s.hl?.line === 'number' ? s.hl.line : null)
      return {
        a: from.label, b: to.label, t: a && b ? clamp01(t) : 1, map: (a && b && tw?.script) || null,
        litA: lit(from), litB: lit(to), boxA: { w: from.w, h: from.h }, boxB: { w: to.w, h: to.h },
      }
    }
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
    const rectPath = (hw, hh, r) => {
      r = Math.max(0, Math.min(r, hw, hh))
      return `M ${-hw + r} ${-hh} H ${hw - r} A ${r} ${r} 0 0 1 ${hw} ${-hh + r} V ${hh - r} A ${r} ${r} 0 0 1 ${hw - r} ${hh}`
        + ` H ${-hw + r} A ${r} ${r} 0 0 1 ${-hw} ${hh - r} V ${-hh + r} A ${r} ${r} 0 0 1 ${-hw + r} ${-hh} Z`
    }
    // Each kind of outline's highlight path (OUTLINES in anim-core.js), about the shape's middle in
    // its own frame, grown by `offset` (shrunk if negative): o is { s, v, hw, hh (its half-sizes),
    // k (its scale), w, h (its scaled half-sizes grown by offset), offset }
    const OUTLINE_PATHS = {
      // its corners (if it has them) grown or shrunk with it, or rounded on the way out
      box: ({ s, v, hw, hh, k, w, h, offset }) => {
        const cornered = APPLIES.corner.includes(s.type)
        const corner = cornered ? cornerOf(s, v, hw, hh) * k : 0
        return rectPath(w, h, cornered ? corner + offset : offset > 0 ? offset : 0)
      },
      round: ({ w, h }) => `M ${-w} 0 A ${w} ${h} 0 1 1 ${w} 0 A ${w} ${h} 0 1 1 ${-w} 0 Z`,
      // each side moves out by `offset`: the same diamond, scaled by (d + offset) / d, where d is the
      // distance from the centre to a side
      diamond: ({ hw, hh, k, offset }) => {
        const d = (hw * k * hh * k) / (Math.hypot(hw * k, hh * k) || 1)
        const f = Math.max(0, (d + offset) / (d || 1))
        return `M 0 ${-hh * k * f} L ${hw * k * f} 0 L 0 ${hh * k * f} L ${-hw * k * f} 0 Z`
      },
      // each side moved out (or in) by `offset`, its corners rounded round the shape's (as a box's
      // are: by its own corner and the gap)
      polygon: ({ s, hw, hh, k, offset }) => polygonPath(s.points, hw * k, hh * k, Math.max(0, (s.corner || 0) * k + offset), offset),
    }

    function highlightPath(s, v, offset, b, boxedToo = false) {
      // its outline (SHAPES); a group, or an outline round a label below its shape, is a box
      const kind = kindOf(s)
      const boxed = boxedToo || !kind.outline || (offset > 0 && LABEL_PLACES[kind.label]?.outside)
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
      return { d: OUTLINE_PATHS[kind.outline]({ s, v, hw, hh, k, w, h, offset }), transform }
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
          setText(o.text, label)
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
