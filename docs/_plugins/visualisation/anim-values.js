/**
 * anim-values.js - Part of the animation plugin (animation.js), and of its compiler (createCompiler
 * in anim-compile.js): the values vars and cells hold, the whole numbers a number's digits hold
 * (LAYOUTS: radix) and flipping them, and copies of values gliding between them (flyers).
 */

;(function () {
  const { parseProps, ID, RESERVED, KEYWORDS, NUMBER, CHOREOGRAPHY: C, KEPT_STYLE, pick, LAYOUTS, LAYOUT_TYPES,
    nounList, boxCentre, COLOUR_FUNCTIONS, OPERATORS, LOOKS, CELL, fieldsOf, numberValue, tokenize, kindOf, wordFor, digitSymbol } = window.Anim

  // The numbers whose digits flip (LAYOUTS: flip), for messages: "a binary number"
  const FLIP_NOUNS = nounList(LAYOUT_TYPES.filter((layout) => LAYOUTS[layout].flip).map((layout) => LAYOUTS[layout].noun))

  // The digit a symbol (digitSymbol: 0-9, then A-F) stands for in a radix (or NaN)
  const symbolDigit = (symbol, radix) => (/^[0-9A-Z]$/.test(symbol) && parseInt(symbol, 36) < radix ? parseInt(symbol, 36) : NaN)

  window.Anim.COMPILER_PARTS.push((cx) => {
    const { shapes, defaults, newUid } = cx
    // the other parts' functions, linked once every part is made
    let applyStagger, busiest, cellsBetween, noShape, placeOf, retime, schedule, speedOf

    // A value a var or a row's / column's cell holds: a number, "quoted" text or null (shown muted)
    function valueOf(token) {
      if (token?.kind === 'str') return { label: token.value }
      if (token?.kind === 'word' && NUMBER.test(token.value)) return { label: token.value }
      if (token?.kind === 'word' && token.lower === 'null') return { label: 'null', nil: true }
      return undefined
    }
    function setValue(shape, value) {
      if (shape.digit) checkDigit(shape.digit, value)
      shape.label = value.label
      shape.nil = Boolean(value.nil)
    }
    // Whether a shape's value is held in its digits (a number: LAYOUTS: radix), not its own label,
    // and those digits (the shapes that change as its value does)
    const inDigits = (shape) => Boolean(LAYOUTS[shape.layout]?.radix)
    const digitsOf = (row) => row.members.map((id) => shapes.get(id)).filter(Boolean)
    // A shape's value: a var's or cell's, or a number's, from its digits
    const valueIn = (shape) => (inDigits(shape) ? { label: String(wholeOf(shape)), nil: false } : { label: shape.label, nil: shape.nil })

    // A digit of a number (layout: LAYOUTS: radix) is a symbol for 0 to radix - 1 (0-9, A-F)
    function checkDigit(layout, value) {
      const { noun, item, radix } = LAYOUTS[layout]
      if (!value.nil && !Number.isNaN(symbolDigit(value.label, radix))) return
      throw new Error(`a ${noun}'s ${item}s hold ${radix > 2 ? `0 to ${digitSymbol(radix - 1)}` : '0 or 1'}, not ${value.nil ? 'null' : `"${value.label}"`}`)
    }
    // "h.0: f": a word that's a digit's symbol (any case), as its value, before it's read as a name
    function symbolValue(shape, token) {
      const symbol = shape?.digit && token?.kind === 'word' ? token.value.toUpperCase() : ''
      return symbol && !Number.isNaN(symbolDigit(symbol, LAYOUTS[shape.digit].radix)) ? { label: symbol } : undefined
    }

    // "v: +1" / "b: -5": a signed value adds to what a var, cell or number holds now (any other
    // value is as given). A digit adds in its radix ("h.0: +1": 9 to A), checked as it's set.
    function addTo(shape, value) {
      if (value.nil || !/^[+-]/.test(value.label)) return value
      if (shape.digit) {
        const sum = symbolDigit(shape.label, LAYOUTS[shape.digit].radix) + Number(value.label)
        return { label: Number.isInteger(sum) && sum >= 0 ? digitSymbol(sum) : String(sum) }
      }
      const now = valueIn(shape)
      if (now.nil || !NUMBER.test(now.label)) throw new Error(`"${shape.id}" holds ${now.nil ? 'null' : `"${now.label}"`}, not a number, so there's nothing to add ${value.label} to`)
      if (!inDigits(shape)) return { label: String(Number((Number(now.label) + Number(value.label)).toPrecision(12))) }
      const { noun } = LAYOUTS[shape.layout]
      if (!/^[+-]\d+$/.test(value.label)) throw new Error(`a ${noun} adds whole numbers, not ${value.label}`)
      return { label: String(BigInt(now.label) + BigInt(value.label)) }
    }

    // A number's value from its digits (its cells, lowest first)
    function wholeOf(row) {
      const { radix } = LAYOUTS[row.layout]
      return row.members.reduceRight((n, id) => n * BigInt(radix) + BigInt(symbolDigit(shapes.get(id)?.label || '0', radix)), 0n)
    }

    // A whole number's digits in a layout's radix, lowest first, as `count` labels. A number that
    // doesn't fit (too big, or below 0) wraps round (keeps its lowest digits), with a warning.
    function digitsFor(layout, value, count, warn) {
      const { noun, item, radix } = LAYOUTS[layout]
      if (value.nil || !/^-?\d+$/.test(value.label)) throw new Error(`a ${noun} holds a whole number, not ${value.nil ? 'null' : `"${value.label}"`}`)
      const base = BigInt(radix)
      const size = base ** BigInt(count)
      let n = BigInt(value.label)
      if (n < 0n || n >= size) {
        n = ((n % size) + size) % size
        warn(`${value.label} doesn't fit in ${count} ${item}${count === 1 ? '' : 's'}, so it wraps round to ${n}`)
      }
      return Array.from({ length: count }, () => { const digit = n % base; n /= base; return digitSymbol(digit) })
    }

    // A number's digits given a value ("b: 67"), each that changes (with `look`, keep-style's) put in
    // shapes: returned, to be timed
    function setNumber(row, value, warn, look = {}) {
      const labels = digitsFor(row.layout, value, row.members.length, warn)
      return row.members.map((id, k) => [shapes.get(id), labels[k]]).filter(([cell, label]) => cell && cell.label !== label).map(([cell, label]) => {
        const changed = restyled(cell, look)
        setValue(changed, { label })
        shapes.set(changed.id, changed)
        return changed
      })
    }

    // "b: flip": each of a number's digits d becomes radix - 1 - d (a bit: 0 <-> 1), crossfading
    // as when it's given a value; "b: flip 0 3" some of them, "b.2: flip" one
    function flipDigits(id, shape, tokens, meta, warn) {
      if (!shape) throw noShape(id)
      const row = shape.digit ? null : shape
      if (!LAYOUTS[row ? row.layout : shape.digit]?.flip) throw new Error(`"flip" flips the digits of ${FLIP_NOUNS} (or one, e.g. "b.0: flip"), and "${id}" isn't one`)
      let cells = row ? digitsOf(row) : [shape]
      let next = 1
      if (row && placeOf(row, tokens[1]) !== undefined) {
        ({ cells } = cellsBetween(row, tokens, 1, 'flip', (a, b) => `"${id}: flip ${a} ${b}"`))
        next = 3
      }
      const props = parseProps(tokens, next, 'flip', shapes)
      for (const cell of cells) {
        const changed = structuredClone(cell)
        const { radix } = LAYOUTS[cell.digit]
        setValue(changed, { label: digitSymbol(radix - 1 - symbolDigit(cell.label, radix)) })
        shapes.set(changed.id, changed)
        schedule(meta, changed.uid, props)
      }
      applyStagger(shape, row ? cells.map((cell) => [cell.uid]) : [], props, meta, warn)
    }

    // How a value on the move shows, leaving or arriving at a shape: as the var or cell itself, or
    // for a number, a box round it (in its cells' look) holding its value
    function standIn(shape) {
      if (!inDigits(shape)) return shape
      return { ...structuredClone(shape.cell), ...boxCentre(shape), w: shape.w, h: shape.h, ...valueIn(shape), auto: null }
    }
    // Where a value on the move leaves or arrives
    const pointOf = (shape) => { const at = standIn(shape); return { x: at.x, y: at.y } }
    // keep-style: the look a value takes with it (not its size, or highlights)
    const keptStyle = (props, shape) => ((props.keepStyle ?? defaults.keepStyle) ? pick(shape, KEPT_STYLE) : {})
    // A copy of a shape given the look a value came with (keep-style), which no longer follows values
    function restyled(shape, look) {
      const changed = { ...structuredClone(shape), ...look }
      for (const key of Object.keys(look)) unlink(changed, key)
      return changed
    }

    // ---- Expressions (OPERATORS): "v3: v1 + v2", "x {v1 * 2}", "{total / 4}" in a label ----

    // An expression from tokens[i]: operands (a number, or a var, cell or number by name) with an
    // operator between each, read until a token that's neither. { terms (each { v } or { ref }),
    // ops, next }, or null if there's no operator after the first operand, unless it can be
    // `alone` ("x v1", "{n}"). `use` says what a name is for, in messages.
    function readExpr(tokens, i, { alone = false, use = 'work out' } = {}) {
      const operand = (token) => {
        if (token?.kind === 'word' && NUMBER.test(token.value)) return { v: Number(token.value) }
        return holderRef(token) ? { ref: holderRef(token, use).id } : null
      }
      const operator = (token) => (token?.kind === 'word' && OPERATORS[token.lower] ? token.lower : null)
      if (!alone && !operator(tokens[i + 1])) return null
      const first = operand(tokens[i])
      if (!first) return null
      const expr = { terms: [first], ops: [], next: i + 1 }
      while (operator(tokens[expr.next])) {
        const [op, after] = [tokens[expr.next], tokens[expr.next + 1]]
        const term = operand(after)
        if (!term) throw new Error(`"${op.value}" needs a number, var or cell after it${after ? `, not "${after.value ?? after.name ?? after.text}"` : ''} (with spaces round it)`)
        expr.ops.push(op.lower)
        expr.terms.push(term)
        expr.next += 2
      }
      return expr
    }
    // All of some tokens as one expression (a lone operand too), or why they aren't one
    function wholeExpr(tokens, use) {
      const expr = tokens.length ? readExpr(tokens, 0, { alone: true, use }) : null
      if (!expr || expr.next !== tokens.length) {
        const bad = tokens[expr ? expr.next : 0]
        throw new Error(`a sum is numbers, vars and cells with ${Object.keys(OPERATORS).join(' ')} between them (spaces round each)${bad ? `, not "${bad.value ?? bad.name ?? bad.text}"` : ''}, e.g. {v1 * 2}`)
      }
      return expr
    }
    const exprRefs = (expr) => expr.terms.filter((term) => term.ref).map((term) => term.ref)
    const RANKS = [...new Set(Object.values(OPERATORS).map((op) => op.rank))].sort((a, b) => b - a)
    // An expression's value now: its operands' numbers (what each var, cell or number holds), then
    // its operators, highest rank first, left to right. Throws why when it can't be worked out.
    function workOut({ terms, ops }) {
      const numbers = terms.map((term) => {
        if (term.ref === undefined) return term.v
        if (!shapes.has(term.ref)) throw new Error(`"${term.ref}" has gone`)
        const value = valueIn(shapes.get(term.ref))
        if (value.nil || !NUMBER.test(value.label)) throw new Error(`"${term.ref}" holds ${value.nil ? 'null' : `"${value.label}"`}, not a number`)
        return Number(value.label)
      })
      const left = [...ops]
      for (const rank of RANKS) {
        for (let k = 0; k < left.length;) {
          const op = OPERATORS[left[k]]
          if (op.rank !== rank) { k++; continue }
          const problem = op.problem?.(numbers[k], numbers[k + 1])
          if (problem) throw new Error(problem)
          numbers.splice(k, 2, op.apply(numbers[k], numbers[k + 1]))
          left.splice(k, 1)
        }
      }
      return Number(numbers[0].toPrecision(12))
    }
    // "v3: v1 + v2": the expression a value line starts with (tokens[0], with an operator after its
    // first operand), worked out once, as code does, as the value it's given; or null
    function exprValue(shape, tokens) {
      const expr = shape.holds ? readExpr(tokens, 0, { use: 'use in a sum' }) : null
      if (!expr) return null
      try { return { label: String(workOut(expr)), next: expr.next } } catch (error) { throw new Error(`${error.message}, so "${shape.id}" can't be given this`) }
    }

    // ---- Links: looks that follow values, kept in shape.links (by look) ----
    // What a link can be (link.kind), each worked out again after every line when what its sources
    // hold changes (fitLinks), changing in the time they take:
    //   sources  sources(link): the ids of the vars, cells and numbers it reads
    //   fit      fit(shape, key, link, warn): works it out and sets the look; true if it changed
    // A look given again (or reset) no longer follows them (unlink).
    const LINKS = {
      colour: { sources: (link) => link.args.filter((arg) => arg.ref !== undefined).map((arg) => arg.ref), fit: fitColour }, // "fill rgb(r g b)"
      text: { sources: (link) => link.parts.flatMap((part) => (part.expr ? exprRefs(part.expr) : [])), fit: fitText }, // "{v1}" in a label
      number: { sources: (link) => exprRefs(link.expr), fit: fitNumber }, // "x v1", "angle {v1 * 2}"
    }
    function unlink(shape, key) {
      if (!shape.links?.[key]) return
      const rest = pick(shape.links, Object.keys(shape.links).filter((k) => k !== key))
      shape.links = Object.keys(rest).length ? rest : undefined
    }
    function setLink(shape, key, link, warn) {
      shape.links = { ...shape.links, [key]: { ...link, seen: null, inputs: null } }
      fitLink(shape, key, warn)
    }
    // Works a link out again if what its sources hold has changed: true if its look changed
    function fitLink(shape, key, warn) {
      const link = shape.links[key]
      const kind = LINKS[link.kind]
      const inputs = JSON.stringify(kind.sources(link).map((id) => (shapes.has(id) ? valueIn(shapes.get(id)) : null)))
      if (inputs === link.inputs) return false
      link.inputs = inputs
      return kind.fit(shape, key, link, warn)
    }
    // After every line: each link follows its sources, changing in the time they take this beat (a
    // number's: its digits')
    function fitLinks(meta, warn) {
      const changing = (source) => (inDigits(source) ? digitsOf(source) : [source])
      for (const shape of shapes.values()) {
        for (const key of Object.keys(shape.links || {})) {
          const sources = LINKS[shape.links[key].kind].sources(shape.links[key]).map((id) => shapes.get(id)).filter(Boolean)
          if (fitLink(shape, key, warn)) retime(meta, shape.uid, busiest(meta, sources.flatMap(changing)))
        }
      }
    }
    // An expression link's value, or (when it can't be worked out) undefined, with a warning: a
    // source that's gone stops it following (its look stays as it is)
    function linkedValue(shape, key, expr, warn, what) {
      try { return workOut(expr) } catch (error) {
        warn(`${error.message}, so ${what} stays as it is`)
        if (exprRefs(expr).some((id) => !shapes.has(id))) unlink(shape, key)
        return undefined
      }
    }

    // "x v1", "angle {v1 * 2}" (KEYWORDS: bound): a look's number, or a shape's x or y (in cells),
    // follows an expression
    function linkNumber(shape, key, tokens, warn) {
      setLink(shape, key, { kind: 'number', expr: wholeExpr(tokens, `follow with "${wordFor(key)}"`) }, warn)
    }
    function fitNumber(shape, key, link, warn) {
      const n = linkedValue(shape, key, link.expr, warn, `"${shape.id}"'s ${wordFor(key)}`)
      if (n === undefined) return false
      const look = LOOKS[key]
      const set = look ? Object.fromEntries(fieldsOf(look).map((field) => [field, Math.min(look.max ?? Infinity, Math.max(look.min ?? -Infinity, numberValue({ v: n }, undefined, { unit: look.unit })))]))
        : { [key]: numberValue({ v: n }, undefined, { unit: CELL, coord: true }) } // x or y: a grid coordinate
      if (Object.keys(set).every((field) => shape[field] === set[field])) return false
      Object.assign(shape, set)
      return true
    }

    // "Total: {v1}" in a label: each { } that's a sum of numbers, vars and cells shows its value, as
    // they change. Any other { } shows as written (with a warning when it looks like a sum with a
    // name in it that isn't a var or cell). Not a value (a var's, a cell's), code or a script.
    const TEMPLATE = /\{([^{}]*)\}/g
    const templated = (shape) => !shape.holds && !kindOf(shape).pre && !kindOf(shape).script
    function linkText(shape, warn) {
      unlink(shape, 'label')
      const label = shape.label ?? ''
      if (!templated(shape) || !label.includes('{')) return
      const parts = []
      let at = 0
      for (const m of label.matchAll(TEMPLATE)) {
        let expr = null
        try { expr = wholeExpr(tokenize(m[1]), 'show') } catch (error) {
          if (/^[\w.\s*/+-]+$/.test(m[1])) warn(`"{${m[1]}}" shows as written: ${error.message}`)
        }
        if (!expr) continue
        if (m.index > at) parts.push({ text: label.slice(at, m.index) })
        parts.push({ expr })
        at = m.index + m[0].length
      }
      if (!parts.some((part) => part.expr)) return
      if (at < label.length) parts.push({ text: label.slice(at) })
      setLink(shape, 'label', { kind: 'text', parts }, warn)
    }
    function fitText(shape, key, link, warn) {
      const shown = []
      for (const part of link.parts) {
        if (!part.expr) { shown.push(part.text); continue }
        const n = linkedValue(shape, key, part.expr, warn, `"${shape.id}"'s label`)
        if (n === undefined) return false
        shown.push(String(n))
      }
      const label = shown.join('')
      if (shape.label === label) return false
      shape.label = label
      return true
    }

    // counter: a new value counts its way there, showing each one between (tween: count, read by
    // the renderer): a var's or cell's from its old number to its new one, and every digit of a
    // number from the whole number it was to the one it is (each showing its place's digit)
    function countUp(shape, before, props, meta, warn) {
      const after = valueIn(shapes.get(shape.id))
      const [from, to] = [before, after].map((value) => (value.nil || !NUMBER.test(value.label) ? NaN : Number(value.label)))
      if (Number.isNaN(from) || Number.isNaN(to)) return warn(`"counter" counts from one number to another, and "${shape.id}" doesn't, so its value changes as usual`)
      if (!inDigits(shape)) { schedule(meta, shapes.get(shape.id).uid, props).count = { from, to }; return }
      const { radix } = LAYOUTS[shape.layout]
      digitsOf(shape).forEach((cell, place) => { schedule(meta, cell.uid, props).count = { from, to, radix, place } })
    }

    // A colour worked out from values ("fill rgb(r g b)", COLOUR_FUNCTIONS): the look follows them
    // (LINKS: colour). Its link: fn; args, each { v } (a number) or { ref } (the id of a var, cell or
    // number); values, the numbers it was last worked out from; and seen, what each argument held then.
    function linkColour(shape, key, { fn, args }, warn) {
      const { args: names, max, example: written } = COLOUR_FUNCTIONS[fn]
      const example = `e.g. "${written}" or "${fn}(${names.map((name) => name[0]).join(' ')})"`
      if (args.length !== names.length) throw new Error(`"${fn}(…)" takes ${names.length} values (${names.join(', ')}): numbers from 0 to ${max}, or vars or cells, ${example}`)
      const read = args.map((token) => {
        if (token.kind === 'word' && NUMBER.test(token.value)) return { v: Number(token.value) }
        const source = holderRef(token, `use in "${fn}(…)"`)
        if (!source) throw new Error(`"${fn}(…)" takes numbers from 0 to ${max}, or vars or cells, not "${token.value ?? token.name}", ${example}`)
        return { ref: source.id }
      })
      setLink(shape, key, { kind: 'colour', fn, args: read, values: null }, warn)
    }

    // Works a linked colour out again (LINKS: colour): true if the colour changes. A source that's
    // gone, or holds no number, leaves its share as it was (a gone one for good); a number out of
    // range is held in it. Each is warned about as its source changes.
    function fitColour(shape, field, link, warn) {
      const seen = link.args.map((arg) => JSON.stringify(arg.ref === undefined ? arg.v : shapes.has(arg.ref) ? valueIn(shapes.get(arg.ref)) : null))
      if (seen.every((input, k) => input === link.seen?.[k])) return false
      const { args: names, max, css } = COLOUR_FUNCTIONS[link.fn]
      const values = link.args.map((arg, k) => {
        const was = link.values?.[k] ?? 0
        if (seen[k] === link.seen?.[k]) return was
        const share = `the ${names[k]} in "${shape.id}"'s ${field}`
        if (arg.ref !== undefined && !shapes.has(arg.ref)) {
          warn(`"${arg.ref}" has gone, so ${share} stays at ${was}`)
          link.args[k] = { v: was }
          return was
        }
        const value = arg.ref === undefined ? { label: String(arg.v) } : valueIn(shapes.get(arg.ref))
        if (value.nil || !NUMBER.test(value.label)) {
          warn(`"${arg.ref}" holds ${value.nil ? 'null' : `"${value.label}"`}, not a number, so ${share} stays at ${was}`)
          return was
        }
        const n = Math.round(Number(value.label))
        const held = Math.min(max, Math.max(0, n))
        if (held !== n) warn(`${value.label} is outside 0 to ${max}, so ${share} is ${held}`)
        return held
      })
      Object.assign(link, { values, seen })
      const colour = css(values)
      if (shape[field] === colour) return false
      shape[field] = colour
      return true
    }

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
      const look = (shape) => ({ ...structuredClone(standIn(shape)), id: `~flyer${n}`, uid: n, attach: null, hl: null, callout: null, layer: 'front' })
      meta.flyers = [...(meta.flyers || []), { uid: n, from: look(from), to: look(to), hops, move }]
      schedule(meta, n, props, { dur: arrive / move })
    }

    // A value flown from `source` (a var, cell or number) along `hops` into `target`, a var or cell
    // that takes it as the flyer lands, `arrive` ms in (a number: its digits that change):
    // crossfading in, centred on the landing, and with keep-style taking the look it came with.
    function flyValue(meta, source, target, hops, props, arrive, warn) {
      const look = keptStyle(props, standIn(source))
      const landing = inDigits(target) ? setNumber(target, valueIn(source), warn, look) : [restyled(target, look)]
      if (!inDigits(target)) {
        setValue(landing[0], valueIn(source))
        shapes.set(landing[0].id, landing[0])
      }
      const fade = C.crossfade * speedOf(props)
      // lands: the flyer has already shown the value on the way, so the target takes it as it lands
      // rather than blending to it (a bar would fill a second time under the flyer)
      for (const changed of landing) schedule(meta, changed.uid, props, { dur: fade, after: arrive - fade / 2 }).lands = true
      fly(meta, source, inDigits(target) ? target : landing[0], hops, props, { arrive })
    }

    // "v1: a.1": a copy of a.1 glides onto v1, which takes its value as it lands
    function assignValue(target, source, tokens, meta, warn) {
      const props = parseProps(tokens, 1, 'assign', shapes)
      if (source.id === target.id) return warn(`"${target.id}" already holds its own value`)
      flyValue(meta, source, target, [pointOf(source), pointOf(target)], props, C.arrive * speedOf(props), warn)
    }

    return {
      functions: { addTo, assignValue, symbolValue, checkDigit, countUp, digitsFor, exprValue, fitLinks, fly, flyValue, holderRef, keptStyle, linkColour, linkNumber, linkText, pointOf,
        setNumber, setValue, unlink, valueIn, valueOf },
      verbs: { flip: flipDigits },
      link: () => {
        ({ applyStagger, busiest, cellsBetween, noShape, placeOf, retime, schedule, speedOf } = cx)
      },
    }
  })
})()
