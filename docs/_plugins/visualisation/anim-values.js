/**
 * anim-values.js - Part of the animation plugin (animation.js), and of its compiler (createCompiler
 * in anim-compile.js): the values vars and cells hold, and copies of them gliding between them
 * (flyers).
 */

;(function () {
  const { parseProps, ID, RESERVED, KEYWORDS, NUMBER, CHOREOGRAPHY: C, KEPT_STYLE, pick } = window.Anim

  window.Anim.COMPILER_PARTS.push((cx) => {
    const { shapes, defaults, newUid } = cx
    // the other parts' functions, linked once every part is made
    let schedule, speedOf

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
      if (!shape.holds) throw new Error(`"${token.value}" doesn't hold a value, so there's nothing to ${use}: use a var or a cell, e.g. v1 or arr.2`)
      return shape
    }

    // A flyer: a copy that exists only while the beat plays, gliding hop by hop through `hops` to
    // arrive `arrive` ms in (after the line's delay). It then lingers where it landed, fading out
    // (it moves for flyMove of its time), or with linger false vanishes as it arrives, where
    // something else takes over. Its look blends from `from`'s to `to`'s on the way.
    function fly(meta, from, to, hops, props, { arrive, linger = true }) {
      const n = newUid()
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

    return {
      functions: { assignValue, fly, flyValue, holderRef, keptStyle, setValue, valueIn, valueOf },
      verbs: {  },
      link: () => {
        ({ schedule, speedOf } = cx)
      },
    }
  })
})()
